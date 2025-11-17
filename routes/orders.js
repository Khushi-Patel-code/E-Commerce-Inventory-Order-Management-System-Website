//routes/orders.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

const {
  validateCreateOrder,
  validateUpdateOrder
} = require('../validators/orderValidator');

router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);

router.post('/', validateCreateOrder, orderController.addOrder);
router.put('/:id', validateUpdateOrder, orderController.updateOrder);

router.delete('/:id', orderController.deleteOrder);

router.get('/export/csv', orderController.exportOrdersCSV);
router.get('/export/pdf', orderController.exportOrdersPDF);

module.exports = router;
