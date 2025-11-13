// routes/orders.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.addOrder);
router.put('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);
router.get('/export/csv', orderController.exportOrdersCSV);
router.get('/export/pdf', orderController.exportOrdersPDF);

module.exports = router;
