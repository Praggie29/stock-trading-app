import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StockCard.css';

const StockCard = ({ stock }) => {
  const navigate = useNavigate();
  const isPositive = stock.percentChange >= 0;

  return (
    <div className="stock-card" onClick={() => navigate(`/stock/${stock.symbol}`)}>
      <div className="stock-card-header">
        <span className="stock-symbol">{stock.symbol}</span>
      </div>
      <div className="stock-price">${stock.currentPrice?.toFixed(2)}</div>
      <div className={`stock-change ${isPositive ? 'positive' : 'negative'}`}>
        <span>{isPositive ? '▲' : '▼'} ${Math.abs(stock.change || 0).toFixed(2)}</span>
        <span className="change-percent">
          ({isPositive ? '+' : ''}{stock.percentChange?.toFixed(2)}%)
        </span>
      </div>
    </div>
  );
};

export default StockCard;