// routes/suppliers.js
const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { validateSupplier } = require('../validators/supplierValidator');

// =========================
// EXPORT ROUTES (must come BEFORE /:id)
// =========================
router.get('/export/csv', supplierController.exportSuppliersCSV);
router.get('/export/pdf', supplierController.exportSuppliersPDF);

// =========================
// CRUD ROUTES
// =========================

// CREATE supplier
router.post('/', validateSupplier, supplierController.createSupplier);

// READ ALL suppliers
router.get('/', supplierController.getSuppliers);

// READ supplier BY ID
router.get('/:id', supplierController.getSupplierById);

// UPDATE supplier
router.put('/:id', validateSupplier, supplierController.updateSupplier);

// DELETE supplier
router.delete('/:id', supplierController.deleteSupplier);

module.exports = router;
