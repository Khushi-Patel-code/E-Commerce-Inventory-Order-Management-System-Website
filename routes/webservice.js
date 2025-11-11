// routes/webservice.js
const express = require("express");
const router = express.Router();
const pool = require("../db/connection");

// REST/JSON web service endpoint
router.get("/products-json", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products");
    res.json({
      success: true,
      count: rows.length,
      products: rows
    });
  } catch (err) {
    console.error("WebService Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
});

module.exports = router;
