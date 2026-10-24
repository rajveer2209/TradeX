import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Stock from '../models/Stock.js';
import User from '../models/User.js';
import Portfolio from '../models/Portfolio.js';
import Watchlist from '../models/Watchlist.js';

// Load environment variables
dotenv.config();

// Helper to generate 30 days of historical candlestick data leading up to today
const generateHistoricalData = (currentPrice, volatility = 0.02) => {
  const history = [];
  const days = 30;
  const now = new Date();

  // Walk backwards to compute base prices, then construct forward
  let walkPrice = currentPrice;
  const dailyPrices = [walkPrice];

  for (let i = 1; i < days; i++) {
    const dailyReturn = (Math.random() - 0.49) * volatility * 2;
    walkPrice = walkPrice / (1 + dailyReturn);
    dailyPrices.unshift(Math.max(1, walkPrice));
  }

  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() - (days - 1 - i));
    date.setHours(16, 0, 0, 0); // Market close 4:00 PM

    const closePrice = Number(dailyPrices[i].toFixed(2));
    const openVariation = (Math.random() - 0.5) * 0.01;
    const openPrice = Number(Math.max(1, closePrice * (1 + openVariation)).toFixed(2));

    const maxOC = Math.max(openPrice, closePrice);
    const minOC = Math.min(openPrice, closePrice);

    const highPrice = Number((maxOC + Math.random() * maxOC * 0.012).toFixed(2));
    const lowPrice = Number(Math.max(0.5, minOC - Math.random() * minOC * 0.012).toFixed(2));

    const baseVolume = 15000000;
    const dayVolume = Math.floor(baseVolume * (0.6 + Math.random() * 0.8));

    history.push({
      date,
      open: openPrice,
      high: highPrice,
      low: lowPrice,
      close: closePrice,
      volume: dayVolume
    });
  }

  return history;
};

