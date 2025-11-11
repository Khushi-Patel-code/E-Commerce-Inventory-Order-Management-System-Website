const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const {authenticate, requireRole} = require('../utils/authMiddleware');

router.get('/dashboard', authenticate, requireRole('admin', adminController.viewDashboard));

module.exports = router;