//customers.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// ---- AUTH ROUTES ----
router.post('/login', customerController.loginCustomer);
router.post('/register', customerController.registerCustomer);

// ---- CRUD ROUTES ----

// ---- CRUD ----
router.get('/', customerController.getAllCustomers);
router.get('/:id', customerController.getCustomerById);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

router.get("/export/csv", customerController.exportCustomersCSV);
router.get("/export/pdf", customerController.exportCustomersPDF);

module.exports = router;
