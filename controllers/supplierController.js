// controllers/supplierController.js
const pool = require('../db/connection');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

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

// EXPORT SUPPLIERS CSV
exports.exportSuppliersCSV = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT supplier_id, supplier_name, contact_name, email, phone, address, created_at
      FROM suppliers
      ORDER BY supplier_id ASC
    `);

    // Set CSV headers
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=suppliers.csv");

    // CSV column headers
    let csv = "ID,Supplier Name,Contact Name,Email,Phone,Address,Created At\n";

    // Append all rows
    rows.forEach((r) => {
      const row = [
        r.supplier_id,
        `"${r.supplier_name}"`,
        `"${r.contact_name || ""}"`,
        `"${r.email || ""}"`,
        `"${r.phone || ""}"`,
        `"${r.address || ""}"`,
        new Date(r.created_at).toISOString().split("T")[0],
      ];
      csv += row.join(",") + "\n";
    });

    res.send(csv);

  } catch (err) {
    console.error("Error exporting suppliers CSV:", err);
    res.status(500).json({ success: false, message: "Failed to export suppliers CSV" });
  }
};

// EXPORT SUPPLIERS PDF
exports.exportSuppliersPDF = async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT supplier_id AS ID, supplier_name AS Name, contact_name AS Contact, email AS Email, phone AS Phone, address AS Address, created_at AS CreatedAt
      FROM suppliers
      ORDER BY supplier_id ASC
    `);

    const doc = new PDFDocument({ margin: 30, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=suppliers.pdf");
    doc.pipe(res);

    // ----- Title -----
    doc.fontSize(18).font("Helvetica-Bold").text("Suppliers Report", { align: "center" });
    doc.moveDown(1);

    // ----- Table Setup -----
    const tableTop = 100;
    const rowHeight = 50;
    const colWidths = [25, 70, 60, 140, 100, 100, 55];  
    const headers = ["ID", "Supplier Name", "Contact", "Email", "Phone", "Address", "Created At"];

    let x = 30;
    let y = tableTop;

    // Header Background
    doc.rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight).fill("#f0f0f0");
    doc.fillColor("black").fontSize(11).font("Helvetica-Bold");

    // Headers text
    let currentX = x;
    headers.forEach((header, i) => {
      doc.text(header, currentX + 5, y + 7, { width: colWidths[i] - 10 });
      currentX += colWidths[i];
    });

    // Header border
    doc.strokeColor("black").rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight).stroke();
    y += rowHeight;

    // ----- Rows -----
    doc.font("Helvetica").fontSize(10);

    results.forEach((r, idx) => {
      if (y > 750) {
        doc.addPage();
        y = tableTop;
      }

      const bgColor = idx % 2 === 0 ? "#fafafa" : "white";
      doc.rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight).fill(bgColor);
      doc.fillColor("black");

      const row = [
        r.ID,
        r.Name,
        r.Contact || "",
        r.Email || "",
        r.Phone || "",
        r.Address || "",
        new Date(r.CreatedAt).toLocaleDateString(),
      ];

      currentX = x;
      row.forEach((val, i) => {
        doc.text(String(val), currentX + 5, y + 7, { width: colWidths[i] - 10 });
        currentX += colWidths[i];
      });

      // Row border
      doc.strokeColor("black").rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight).stroke();
      y += rowHeight;
    });

    doc.end();

  } catch (err) {
    console.error("Error exporting suppliers PDF:", err);
    res.status(500).json({ success: false, message: "Failed to export suppliers PDF" });
  }
};