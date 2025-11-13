// controllers/paymentController.js
const pool = require('../db/connection');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

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

// EXPORT PAYMENTS CSV
exports.exportPaymentsCSV = async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT 
        p.payment_id AS PaymentID,
        p.order_id AS OrderID,
        p.payment_method AS Method,
        p.payment_status AS Status,
        p.amount AS Amount,
        p.paid_at AS PaidAt,
        p.transaction_ref AS TransactionRef
      FROM payments p
      ORDER BY p.payment_id ASC
    `);

    const fields = [
      "PaymentID",
      "OrderID",
      "Method",
      "Status",
      "Amount",
      "PaidAt",
      "TransactionRef"
    ];

    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(results);

    res.header("Content-Type", "text/csv");
    res.attachment("payments.csv");
    res.send(csv);

  } catch (err) {
    console.error("Error exporting payments CSV:", err);
    res.status(500).json({ success: false, message: "Failed to export payments CSV" });
  }
};


// EXPORT PAYMENTS PDF
exports.exportPaymentsPDF = async (req, res) => {
  try {
    const [results] = await pool.query(`
      SELECT 
        p.payment_id AS PaymentID,
        p.order_id AS OrderID,
        p.payment_method AS Method,
        p.payment_status AS Status,
        p.amount AS Amount,
        p.paid_at AS PaidAt,
        p.transaction_ref AS TransactionRef
      FROM payments p
      ORDER BY p.payment_id ASC
    `);

    const doc = new PDFDocument({ margin: 30, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=payments.pdf");
    doc.pipe(res);

    // ----- Title -----
    doc.fontSize(18).font("Helvetica-Bold").text("Payments Summary Report", { align: "center" });
    doc.moveDown(1);

    // ----- Table Setup -----
    const tableTop = 100;
    const rowHeight = 25;
    const colWidths = [30, 40, 90, 80, 60, 140, 120];
    const headers = ["ID", "Order", "Method", "Status", "Amount", "Paid At", "Transaction Ref"];

    let x = 30;
    let y = tableTop;

    // Header Background
    doc.rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight).fill("#f0f0f0");
    doc.fillColor("black").fontSize(11).font("Helvetica-Bold");

    // Header Text
    let currentX = x;
    headers.forEach((header, i) => {
      doc.text(header, currentX + 5, y + 7, { width: colWidths[i] - 10 });
      currentX += colWidths[i];
    });

    // Header Border
    doc.strokeColor("black").rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight).stroke();
    y += rowHeight;

    // ----- Rows -----
    doc.font("Helvetica").fontSize(10);

    results.forEach((r, idx) => {
      if (y > 750) {
        doc.addPage();
        y = tableTop;

        // Redraw header on new page
        doc.rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight).fill("#f0f0f0");
        doc.fillColor("black").font("Helvetica-Bold");

        currentX = x;
        headers.forEach((header, i) => {
          doc.text(header, currentX + 5, y + 7, { width: colWidths[i] - 10 });
          currentX += colWidths[i];
        });

        doc.strokeColor("black").rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight).stroke();
        y += rowHeight;
        doc.font("Helvetica").fontSize(10);
      }

      // Row background
      const bgColor = idx % 2 === 0 ? "#fafafa" : "white";
      doc.rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight).fill(bgColor);
      doc.fillColor("black");

      const row = [
        r.PaymentID,
        r.OrderID,
        r.Method,
        r.Status,
        `$${Number(r.Amount).toFixed(2)}`,
        r.PaidAt ? new Date(r.PaidAt).toLocaleString() : "—",
        r.TransactionRef ?? "—"
      ];

      currentX = x;
      row.forEach((val, i) => {
        doc.text(String(val), currentX + 5, y + 7, { width: colWidths[i] - 10 });
        currentX += colWidths[i];
      });

      // Border
      doc.strokeColor("black").rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight).stroke();

      y += rowHeight;
    });

    doc.end();

  } catch (err) {
    console.error("Error exporting payments PDF:", err);
    res.status(500).json({ success: false, message: "Failed to export payments PDF" });
  }
};
