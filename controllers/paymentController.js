// controllers/paymentController.js
const pool = require('../db/connection');

// CREATE
exports.createPayment = async (req, res) => {
  try {
    const { order_id, payment_method, payment_status, amount, paid_at, transaction_ref } = req.body;

    const [result] = await pool.query(
      `INSERT INTO payments (order_id, payment_method, payment_status, amount, paid_at, transaction_ref)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [order_id, payment_method, payment_status, amount, paid_at || null, transaction_ref || null]
    );

    res.json({ success: true, message: 'Payment record created successfully', payment_id: result.insertId });
  } catch (err) {
    console.error('Error creating payment:', err);
    res.status(500).json({ success: false, message: 'Error creating payment' });
  }
};

// READ ALL
exports.getPayments = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.payment_id, p.order_id, o.customer_id, p.payment_method, p.payment_status, 
             p.amount, p.paid_at, p.transaction_ref
      FROM payments p
      JOIN orders o ON p.order_id = o.order_id
      ORDER BY p.payment_id
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ success: false, message: 'Error fetching payments' });
  }
};

// READ ONE
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(`
      SELECT p.*, o.customer_id
      FROM payments p
      JOIN orders o ON p.order_id = o.order_id
      WHERE p.payment_id = ?
    `, [id]);

    if (rows.length === 0)
      return res.status(404).json({ success: false, message: 'Payment record not found' });

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Error fetching payment:', err);
    res.status(500).json({ success: false, message: 'Error fetching payment record' });
  }
};

// UPDATE
exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status, paid_at, transaction_ref } = req.body;

    await pool.query(
      `UPDATE payments SET payment_status = ?, paid_at = ?, transaction_ref = ? WHERE payment_id = ?`,
      [payment_status, paid_at || null, transaction_ref || null, id]
    );

    res.json({ success: true, message: 'Payment record updated successfully' });
  } catch (err) {
    console.error('Error updating payment:', err);
    res.status(500).json({ success: false, message: 'Error updating payment record' });
  }
};

// DELETE
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM payments WHERE payment_id = ?`, [id]);
    res.json({ success: true, message: 'Payment record deleted successfully' });
  } catch (err) {
    console.error('Error deleting payment:', err);
    res.status(500).json({ success: false, message: 'Error deleting payment record' });
  }
};
