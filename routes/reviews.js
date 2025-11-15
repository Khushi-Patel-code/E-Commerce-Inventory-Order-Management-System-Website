const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewsController');
const { validateReview } = require('../validators/reviewValidator');

// CREATE with validation
router.post('/', validateReview, reviewController.createReview);

// READ ALL
router.get('/', reviewController.getReviews);

// READ ONE
router.get('/:id', reviewController.getReviewById);

// UPDATE with validation
router.put('/:id', validateReview, reviewController.updateReview);

// DELETE
router.delete('/:id', reviewController.deleteReview);

// EXPORT
router.get('/export/csv', reviewController.exportReviewsCSV);
router.get('/export/pdf', reviewController.exportReviewsPDF);

module.exports = router;
