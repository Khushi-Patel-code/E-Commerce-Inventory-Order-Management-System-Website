const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categoriesController');
const handleValidation = require("../validators/handleValidation");

const {
  createCategoryValidator,
  updateCategoryValidator,
  idValidator
} = require("../validators/categoryValidator");

// CREATE
router.post(
  '/',
  createCategoryValidator,
  handleValidation,
  categoryController.createCategory
);

// READ ALL
router.get('/', categoryController.getCategories);

// READ ONE
router.get(
  '/:id',
  idValidator,
  handleValidation,
  categoryController.getCategoryById
);

// UPDATE
router.put(
  '/:id',
  updateCategoryValidator,
  handleValidation,
  categoryController.updateCategory
);

// DELETE
router.delete(
  '/:id',
  idValidator,
  handleValidation,
  categoryController.deleteCategory
);

// EXPORTS (no validation needed)
router.get("/export/csv", categoryController.exportCategoriesCSV);
router.get("/export/pdf", categoryController.exportCategoriesPDF);



module.exports = router;
