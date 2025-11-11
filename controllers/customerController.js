//customerController
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/connection');

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