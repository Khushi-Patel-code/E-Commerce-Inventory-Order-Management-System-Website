// controllers/categoryController.js
const pool = require('../db/connection');

// CREATE
exports.createCategory = async (req, res) => {
  try {
    const { category_name, description } = req.body;

    if (!category_name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const [result] = await pool.query(
      `INSERT INTO categories (category_name, description) VALUES (?, ?)`,
      [category_name, description || null]
    );

    res.json({ success: true, message: 'Category added successfully', category_id: result.insertId });
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ success: false, message: 'Error creating category' });
  }
};

// READ ALL
exports.getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM categories ORDER BY category_id`);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ success: false, message: 'Error fetching categories' });
  }
};

// READ ONE
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`SELECT * FROM categories WHERE category_id = ?`, [id]);

    if (rows.length === 0)
      return res.status(404).json({ success: false, message: 'Category not found' });

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Error fetching category:', err);
    res.status(500).json({ success: false, message: 'Error fetching category' });
  }
};

// UPDATE
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name, description } = req.body;

    await pool.query(
      `UPDATE categories SET category_name = ?, description = ? WHERE category_id = ?`,
      [category_name, description, id]
    );

    res.json({ success: true, message: 'Category updated successfully' });
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ success: false, message: 'Error updating category' });
  }
};

// DELETE
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM categories WHERE category_id = ?`, [id]);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ success: false, message: 'Error deleting category' });
  }
};
