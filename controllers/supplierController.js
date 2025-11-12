// controllers/supplierController.js
const pool = require('../db/connection');

// CREATE new entry
exports.createSupplier = async (req, res) => {
  try {
    const { supplier_name, contact_name, email, phone, address } = req.body;

    const [result] = await pool.query(
      `INSERT INTO suppliers (supplier_name, contact_name, email, phone, address)
       VALUES (?, ?, ?, ?, ?)`,
      [supplier_name, contact_name, email, phone, address]
    );

    res.json({ success: true, message: 'Supplier created successfully', supplier_id: result.insertId });
  } catch (err) {
    console.error('Error creating supplier:', err);
    res.status(500).json({ success: false, message: 'Error creating supplier' });
  }
};

// READ ALL
exports.getSuppliers = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM suppliers ORDER BY supplier_id`);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching suppliers:', err);
    res.status(500).json({ success: false, message: 'Error fetching suppliers' });
  }
};

// READ by ID
exports.getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`SELECT * FROM suppliers WHERE supplier_id = ?`, [id]);

    if (rows.length === 0)
      return res.status(404).json({ success: false, message: 'Supplier not found' });

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Error fetching supplier:', err);
    res.status(500).json({ success: false, message: 'Error fetching supplier' });
  }
};

// UPDATE
exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { supplier_name, contact_name, email, phone, address } = req.body;

    await pool.query(
      `UPDATE suppliers 
       SET supplier_name = ?, contact_name = ?, email = ?, phone = ?, address = ? 
       WHERE supplier_id = ?`,
      [supplier_name, contact_name, email, phone, address, id]
    );

    res.json({ success: true, message: 'Supplier updated successfully' });
  } catch (err) {
    console.error('Error updating supplier:', err);
    res.status(500).json({ success: false, message: 'Error updating supplier' });
  }
};

//  DELETE
exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM suppliers WHERE supplier_id = ?`, [id]);
    res.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (err) {
    console.error('Error deleting supplier:', err);
    res.status(500).json({ success: false, message: 'Error deleting supplier' });
  }
};
