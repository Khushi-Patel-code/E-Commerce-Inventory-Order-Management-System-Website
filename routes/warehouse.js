// routes/warehouses.js
const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');
const {
  validateCreateWarehouse,
  validateUpdateWarehouse,
  validateIdParam
} = require('../validators/warehouseValidator');

// ---- CRUD ROUTES ----
router.get('/', warehouseController.getAllWarehouses);
router.get('/:id', validateIdParam, warehouseController.getWarehouseById);
router.post('/', validateCreateWarehouse, warehouseController.createWarehouse);
router.put('/:id', validateUpdateWarehouse, warehouseController.updateWarehouse);
router.delete('/:id', validateIdParam, warehouseController.deleteWarehouse);

router.get("/export/csv", warehouseController.exportWarehousesCSV);
router.get("/export/pdf", warehouseController.exportWarehousesPDF);

module.exports = router;
