// controllers/orderController.js
const pool = require('../db/connection');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');


function generateOrderNumber() { // Utility: generate unique order number
  return 'ORD-' + Date.now();
}

//Get orders for the logged-in customer
exports.getMyOrders = async (req, res) => {
  try {
    const customerId = req.user?.id;
    if (!customerId) {
      return res.status(401).json({ success: false, message: "Not logged in "});
    }

    const [rows] = await pool.query(
      `SELECT o.*, c.first_name, c.last_name
      FROM orders o
      JOIN customers c ON o.customer_id = c.customer_id
      WHERE o.customer_id = ?
      ORDER BY o.order_date DESC`,
      [customerId]
    );

    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error("Error fetching customer orders:", err.message || err);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};
/*
// Get all orders (admin/staff view)
exports.getAllOrders = async (req, res) => {
    // 1. Read the optional 'status' filter from the URL query
    const statusFilter = req.query.status; 
    
    // Base SQL Query setup
    let query = `
      SELECT 
        o.*, 
        c.first_name AS customer_first_name, 
        c.last_name AS customer_last_name
      FROM orders o
      JOIN customers c ON o.customer_id = c.customer_id
      ORDER BY o.order_date
      LIMIT 200
    `);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error('Error fetching orders:', err.message || err);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};*/

// Get all orders (admin/staff view, with optional status filter)
exports.getAllOrders = async (req, res) => {
  const statusFilter = req.query.status; 
  let query = `
    SELECT 
      o.*, 
      c.first_name AS customer_first_name, 
      c.last_name AS customer_last_name
    FROM orders o
    JOIN customers c ON o.customer_id = c.customer_id
  `;
  const params = [];

  if (statusFilter && statusFilter.trim() !== '') {
    query += ` WHERE o.order_status = ?`;
    params.push(statusFilter);
  }

  query += ` ORDER BY o.order_date LIMIT 200`;

  try {
    const [rows] = await pool.query(query, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error('Error fetching orders:', err.message || err);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `
      SELECT 
        o.*, 
        c.first_name AS customer_first_name, 
        c.last_name AS customer_last_name
      FROM orders o
      JOIN customers c ON o.customer_id = c.customer_id
      WHERE o.order_id = ?
      `,
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Error fetching order:', err.message || err);
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
};

/*// Add a new order (customer checkout)
exports.addOrder = async (req, res) => {
  try {
    const customerId = req.user?.id; // JWT should carry customer_id
    if (!customerId) {
      return res.status(401).json({ success: false, message: "Not logged in" }); //Authorization check
    }

    const {
      order_status,
      shipping_address,
      billing_address,
      subtotal,
      tax,
      shipping_fee,
      total,
      created_by,
    } = req.body;

    const order_number = generateOrderNumber();

    const [result] = await pool.query(
      `INSERT INTO orders 
      (order_number, customer_id, order_status, shipping_address, billing_address, subtotal, tax, shipping_fee, total, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order_number,
        customerId,
        order_status || 'pending',
        shipping_address,
        billing_address || null,
        subtotal || 0,
        tax || 0,
        shipping_fee || 0,
        total || 0,
        created_by || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order_id: result.insertId,
      order_number,
    });
  } catch (err) {
    console.error('Error adding order:', err.message || err);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
};*/


// Add a new order (customer checkout)
exports.addOrder = async (req, res) => {
  try {
    const customerId = req.user?.id;
    if (!customerId) {
      return res.status(401).json({ success: false, message: "Not logged in" });
    }

    const {
      order_status,
      shipping_address,
      billing_address,
      subtotal,
      tax,
      shipping_fee,
      total,
      created_by,
      cart // frontend must send cart array
    } = req.body;

    const order_number = generateOrderNumber();

    // 1. Insert order
    const [result] = await pool.query(
      `INSERT INTO orders 
      (order_number, customer_id, order_status, shipping_address, billing_address, subtotal, tax, shipping_fee, total, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order_number,
        customerId,
        order_status || 'pending',
        shipping_address,
        billing_address || null,
        subtotal || 0,
        tax || 0,
        shipping_fee || 0,
        total || 0,
        created_by || null,
      ]
    );

    const orderId = result.insertId;

    // 2. Insert order items + decrement inventory
    if (Array.isArray(cart)) {
      for (const item of cart) {
        // Save order item
        await pool.query(
          `INSERT INTO order_items (order_id, product_id, warehouse_id, quantity, unit_price, line_total)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.product_id,
            item.warehouse_id || null, // optional
            item.quantity,
            item.price,
            item.quantity * item.price
          ]
        );

        // Decrement inventory (safe: never below 0)
        await pool.query(
          `UPDATE inventory 
           SET quantity = GREATEST(0, quantity - ?) 
           WHERE product_id = ? 
           ${item.warehouse_id ? 'AND warehouse_id = ?' : ''}
           LIMIT 1`,
          item.warehouse_id
            ? [item.quantity, item.product_id, item.warehouse_id]
            : [item.quantity, item.product_id]
        );

        // Optionally: log stock movement
        await pool.query(
          `INSERT INTO stock_movements (product_id, warehouse_id, movement_type, reference_id, quantity_change, note, created_by)
           VALUES (?, ?, 'sale', ?, ?, ?, ?)`,
          [
            item.product_id,
            item.warehouse_id || 1, // fallback warehouse
            order_number,
            -item.quantity,
            'Order checkout',
            created_by || null
          ]
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order_id: orderId,
      order_number,
    });
  } catch (err) {
    console.error('Error adding order:', err.message || err);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
};





// Update order
exports.updateOrder = async (req, res) => {
  const { id } = req.params;
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(req.body)) {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0)
    return res.status(400).json({ success: false, message: 'No fields to update' });

  values.push(id);

  try {
    const [result] = await pool.query(
      `UPDATE orders SET ${fields.join(', ')} WHERE order_id = ?`,
      values
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, message: 'Order updated successfully' });
  } catch (err) {
    console.error('Error updating order:', err.message || err);
    res.status(500).json({ success: false, message: 'Failed to update order' });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM orders WHERE order_id = ?', [id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (err) {
    console.error('Error deleting order:', err.message || err);
    res.status(500).json({ success: false, message: 'Failed to delete order' });
  }
};

