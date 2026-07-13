const express = require('express');
const router = express.Router();
const {
  searchStocks,
  getStockQuote,
  getCompanyProfile,
  getMarketNews,
  getPopularStocks,
} = require('../controllers/stockController');

router.get('/search', searchStocks);
router.get('/quote/:symbol', getStockQuote);
router.get('/profile/:symbol', getCompanyProfile);
router.get('/news', getMarketNews);
router.get('/popular', getPopularStocks);

module.exports = router;