//customerController
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/connection');


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