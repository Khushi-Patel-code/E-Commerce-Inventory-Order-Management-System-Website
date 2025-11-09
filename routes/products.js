// routes/products.js
const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// GET /api/products
// Returns rows from your products table (adjust column list if you want)
router.get('/', async (req, res) => {
  try {
    // If your table uses a different name, change 'products' below.
    const [rows] = await pool.query('SELECT * FROM products LIMIT 200');
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error('Error fetching products:', err.message || err);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

module.exports = router;
