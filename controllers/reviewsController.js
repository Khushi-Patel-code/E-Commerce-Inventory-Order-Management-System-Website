// controllers/reviewsController.js
const pool = require('../db/connection');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');


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

// EXPORT REVIEWS CSV
exports.exportReviewsCSV = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        r.review_id, 
        p.product_name, 
        u.username AS customer_name, 
        r.rating, 
        r.comment AS review_text, 
        r.review_date
      FROM reviews r
      JOIN products p ON r.product_id = p.product_id
      JOIN users u ON r.user_id = u.user_id
      ORDER BY r.review_date
    `);

    // Set CSV headers
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=reviews.csv");

    // CSV column headers
    let csv = "Review ID,Product Name,Username,Rating,Comment,Review Date\n";

    // Append all rows
    rows.forEach((r) => {
      const row = [
        r.review_id,
        `"${r.product_name}"`,
        `"${r.username}"`,
        r.rating,
        `"${(r.comment || "").replace(/"/g, '""')}"`, // Escape quotes
        new Date(r.review_date).toISOString().split("T")[0],
      ];

      csv += row.join(",") + "\n";
    });

    res.send(csv);

  } catch (err) {
    console.error("Error exporting reviews CSV:", err);
    res.status(500).json({ success: false, message: "Failed to export reviews CSV" });
  }
};

// EXPORT REVIEWS PDF
exports.exportReviewsPDF = async (req, res) => {
  try {
    const [results] = await pool.query(`
       SELECT 
        r.review_id AS ReviewID,
        p.product_name AS Product,
        u.username AS Customer,
        r.rating AS Rating,
        r.comment AS ReviewText,
        r.review_date AS ReviewDate
      FROM reviews r
      JOIN products p ON r.product_id = p.product_id
      JOIN users u ON r.user_id = u.user_id
      ORDER BY r.review_id ASC
    `);

    const doc = new PDFDocument({ margin: 30, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=reviews.pdf");
    doc.pipe(res);

    // ----- Title -----
    doc.fontSize(18).font("Helvetica-Bold").text("Reviews Report", { align: "center" });
    doc.moveDown(1);

    // ----- Table Setup -----
    const tableTop = 100;
    const rowHeight = 50;
    const colWidths = [30, 120, 100, 50, 180, 70];  
    const headers = ["ID", "Product", "Customer", "Rating", "Review", "Date"];

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

      // Alternate row colors
      const bgColor = idx % 2 === 0 ? "#fafafa" : "white";
      doc.rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight).fill(bgColor);
      doc.fillColor("black");

      const row = [
        r.ReviewID,
        r.Product,
        r.Customer,
        r.Rating,
        r.ReviewText,
        new Date(r.ReviewDate).toLocaleString(),
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
    console.error("Error exporting reviews PDF:", err);
    res.status(500).json({ success: false, message: "Failed to export reviews PDF" });
  }
};
