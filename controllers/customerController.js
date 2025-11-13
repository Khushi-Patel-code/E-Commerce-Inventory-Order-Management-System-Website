//customerController
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/connection');

const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

// -------------------- AUTHENTICATION --------------------

// Register a new customer

exports.registerCustomer = async (req, res) => {
    try {
        const {first_name, last_name, email, password, phone, billing_address, shipping_address} = req.body;

        const [existing] = await db.query('SELECT * FROM customers WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({message: 'Email already registered'});
        }

        const password_hash = await bcrypt.hash(password, 10);

        await db.query(
            'INSERT INTO customers (first_name, last_name, email, password_hash, phone, billing_address, shipping_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [first_name, last_name, email, password_hash, phone, billing_address, shipping_address]
        );

        res.json({message: 'Customer registered successfully!'});
    } catch (err){
        console.error('Customer registration error:', err.message);
        res.status(500).json({message: 'Registration failed'});
    }
};

// Login a customer
exports.loginCustomer = async (req, res) => {
    try {
        const {email, password} = req.body;
        const [rows] = await db.query('SELECT * FROM customers WHERE email = ?', [email]);
        const customer = rows[0];

        if (!customer || !(await bcrypt.compare(password, customer.password_hash))) {
            return res.status(401).json({message: 'Invalid Credentials'});
        }

        //debug: confitm JWT secret is loaded
        console.log('JWT_SECRET value:', process.env.JWT_SECRET);

        const token = jwt.sign(
            {id: customer.customer_id, role: 'customer'},
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        );

        res.json({token, role: 'customer'});
    }   catch (err) {
        console.error('Customer login error:', err.message);
        res.status(500).json({message: 'Login failed'});
    }
};


// -------------------- CRUD OPERATIONS --------------------

// Get all customers

exports.getAllCustomers = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM customers');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch customers' });
  }
};

// Get single customer by ID
exports.getCustomerById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT customer_id, first_name, last_name, email, phone, billing_address, shipping_address FROM customers WHERE customer_id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, customer: rows[0] });
  } catch (err) {
    console.error('Error fetching customer:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch customer' });
  }
};

// Update a customer
exports.updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, phone, billing_address, shipping_address, password } = req.body;

  try {
    // Hash new password if provided
    let password_hash = null;
    if (password) {
      password_hash = await bcrypt.hash(password, 10);
    }

    const [result] = await db.query(
      `UPDATE customers
       SET
         first_name = COALESCE(?, first_name),
         last_name = COALESCE(?, last_name),
         email = COALESCE(?, email),
         phone = COALESCE(?, phone),
         billing_address = COALESCE(?, billing_address),
         shipping_address = COALESCE(?, shipping_address),
         password_hash = COALESCE(?, password_hash)
       WHERE customer_id = ?`,
      [first_name, last_name, email, phone, billing_address, shipping_address, password_hash, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: 'Customer not found' });

    res.json({ success: true, message: 'Customer updated successfully' });
  } catch (err) {
    console.error('Error updating customer:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update customer' });
  }
};

// Delete a customer
exports.deleteCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM customers WHERE customer_id = ?', [id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: 'Customer not found' });

    res.json({ success: true, message: 'Customer deleted' });
  } catch (err) {
    console.error('Error deleting customer:', err.message);
    res.status(500).json({ success: false, message: 'Failed to delete customer' });
  }
};

// Export CSV
exports.exportCustomersCSV = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT
        customer_id AS ID,
        first_name AS FirstName,
        last_name AS LastName,
        email AS Email,
        phone AS Phone,
        billing_address AS BillingAddress,
        shipping_address AS ShippingAddress,
        created_at AS CreatedAt,
        is_active AS Active
      FROM customers
      ORDER BY customer_id ASC
    `);

    const fields = [
      "ID",
      "FirstName",
      "LastName",
      "Email",
      "Phone",
      "BillingAddress",
      "ShippingAddress",
      "CreatedAt",
      "Active"
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(results);

    res.header("Content-Type", "text/csv");
    res.attachment("customers.csv");
    res.send(csv);

  } catch (err) {
    console.error("Error exporting customers CSV:", err);
    res.status(500).json({ success: false, message: "Failed to export customers CSV" });
  }
};


// Export PDF
exports.exportCustomersPDF = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT
        customer_id AS ID,
        first_name AS FirstName,
        last_name AS LastName,
        email AS Email,
        phone AS Phone,
        billing_address AS BillingAddress,
        shipping_address AS ShippingAddress,
        created_at AS CreatedAt,
        is_active AS Active
      FROM customers
      ORDER BY customer_id ASC
    `);

    const doc = new PDFDocument({ margin: 30, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=customers.pdf");
    doc.pipe(res);

    // Title
    doc.fontSize(18).font("Helvetica-Bold").text("Customers Report", { align: "center" });
    doc.moveDown(1);

    // Table setup
    const tableTop = 100;
    const rowHeight = 45;

    const colWidths = [
      25,   // ID
      45,   // First Name
      45,   // Last Name
      130,  // Email
      80,   // Phone
      90,  // Billing Address
      90,  // Shipping Address
      50,   // Active
    ];

    const headers = ["ID","First","Last","Email","Phone","Billing Address","Shipping Address","Active"];

    let x = 30;
    let y = tableTop;

    // Header background
    doc.rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight).fill("#f0f0f0");
    doc.fillColor("black").font("Helvetica-Bold").fontSize(11);

    let currentX = x;
    headers.forEach((header, i) => {
      doc.text(header, currentX + 5, y + 10, { width: colWidths[i] - 10 });
      currentX += colWidths[i];
    });

    doc.strokeColor("black").rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight).stroke();
    y += rowHeight;

    // Rows
    doc.font("Helvetica").fontSize(9);

    results.forEach((c, index) => {
      if (y > 750) {
        doc.addPage();
        y = tableTop;
      }

      // Alternate row colors
      const bg = index % 2 === 0 ? "#fafafa" : "white";
      doc.rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight).fill(bg);
      doc.fillColor("black");

      const row = [
        c.ID,
        c.FirstName,
        c.LastName,
        c.Email,
        c.Phone || "—",
        c.BillingAddress || "—",
        c.ShippingAddress || "—",
        c.Active ? "Yes" : "No"
      ];

      currentX = x;
      row.forEach((val, i) => {
        doc.text(String(val), currentX + 5, y + 10, {
          width: colWidths[i] - 10,
        });
        currentX += colWidths[i];
      });

      doc.strokeColor("black").rect(x, y, colWidths.reduce((a, b) => a + b), rowHeight).stroke();
      y += rowHeight;
    });

    doc.end();

  } catch (err) {
    console.error("Error exporting customers PDF:", err);
    res.status(500).json({ success: false, message: "Failed to export customers PDF" });
  }
};