import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import Stock from '../models/Stock.js';
import User from '../models/User.js';
import Portfolio from '../models/Portfolio.js';

// @desc    Buy shares of a stock
// @route   POST /api/transactions/buy
// @access  Private
export const buyStock = async (req, res) => {
  try {
    const { stockId, quantity } = req.body;
    const parsedQty = parseInt(quantity, 10);

    if (!stockId || !parsedQty || parsedQty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid stock ID and positive integer quantity'
      });
    }

    // Lookup stock
    let stock;
    if (mongoose.Types.ObjectId.isValid(stockId)) {
      stock = await Stock.findById(stockId);
    } else {
      stock = await Stock.findOne({ symbol: stockId.toUpperCase().trim() });
    }

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock not found'
      });
    }

    const totalCost = Number((stock.price * parsedQty).toFixed(2));

    // Check user balance
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }

    if (user.balance < totalCost) {
      return res.status(400).json({
        success: false,
        message: `Insufficient funds. Required: $${totalCost.toFixed(2)}, Available: $${user.balance.toFixed(2)}`
      });
    }

    // Deduct balance
    user.balance = Number((user.balance - totalCost).toFixed(2));
    await user.save();

    // Update user portfolio
    let portfolio = await Portfolio.findOne({ userId: user._id });
    if (!portfolio) {
      portfolio = new Portfolio({
        userId: user._id,
        holdings: [],
        totalInvested: 0,
        currentValue: 0
      });
    }

    const existingHoldingIndex = portfolio.holdings.findIndex(
      (h) => h.stockId.toString() === stock._id.toString()
    );

    if (existingHoldingIndex > -1) {
      const existingHolding = portfolio.holdings[existingHoldingIndex];
      const prevTotalCost = existingHolding.quantity * existingHolding.avgBuyPrice;
      const newQuantity = existingHolding.quantity + parsedQty;
      const newAvgBuyPrice = Number(((prevTotalCost + totalCost) / newQuantity).toFixed(2));

      existingHolding.quantity = newQuantity;
      existingHolding.avgBuyPrice = newAvgBuyPrice;
    } else {
      portfolio.holdings.push({
        stockId: stock._id,
        symbol: stock.symbol,
        name: stock.name,
        quantity: parsedQty,
        avgBuyPrice: stock.price
      });
    }

    // Recalculate portfolio summary cached numbers
    portfolio.totalInvested = Number(
      portfolio.holdings.reduce((sum, h) => sum + h.quantity * h.avgBuyPrice, 0).toFixed(2)
    );
    portfolio.currentValue = Number(
      portfolio.holdings.reduce((sum, h) => sum + h.quantity * (h.stockId.equals(stock._id) ? stock.price : h.avgBuyPrice), 0).toFixed(2)
    );
    await portfolio.save();

    // Create transaction record
    const transaction = await Transaction.create({
      userId: user._id,
      stockId: stock._id,
      symbol: stock.symbol,
      type: 'buy',
      quantity: parsedQty,
      price: stock.price,
      total: totalCost,
      timestamp: new Date()
    });

    return res.status(201).json({
      success: true,
      message: `Successfully purchased ${parsedQty} shares of ${stock.symbol} for $${totalCost.toFixed(2)}`,
      data: {
        transaction,
        remainingBalance: user.balance
      }
    });
  } catch (error) {
    console.error('Buy stock error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error processing stock purchase'
    });
  }
};

