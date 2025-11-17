// controllers/productController.js
const pool = require('../db/connection');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.product_id, p.product_name, p.description, p.price,
             IFNULL(SUM(i.quantity), 0) AS stock
      FROM products p
      LEFT JOIN inventory i ON p.product_id = i.product_id
      WHERE p.active = 1
      GROUP BY p.product_id
      LIMIT 200
      `);

    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error('Error fetching products:', err.message || err);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

// Get single product by ID
exports.getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE product_id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product: rows[0] });
  } catch (err) {
    console.error('Error fetching product:', err.message || err);
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
};

// Add a new product
exports.addProduct = async (req, res) => {
  try {
    const { sku, product_name, description, category_id, price, retail_price, active } = req.body;

    const [result] = await pool.query(
      `INSERT INTO products (sku, product_name, description, category_id, price, retail_price, active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [sku, product_name, description, category_id || null, price || 0, retail_price || null, active ?? 1]
    );

    res.status(201).json({
      success: true,
      message: 'Product added',
      product_id: result.insertId,
    });
  } catch (err) {
    console.error('Error creating product:', err.message || err);
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
};

//updateProduct function
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { sku, product_name, description, category_id, price, retail_price, active } = req.body;

  try {
    // Basic check: if nothing is provided
    if (!sku && !product_name && !description && !category_id && !price && !retail_price && active === undefined) {
      return res.status(400).json({ success: false, message: "No fields provided to update" });
    }

    // Use COALESCE to only update values that are provided
    const [result] = await pool.query(
      `UPDATE products
       SET 
         sku = COALESCE(?, sku),
         product_name = COALESCE(?, product_name),
         description = COALESCE(?, description),
         category_id = COALESCE(?, category_id),
         price = COALESCE(?, price),
         retail_price = COALESCE(?, retail_price),
         active = COALESCE(?, active)
       WHERE product_id = ?`,
      [sku, product_name, description, category_id, price, retail_price, active, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product updated successfully" });
  } catch (err) {
    console.error("Error updating product:", err.message || err);
    res.status(500).json({ success: false, message: "Failed to update product" });
  }
};


// Delete a product
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM products WHERE product_id = ?', [id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: 'Product not found' });

    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err.message || err);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};


/*// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products LIMIT 200');
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error('Error fetching products:', err.message || err);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};*/

// Get single product by ID
exports.getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE product_id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product: rows[0] });
  } catch (err) {
    console.error('Error fetching product:', err.message || err);
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
};

// Add a new product
exports.addProduct = async (req, res) => {
  try {
    const { sku, product_name, description, category_id, price, retail_price, active } = req.body;

    const [result] = await pool.query(
      `INSERT INTO products (sku, product_name, description, category_id, price, retail_price, active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [sku, product_name, description, category_id || null, price || 0, retail_price || null, active ?? 1]
    );

    res.status(201).json({
      success: true,
      message: 'Product added',
      product_id: result.insertId,
    });
  } catch (err) {
    console.error('Error creating product:', err.message || err);
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { sku, product_name, description, category_id, price, retail_price, active } = req.body;

  try {
    if (!sku && !product_name && !description && !category_id && !price && !retail_price && active === undefined) {
      return res.status(400).json({ success: false, message: "No fields provided to update" });
    }

    const [result] = await pool.query(
      `UPDATE products
       SET 
         sku = COALESCE(?, sku),
         product_name = COALESCE(?, product_name),
         description = COALESCE(?, description),
         category_id = COALESCE(?, category_id),
         price = COALESCE(?, price),
         retail_price = COALESCE(?, retail_price),
         active = COALESCE(?, active)
       WHERE product_id = ?`,
      [sku, product_name, description, category_id, price, retail_price, active, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product updated successfully" });
  } catch (err) {
    console.error("Error updating product:", err.message || err);
    res.status(500).json({ success: false, message: "Failed to update product" });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM products WHERE product_id = ?', [id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: 'Product not found' });

    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err.message || err);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};

// Export Products as CSV (with category name)
exports.exportProductsCSV = async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT 
        p.product_id AS ID,
        p.sku AS SKU,
        p.product_name AS Name,
        p.description AS Description,
        c.category_name AS Category,
        p.price AS Price,
        p.retail_price AS RetailPrice,
        p.active AS Active,
        p.created_at AS CreatedAt
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      ORDER BY p.product_id ASC
    `);

    const fields = ['ID', 'SKU', 'Name', 'Description', 'Category', 'Price', 'RetailPrice', 'Active', 'CreatedAt'];
    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(results);

    res.header('Content-Type', 'text/csv');
    res.attachment('products.csv');
    res.send(csv);
  } catch (err) {
    console.error('Error exporting CSV:', err.message || err);
    res.status(500).json({ success: false, message: 'Failed to export CSV' });
  }
};

