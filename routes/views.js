const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController'); 

router.get('/:viewName', viewController.getViewData);
router.get("/export/:viewName/csv", viewController.exportViewCSV);
router.get("/export/:viewName/pdf", viewController.exportViewPDF);

module.exports = router;