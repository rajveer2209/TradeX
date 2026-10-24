import mongoose from 'mongoose';
import Watchlist from '../models/Watchlist.js';
import Stock from '../models/Stock.js';

// @desc    Get user's watchlist with enriched stock details
// @route   GET /api/watchlist
// @access  Private
export const getWatchlist = async (req, res) => {
  try {
    const userId = req.user._id;

    let watchlist = await Watchlist.findOne({ userId });
    if (!watchlist) {
      watchlist = await Watchlist.create({
        userId,
        stocks: []
      });
    }

    // Enrich watchlist with latest stock price information
    const enrichedStocks = [];
    for (const item of watchlist.stocks) {
      const stock = await Stock.findById(item.stockId);
      if (stock) {
        enrichedStocks.push({
          _id: item._id,
          stockId: stock._id,
          symbol: stock.symbol,
          name: stock.name,
          price: stock.price,
          change: stock.change,
          changePercent: stock.changePercent,
          sector: stock.sector,
          dayHigh: stock.dayHigh,
          dayLow: stock.dayLow,
          volume: stock.volume,
          addedAt: item.addedAt
        });
      } else {
        enrichedStocks.push(item);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        _id: watchlist._id,
        userId: watchlist.userId,
        stocks: enrichedStocks,
        count: enrichedStocks.length,
        createdAt: watchlist.createdAt,
        updatedAt: watchlist.updatedAt
      }
    });
  } catch (error) {
    console.error('Get watchlist error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving watchlist'
    });
  }
};

// @desc    Add stock to watchlist
// @route   POST /api/watchlist/add
// @access  Private
export const addToWatchlist = async (req, res) => {
  try {
    const { stockId } = req.body;

    if (!stockId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a stockId'
      });
    }

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

    let watchlist = await Watchlist.findOne({ userId: req.user._id });
    if (!watchlist) {
      watchlist = new Watchlist({
        userId: req.user._id,
        stocks: []
      });
    }

    const alreadyInWatchlist = watchlist.stocks.some(
      (item) => item.stockId.toString() === stock._id.toString()
    );

    if (alreadyInWatchlist) {
      return res.status(400).json({
        success: false,
        message: `${stock.symbol} is already in your watchlist`
      });
    }

    watchlist.stocks.push({
      stockId: stock._id,
      symbol: stock.symbol,
      name: stock.name,
      addedAt: new Date()
    });

    await watchlist.save();

    return res.status(201).json({
      success: true,
      message: `Added ${stock.symbol} to watchlist`,
      data: watchlist
    });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error adding stock to watchlist'
    });
  }
};

// @desc    Remove stock from watchlist
// @route   DELETE /api/watchlist/remove/:stockId
// @access  Private
export const removeFromWatchlist = async (req, res) => {
  try {
    const { stockId } = req.params;

    const watchlist = await Watchlist.findOne({ userId: req.user._id });
    if (!watchlist) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist not found'
      });
    }

    const initialCount = watchlist.stocks.length;

    watchlist.stocks = watchlist.stocks.filter((item) => {
      const matchesId = item.stockId.toString() === stockId;
      const matchesSymbol = item.symbol.toUpperCase() === stockId.toUpperCase();
      return !matchesId && !matchesSymbol;
    });

    if (watchlist.stocks.length === initialCount) {
      return res.status(404).json({
        success: false,
        message: 'Stock not found in watchlist'
      });
    }

    await watchlist.save();

    return res.status(200).json({
      success: true,
      message: 'Stock removed from watchlist',
      data: watchlist
    });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error removing stock from watchlist'
    });
  }
};
