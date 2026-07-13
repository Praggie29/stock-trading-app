import React, { useState, useEffect } from 'react';
import { getPortfolio } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Portfolio.css';

const Portfolio = () => {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const { data } = await getPortfolio();
      setPortfolio(data);
    } catch (error) {
      toast.error('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="portfolio-loading">
        <div className="loader"></div>
        <p>Loading portfolio...</p>
      </div>
    );
  }

  return (
    <div className="portfolio-page">
      <div className="portfolio-header">
        <h1>My Portfolio</h1>
        <p className="portfolio-subtitle">Track your holdings and performance</p>
      </div>

      {portfolio?.summary && (
        <div className="portfolio-summary">
          <div className="summary-card">
            <span className="summary-label">Total Invested</span>
            <span className="summary-value">${portfolio.summary.totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Current Value</span>
            <span className="summary-value accent">${portfolio.summary.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Total P&L</span>
            <span className={`summary-value ${portfolio.summary.totalGainLoss >= 0 ? 'positive' : 'negative'}`}>
              {portfolio.summary.totalGainLoss >= 0 ? '+' : ''}${portfolio.summary.totalGainLoss.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              <span className="pl-percent">
                ({portfolio.summary.totalGainLossPercent >= 0 ? '+' : ''}{portfolio.summary.totalGainLossPercent.toFixed(2)}%)
              </span>
            </span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Holdings</span>
            <span className="summary-value">{portfolio.summary.holdingsCount}</span>
          </div>
        </div>
      )}

      {portfolio?.holdings?.length === 0 ? (
        <div className="empty-portfolio">
          <span className="empty-icon">📂</span>
          <h3>No holdings yet</h3>
          <p>Start trading by buying stocks from the dashboard</p>
          <button className="browse-btn" onClick={() => navigate('/dashboard')}>
            Browse Stocks
          </button>
        </div>
      ) : (
        <div className="holdings-table-container">
          <table className="holdings-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Company</th>
                <th>Qty</th>
                <th>Avg Price</th>
                <th>Current Price</th>
                <th>Invested</th>
                <th>Market Value</th>
                <th>P&L</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {portfolio?.holdings?.map((holding) => (
                <tr key={holding._id}>
                  <td>
                    <span className="holding-symbol">{holding.symbol}</span>
                  </td>
                  <td className="holding-name">{holding.companyName}</td>
                  <td>{holding.quantity}</td>
                  <td>${holding.avgPrice?.toFixed(2)}</td>
                  <td>${holding.currentPrice?.toFixed(2)}</td>
                  <td>${holding.totalInvested?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td>${holding.marketValue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td>
                    <span className={`pl-value ${holding.gainLoss >= 0 ? 'positive' : 'negative'}`}>
                      {holding.gainLoss >= 0 ? '+' : ''}${holding.gainLoss?.toFixed(2)}
                      <br />
                      <small>({holding.gainLossPercent >= 0 ? '+' : ''}{holding.gainLossPercent?.toFixed(2)}%)</small>
                    </span>
                  </td>
                  <td>
                    <button
                      className="trade-btn"
                      onClick={() => navigate(`/stock/${holding.symbol}`)}
                    >
                      Trade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Portfolio;