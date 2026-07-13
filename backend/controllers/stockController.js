const axios = require('axios');

const FINNHUB_BASE = 'https://finnhub.io/api/v1';

// Mock data for fallback when Finnhub API key is not set
const MOCK_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', currentPrice: 178.72, change: 2.15, percentChange: 1.22, high: 180.00, low: 177.50, open: 178.00, previousClose: 176.57, country: 'US', currency: 'USD', exchange: 'NASDAQ', industry: 'Technology', marketCapitalization: 2800000000000 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', currentPrice: 405.30, change: 3.80, percentChange: 0.95, high: 407.00, low: 403.20, open: 404.00, previousClose: 401.50, country: 'US', currency: 'USD', exchange: 'NASDAQ', industry: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', currentPrice: 141.80, change: -0.60, percentChange: -0.42, high: 143.00, low: 141.20, open: 142.50, previousClose: 142.40, country: 'US', currency: 'USD', exchange: 'NASDAQ', industry: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', currentPrice: 178.22, change: 2.50, percentChange: 1.42, high: 179.50, low: 176.80, open: 177.00, previousClose: 175.72, country: 'US', currency: 'USD', exchange: 'NASDAQ', industry: 'E-Commerce' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', currentPrice: 682.30, change: 15.20, percentChange: 2.28, high: 685.00, low: 675.00, open: 678.00, previousClose: 667.10, country: 'US', currency: 'USD', exchange: 'NASDAQ', industry: 'Semiconductors' },
  { symbol: 'META', name: 'Meta Platforms Inc.', currentPrice: 474.50, change: 5.60, percentChange: 1.19, high: 476.00, low: 471.00, open: 472.00, previousClose: 468.90, country: 'US', currency: 'USD', exchange: 'NASDAQ', industry: 'Social Media' },
  { symbol: 'TSLA', name: 'Tesla Inc.', currentPrice: 245.80, change: -3.20, percentChange: -1.28, high: 250.00, low: 244.50, open: 249.00, previousClose: 249.00, country: 'US', currency: 'USD', exchange: 'NASDAQ', industry: 'Automotive' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', currentPrice: 183.60, change: 1.40, percentChange: 0.77, high: 184.50, low: 182.80, open: 183.00, previousClose: 182.20, country: 'US', currency: 'USD', exchange: 'NYSE', industry: 'Banking' },
  { symbol: 'V', name: 'Visa Inc.', currentPrice: 275.40, change: 2.10, percentChange: 0.77, high: 277.00, low: 274.00, open: 275.00, previousClose: 273.30, country: 'US', currency: 'USD', exchange: 'NYSE', industry: 'Financial Services' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', currentPrice: 156.90, change: 0.30, percentChange: 0.19, high: 157.50, low: 156.20, open: 156.80, previousClose: 156.60, country: 'US', currency: 'USD', exchange: 'NYSE', industry: 'Healthcare' },
];

const MOCK_NEWS = [
  { headline: 'Fed Holds Interest Rates Steady, Signals Potential Cuts Later This Year', summary: 'The Federal Reserve maintained its benchmark interest rate while indicating that rate cuts may be on the horizon as inflation continues to moderate.', url: '#', source: 'SB Stocks News', datetime: Math.floor(Date.now() / 1000), image: '' },
  { headline: 'Tech Stocks Rally as AI Optimism Drives Market Momentum', summary: 'Technology shares surged as investor confidence in artificial intelligence continues to drive growth across the sector.', url: '#', source: 'SB Stocks News', datetime: Math.floor(Date.now() / 1000) - 86400, image: '' },
  { headline: 'Apple Announces New AI Features for Upcoming iOS Update', summary: 'Apple revealed comprehensive AI integration plans for its next major operating system update, sending shares higher.', url: '#', source: 'SB Stocks News', datetime: Math.floor(Date.now() / 1000) - 172800, image: '' },
  { headline: 'Oil Prices Drop Amid Global Supply Concerns', summary: 'Crude oil prices declined as traders weigh increased supply from major producers against weakening demand forecasts.', url: '#', source: 'SB Stocks News', datetime: Math.floor(Date.now() / 1000) - 259200, image: '' },
  { headline: 'NVIDIA Earnings Beat Expectations, Stock Hits New High', summary: 'The chipmaker reported quarterly results that exceeded analyst estimates, driven by surging demand for AI processors.', url: '#', source: 'SB Stocks News', datetime: Math.floor(Date.now() / 1000) - 345600, image: '' },
];

const MOCK_DB = {};
MOCK_STOCKS.forEach(s => { MOCK_DB[s.symbol] = s; });

const hasApiKey = () => process.env.FINNHUB_API_KEY && process.env.FINNHUB_API_KEY !== 'your_finnhub_api_key_here';

const tryFinnhub = async (endpoint, params) => {
  if (!hasApiKey()) throw new Error('No API key');
  return await axios.get(`${FINNHUB_BASE}${endpoint}`, {
    params: { ...params, token: process.env.FINNHUB_API_KEY },
  });
};

// @desc    Search stocks
// @route   GET /api/stocks/search?q=
const searchStocks = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query required' });
    }

    const query = q.toUpperCase();
    let results = MOCK_STOCKS.filter(s =>
      s.symbol.includes(query) || s.name.toUpperCase().includes(query)
    ).slice(0, 10).map(s => ({
      symbol: s.symbol,
      name: s.name,
      displaySymbol: s.symbol,
    }));

    // Try Finnhub for more results if key exists
    if (hasApiKey()) {
      try {
        const response = await tryFinnhub('/search', { q });
        const apiResults = response.data.result
          .filter(s => s.type === 'Common Stock')
          .slice(0, 10)
          .map(s => ({ symbol: s.symbol, name: s.description, displaySymbol: s.displaySymbol }));
        if (apiResults.length > 0) results = apiResults;
      } catch (e) { /* fallback to mock */ }
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stock data' });
  }
};

