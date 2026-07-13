import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <span className="brand-icon">📈</span>
          <span className="brand-text">SB Stocks</span>
        </Link>

        <div className="navbar-links">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/portfolio" className="nav-link">Portfolio</Link>
          <Link to="/transactions" className="nav-link">Transactions</Link>
        </div>

        <div className="navbar-right">
          <div className="balance-badge">
            <span className="balance-label">Balance</span>
            <span className="balance-amount">
              ${user.virtualBalance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;