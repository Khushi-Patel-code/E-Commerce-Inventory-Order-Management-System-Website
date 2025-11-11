const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({message: 'No token provided'});

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(403).json({message: 'Invalid token'});
    }
};

exports.requireRole = (role) => (req, res, next) => {
    if (req.user?.role !== role) {
        return res.status(403).json({message: `${role} access required`});
    }
    next(); 
};