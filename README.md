# SB Stocks - Paper Trading Simulator

A full-stack stock market paper trading application that lets users practice trading stocks with virtual money in real-time. Built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- **User Authentication** — Register and login with JWT-based authentication
- **Real-Time Stock Data** — Live stock quotes, company profiles, and market news via Finnhub API (with built-in mock data fallback)
- **Paper Trading** — Buy and sell stocks using a virtual balance of $100,000
- **Portfolio Management** — Track holdings, average buy price, and total invested amount
- **Transaction History** — View complete buy/sell history with pagination
- **Market Overview** — Browse popular stocks, search by symbol/name, and view detailed stock information
- **Responsive UI** — Modern dark-themed interface built with React

## Tech Stack

### Backend
- **Node.js** with **Express** — REST API server
- **MongoDB** with **Mongoose** — Database and ODM
- **JWT** (jsonwebtoken) — Authentication
- **bcryptjs** — Password hashing
- **Axios** — HTTP client for Finnhub API calls
- **dotenv** — Environment variable management

### Frontend
- **React 18** — UI framework
- **React Router v6** — Client-side routing
- **Axios** — API communication with auth interceptors
- **react-hot-toast** — Toast notifications

## Project Structure

```
stack_trading/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Register, login, profile
│   │   ├── portfolioController.js # Buy/sell, portfolio CRUD
│   │   ├── stockController.js     # Quotes, search, news, profiles
│   │   └── transactionController.js # Transaction history
│   ├── middleware/
│   │   └── auth.js                # JWT verification middleware
│   ├── models/
│   │   ├── User.js                # User schema (name, email, password, virtualBalance)
│   │   ├── Portfolio.js           # Portfolio schema (symbol, quantity, avgPrice)
│   │   └── Transaction.js         # Transaction schema (type, symbol, quantity, price)
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── portfolioRoutes.js
│   │   ├── stockRoutes.js
│   │   └── transactionRoutes.js
│   ├── utils/
│   │   └── generateToken.js       # JWT token generation
│   ├── .gitignore
│   ├── package.json
│   └── server.js                  # Express app entry point
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js          # Navigation bar
│   │   │   └── StockCard.js       # Stock display card
│   │   ├── context/
│   │   │   └── AuthContext.js      # Auth state management
│   │   ├── pages/
│   │   │   ├── Dashboard.js       # Market overview & popular stocks
│   │   │   ├── Login.js           # Login page
│   │   │   ├── Portfolio.js       # User portfolio view
│   │   │   ├── Register.js        # Registration page
│   │   │   ├── StockDetails.js    # Individual stock details & trading
│   │   │   └── Transactions.js    # Transaction history
│   │   ├── services/
│   │   │   └── api.js             # Axios API client with auth interceptors
│   │   ├── App.js                 # Main app with routing
│   │   ├── App.css
│   │   └── index.js
│   ├── .gitignore
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
| Method | Endpoint           | Description          | Auth |
|--------|--------------------|----------------------|------|
| POST   | `/api/auth/register` | Register new user    | No   |
| POST   | `/api/auth/login`    | Login user           | No   |
| GET    | `/api/auth/profile`  | Get user profile     | Yes  |

### Stocks
| Method | Endpoint                  | Description                | Auth |
|--------|---------------------------|----------------------------|------|
| GET    | `/api/stocks/search?q=`   | Search stocks by symbol/name | No |
| GET    | `/api/stocks/quote/:symbol` | Get current stock quote   | No   |
| GET    | `/api/stocks/profile/:symbol` | Get company profile     | No   |
| GET    | `/api/stocks/news`        | Get market news            | No   |
| GET    | `/api/stocks/popular`     | Get popular stocks         | No   |

### Portfolio
| Method | Endpoint               | Description         | Auth |
|--------|------------------------|---------------------|------|
| GET    | `/api/portfolio`       | Get user portfolio  | Yes  |
| POST   | `/api/portfolio/buy`   | Buy stocks          | Yes  |
| POST   | `/api/portfolio/sell`  | Sell stocks         | Yes  |

### Transactions
| Method | Endpoint                  | Description                 | Auth |
|--------|---------------------------|-----------------------------|------|
| GET    | `/api/transactions?page=` | Get transaction history (paginated) | Yes |

### Health
| Method | Endpoint          | Description            |
|--------|-------------------|------------------------|
| GET    | `/api/health`     | API health check       |

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- Finnhub API key (optional — app works with mock data without it)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Praggie29/stock-trading-app.git
   cd stack_trading
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Create a .env file in the backend directory
   cp .env.example .env  # or create manually
   ```
   Add the following to `backend/.env`:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   FINNHUB_API_KEY=your_finnhub_api_key  # optional
   PORT=5000
   ```

4. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Start the backend server**
   ```bash
   cd ../backend
   npm run dev    # with nodemon for auto-reload
   # or
   npm start      # production mode
   ```

6. **Start the frontend dev server**
   ```bash
   cd ../frontend
   npm start
   ```

   The app will be available at `http://localhost:3000` with the backend API at `http://localhost:5000`.

## Usage

1. **Register** an account with your name, email, and password
2. **Browse** popular stocks on the dashboard or search for specific stocks
3. **View details** of any stock to see price, company info, and market data
4. **Buy** stocks by entering a quantity (max you can afford with your virtual balance)
5. **Track** your portfolio to see holdings, P&L, and total invested amount
6. **Sell** stocks from your portfolio to realize gains/losses
7. **Review** your transaction history for all past trades

Each new user starts with a **$100,000 virtual balance**.

## License

This project is for educational purposes.