// Raw stocks dataset with 32 real US companies
const stocksData = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    sector: 'Technology',
    price: 185.92,
    previousClose: 184.25,
    volume: 54230100,
    marketCap: 2870000000000,
    high52: 199.62,
    low52: 164.08,
    volatility: 0.018
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    sector: 'Technology',
    price: 420.55,
    previousClose: 417.88,
    volume: 21450300,
    marketCap: 3120000000000,
    high52: 430.82,
    low52: 309.45,
    volatility: 0.016
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    sector: 'Technology',
    price: 172.48,
    previousClose: 170.15,
    volume: 26580400,
    marketCap: 2150000000000,
    high52: 179.95,
    low52: 115.83,
    volatility: 0.02
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    sector: 'Consumer Cyclical',
    price: 182.15,
    previousClose: 180.75,
    volume: 38920100,
    marketCap: 1890000000000,
    high52: 189.77,
    low52: 118.35,
    volatility: 0.022
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    sector: 'Consumer Cyclical',
    price: 177.46,
    previousClose: 174.6,
    volume: 78540900,
    marketCap: 565000000000,
    high52: 299.29,
    low52: 138.8,
    volatility: 0.038
  },
  {
    symbol: 'META',
    name: 'Meta Platforms Inc.',
    sector: 'Technology',
    price: 476.2,
    previousClose: 472.1,
    volume: 18340700,
    marketCap: 1210000000000,
    high52: 531.49,
    low52: 274.38,
    volatility: 0.025
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    sector: 'Technology',
    price: 903.56,
    previousClose: 887.4,
    volume: 45210800,
    marketCap: 2220000000000,
    high52: 974.0,
    low52: 373.56,
    volatility: 0.032
  },
  {
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    sector: 'Financial Services',
    price: 198.42,
    previousClose: 197.1,
    volume: 9840200,
    marketCap: 568000000000,
    high52: 205.88,
    low52: 135.19,
    volatility: 0.014
  },
  {
    symbol: 'V',
    name: 'Visa Inc.',
    sector: 'Financial Services',
    price: 275.64,
    previousClose: 274.3,
    volume: 6730500,
    marketCap: 562000000000,
    high52: 290.96,
    low52: 227.78,
    volatility: 0.012
  },
  {
    symbol: 'JNJ',
    name: 'Johnson & Johnson',
    sector: 'Healthcare',
    price: 152.18,
    previousClose: 151.75,
    volume: 7120300,
    marketCap: 366000000000,
    high52: 175.97,
    low52: 143.16,
    volatility: 0.011
  },
  {
    symbol: 'WMT',
    name: 'Walmart Inc.',
    sector: 'Consumer Defensive',
    price: 65.34,
    previousClose: 64.8,
    volume: 17420900,
    marketCap: 526000000000,
    high52: 68.22,
    low52: 49.85,
    volatility: 0.012
  },
  {
    symbol: 'PG',
    name: 'Procter & Gamble Co.',
    sector: 'Consumer Defensive',
    price: 164.72,
    previousClose: 163.95,
    volume: 6180400,
    marketCap: 387000000000,
    high52: 168.96,
    low52: 141.45,
    volatility: 0.01
  },
  {
    symbol: 'DIS',
    name: 'The Walt Disney Company',
    sector: 'Communication Services',
    price: 102.65,
    previousClose: 101.4,
    volume: 11430200,
    marketCap: 187000000000,
    high52: 123.74,
    low52: 78.73,
    volatility: 0.022
  },
  {
    symbol: 'NFLX',
    name: 'Netflix Inc.',
    sector: 'Communication Services',
    price: 641.8,
    previousClose: 635.25,
    volume: 3890100,
    marketCap: 276000000000,
    high52: 664.25,
    low52: 344.73,
    volatility: 0.024
  },
  {
    symbol: 'PYPL',
    name: 'PayPal Holdings Inc.',
    sector: 'Financial Services',
    price: 64.95,
    previousClose: 63.8,
    volume: 12540600,
    marketCap: 68000000000,
    high52: 76.54,
    low52: 50.25,
    volatility: 0.028
  },
  {
    symbol: 'AMD',
    name: 'Advanced Micro Devices Inc.',
    sector: 'Technology',
    price: 154.6,
    previousClose: 151.2,
    volume: 48900300,
    marketCap: 250000000000,
    high52: 227.3,
    low52: 93.11,
    volatility: 0.034
  },
  {
    symbol: 'INTC',
    name: 'Intel Corporation',
    sector: 'Technology',
    price: 30.72,
    previousClose: 30.15,
    volume: 42300500,
    marketCap: 131000000000,
    high52: 51.28,
    low52: 29.73,
    volatility: 0.029
  },
  {
    symbol: 'CRM',
    name: 'Salesforce Inc.',
    sector: 'Technology',
    price: 278.45,
    previousClose: 275.9,
    volume: 5670800,
    marketCap: 270000000000,
    high52: 318.71,
    low52: 193.68,
    volatility: 0.022
  },
  {
    symbol: 'ORCL',
    name: 'Oracle Corporation',
    sector: 'Technology',
    price: 124.8,
    previousClose: 123.1,
    volume: 8940200,
    marketCap: 343000000000,
    high52: 132.77,
    low52: 99.26,
    volatility: 0.019
  },
  {
    symbol: 'CSCO',
    name: 'Cisco Systems Inc.',
    sector: 'Technology',
    price: 47.35,
    previousClose: 46.95,
    volume: 16800400,
    marketCap: 191000000000,
    high52: 58.19,
    low52: 45.45,
    volatility: 0.013
  },
  {
    symbol: 'BA',
    name: 'The Boeing Company',
    sector: 'Industrials',
    price: 178.25,
    previousClose: 176.5,
    volume: 7210900,
    marketCap: 109000000000,
    high52: 267.54,
    low52: 159.7,
    volatility: 0.028
  },
  {
    symbol: 'GS',
    name: 'The Goldman Sachs Group Inc.',
    sector: 'Financial Services',
    price: 442.15,
    previousClose: 438.8,
    volume: 2450300,
    marketCap: 147000000000,
    high52: 460.52,
    low52: 289.36,
    volatility: 0.017
  },
  {
    symbol: 'MS',
    name: 'Morgan Stanley',
    sector: 'Financial Services',
    price: 97.42,
    previousClose: 96.1,
    volume: 5930200,
    marketCap: 158000000000,
    high52: 103.54,
    low52: 69.42,
    volatility: 0.018
  },
  {
    symbol: 'UNH',
    name: 'UnitedHealth Group Inc.',
    sector: 'Healthcare',
    price: 493.85,
    previousClose: 489.2,
    volume: 3820100,
    marketCap: 454000000000,
    high52: 558.1,
    low52: 436.38,
    volatility: 0.015
  },
  {
    symbol: 'HD',
    name: 'The Home Depot Inc.',
    sector: 'Consumer Cyclical',
    price: 342.9,
    previousClose: 339.6,
    volume: 3410500,
    marketCap: 340000000000,
    high52: 396.87,
    low52: 274.26,
    volatility: 0.016
  },
  {
    symbol: 'MCD',
    name: "McDonald's Corporation",
    sector: 'Consumer Cyclical',
    price: 258.75,
    previousClose: 256.4,
    volume: 3950200,
    marketCap: 186000000000,
    high52: 302.39,
    low52: 243.53,
    volatility: 0.013
  },
  {
    symbol: 'NKE',
    name: 'NIKE Inc.',
    sector: 'Consumer Cyclical',
    price: 93.65,
    previousClose: 92.4,
    volume: 8120400,
    marketCap: 141000000000,
    high52: 123.39,
    low52: 88.66,
    volatility: 0.021
  },
  {
    symbol: 'COST',
    name: 'Costco Wholesale Corporation',
    sector: 'Consumer Defensive',
    price: 798.12,
    previousClose: 791.4,
    volume: 1980300,
    marketCap: 354000000000,
    high52: 815.44,
    low52: 479.25,
    volatility: 0.014
  },
  {
    symbol: 'SBUX',
    name: 'Starbucks Corporation',
    sector: 'Consumer Cyclical',
    price: 78.42,
    previousClose: 77.3,
    volume: 12840700,
    marketCap: 89000000000,
    high52: 107.66,
    low52: 71.55,
    volatility: 0.02
  },
  {
    symbol: 'ADBE',
    name: 'Adobe Inc.',
    sector: 'Technology',
    price: 485.65,
    previousClose: 480.1,
    volume: 2950600,
    marketCap: 217000000000,
    high52: 638.25,
    low52: 433.97,
    volatility: 0.023
  },
  {
    symbol: 'BAC',
    name: 'Bank of America Corporation',
    sector: 'Financial Services',
    price: 38.65,
    previousClose: 38.15,
    volume: 34100200,
    marketCap: 303000000000,
    high52: 40.08,
    low52: 24.96,
    volatility: 0.016
  },
  {
    symbol: 'XOM',
    name: 'Exxon Mobil Corporation',
    sector: 'Energy',
    price: 118.25,
    previousClose: 117.1,
    volume: 15400900,
    marketCap: 468000000000,
    high52: 123.75,
    low52: 95.77,
    volatility: 0.017
  }
];

