// controllers/inventoryController.js
const pool = require('../db/connection');

// CREATE
exports.createInventory = async (req, res) => {
  try {
    const { product_id, warehouse_id, quantity } = req.body;

    const [result] = await pool.query(
      `INSERT INTO inventory (product_id, warehouse_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), last_updated = CURRENT_TIMESTAMP`,
      [product_id, warehouse_id, quantity]
    );

    res.json({ success: true, message: 'Inventory record added/updated', inventory_id: result.insertId });
  } catch (err) {
    console.error('Error creating inventory record:', err);
    res.status(500).json({ success: false, message: 'Error creating inventory record' });
  }
};

// READ ALL
exports.getInventory = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT i.inventory_id, i.product_id, p.product_name, i.warehouse_id, w.warehouse_name, 
             i.quantity, i.last_updated
      FROM inventory i
      JOIN products p ON i.product_id = p.product_id
      JOIN warehouses w ON i.warehouse_id = w.warehouse_id
      ORDER BY i.inventory_id
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).json({ success: false, message: 'Error fetching inventory' });
  }
};

// READ ONE
exports.getInventoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT i.*, p.product_name, w.warehouse_name
      FROM inventory i
      JOIN products p ON i.product_id = p.product_id
      JOIN warehouses w ON i.warehouse_id = w.warehouse_id
      WHERE i.inventory_id = ?
    `, [id]);

    if (rows.length === 0)
      return res.status(404).json({ success: false, message: 'Inventory record not found' });

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Error fetching inventory record:', err);
    res.status(500).json({ success: false, message: 'Error fetching inventory record' });
  }
};

// UPDATE
exports.updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    await pool.query(
      `UPDATE inventory SET quantity = ?, last_updated = CURRENT_TIMESTAMP WHERE inventory_id = ?`,
      [quantity, id]
    );

    res.json({ success: true, message: 'Inventory updated successfully' });
  } catch (err) {
    console.error('Error updating inventory:', err);
    res.status(500).json({ success: false, message: 'Error updating inventory' });
  }
};

// DELETE
exports.deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM inventory WHERE inventory_id = ?`, [id]);
    res.json({ success: true, message: 'Inventory record deleted successfully' });
  } catch (err) {
    console.error('Error deleting inventory:', err);
    res.status(500).json({ success: false, message: 'Error deleting inventory' });
  }
};
