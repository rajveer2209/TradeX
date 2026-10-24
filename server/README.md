# TradeX - Backend API

Production-ready Node.js, Express, and MongoDB REST API for the TradeX stock trading simulation platform.

## Features
- **User Authentication**: Secure registration and login using JWT and bcryptjs.
- **Stock Market Engine**: Full catalog of 32 real US stocks with real-time price updates and 30-day historical candlestick charts.
- **Trading Engine**: Buy and sell orders with validation, balance checking, and automatic portfolio average-cost calculation.
- **Portfolio Management**: Real-time holding valuation, profit & loss calculation, and performance tracking.
- **Watchlist**: Personal watchlists with live market metrics.
- **Price Simulation**: Admin trigger to simulate realistic market fluctuations (-3% to +3%).

---

## Directory Structure
```
server/
├── package.json
├── .env.example
├── .env
├── server.js (entry point)
├── config/
│   └── db.js (MongoDB connection)
├── models/
│   ├── User.js
│   ├── Stock.js
│   ├── Portfolio.js
│   ├── Transaction.js
│   └── Watchlist.js
├── routes/
│   ├── authRoutes.js
│   ├── stockRoutes.js
│   ├── portfolioRoutes.js
│   ├── transactionRoutes.js
│   └── watchlistRoutes.js
├── controllers/
│   ├── authController.js
│   ├── stockController.js
│   ├── portfolioController.js
│   ├── transactionController.js
│   └── watchlistController.js
├── middleware/
│   ├── auth.js (JWT verification)
│   └── roleCheck.js (admin/user role)
└── seeds/
    └── stockSeed.js (seeds 32 real US stocks with 30-day history)
```

---

## Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Update `.env` if necessary:
   ```env
   MONGO_URI=mongodb://localhost:27017/tradex
   JWT_SECRET=your_jwt_secret_key_here
   PORT=5000
   NODE_ENV=development
   ```

3. **Seed Database**:
   Seeds 32 real US stocks and sample accounts (`admin@tradex.com` / `admin123` and `demo@tradex.com` / `demo123`):
   ```bash
   npm run seed
   ```

4. **Run Server**:
   ```bash
   npm run dev    # For development with nodemon
   npm start      # For production
   ```

---

## API Endpoints

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user with $100k balance | Public |
| `POST` | `/api/auth/login` | Login user & receive JWT token | Public |
| `GET` | `/api/auth/profile` | Get current user profile | Bearer Token |
| `PUT` | `/api/auth/profile` | Update profile information | Bearer Token |

### 2. Stocks (`/api/stocks`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/stocks` | Get all stocks (`?search=AAPL&sector=Technology`) | Public |
| `GET` | `/api/stocks/:id` | Get stock details with 30-day history | Public |
| `POST` | `/api/stocks` | Create new stock | Admin |
| `PUT` | `/api/stocks/:id` | Update stock details | Admin |
| `DELETE`| `/api/stocks/:id` | Delete stock | Admin |
| `POST` | `/api/stocks/simulate-update` | Simulate random price fluctuation (-3% to +3%) | Admin |

### 3. Portfolio (`/api/portfolio`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/portfolio` | Get user portfolio with live valuation & P&L | Bearer Token |
| `GET` | `/api/portfolio/summary`| Get summary with total account value & top holdings | Bearer Token |

### 4. Transactions (`/api/transactions`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/transactions/buy` | Buy stock shares (`{ stockId, quantity }`) | Bearer Token |
| `POST` | `/api/transactions/sell` | Sell stock shares (`{ stockId, quantity }`) | Bearer Token |
| `GET` | `/api/transactions` | Paginated transaction history (`?page=1&limit=10`) | Bearer Token |
| `GET` | `/api/transactions/stats` | Trading statistics (total volume, most traded stock) | Bearer Token |

### 5. Watchlist (`/api/watchlist`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/watchlist` | Get user watchlist with live quotes | Bearer Token |
| `POST` | `/api/watchlist/add` | Add stock to watchlist (`{ stockId }`) | Bearer Token |
| `DELETE`| `/api/watchlist/remove/:stockId`| Remove stock from watchlist | Bearer Token |
