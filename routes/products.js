// routes/products.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', productController.addProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

// Json to pdf/csv
router.get('/export/csv', productController.exportProductsCSV);
router.get('/export/pdf', productController.exportProductsPDF);


module.exports = router;