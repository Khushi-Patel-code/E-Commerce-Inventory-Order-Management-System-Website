// controllers/productController.js
const pool = require('../db/connection');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');


// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
  SELECT 
      p.product_id,
      p.sku,
      p.product_name,
      p.description,
      p.category_id,
      p.price,
      p.retail_price,
      p.active,
      p.created_at,
      IFNULL(SUM(i.quantity), 0) AS stock
  FROM products p
  LEFT JOIN inventory i ON p.product_id = i.product_id
  GROUP BY p.product_id
  ORDER BY p.product_id
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

// Export Products as CSV
exports.exportProductsCSV = async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT 
        p.product_id AS ID,
        p.sku AS SKU,
        p.product_name AS Name,
        p.description AS Description,
        COALESCE(c.category_name, 'N/A') AS Category,
        p.price AS Price,
        p.retail_price AS RetailPrice,
        p.active AS Active,
        p.created_at AS CreatedAt
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      ORDER BY p.product_id ASC
    `);

    // Define fields for the CSV parser
    const fields = [
      "ID", "SKU", "Name", "Description", "Category", 
      "Price", "RetailPrice", "Active", "CreatedAt"
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(results);

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
        p.price AS Price,
        p.retail_price AS RetailPrice,
        p.active AS Active,
        p.created_at AS CreatedAt
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      ORDER BY p.product_id ASC
    `);

    const doc = new PDFDocument({ margin: 30, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=products_report.pdf");

    doc.pipe(res);

    // Title
    doc.fontSize(18).font("Helvetica-Bold").text("Products Report", { align: "center" });
    doc.moveDown(1);

    // Table layout
    const tableTop = 100;
    const rowHeight = 30;

    // Adjusted headers and widths for Product data
    const headers = ["ID", "SKU", "Name", "Category", "$Price", "$Retail", "Active", "Created At"];

    const colWidths = [30, 60, 130, 75, 60, 60, 50, 70]; 

    let x = 30;
    let y = tableTop;

    // Header styling
    doc.rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight).fill("#f0f0f0");
    doc.fillColor("black").font("Helvetica-Bold").fontSize(10);

    let currentX = x;
    headers.forEach((h, i) => {
      doc.text(h, currentX + 5, y + 7, { width: colWidths[i] - 10 });
      currentX += colWidths[i];
    });

    doc.strokeColor("black").rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight).stroke();
    y += rowHeight;

    // Rows
    doc.font("Helvetica").fontSize(9);

    results.forEach((p, index) => {
      if (y > 750) { // Check for page break
        doc.addPage();
        y = tableTop;
        // Redraw header on new page
        doc.rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight).fill("#f0f0f0");
        doc.fillColor("black").font("Helvetica-Bold").fontSize(10);
        let currentXHeader = x;
        headers.forEach((h, i) => {
          doc.text(h, currentXHeader + 5, y + 7, { width: colWidths[i] - 10 });
          currentXHeader += colWidths[i];
        });
        doc.strokeColor("black").rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight).stroke();
        y += rowHeight;
        doc.font("Helvetica").fontSize(9);
      }

      // Alternating colors
      const bgColor = index % 2 === 0 ? "#fafafa" : "white";
      doc.rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight).fill(bgColor);
      doc.fillColor("black");

      // Format row values 
      const row = [
        p.ID,
        p.SKU,
        p.Name,
        p.Category,
        // Price formatting
        p.Price !== null ? `$${Number(p.Price).toFixed(2)}` : '—', 
        p.RetailPrice !== null ? `$${Number(p.RetailPrice).toFixed(2)}` : '—',
        // Active formatting
        p.Active === 1 ? 'Yes' : 'No', 
        // Date formatting
        p.CreatedAt ? new Date(p.CreatedAt).toLocaleDateString() : '—'
      ];

      currentX = x;
      row.forEach((val, i) => {
        doc.text(String(val), currentX + 5, y + 7, { width: colWidths[i] - 10, align: 'left', ellipsis: true });
        currentX += colWidths[i];
      });

      doc.strokeColor("black").rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight).stroke();
      y += rowHeight;
    });

    doc.end();

  } catch (err) {
    console.error("Error exporting products PDF:", err.message || err);
    res.status(500).json({ success: false, message: "Failed to export products PDF" });
  }
};



