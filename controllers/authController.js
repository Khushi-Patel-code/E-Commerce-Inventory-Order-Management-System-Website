//authController
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/connection');

exports.registerUser = async (req, res) => {
    try{
        const{first_name, last_name, email, password, role_id} = req.body;

        const[existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({message: 'Email already registered'});
        }

        const password_hash = await bcrypt.hash(password, 10);

        await db.query(
            'INSERT INTO users (first_name, last_name, email, password_hash, role_id) VALUES (?, ?, ?, ?, ?)',
            [first_name, last_name, email, password_hash, role_id]
        );

        res.json({message: 'User registered successfully'});
    } catch(err){
        console.error("User registration error:", err.message);
        res.status(500).json({message: 'Registration failed'});
    }
};


exports.loginUser = async (req, res) => {
    console.log('Incoming login payload:', req.body);
    try{
        const {email, password} = req.body;
        const [rows] = await db.query('SELECT u.*, r.role_name FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.email = ?', [email]);
        const user = rows[0];

        if (!user) {
            console.log('User not found');
            return res.status(401).json({message: 'Invalid credentials'});
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        console.log('Stored hash: ', user.password_hash);
        console.log('Password match:', passwordMatch);

        if(!passwordMatch){
            return res.status(401).json({message: 'Invalid credentials'});
        }

        const token = jwt.sign(
            {id: user.user_id, role: user.role_name},
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        );

        await db.query('UPDATE users SET last_login = NOW() WHERE user_id = ?', [user.user_id]);
        res.json({token, role: user.role_name});
    } catch (err) {
        console.error('User login error:', err.message);
        res.status(500).json({message: 'Login failed'});
    }
};