// routes/inventory.js
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.post('/', inventoryController.createInventory);
router.get('/', inventoryController.getInventory);
router.get('/:id', inventoryController.getInventoryById);
router.put('/:id', inventoryController.updateInventory);
router.delete('/:id', inventoryController.deleteInventory);

// Export to PDF/CSV
router.get("/export/csv", inventoryController.exportInventoryCSV);
router.get("/export/pdf", inventoryController.exportInventoryPDF);

module.exports = router;