export const seedDatabase = async (closeOnComplete = true) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tradex';
      console.log(`[Seed] Connecting to MongoDB: ${mongoUri}`);
      await mongoose.connect(mongoUri);
    }

    console.log('[Seed] Connected! Clearing existing stock data...');
    await Stock.deleteMany({});

    console.log(`[Seed] Generating rich stock models with 30-day historical data for ${stocksData.length} stocks...`);

    const formattedStocks = stocksData.map((item) => {
      const price = item.price;
      const prevClose = item.previousClose;
      const change = Number((price - prevClose).toFixed(2));
      const changePercent = Number(((change / prevClose) * 100).toFixed(2));
      const dayHigh = Number((price + price * (Math.random() * 0.015 + 0.003)).toFixed(2));
      const dayLow = Number((price - price * (Math.random() * 0.015 + 0.003)).toFixed(2));
      const openPrice = Number((prevClose + (Math.random() - 0.48) * (price * 0.01)).toFixed(2));

      const historicalData = generateHistoricalData(price, item.volatility || 0.02);

      return {
        symbol: item.symbol,
        name: item.name,
        sector: item.sector,
        price,
        previousClose: prevClose,
        change,
        changePercent,
        volume: item.volume,
        marketCap: item.marketCap,
        high52: item.high52,
        low52: item.low52,
        dayHigh,
        dayLow,
        openPrice,
        historicalData,
        updatedAt: new Date()
      };
    });

    const insertedStocks = await Stock.insertMany(formattedStocks);
    console.log(`[Seed] Successfully inserted ${insertedStocks.length} stocks!`);

    // Ensure default admin user exists
    const adminEmail = 'admin@tradex.com';
    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      console.log('[Seed] Creating default admin user (admin@tradex.com / admin123)...');
      adminUser = await User.create({
        name: 'TradeX Admin',
        email: adminEmail,
        password: 'admin123',
        role: 'admin',
        balance: 1000000,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      });
      await Portfolio.create({
        userId: adminUser._id,
        holdings: [],
        totalInvested: 0,
        currentValue: 0
      });
      await Watchlist.create({
        userId: adminUser._id,
        stocks: []
      });
      console.log('[Seed] Admin user created.');
    } else {
      console.log('[Seed] Admin user already exists.');
    }

    // Ensure default demo user exists
    const demoEmail = 'demo@tradex.com';
    let demoUser = await User.findOne({ email: demoEmail });
    if (!demoUser) {
      console.log('[Seed] Creating default demo user (demo@tradex.com / demo123)...');
      demoUser = await User.create({
        name: 'Alex Trader',
        email: demoEmail,
        password: 'demo123',
        role: 'user',
        balance: 75000,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
      });

      // Give demo user some initial sample holdings
      const appleStock = insertedStocks.find((s) => s.symbol === 'AAPL');
      const nvdaStock = insertedStocks.find((s) => s.symbol === 'NVDA');
      const msftStock = insertedStocks.find((s) => s.symbol === 'MSFT');

      const holdings = [];
      let totalInvested = 0;
      let currentValue = 0;

      if (appleStock) {
        holdings.push({
          stockId: appleStock._id,
          symbol: appleStock.symbol,
          name: appleStock.name,
          quantity: 50,
          avgBuyPrice: 175.5
        });
        totalInvested += 50 * 175.5;
        currentValue += 50 * appleStock.price;
      }

      if (nvdaStock) {
        holdings.push({
          stockId: nvdaStock._id,
          symbol: nvdaStock.symbol,
          name: nvdaStock.name,
          quantity: 15,
          avgBuyPrice: 820.0
        });
        totalInvested += 15 * 820.0;
        currentValue += 15 * nvdaStock.price;
      }

      await Portfolio.create({
        userId: demoUser._id,
        holdings,
        totalInvested: Number(totalInvested.toFixed(2)),
        currentValue: Number(currentValue.toFixed(2))
      });

      const watchlistStocks = [];
      if (msftStock) {
        watchlistStocks.push({
          stockId: msftStock._id,
          symbol: msftStock.symbol,
          name: msftStock.name,
          addedAt: new Date()
        });
      }
      if (appleStock) {
        watchlistStocks.push({
          stockId: appleStock._id,
          symbol: appleStock.symbol,
          name: appleStock.name,
          addedAt: new Date()
        });
      }

      await Watchlist.create({
        userId: demoUser._id,
        stocks: watchlistStocks
      });

      console.log('[Seed] Demo user created with starter portfolio and watchlist.');
    } else {
      console.log('[Seed] Demo user already exists.');
    }

    console.log('[Seed] Seeding completed successfully!');
    if (closeOnComplete) {
      await mongoose.connection.close();
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    if (closeOnComplete) {
      await mongoose.connection.close();
      process.exit(1);
    }
    throw error;
  }
};

// Execute if run directly from CLI
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('stockSeed.js')) {
  seedDatabase(true);
}
