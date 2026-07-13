import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getUserProfile = () => api.get('/auth/profile');

// Stocks
export const searchStocks = (q) => api.get(`/stocks/search?q=${q}`);
export const getStockQuote = (symbol) => api.get(`/stocks/quote/${symbol}`);
export const getCompanyProfile = (symbol) => api.get(`/stocks/profile/${symbol}`);
export const getMarketNews = () => api.get('/stocks/news');
export const getPopularStocks = () => api.get('/stocks/popular');

// Portfolio
export const getPortfolio = () => api.get('/portfolio');
export const buyStock = (data) => api.post('/portfolio/buy', data);
export const sellStock = (data) => api.post('/portfolio/sell', data);

// Transactions
export const getTransactions = (page = 1) => api.get(`/transactions?page=${page}`);

export default api;