// Export Products as PDF
exports.exportProductsPDF = async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT 
        p.product_id AS ID,
        p.sku AS SKU,
        p.product_name AS Name,
        COALESCE(c.category_name, 'N/A') AS Category,
        p.description AS Description,
        p.price AS Price,
        p.retail_price AS RetailPrice,
        p.active AS Active,
        p.created_at AS CreatedAt
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      ORDER BY p.product_id ASC
    `);

    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=products_table.pdf');
    doc.pipe(res);

    // Layout config
    const startX = 30;
    let y = 50; // top position
    const pageBottom = doc.page.height - 40;
    const cellPadding = 6;

    // Columns: label and width
    const cols = [
      { key: 'ID', label: 'ID', width: 30 },
      { key: 'SKU', label: 'SKU', width: 70 },
      { key: 'Name', label: 'Name', width: 150 },
      { key: 'Description', label: 'Description', width: 170 },
      { key: 'Category', label: 'Category', width: 90 },
      { key: 'Price', label: 'Price', width: 60 },
      { key: 'RetailPrice', label: 'Retail', width: 60 },
      { key: 'Active', label: 'Active', width: 40 },
      { key: 'CreatedAt', label: 'Created At', width: 80 }
    ];

    // Helper: draw table header
    const drawHeader = () => {
      doc.font('Helvetica-Bold').fontSize(11);
      let x = startX;
      const headerHeight = 20;
      // draw header cells
      cols.forEach(col => {
        doc.rect(x, y, col.width, headerHeight).fill('#f0f0f0').stroke();
        doc.fillColor('black').text(col.label, x + cellPadding, y + 5, { width: col.width - cellPadding * 2, align: 'left' });
        x += col.width;
      });
      y += headerHeight;
    };

    // Draw page title + header
    doc.fontSize(16).font('Helvetica-Bold').text('Products Report', { align: 'center' });
    y += 10;
    drawHeader();
    doc.font('Helvetica').fontSize(10);

    // For each row, compute height required per cell, draw cell rects, then text
    for (let i = 0; i < results.length; i++) {
      const r = results[i];

      // prepare row values (string) in same order as cols
      const rowVals = cols.map(col => {
        // format values nicely
        let val = r[col.key];
        if (col.key === 'Price' || col.key === 'RetailPrice') {
          val = (val === null || val === undefined) ? '—' : `$${Number(val).toFixed(2)}`;
        } else if (col.key === 'Active') {
          val = r.Active ? 'Yes' : 'No';
        } else if (col.key === 'CreatedAt') {
          val = r.CreatedAt ? new Date(r.CreatedAt).toLocaleString() : '';
        } else if (val === null || val === undefined) {
          val = '';
        }
        return String(val);
      });

      // measure height per cell (wrapped)
      let rowHeight = 0;
      let x = startX;
      cols.forEach((col, idx) => {
        const text = rowVals[idx];
        const availableWidth = col.width - cellPadding * 2;
        const h = doc.heightOfString(text, { width: availableWidth });
        rowHeight = Math.max(rowHeight, h + cellPadding * 2);
        x += col.width;
      });

      // page break if needed
      if (y + rowHeight > pageBottom) {
        doc.addPage();
        y = 50;
        // redraw header on new page
        drawHeader();
        doc.font('Helvetica').fontSize(10);
      }

      // draw each cell rectangle + text
      x = startX;
      cols.forEach((col, idx) => {
        // cell rect (stroke draws border)
        doc.rect(x, y, col.width, rowHeight).fill('white').stroke();

        // write text inside with padding
        doc.fillColor('black').text(rowVals[idx], x + cellPadding, y + cellPadding, {
          width: col.width - cellPadding * 2,
          align: 'left'
        });

        x += col.width;
      });

      // move down
      y += rowHeight;
    }

    doc.end();
  } catch (err) {
    console.error('Error exporting products PDF:', err);
    res.status(500).json({ success: false, message: 'Failed to export PDF' });
  }
};



