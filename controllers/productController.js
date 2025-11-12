// controllers/productController.js
const pool = require('../db/connection');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products LIMIT 200');
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

// Simpler updateProduct function
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


// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products LIMIT 200');
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

// ✅ Export Products as CSV
exports.exportProductsCSV = async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM products');
    const json2csv = new Parser();
    const csv = json2csv.parse(results);
    res.header('Content-Type', 'text/csv');
    res.attachment('products.csv');
    res.send(csv);
  } catch (err) {
    console.error('Error exporting CSV:', err.message || err);
    res.status(500).json({ success: false, message: 'Failed to export CSV' });
  }
};

// ✅ Export Products as PDF
exports.exportProductsPDF = async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM products');

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=products_table.pdf');
    doc.pipe(res);

    // Title
    doc.fontSize(18).text('Products Report', { align: 'center' });
    doc.moveDown(1);

    // Table Header Styles
    doc.fontSize(12).font('Helvetica-Bold');

    const headers = [
      'ID', 'SKU', 'Name', 'Description', 'Category ID',
      'Price', 'Retail Price', 'Active', 'Created At'
    ];

    // Column x positions (tweak spacing as needed)
    const xPositions = [30, 70, 140, 250, 400, 460, 520, 580, 630];
    const startY = doc.y;
    let y = startY + 10;

    // Draw headers
    headers.forEach((header, i) => {
      doc.text(header, xPositions[i], y);
    });

    doc.moveTo(30, y + 15).lineTo(560, y + 15).stroke(); // underline header
    y += 25;

    // Table Content
    doc.font('Helvetica').fontSize(10);

    results.forEach((p) => {
      if (y > 750) {  // new page when nearing bottom
        doc.addPage();
        y = 50;
      }

      const rowData = [
        p.product_id,
        p.sku,
        p.product_name,
        (p.description || '').slice(0, 25) + (p.description?.length > 25 ? '...' : ''), // short desc
        p.category_id ?? 'N/A',
        `$${p.price}`,
        p.retail_price ? `$${p.retail_price}` : '—',
        p.active ? 'Yes' : 'No',
        new Date(p.created_at).toLocaleDateString()
      ];

      rowData.forEach((val, i) => {
        doc.text(String(val), xPositions[i], y, { width: 100 });
      });

      y += 18;
    });

    doc.end();
  } catch (err) {
    console.error('Error exporting products PDF:', err);
    res.status(500).json({ success: false, message: 'Failed to export PDF' });
  }
};

