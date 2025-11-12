// controllers/productController.js
const pool = require('../db/connection');

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