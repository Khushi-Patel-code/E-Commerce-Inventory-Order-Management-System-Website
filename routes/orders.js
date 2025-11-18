//routes/orders.js
/*const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

const {
  validateCreateOrder,
  validateUpdateOrder
} = require('../validators/orderValidator');

const { authenticate, requireRole } = require('../utils/authMiddleware');

// Public endpoints (anyone can view orders if you want)
router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);

// Protected endpoints (must be logged in)
router.post('/', authenticate, validateCreateOrder, orderController.addOrder);
router.put('/:id', authenticate, validateUpdateOrder, orderController.updateOrder);
router.delete('/:id', authenticate, orderController.deleteOrder);

// Export endpoints (could also be protected if needed)
router.get('/export/csv', authenticate, requireRole('admin'), orderController.exportOrdersCSV);
router.get('/export/pdf', authenticate, requireRole('admin'), orderController.exportOrdersPDF);

module.exports = router;*/

// routes/orders.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

const {validateCreateOrder,validateUpdateOrder} = require('../validators/orderValidator');

const { authenticate, requireRole } = require('../utils/authMiddleware');

// Public endpoints
router.get('/', orderController.getAllOrders);

// ✅ Place /my BEFORE /:id
router.get('/my', authenticate, requireRole('customer'), orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);

// Protected endpoints
router.post('/', authenticate, validateCreateOrder, orderController.addOrder);
router.put('/:id', authenticate, validateUpdateOrder, orderController.updateOrder);
router.delete('/:id', authenticate, orderController.deleteOrder);

// Export endpoints (admin only)
router.get('/export/csv', authenticate, requireRole('admin'), orderController.exportOrdersCSV);
router.get('/export/pdf', authenticate, requireRole('admin'), orderController.exportOrdersPDF);

module.exports = router;
