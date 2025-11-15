const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/connection');

exports.registerUser = async (req, res) => {
    try {
        const { username, first_name, last_name, email, password, role_id } = req.body;

        // Fix — Default role if not provided
        const roleId = role_id || 1; // 1 = user (or whatever default role you use)

        const [existing] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        await db.query(
            'INSERT INTO users (username, first_name, last_name, email, password_hash, role_id) VALUES (?, ?, ?, ?, ?, ?)',
            [username, first_name, last_name, email, password_hash, roleId]
        );

        res.json({ message: 'User registered successfully' });

    } catch (err) {
        console.error("User registration error:", err.message);
        res.status(500).json({ message: 'Registration failed' });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }

        const [rows] = await db.query(
            'SELECT u.*, r.role_name FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.email = ?',
            [email]
        );

        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.user_id, role: user.role_name },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        await db.query(
            'UPDATE users SET last_login = NOW() WHERE user_id = ?',
            [user.user_id]
        );

        res.json({
            success: true,
            admin: {
                id: user.user_id,
                name: user.username,
                email: user.email,
                role: user.role_name
            },
            token
        });

    } catch (err) {
        console.error('User login error:', err.message);
        res.status(500).json({ message: 'Login failed' });
    }
};
