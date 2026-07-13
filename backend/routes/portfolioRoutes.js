const express = require('express');
const router = express.Router();
const { getPortfolio, buyStock, sellStock } = require('../controllers/portfolioController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getPortfolio);
router.post('/buy', protect, buyStock);
router.post('/sell', protect, sellStock);

module.exports = router;