import Portfolio from '../models/Portfolio.js';
import Stock from '../models/Stock.js';
import User from '../models/User.js';

// Helper to recalculate and enrich portfolio with real-time stock data
export const calculatePortfolioMetrics = async (portfolio) => {
  let totalInvested = 0;
  let currentValue = 0;

  const enrichedHoldings = [];

  for (const item of portfolio.holdings) {
    const stock = await Stock.findById(item.stockId);
    const livePrice = stock ? stock.price : item.avgBuyPrice;
    const itemInvested = Number((item.quantity * item.avgBuyPrice).toFixed(2));
    const itemCurrentValue = Number((item.quantity * livePrice).toFixed(2));
    const pnl = Number((itemCurrentValue - itemInvested).toFixed(2));
    const pnlPercent = itemInvested > 0 ? Number(((pnl / itemInvested) * 100).toFixed(2)) : 0;

    totalInvested += itemInvested;
    currentValue += itemCurrentValue;

    enrichedHoldings.push({
      _id: item._id,
      stockId: item.stockId,
      symbol: item.symbol,
      name: stock ? stock.name : item.name,
      quantity: item.quantity,
      avgBuyPrice: item.avgBuyPrice,
      currentPrice: livePrice,
      change: stock ? stock.change : 0,
      changePercent: stock ? stock.changePercent : 0,
      totalInvested: itemInvested,
      currentValue: itemCurrentValue,
      profitLoss: pnl,
      profitLossPercent: pnlPercent
    });
  }

  totalInvested = Number(totalInvested.toFixed(2));
  currentValue = Number(currentValue.toFixed(2));

  // Update cached values in portfolio document
  portfolio.totalInvested = totalInvested;
  portfolio.currentValue = currentValue;
  await portfolio.save();

  return {
    portfolio,
    enrichedHoldings,
    totalInvested,
    currentValue
  };
};

// @desc    Get user's portfolio with live calculations
// @route   GET /api/portfolio
// @access  Private
export const getPortfolio = async (req, res) => {
  try {
    const userId = req.user._id;

    let portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      portfolio = await Portfolio.create({
        userId,
        holdings: [],
        totalInvested: 0,
        currentValue: 0
      });
    }

    const user = await User.findById(userId).select('balance');
    const { enrichedHoldings, totalInvested, currentValue } =
      await calculatePortfolioMetrics(portfolio);

    const unrealizedProfitLoss = Number((currentValue - totalInvested).toFixed(2));
    const unrealizedProfitLossPercent =
      totalInvested > 0 ? Number(((unrealizedProfitLoss / totalInvested) * 100).toFixed(2)) : 0;

    return res.status(200).json({
      success: true,
      data: {
        portfolioId: portfolio._id,
        userId,
        userBalance: user ? user.balance : 0,
        totalInvested,
        currentValue,
        unrealizedProfitLoss,
        unrealizedProfitLossPercent,
        holdings: enrichedHoldings,
        createdAt: portfolio.createdAt,
        updatedAt: portfolio.updatedAt
      }
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving portfolio'
    });
  }
};

// @desc    Get portfolio summary with total account value, P&L, and performance breakdown
// @route   GET /api/portfolio/summary
// @access  Private
export const getPortfolioSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    let portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      portfolio = await Portfolio.create({
        userId,
        holdings: [],
        totalInvested: 0,
        currentValue: 0
      });
    }

    const user = await User.findById(userId).select('balance');
    const cashBalance = user ? user.balance : 0;

    const { enrichedHoldings, totalInvested, currentValue } =
      await calculatePortfolioMetrics(portfolio);

    const totalAccountValue = Number((cashBalance + currentValue).toFixed(2));
    const unrealizedProfitLoss = Number((currentValue - totalInvested).toFixed(2));
    const unrealizedProfitLossPercent =
      totalInvested > 0 ? Number(((unrealizedProfitLoss / totalInvested) * 100).toFixed(2)) : 0;

    // All-time return benchmarked against the standard $100,000 starting cash
    const startingBalance = 100000;
    const allTimeProfitLoss = Number((totalAccountValue - startingBalance).toFixed(2));
    const allTimeReturnPercent = Number(((allTimeProfitLoss / startingBalance) * 100).toFixed(2));

    // Sort holdings to extract top gainers and biggest holdings
    const topPerformers = [...enrichedHoldings].sort(
      (a, b) => b.profitLossPercent - a.profitLossPercent
    );

    return res.status(200).json({
      success: true,
      data: {
        cashBalance,
        portfolioValue: currentValue,
        totalAccountValue,
        totalInvested,
        totalProfitLoss: unrealizedProfitLoss,
        totalProfitLossPercent: unrealizedProfitLossPercent,
        allTimeProfitLoss,
        allTimeReturnPercent,
        holdingsCount: enrichedHoldings.length,
        topHoldings: topPerformers.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Get portfolio summary error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving portfolio summary'
    });
  }
};
