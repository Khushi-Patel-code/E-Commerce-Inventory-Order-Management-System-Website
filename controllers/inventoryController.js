// controllers/inventoryController.js
const pool = require('../db/connection');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

// CREATE
exports.createInventory = async (req, res) => {
  try {
    const { product_id, warehouse_id, quantity } = req.body;

    const [result] = await pool.query(
      `INSERT INTO inventory (product_id, warehouse_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), last_updated = CURRENT_TIMESTAMP`,
      [product_id, warehouse_id, quantity]
    );

    res.json({ success: true, message: 'Inventory record added/updated', inventory_id: result.insertId });
  } catch (err) {
    console.error('Error creating inventory record:', err);
    res.status(500).json({ success: false, message: 'Error creating inventory record' });
  }
};

// READ ALL
exports.getInventory = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT i.inventory_id, i.product_id, p.product_name, i.warehouse_id, w.warehouse_name, 
             i.quantity, i.last_updated
      FROM inventory i
      JOIN products p ON i.product_id = p.product_id
      JOIN warehouses w ON i.warehouse_id = w.warehouse_id
      ORDER BY i.inventory_id
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).json({ success: false, message: 'Error fetching inventory' });
  }
};

// READ ONE
exports.getInventoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT i.*, p.product_name, w.warehouse_name
      FROM inventory i
      JOIN products p ON i.product_id = p.product_id
      JOIN warehouses w ON i.warehouse_id = w.warehouse_id
      WHERE i.inventory_id = ?
    `, [id]);

    if (rows.length === 0)
      return res.status(404).json({ success: false, message: 'Inventory record not found' });

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Error fetching inventory record:', err);
    res.status(500).json({ success: false, message: 'Error fetching inventory record' });
  }
};

// UPDATE
exports.updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    await pool.query(
      `UPDATE inventory SET quantity = ?, last_updated = CURRENT_TIMESTAMP WHERE inventory_id = ?`,
      [quantity, id]
    );

    res.json({ success: true, message: 'Inventory updated successfully' });
  } catch (err) {
    console.error('Error updating inventory:', err);
    res.status(500).json({ success: false, message: 'Error updating inventory' });
  }
};

// DELETE
exports.deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM inventory WHERE inventory_id = ?`, [id]);
    res.json({ success: true, message: 'Inventory record deleted successfully' });
  } catch (err) {
    console.error('Error deleting inventory:', err);
    res.status(500).json({ success: false, message: 'Error deleting inventory' });
  }
};

// EXPORT INVENTORY CSV
exports.exportInventoryCSV = async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT 
        i.inventory_id AS InventoryID,
        p.product_name AS Product,
        w.warehouse_name AS Warehouse,
        i.quantity AS Quantity,
        i.last_updated AS LastUpdated
      FROM inventory i
      JOIN products p ON i.product_id = p.product_id
      JOIN warehouses w ON i.warehouse_id = w.warehouse_id
      ORDER BY i.inventory_id ASC
    `);

    const fields = ["InventoryID", "Product", "Warehouse", "Quantity", "LastUpdated"];
    const json2csv = new Parser({ fields });

    const csv = json2csv.parse(results);

    res.header("Content-Type", "text/csv");
    res.attachment("inventory.csv");
    res.send(csv);

  } catch (err) {
    console.error("Error exporting inventory CSV:", err);
    res.status(500).json({ success: false, message: "Failed to export inventory CSV" });
  }
};

// EXPORT INVENTORY PDF
exports.exportInventoryPDF = async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT 
        i.inventory_id AS InventoryID,
        p.product_name AS Product,
        w.warehouse_name AS Warehouse,
        i.quantity AS Quantity,
        i.last_updated AS LastUpdated
      FROM inventory i
      JOIN products p ON i.product_id = p.product_id
      JOIN warehouses w ON i.warehouse_id = w.warehouse_id
      ORDER BY i.inventory_id ASC
    `);

    const doc = new PDFDocument({ margin: 30, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=inventory.pdf");
    doc.pipe(res);

    // ----- Title -----
    doc.fontSize(18).font("Helvetica-Bold").text("Inventory Report", { align: "center" });
    doc.moveDown(1);

    // ----- Table Setup -----
    const tableTop = 100;
    const rowHeight = 25;
    const colWidths = [30, 160, 150, 60, 130];  // widths fine-tuned to avoid overflow
    const headers = ["ID", "Product", "Warehouse", "Qty", "Last Updated"];

    let x = 30;
    let y = tableTop;

    // Header Background
    doc.rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight).fill("#f0f0f0");
    doc.fillColor("black").fontSize(11).font("Helvetica-Bold");

    // Header Text
    let currentX = x;
    headers.forEach((header, i) => {
      doc.text(header, currentX + 5, y + 7, { width: colWidths[i] - 10 });
      currentX += colWidths[i];
    });

    doc.strokeColor("black").rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight).stroke();
    y += rowHeight;

    // ----- Rows -----
    doc.font("Helvetica").fontSize(10);

    results.forEach((r, idx) => {
      if (y > 750) {
        doc.addPage();
        y = tableTop;
      }

      // Alternate row colors
      const bgColor = idx % 2 === 0 ? "#fafafa" : "white";
      doc.rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight).fill(bgColor);
      doc.fillColor("black");

      const row = [
        r.InventoryID,
        r.Product,
        r.Warehouse,
        r.Quantity,
        new Date(r.LastUpdated).toLocaleString()
      ];

      currentX = x;
      row.forEach((val, i) => {
        doc.text(String(val), currentX + 5, y + 7, { width: colWidths[i] - 10 });
        currentX += colWidths[i];
      });

      doc.strokeColor("black").rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight).stroke();
      y += rowHeight;
    });
    

    doc.end();

  } catch (err) {
    console.error("Error exporting inventory PDF:", err);
    res.status(500).json({ success: false, message: "Failed to export inventory PDF" });
  }
};

