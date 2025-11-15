const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { validateCreatePayment, validateUpdatePayment } = require('../validators/paymentValidator');

router.post('/', validateCreatePayment, paymentController.createPayment);
router.get('/', paymentController.getPayments);
router.get('/:id', paymentController.getPaymentById);
router.put('/:id', validateUpdatePayment, paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);

router.get("/export/csv", paymentController.exportPaymentsCSV);
router.get("/export/pdf", paymentController.exportPaymentsPDF);

module.exports = router;
