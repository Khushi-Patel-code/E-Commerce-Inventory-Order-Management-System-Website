// controllers/categoriesController.js
const pool = require('../db/connection');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

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

// Export to CSV
exports.exportCategoriesCSV = async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT 
        category_id AS ID,
        category_name AS Name,
        description AS Description
      FROM categories
      ORDER BY category_id ASC
    `);

    const fields = ["ID", "Name", "Description"];
    const parser = new Parser({ fields });
    const csv = parser.parse(results);

    res.header("Content-Type", "text/csv");
    res.attachment("categories.csv");
    res.send(csv);

  } catch (err) {
    console.error("Error exporting categories CSV:", err);
    res.status(500).json({ success: false, message: "Failed to export categories CSV" });
  }
};


//Export to PDF
exports.exportCategoriesPDF = async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT 
        category_id AS ID,
        category_name AS Name,
        description AS Description
      FROM categories
      ORDER BY category_id ASC
    `);

    const doc = new PDFDocument({ margin: 30, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=categories.pdf");
    doc.pipe(res);

    // Title
    doc.fontSize(18).font("Helvetica-Bold").text("Categories Report", { align: "center" });
    doc.moveDown(1);

    // Table layout
    const tableTop = 100;
    const rowHeight = 35;
    const colWidths = [40, 150, 350]; // Adjusted for long description
    const headers = ["ID", "Category Name", "Description"];

    let x = 30;
    let y = tableTop;

    // Header background
    doc.rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight).fill("#f0f0f0");
    doc.fillColor("black").fontSize(12).font("Helvetica-Bold");

    let currentX = x;
    headers.forEach((header, i) => {
      doc.text(header, currentX + 5, y + 10, { width: colWidths[i] - 10 });
      currentX += colWidths[i];
    });

    doc.strokeColor("black").lineWidth(1)
      .rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight).stroke();

    y += rowHeight;

    // Rows
    doc.font("Helvetica").fontSize(10);

    results.forEach((r, idx) => {
      if (y > 750) {
        doc.addPage();
        y = tableTop;
      }

      // Alternate row color
      const bgColor = idx % 2 === 0 ? "#fafafa" : "white";
      doc.rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight).fill(bgColor);
      doc.fillColor("black");

      const row = [
        r.ID,
        r.Name,
        r.Description || "—"
      ];

      currentX = x;
      row.forEach((val, i) => {
        doc.text(String(val), currentX + 5, y + 10, {
          width: colWidths[i] - 10,
        });
        currentX += colWidths[i];
      });

      doc.strokeColor("black")
        .rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight)
        .stroke();

      y += rowHeight;
    });

    doc.end();

  } catch (err) {
    console.error("Error exporting categories PDF:", err);
    res.status(500).json({ success: false, message: "Failed to export categories PDF" });
  }
};