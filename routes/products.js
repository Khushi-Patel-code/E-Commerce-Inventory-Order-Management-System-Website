const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { validateProduct } = require('../validators/productValidator');

// GET
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// CREATE with validation
router.post('/', validateProduct, productController.addProduct);

// UPDATE with validation
router.put('/:id', validateProduct, productController.updateProduct);

// DELETE
router.delete('/:id', productController.deleteProduct);

// Json to pdf/csv
router.get('/export/csv', productController.exportProductsCSV);
router.get('/export/pdf', productController.exportProductsPDF);

module.exports = router;
