const express = require('express');
const router = express.Router();
const pool = require("../db/connection");
const adminController = require('../controllers/adminController');
const { authenticate, requireRole } = require('../utils/authMiddleware');

// Correct pattern: authenticate → requireRole → controller
router.get('/dashboard',
    authenticate,
    requireRole('admin'),
    adminController.viewDashboard
);

// total revenue last 30 days
router.get("/dashboard/revenue", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT COALESCE(SUM(total), 0) AS revenue
            FROM orders;
        `);

        res.json({ revenue: rows[0].revenue });
    } catch (err) {
        console.error("Error loading revenue:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Total products:
router.get("/dashboard/products", async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM products`);
        res.json({ totalProducts: rows[0].total });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// total customers
router.get("/dashboard/customers", async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM customers`);
        res.json({ totalCustomers: rows[0].total });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// total orderss
router.get("/dashboard/orders", async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM orders`);
        res.json({ totalOrders: rows[0].total });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/profile/:id", adminController.getAdminProfile);
router.put("/profile/:id", adminController.updateAdminProfile);

module.exports = router;
