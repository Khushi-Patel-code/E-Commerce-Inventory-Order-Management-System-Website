const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

//Customers can only view products
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

module.exports = router;