// Export Orders as CSV
exports.exportOrdersCSV = async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT
        o.order_id AS ID,
        o.order_number AS OrderNumber,
        CONCAT(c.first_name, ' ', c.last_name) AS Customer,
        o.order_status AS Status,
        o.order_date AS OrderDate,
        o.shipping_address AS ShippingAddress,
        o.billing_address AS BillingAddress,
        o.subtotal AS Subtotal,
        o.tax AS Tax,
        o.shipping_fee AS ShippingFee,
        o.total AS Total
      FROM orders o
      JOIN customers c ON o.customer_id = c.customer_id
    `);

    const fields = [
      "ID", "OrderNumber", "Customer", "Status", "OrderDate",
      "ShippingAddress", "BillingAddress", "Subtotal", "Tax",
      "ShippingFee", "Total"
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(results);

    res.header("Content-Type", "text/csv");
    res.attachment("orders.csv");
    res.send(csv);

  } catch (err) {
    console.error("Error exporting orders CSV:", err.message || err);
    res.status(500).json({ success: false, message: "Failed to export orders CSV" });
  }
};

// Export Orders as PDF
exports.exportOrdersPDF = async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT
        o.order_id AS ID,
        o.order_number AS OrderNumber,
        CONCAT(c.first_name, ' ', c.last_name) AS Customer,
        o.order_status AS Status,
        o.order_date AS OrderDate,
        o.total AS Total
      FROM orders o
      JOIN customers c ON o.customer_id = c.customer_id
    `);

    const doc = new PDFDocument({ margin: 30, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=orders.pdf");

    doc.pipe(res);

    // Title
    doc.fontSize(18).font("Helvetica-Bold").text("Orders Report", { align: "center" });
    doc.moveDown(1);

    // Table layout
    const tableTop = 100;
    const rowHeight = 25;
    const headers = ["ID", "Order #", "Customer", "Status", "Date", "Total"];
    const colWidths = [30, 90, 150, 90, 140, 70];
    const totalTableWidth = colWidths.reduce((a, b) => a + b);

    let x = 30;
    let y = tableTop;

    // Header row
    doc.rect(x, y, totalTableWidth, rowHeight).fill("#f0f0f0");
    doc.fillColor("black").font("Helvetica-Bold").fontSize(11);
    let currentX = x;
    headers.forEach((h, i) => {
      doc.text(h, currentX + 5, y + 7, { width: colWidths[i] - 10 });
      currentX += colWidths[i];
    });
    doc.strokeColor("black").rect(x, y, totalTableWidth, rowHeight).stroke();
    y += rowHeight;

    // Data rows
    doc.font("Helvetica").fontSize(10);
    results.forEach((o, index) => {
      if (y > 750) {
        doc.addPage();
        y = tableTop;

        // redraw header on new page
        doc.rect(x, y, totalTableWidth, rowHeight).fill("#f0f0f0");
        doc.fillColor("black").font("Helvetica-Bold").fontSize(11);
        currentX = x;
        headers.forEach((h, i) => {
          doc.text(h, currentX + 5, y + 7, { width: colWidths[i] - 10 });
          currentX += colWidths[i];
        });
        doc.strokeColor("black").rect(x, y, totalTableWidth, rowHeight).stroke();
        y += rowHeight;
        doc.font("Helvetica").fontSize(10);

      }

      // Alternating row background
      const bgColor = index % 2 === 0 ? "#fafafa" : "white";
      doc.rect(x, y, totalTableWidth, rowHeight).fill(bgColor);
      doc.fillColor("black");

      const row = [
        o.ID,
        o.OrderNumber,
        o.Customer,
        o.Status,
        new Date(o.OrderDate).toLocaleString(),
        `$${Number(o.Total).toFixed(2)}`
      ];

      currentX = x;
      row.forEach((val, i) => {
        doc.text(String(val), currentX + 5, y + 7, { width: colWidths[i] - 10 });
        currentX += colWidths[i];
      });

      doc.strokeColor("black").rect(x, y, totalTableWidth, rowHeight).stroke();
      y += rowHeight;
    });

    doc.end();

  } catch (err) {
    console.error("Error exporting orders PDF:", err.message || err);
    res.status(500).json({ success: false, message: "Failed to export orders PDF" });
  }
};