//customers.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

const {
  registerCustomerValidator,
  loginCustomerValidator,
  updateCustomerValidator,
  customerIdValidator
} = require("../validators/customerValidator");

const handleValidation = require("../validators/handleValidation");

// ---- AUTH ROUTES ----
router.post('/register', registerCustomerValidator, handleValidation, customerController.registerCustomer);
router.post('/login', loginCustomerValidator, handleValidation, customerController.loginCustomer);

// ---- CRUD ROUTES ----
router.get('/', customerController.getAllCustomers);

router.get('/:id',
  customerIdValidator,
  handleValidation,
  customerController.getCustomerById
);

router.put('/:id',
  updateCustomerValidator,
  handleValidation,
  customerController.updateCustomer
);

router.delete('/:id',
  customerIdValidator,
  handleValidation,
  customerController.deleteCustomer
);

// ---- EXPORT ----
router.get("/export/csv", customerController.exportCustomersCSV);
router.get("/export/pdf", customerController.exportCustomersPDF);

module.exports = router;
