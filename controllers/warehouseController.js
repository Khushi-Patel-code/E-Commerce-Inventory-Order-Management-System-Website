// controllers/warehouseController.js
const pool = require('../db/connection'); // your pool/connection module
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

// -------------------- CRUD OPERATIONS --------------------

// Get all warehouses
exports.getAllWarehouses = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM warehouses');
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
    const [rows] = await pool.query(
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
    // inputs have been validated & trimmed by express-validator middleware
    const warehouse_name = req.body.warehouse_name;
    const location = req.body.location ?? null;
    const contact_phone = req.body.contact_phone ?? null;

    // double-check required field (defensive)
    if (!warehouse_name || String(warehouse_name).trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Warehouse name is required' });
    }

    await pool.query(
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
  // express-validator sanitized/trimmed fields are in req.body
  const { warehouse_name, location, contact_phone } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE warehouses
       SET
         warehouse_name = COALESCE(?, warehouse_name),
         location = COALESCE(?, location),
         contact_phone = COALESCE(?, contact_phone)
       WHERE warehouse_id = ?`,
      [warehouse_name ?? null, location ?? null, contact_phone ?? null, id]
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
    const [result] = await pool.query('DELETE FROM warehouses WHERE warehouse_id = ?', [id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: 'Warehouse not found' });

    res.json({ success: true, message: 'Warehouse deleted' });
  } catch (err) {
    console.error('Error deleting warehouse:', err.message);
    res.status(500).json({ success: false, message: 'Failed to delete warehouse' });
  }
};

// EXPORT WAREHOUSE CSV
exports.exportWarehousesCSV = async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT 
        warehouse_id AS ID,
        warehouse_name AS Name,
        location AS Location,
        contact_phone AS Phone,
        created_at AS CreatedAt
      FROM warehouses
      ORDER BY warehouse_id ASC
    `);

    const fields = ["ID", "Name", "Location", "Phone", "CreatedAt"];
    const json2csv = new Parser({ fields });

    const csv = json2csv.parse(results);

    res.header("Content-Type", "text/csv");
    res.attachment("warehouses.csv");
    res.send(csv);

  } catch (err) {
    console.error("Error exporting warehouse CSV:", err);
    res.status(500).json({ success: false, message: "Failed to export warehouse CSV" });
  }
};

// EXPORT WAREHOUSE PDF
exports.exportWarehousesPDF = async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT 
        warehouse_id AS ID,
        warehouse_name AS Name,
        location AS Location,
        contact_phone AS Phone,
        created_at AS CreatedAt
      FROM warehouses
      ORDER BY warehouse_id ASC
    `);

    const doc = new PDFDocument({ margin: 30, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=warehouses.pdf");
    doc.pipe(res);

    // Title
    doc.fontSize(18).font("Helvetica-Bold").text("Warehouse Report", { align: "center" });
    doc.moveDown(1);

    // Table setup
    const tableTop = 100;
    const rowHeight = 25;
    const colWidths = [30, 150, 100, 120, 140]; 
    const headers = ["ID", "Name", "Location", "Phone", "Created"];

    let x = 30;
    let y = tableTop;

    // Header background
    doc.rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight).fill("#f0f0f0");
    doc.fillColor("black").fontSize(11).font("Helvetica-Bold");

    // Header text
    let currentX = x;
    headers.forEach((header, i) => {
      doc.text(header, currentX + 5, y + 7, { width: colWidths[i] - 10 });
      currentX += colWidths[i];
    });

    // Border
    doc.strokeColor("black").rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight).stroke();
    y += rowHeight;

    // ROWS
    doc.font("Helvetica").fontSize(10);

    results.forEach((w, index) => {
      if (y > 750) {
        doc.addPage();
        y = tableTop;
      }

      // Alternate color
      const bgColor = index % 2 === 0 ? "#fafafa" : "white";
      doc.rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight).fill(bgColor);
      doc.fillColor("black");

      const row = [
        w.ID,
        w.Name,
        w.Location || "N/A",
        w.Phone || "—",
        new Date(w.CreatedAt).toLocaleString()
      ];

      currentX = x;
      row.forEach((val, i) => {
        doc.text(String(val), currentX + 5, y + 7, {
          width: colWidths[i] - 10,
          align: "left"
        });
        currentX += colWidths[i];
      });

      doc.strokeColor("black").rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight).stroke();

      y += rowHeight;
    });

    doc.end();

  } catch (err) {
    console.error("Error exporting warehouse PDF:", err);
    res.status(500).json({ success: false, message: "Failed to export warehouse PDF" });
  }
};