// @desc    Get stock quote (current price)
// @route   GET /api/stocks/quote/:symbol
const getStockQuote = async (req, res) => {
  try {
    const { symbol } = req.params;
    const sym = symbol.toUpperCase();

    // Try Finnhub first if key exists
    if (hasApiKey()) {
      try {
        const response = await tryFinnhub('/quote', { symbol: sym });
        const data = response.data;
        if (data.c) {
          return res.json({
            symbol: sym,
            currentPrice: data.c,
            change: data.d,
            percentChange: data.dp,
            high: data.h,
            low: data.l,
            open: data.o,
            previousClose: data.pc,
          });
        }
      } catch (e) { /* fallback */ }
    }

    // Mock fallback
    const mock = MOCK_DB[sym];
    if (mock) {
      return res.json({
        symbol: sym,
        currentPrice: mock.currentPrice,
        change: mock.change,
        percentChange: mock.percentChange,
        high: mock.high,
        low: mock.low,
        open: mock.open,
        previousClose: mock.previousClose,
      });
    }

    // Generate simulated stock data
    const basePrice = 50 + Math.random() * 450;
    const change = (Math.random() - 0.5) * 10;
    const pctChange = (change / basePrice) * 100;
    res.json({
      symbol: sym,
      currentPrice: parseFloat(basePrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      percentChange: parseFloat(pctChange.toFixed(2)),
      high: parseFloat((basePrice + Math.random() * 5).toFixed(2)),
      low: parseFloat((basePrice - Math.random() * 5).toFixed(2)),
      open: parseFloat((basePrice + (Math.random() - 0.5) * 3).toFixed(2)),
      previousClose: parseFloat((basePrice - (Math.random() - 0.5) * 3).toFixed(2)),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stock quote' });
  }
};

// @desc    Get company profile
// @route   GET /api/stocks/profile/:symbol
const getCompanyProfile = async (req, res) => {
  try {
    const { symbol } = req.params;
    const sym = symbol.toUpperCase();

    if (hasApiKey()) {
      try {
        const response = await tryFinnhub('/stock/profile2', { symbol: sym });
        const data = response.data;
        if (data.name) {
          return res.json({
            symbol: data.ticker, name: data.name, country: data.country,
            currency: data.currency, exchange: data.exchange, ipo: data.ipo,
            marketCapitalization: data.marketCapitalization, shareOutstanding: data.shareOutstanding,
            logo: data.logo, weburl: data.weburl, industry: data.finnhubIndustry,
          });
        }
      } catch (e) { /* fallback */ }
    }

    const mock = MOCK_DB[sym];
    if (mock) {
      return res.json({
        symbol: sym, name: mock.name,
        country: mock.country || 'US', currency: mock.currency || 'USD',
        exchange: mock.exchange || 'NASDAQ', ipo: '2000-01-01',
        marketCapitalization: mock.marketCapitalization || 100000000000,
        shareOutstanding: 1000000000, logo: '', weburl: `https://www.${sym.toLowerCase()}.com`,
        industry: mock.industry || 'Technology',
      });
    }

    res.status(404).json({ message: 'Company not found' });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching company profile' });
  }
};

// @desc    Get market news
// @route   GET /api/stocks/news
const getMarketNews = async (req, res) => {
  try {
    if (hasApiKey()) {
      try {
        const response = await tryFinnhub('/news', { category: 'general' });
        const news = response.data.slice(0, 10).map(item => ({
          headline: item.headline, summary: item.summary, url: item.url,
          source: item.source, datetime: item.datetime, image: item.image,
        }));
        if (news.length > 0) return res.json(news);
      } catch (e) { /* fallback */ }
    }
    res.json(MOCK_NEWS);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching market news' });
  }
};

// @desc    Get popular/watchlist stocks
// @route   GET /api/stocks/popular
const getPopularStocks = async (req, res) => {
  const popularSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'JPM', 'V', 'JNJ'];

  try {
    if (hasApiKey()) {
      try {
        const quotes = await Promise.all(
          popularSymbols.map(async (symbol) => {
            try {
              const response = await tryFinnhub('/quote', { symbol });
              return {
                symbol, currentPrice: response.data.c,
                change: response.data.d, percentChange: response.data.dp,
              };
            } catch {
              return null;
            }
          })
        );
        const valid = quotes.filter(q => q && q.currentPrice);
        if (valid.length >= 5) return res.json(valid);
      } catch (e) { /* fallback */ }
    }

    // Mock fallback
    const result = popularSymbols.map(symbol => {
      const mock = MOCK_DB[symbol];
      return {
        symbol,
        name: mock ? mock.name : symbol,
        currentPrice: mock ? mock.currentPrice : parseFloat((50 + Math.random() * 450).toFixed(2)),
        change: mock ? mock.change : parseFloat((Math.random() - 0.5) * 10).toFixed(2),
        percentChange: mock ? mock.percentChange : parseFloat(((Math.random() - 0.5) * 5).toFixed(2)),
      };
    });
    res.json(result);
  } catch (error) {
    // Ultimate fallback - never fail
    const result = popularSymbols.map(symbol => ({
      symbol, name: symbol, currentPrice: 100 + Math.random() * 200,
      change: (Math.random() - 0.5) * 10, percentChange: (Math.random() - 0.5) * 5,
    }));
    res.json(result);
  }
};

module.exports = {
  searchStocks,
  getStockQuote,
  getCompanyProfile,
  getMarketNews,
  getPopularStocks,
};