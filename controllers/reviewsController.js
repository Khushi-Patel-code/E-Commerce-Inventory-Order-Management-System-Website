// controllers/reviewsController.js
const pool = require('../db/connection');

// CREATE
exports.createReview = async (req, res) => {
  try {
    const { product_id, user_id, rating, comment } = req.body;

    const [result] = await pool.query(
      `INSERT INTO reviews (product_id, user_id, rating, comment)
       VALUES (?, ?, ?, ?)`,
      [product_id, user_id, rating, comment]
    );

    res.json({ success: true, message: 'Review added successfully', review_id: result.insertId });
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(500).json({ success: false, message: 'Error creating review' });
  }
};

// READ ALL
exports.getReviews = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.review_id, r.product_id, p.product_name, r.user_id, u.username,
             r.rating, r.comment, r.review_date
      FROM reviews r
      JOIN products p ON r.product_id = p.product_id
      JOIN users u ON r.user_id = u.user_id
      ORDER BY r.review_date
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ success: false, message: 'Error fetching reviews' });
  }
};

// READ ONE
exports.getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT r.*, p.product_name, u.username
      FROM reviews r
      JOIN products p ON r.product_id = p.product_id
      JOIN users u ON r.user_id = u.user_id
      WHERE r.review_id = ?
    `, [id]);

    if (rows.length === 0)
      return res.status(404).json({ success: false, message: 'Review not found' });

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Error fetching review:', err);
    res.status(500).json({ success: false, message: 'Error fetching review' });
  }
};

// UPDATE
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    await pool.query(
      `UPDATE reviews SET rating = ?, comment = ? WHERE review_id = ?`,
      [rating, comment, id]
    );

    res.json({ success: true, message: 'Review updated successfully' });
  } catch (err) {
    console.error('Error updating review:', err);
    res.status(500).json({ success: false, message: 'Error updating review' });
  }
};

// DELETE
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM reviews WHERE review_id = ?`, [id]);
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ success: false, message: 'Error deleting review' });
  }
};
