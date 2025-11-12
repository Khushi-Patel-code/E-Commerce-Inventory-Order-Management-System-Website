// routes/categories.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoriesController');

router.post('/', categoryController.createCategory);
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
