import React, { useState, useEffect } from 'react';
import { getPopularStocks, getMarketNews, searchStocks, getStockQuote } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StockCard from '../components/StockCard';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [popularStocks, setPopularStocks] = useState([]);
  const [news, setNews] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stocksRes, newsRes] = await Promise.all([
          getPopularStocks(),
          getMarketNews(),
        ]);
        setPopularStocks(stocksRes.data);
        setNews(newsRes.data);
      } catch (error) {
        toast.error('Failed to load market data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.length < 1) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const { data } = await searchStocks(q);
      const resultsWithPrices = await Promise.all(
        data.slice(0, 5).map(async (stock) => {
          try {
            const quoteRes = await getStockQuote(stock.symbol);
            return { ...stock, ...quoteRes.data };
          } catch {
            return { ...stock, currentPrice: 0, change: 0, percentChange: 0 };
          }
        })
      );
      setSearchResults(resultsWithPrices);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader"></div>
        <p>Loading market data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {user?.name}!</h1>
          <p className="dashboard-subtitle">Track the market and practice trading with virtual funds</p>
        </div>
        <div className="dashboard-balance">
          <span className="balance-label">Virtual Balance</span>
          <span className="balance-value">
            ${user?.virtualBalance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="search-section">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search stocks by symbol or company name..."
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
          />
          {searching && <span className="search-spinner">⏳</span>}
        </div>
        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((stock) => (
              <div
                key={stock.symbol}
                className="search-result-item"
                onClick={() => navigate(`/stock/${stock.symbol}`)}
              >
                <div className="result-info">
                  <span className="result-symbol">{stock.symbol}</span>
                  <span className="result-name">{stock.name}</span>
                </div>
                <div className="result-price">
                  <span className="result-current">${stock.currentPrice?.toFixed(2)}</span>
                  <span className={`result-change ${stock.percentChange >= 0 ? 'positive' : 'negative'}`}>
                    {stock.percentChange >= 0 ? '▲' : '▼'} {Math.abs(stock.percentChange || 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <section className="market-section">
        <h2>Popular Stocks</h2>
        <div className="stocks-grid">
          {popularStocks.map((stock) => (
            <StockCard key={stock.symbol} stock={stock} />
          ))}
        </div>
      </section>

      <section className="news-section">
        <h2>Market News</h2>
        <div className="news-grid">
          {news.map((item, index) => (
            <a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="news-card"
            >
              {item.image && (
                <div className="news-image">
                  <img src={item.image} alt={item.headline} />
                </div>
              )}
              <div className="news-content">
                <h3>{item.headline}</h3>
                <p>{item.summary?.slice(0, 120)}...</p>
                <div className="news-meta">
                  <span>{item.source}</span>
                  <span>{formatDate(item.datetime)}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;