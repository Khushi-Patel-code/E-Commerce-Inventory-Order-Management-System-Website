// controllers/orderController.js
const pool = require('../db/connection');

// 🟢 Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        o.*, 
        c.first_name AS customer_first_name, 
        c.last_name AS customer_last_name
      FROM orders o
      JOIN customers c ON o.customer_id = c.customer_id
      ORDER BY o.order_date DESC
      LIMIT 200
    `);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error('Error fetching orders:', err.message || err);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

// 🟢 Get order by ID
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

// 🟢 Add a new order
exports.addOrder = async (req, res) => {
  try {
    const {
      order_number,
      customer_id,
      order_status,
      shipping_address,
      billing_address,
      subtotal,
      tax,
      shipping_fee,
      total,
      created_by,
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO orders 
      (order_number, customer_id, order_status, shipping_address, billing_address, subtotal, tax, shipping_fee, total, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order_number,
        customer_id,
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
    });
  } catch (err) {
    console.error('Error adding order:', err.message || err);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
};

// 🟢 Update order
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

// 🟢 Delete order
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
