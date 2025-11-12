// controllers/warehouseController.js
const db = require('../db/connection');

// -------------------- CRUD OPERATIONS --------------------

// Get all warehouses
exports.getAllWarehouses = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM warehouses');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching warehouses:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch warehouses' });
  }
};

// Get warehouse by ID
exports.getWarehouseById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT warehouse_id, warehouse_name, location, contact_phone, created_at FROM warehouses WHERE warehouse_id = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Warehouse not found' });
    }
    res.json({ success: true, warehouse: rows[0] });
  } catch (err) {
    console.error('Error fetching warehouse:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch warehouse' });
  }
};

// Create warehouse
exports.createWarehouse = async (req, res) => {
  try {
    const { warehouse_name, location, contact_phone } = req.body;

    if (!warehouse_name) {
      return res.status(400).json({ success: false, message: 'Warehouse name is required' });
    }

    await db.query(
      'INSERT INTO warehouses (warehouse_name, location, contact_phone) VALUES (?, ?, ?)',
      [warehouse_name, location, contact_phone]
    );

    res.json({ success: true, message: 'Warehouse created successfully' });
  } catch (err) {
    console.error('Error creating warehouse:', err.message);
    res.status(500).json({ success: false, message: 'Failed to create warehouse' });
  }
};

// Update warehouse
exports.updateWarehouse = async (req, res) => {
  const { id } = req.params;
  const { warehouse_name, location, contact_phone } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE warehouses
       SET
         warehouse_name = COALESCE(?, warehouse_name),
         location = COALESCE(?, location),
         contact_phone = COALESCE(?, contact_phone)
       WHERE warehouse_id = ?`,
      [warehouse_name, location, contact_phone, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: 'Warehouse not found' });

    res.json({ success: true, message: 'Warehouse updated successfully' });
  } catch (err) {
    console.error('Error updating warehouse:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update warehouse' });
  }
};

// Delete warehouse
exports.deleteWarehouse = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM warehouses WHERE warehouse_id = ?', [id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: 'Warehouse not found' });

    res.json({ success: true, message: 'Warehouse deleted' });
  } catch (err) {
    console.error('Error deleting warehouse:', err.message);
    res.status(500).json({ success: false, message: 'Failed to delete warehouse' });
  }
};
