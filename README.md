# TradeX - Stock Trading Simulation Platform 📈

TradeX is a modern full-stack stock trading simulation platform built with **React**, **Node.js**, **Express**, and **MongoDB**. It lets users simulate trading 32 real US stocks, manage personal portfolios, monitor watchlists, and analyze performance with live candlestick & interactive charts.

---

## 🌟 Key Features

- **Authentication & Security**: User registration, login with JWT authentication, password hashing using bcrypt.
- **Virtual Balance**: $100,000 initial virtual cash credited upon registration.
- **Stock Market Catalog**: 32 US stocks across Technology, Finance, Healthcare, Consumer, Energy, and Industrial sectors with 30-day historical chart data.
- **Interactive Charts**: Candlestick and price trends powered by Chart.js.
- **Trading Engine**: Real-time Buy and Sell execution with order validation and automatic average purchase price recalculation.
- **Portfolio & Performance**: Dynamic holdings tracking, real-time unrealized and realized P&L calculations.
- **Watchlist**: Track favorite stocks and monitor daily price changes.
- **Market Simulation**: Trigger price fluctuations (-3% to +3%) to simulate realistic live market conditions.
- **Zero-Setup Database**: Automatic fallback to in-memory MongoDB (`mongodb-memory-server`) with auto-seeding if a local MongoDB server is not present.

---

## 🏗️ Architecture & Tech Stack

### Frontend (`client/`)
- **React 18** (SPA)
- **Redux Toolkit** (State management)
- **Bootstrap 5 & React-Bootstrap**
- **Chart.js & React-Chartjs-2**
- **React Icons & React Toastify**
- **Axios**

### Backend (`server/`)
- **Node.js & Express** (ES Modules)
- **Mongoose & MongoDB** (with MongoDB Memory Server fallback)
- **JWT (JSON Web Tokens)** & **Bcryptjs**
- **CORS & Dotenv**

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Optional: an in-memory database will automatically launch if local MongoDB is not running)

### 1. Backend Setup
```bash
cd server
npm install
npm run seed     # Optional: manually seed sample stocks & demo accounts
npm run dev      # Runs server on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd client
npm install
npm start        # Launches client on http://localhost:3000
```

---

## 🔑 Demo Credentials

| Role | Email | Password | Initial Balance |
|---|---|---|---|
| Admin | `admin@tradex.com` | `admin123` | $100,000 |
| Demo User | `demo@tradex.com` | `demo123` | $100,000 |

*You can also register a new account on the registration page with instant $100,000 virtual balance.*

---

## 📡 API Overview

| Route | Method | Description |
|---|---|---|
| `/api/auth/register` | POST | Register new trader |
| `/api/auth/login` | POST | Login and receive JWT |
| `/api/auth/profile` | GET / PUT | Fetch or update user profile |
| `/api/stocks` | GET | List stocks with search/filter |
| `/api/stocks/:id` | GET | Get single stock details & historical prices |
| `/api/stocks/simulate-update` | POST | Simulate market movements (Admin) |
| `/api/portfolio` | GET | Retrieve user portfolio with live valuation |
| `/api/transactions/buy` | POST | Buy shares |
| `/api/transactions/sell` | POST | Sell shares |
| `/api/transactions` | GET | Paginated trade transaction history |
| `/api/watchlist` | GET / POST / DELETE | Manage personal watchlist |

---

## 📄 License
MIT License.
