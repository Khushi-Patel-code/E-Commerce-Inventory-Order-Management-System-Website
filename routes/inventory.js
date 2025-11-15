const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

const {
  validateCreateInventory,
  validateUpdateInventory
} = require('../validators/inventoryValidator');

router.post('/', validateCreateInventory, inventoryController.createInventory);
router.get('/', inventoryController.getInventory);
router.get('/:id', inventoryController.getInventoryById);
router.put('/:id', validateUpdateInventory, inventoryController.updateInventory);
router.delete('/:id', inventoryController.deleteInventory);

// Export to PDF/CSV
router.get("/export/csv", inventoryController.exportInventoryCSV);
router.get("/export/pdf", inventoryController.exportInventoryPDF);

module.exports = router;
