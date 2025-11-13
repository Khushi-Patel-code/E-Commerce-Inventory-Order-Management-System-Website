// routes/payments.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/', paymentController.createPayment);
router.get('/', paymentController.getPayments);
router.get('/:id', paymentController.getPaymentById);
router.put('/:id', paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);

// Export to PDF/CSV
router.get("/export/csv", paymentController.exportPaymentsCSV);
router.get("/export/pdf", paymentController.exportPaymentsPDF);

module.exports = router;