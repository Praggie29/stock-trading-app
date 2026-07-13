const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const axios = require('axios');

const FINNHUB_BASE = 'https://finnhub.io/api/v1';

// @desc    Get user portfolio
// @route   GET /api/portfolio
const getPortfolio = async (req, res) => {
  try {
    const holdings = await Portfolio.find({ user: req.user._id });

    const portfolioWithPrices = await Promise.all(
      holdings.map(async (holding) => {
        try {
          const response = await axios.get(`${FINNHUB_BASE}/quote`, {
            params: { symbol: holding.symbol, token: process.env.FINNHUB_API_KEY },
          });
          const currentPrice = response.data.c || 0;
          const marketValue = currentPrice * holding.quantity;
          const gainLoss = marketValue - holding.totalInvested;
          const gainLossPercent = holding.totalInvested > 0
            ? ((currentPrice - holding.avgPrice) / holding.avgPrice) * 100
            : 0;

          return {
            _id: holding._id,
            symbol: holding.symbol,
            companyName: holding.companyName,
            quantity: holding.quantity,
            avgPrice: holding.avgPrice,
            totalInvested: holding.totalInvested,
            currentPrice,
            marketValue,
            gainLoss,
            gainLossPercent,
          };
        } catch {
          return {
            _id: holding._id,
            symbol: holding.symbol,
            companyName: holding.companyName,
            quantity: holding.quantity,
            avgPrice: holding.avgPrice,
            totalInvested: holding.totalInvested,
            currentPrice: 0,
            marketValue: 0,
            gainLoss: 0,
            gainLossPercent: 0,
          };
        }
      })
    );

    const totalInvested = portfolioWithPrices.reduce((sum, h) => sum + h.totalInvested, 0);
    const totalValue = portfolioWithPrices.reduce((sum, h) => sum + h.marketValue, 0);
    const totalGainLoss = portfolioWithPrices.reduce((sum, h) => sum + h.gainLoss, 0);

    res.json({
      holdings: portfolioWithPrices,
      summary: {
        totalInvested,
        totalValue,
        totalGainLoss,
        totalGainLossPercent: totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0,
        holdingsCount: portfolioWithPrices.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Buy stock
// @route   POST /api/portfolio/buy
const buyStock = async (req, res) => {
  try {
    const { symbol, companyName, quantity, price } = req.body;

    if (!symbol || !quantity || !price) {
      return res.status(400).json({ message: 'Please provide symbol, quantity, and price' });
    }

    const totalAmount = quantity * price;
    const user = await User.findById(req.user._id);

    if (user.virtualBalance < totalAmount) {
      return res.status(400).json({ message: 'Insufficient virtual balance' });
    }

    let holding = await Portfolio.findOne({ user: req.user._id, symbol: symbol.toUpperCase() });

    if (holding) {
      const newTotalInvested = holding.totalInvested + totalAmount;
      const newQuantity = holding.quantity + quantity;
      holding.avgPrice = newTotalInvested / newQuantity;
      holding.quantity = newQuantity;
      holding.totalInvested = newTotalInvested;
    } else {
      holding = await Portfolio.create({
        user: req.user._id,
        symbol: symbol.toUpperCase(),
        companyName,
        quantity,
        avgPrice: price,
        totalInvested: totalAmount,
      });
    }

    await holding.save();

    user.virtualBalance -= totalAmount;
    await user.save();

    await Transaction.create({
      user: req.user._id,
      type: 'BUY',
      symbol: symbol.toUpperCase(),
      companyName,
      quantity,
      price,
      totalAmount,
    });

    res.json({
      message: `Successfully bought ${quantity} shares of ${symbol.toUpperCase()}`,
      holding,
      virtualBalance: user.virtualBalance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Sell stock
// @route   POST /api/portfolio/sell
const sellStock = async (req, res) => {
  try {
    const { symbol, quantity, price } = req.body;

    if (!symbol || !quantity || !price) {
      return res.status(400).json({ message: 'Please provide symbol, quantity, and price' });
    }

    const holding = await Portfolio.findOne({ user: req.user._id, symbol: symbol.toUpperCase() });

    if (!holding || holding.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient shares to sell' });
    }

    const totalAmount = quantity * price;
    const user = await User.findById(req.user._id);

    holding.quantity -= quantity;
    holding.totalInvested = holding.avgPrice * holding.quantity;

    if (holding.quantity === 0) {
      await Portfolio.deleteOne({ _id: holding._id });
    } else {
      await holding.save();
    }

    user.virtualBalance += totalAmount;
    await user.save();

    await Transaction.create({
      user: req.user._id,
      type: 'SELL',
      symbol: symbol.toUpperCase(),
      companyName: holding.companyName,
      quantity,
      price,
      totalAmount,
    });

    res.json({
      message: `Successfully sold ${quantity} shares of ${symbol.toUpperCase()}`,
      virtualBalance: user.virtualBalance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPortfolio, buyStock, sellStock };