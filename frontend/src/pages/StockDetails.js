import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStockQuote, getCompanyProfile, buyStock, sellStock } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './StockDetails.css';

const StockDetails = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [quote, setQuote] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [tradeType, setTradeType] = useState('BUY');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [quoteRes, profileRes] = await Promise.all([
          getStockQuote(symbol),
          getCompanyProfile(symbol),
        ]);
        setQuote(quoteRes.data);
        setProfile(profileRes.data);
      } catch (error) {
        toast.error('Failed to load stock details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [symbol]);

  const handleTrade = async () => {
    if (quantity < 1) {
      return toast.error('Quantity must be at least 1');
    }

    setProcessing(true);
    try {
      const data = {
        symbol: symbol.toUpperCase(),
        companyName: profile?.name || symbol,
        quantity,
        price: quote.currentPrice,
      };

      if (tradeType === 'BUY') {
        const { data: result } = await buyStock(data);
        toast.success(result.message);
      } else {
        const { data: result } = await sellStock(data);
        toast.success(result.message);
      }

      // Update user balance in context
      const updatedUser = { ...user, virtualBalance: user.virtualBalance - (tradeType === 'BUY' ? quote.currentPrice * quantity : -quote.currentPrice * quantity) };
      login(updatedUser);

      setQuantity(1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Transaction failed');
    } finally {
      setProcessing(false);
    }
  };

  const totalAmount = quote?.currentPrice ? quote.currentPrice * quantity : 0;
  const isPositive = quote?.percentChange >= 0;

  if (loading) {
    return (
      <div className="stock-details-loading">
        <div className="loader"></div>
        <p>Loading stock details...</p>
      </div>
    );
  }

  return (
    <div className="stock-details-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="stock-details-header">
        <div className="stock-details-info">
          <div className="stock-title">
            <h1>{symbol}</h1>
            {profile?.logo && (
              <img src={profile.logo} alt={profile.name} className="company-logo" />
            )}
          </div>
          <p className="company-name">{profile?.name}</p>
          {profile?.industry && (
            <p className="company-industry">{profile.industry} · {profile.exchange}</p>
          )}
        </div>

        <div className="stock-price-section">
          <div className="current-price">${quote?.currentPrice?.toFixed(2)}</div>
          <div className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '▲' : '▼'} ${Math.abs(quote?.change || 0).toFixed(2)}
            <span className="price-change-percent">
              ({isPositive ? '+' : ''}{quote?.percentChange?.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      <div className="stock-details-grid">
        <div className="stock-stats">
          <h3>Price Statistics</h3>
          <div className="stat-row">
            <span className="stat-label">Open</span>
            <span className="stat-value">${quote?.open?.toFixed(2)}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">High</span>
            <span className="stat-value">${quote?.high?.toFixed(2)}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Low</span>
            <span className="stat-value">${quote?.low?.toFixed(2)}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Previous Close</span>
            <span className="stat-value">${quote?.previousClose?.toFixed(2)}</span>
          </div>
        </div>

        {profile && (
          <div className="stock-company-info">
            <h3>Company Info</h3>
            <div className="stat-row">
              <span className="stat-label">Country</span>
              <span className="stat-value">{profile.country}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Currency</span>
              <span className="stat-value">{profile.currency}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">IPO</span>
              <span className="stat-value">{profile.ipo}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Market Cap</span>
              <span className="stat-value">${(profile.marketCapitalization / 1e9).toFixed(2)}B</span>
            </div>
            {profile.weburl && (
              <a href={profile.weburl} target="_blank" rel="noopener noreferrer" className="company-link">
                Visit Website ↗
              </a>
            )}
          </div>
        )}

        <div className="trade-card">
          <h3>Trade {symbol}</h3>
          <div className="trade-type-toggle">
            <button
              className={`trade-type-btn ${tradeType === 'BUY' ? 'active-buy' : ''}`}
              onClick={() => setTradeType('BUY')}
            >
              Buy
            </button>
            <button
              className={`trade-type-btn ${tradeType === 'SELL' ? 'active-sell' : ''}`}
              onClick={() => setTradeType('SELL')}
            >
              Sell
            </button>
          </div>

          <div className="trade-form">
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>

            <div className="trade-summary">
              <div className="trade-summary-row">
                <span>Price per share</span>
                <span>${quote?.currentPrice?.toFixed(2)}</span>
              </div>
              <div className="trade-summary-row">
                <span>Total {tradeType === 'BUY' ? 'Cost' : 'Value'}</span>
                <span className="total-amount">${totalAmount.toFixed(2)}</span>
              </div>
              {tradeType === 'BUY' && (
                <div className="trade-summary-row">
                  <span>Your Balance</span>
                  <span>${user?.virtualBalance?.toFixed(2)}</span>
                </div>
              )}
            </div>

            <button
              className={`trade-execute-btn ${tradeType === 'BUY' ? 'btn-buy' : 'btn-sell'}`}
              onClick={handleTrade}
              disabled={processing || !quote?.currentPrice}
            >
              {processing
                ? 'Processing...'
                : `${tradeType === 'BUY' ? 'Buy' : 'Sell'} ${quantity} ${quantity > 1 ? 'shares' : 'share'}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetails;