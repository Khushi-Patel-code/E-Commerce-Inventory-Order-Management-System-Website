const pool = require('../db/connection');

// Chart 1: Revenue vs Date
async function getRevenueVsDate() {
    const [rows] = await pool.query(`
        SELECT DATE(order_date) AS date, SUM(total) AS revenue
        FROM orders
        GROUP BY DATE(order_date)
        ORDER BY DATE(order_date)
    `);
    return rows;
}

// Chart 2: Revenue by Category
async function getRevenueByCategory() {
    const [rows] = await pool.query(`
        SELECT c.category_name, SUM(oi.line_total) AS revenue
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        JOIN categories c ON p.category_id = c.category_id
        GROUP BY c.category_name
        ORDER BY revenue DESC
    `);
    return rows;
}

// Chart 3: Top Selling Products
async function getTopProducts() {
    const [rows] = await pool.query(`
        SELECT p.product_name, SUM(oi.quantity) AS units_sold
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        GROUP BY p.product_name
        ORDER BY units_sold DESC
        LIMIT 10
    `);
    return rows;
}

module.exports = { getRevenueVsDate, getRevenueByCategory, getTopProducts };