// @desc    Sell shares of a stock
// @route   POST /api/transactions/sell
// @access  Private
export const sellStock = async (req, res) => {
  try {
    const { stockId, quantity } = req.body;
    const parsedQty = parseInt(quantity, 10);

    if (!stockId || !parsedQty || parsedQty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid stock ID and positive integer quantity'
      });
    }

    // Lookup stock
    let stock;
    if (mongoose.Types.ObjectId.isValid(stockId)) {
      stock = await Stock.findById(stockId);
    } else {
      stock = await Stock.findOne({ symbol: stockId.toUpperCase().trim() });
    }

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock not found'
      });
    }

    const portfolio = await Portfolio.findOne({ userId: req.user._id });
    if (!portfolio || !portfolio.holdings || portfolio.holdings.length === 0) {
      return res.status(400).json({
        success: false,
        message: `You do not own any shares of ${stock.symbol}`
      });
    }

    const holdingIndex = portfolio.holdings.findIndex(
      (h) => h.stockId.toString() === stock._id.toString()
    );

    if (holdingIndex === -1) {
      return res.status(400).json({
        success: false,
        message: `You do not own any shares of ${stock.symbol}`
      });
    }

    const holding = portfolio.holdings[holdingIndex];
    if (holding.quantity < parsedQty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient shares. You own ${holding.quantity} shares of ${stock.symbol}, but attempted to sell ${parsedQty}`
      });
    }

    const totalRevenue = Number((stock.price * parsedQty).toFixed(2));

    // Update user balance
    const user = await User.findById(req.user._id);
    user.balance = Number((user.balance + totalRevenue).toFixed(2));
    await user.save();

    // Update portfolio holdings
    if (holding.quantity === parsedQty) {
      portfolio.holdings.splice(holdingIndex, 1);
    } else {
      holding.quantity -= parsedQty;
    }

    // Recalculate portfolio cached numbers
    portfolio.totalInvested = Number(
      portfolio.holdings.reduce((sum, h) => sum + h.quantity * h.avgBuyPrice, 0).toFixed(2)
    );
    portfolio.currentValue = Number(
      portfolio.holdings.reduce((sum, h) => sum + h.quantity * (h.stockId.equals(stock._id) ? stock.price : h.avgBuyPrice), 0).toFixed(2)
    );
    await portfolio.save();

    // Create transaction record
    const transaction = await Transaction.create({
      userId: user._id,
      stockId: stock._id,
      symbol: stock.symbol,
      type: 'sell',
      quantity: parsedQty,
      price: stock.price,
      total: totalRevenue,
      timestamp: new Date()
    });

    return res.status(200).json({
      success: true,
      message: `Successfully sold ${parsedQty} shares of ${stock.symbol} for $${totalRevenue.toFixed(2)}`,
      data: {
        transaction,
        newBalance: user.balance
      }
    });
  } catch (error) {
    console.error('Sell stock error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error processing stock sale'
    });
  }
};

// @desc    Get transaction history with pagination
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id };
    if (req.query.type && ['buy', 'sell'].includes(req.query.type.toLowerCase())) {
      query.type = req.query.type.toLowerCase();
    }
    if (req.query.symbol) {
      query.symbol = req.query.symbol.toUpperCase().trim();
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('stockId', 'sector marketCap dayHigh dayLow');

    return res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving transactions'
    });
  }
};

// @desc    Get trading stats for user
// @route   GET /api/transactions/stats
// @access  Private
export const getTransactionStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const allTransactions = await Transaction.find({ userId }).sort({ timestamp: -1 });

    const totalTrades = allTransactions.length;
    let buyTrades = 0;
    let sellTrades = 0;
    let totalVolumeTraded = 0;
    let totalSharesTraded = 0;
    const symbolCount = {};

    for (const tx of allTransactions) {
      if (tx.type === 'buy') buyTrades++;
      if (tx.type === 'sell') sellTrades++;
      totalVolumeTraded += tx.total;
      totalSharesTraded += tx.quantity;

      symbolCount[tx.symbol] = (symbolCount[tx.symbol] || 0) + tx.quantity;
    }

    // Determine most traded stock
    let mostTradedStock = null;
    let maxQuantity = 0;
    for (const [sym, count] of Object.entries(symbolCount)) {
      if (count > maxQuantity) {
        maxQuantity = count;
        mostTradedStock = { symbol: sym, totalShares: count };
      }
    }

    const recentTrades = allTransactions.slice(0, 5);

    return res.status(200).json({
      success: true,
      data: {
        totalTrades,
        buyTrades,
        sellTrades,
        totalVolumeTraded: Number(totalVolumeTraded.toFixed(2)),
        totalSharesTraded,
        mostTradedStock,
        recentTrades
      }
    });
  } catch (error) {
    console.error('Get transaction stats error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving transaction statistics'
    });
  }
};
