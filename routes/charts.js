const express = require('express');
const router = express.Router();
const chartController = require('../controllers/chartController');

// GET all chart data
router.get('/data', async (req, res) => {
  try {
    const revenueVsDate = await chartController.getRevenueVsDate();
    const revenueByCategory = await chartController.getRevenueByCategory();
    const topProducts = await chartController.getTopProducts();

    res.json({ revenueVsDate, revenueByCategory, topProducts });
  } catch (err) {
    console.error('Error fetching charts:', err);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

module.exports = router;
