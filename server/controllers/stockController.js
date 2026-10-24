import mongoose from 'mongoose';
import Stock from '../models/Stock.js';

// @desc    Get all stocks with optional search and sector filters
// @route   GET /api/stocks
// @access  Public
export const getStocks = async (req, res) => {
  try {
    const { search, sector } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { symbol: { $regex: search.trim(), $options: 'i' } },
        { name: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    if (sector && sector !== 'All') {
      filter.sector = { $regex: `^${sector.trim()}$`, $options: 'i' };
    }

    // Exclude full 30-day historicalData in list view to keep payload fast and light
    const stocks = await Stock.find(filter)
      .select('-historicalData')
      .sort({ symbol: 1 });

    return res.status(200).json({
      success: true,
      count: stocks.length,
      data: stocks
    });
  } catch (error) {
    console.error('Get stocks error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving stocks'
    });
  }
};

// @desc    Get stock by ID (or symbol) with historical data
// @route   GET /api/stocks/:id
// @access  Public
export const getStockById = async (req, res) => {
  try {
    const { id } = req.params;
    let stock;

    if (mongoose.Types.ObjectId.isValid(id)) {
      stock = await Stock.findById(id);
    } else {
      // Allow searching by ticker symbol as a fallback
      stock = await Stock.findOne({ symbol: id.toUpperCase().trim() });
    }

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: stock
    });
  } catch (error) {
    console.error('Get stock by ID error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving stock'
    });
  }
};

// @desc    Create a new stock
// @route   POST /api/stocks
// @access  Private/Admin
export const createStock = async (req, res) => {
  try {
    const {
      symbol,
      name,
      sector,
      price,
      previousClose,
      change,
      changePercent,
      volume,
      marketCap,
      high52,
      low52,
      dayHigh,
      dayLow,
      openPrice,
      historicalData
    } = req.body;

    if (!symbol || !name || !sector || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide symbol, name, sector, and price'
      });
    }

    const existingStock = await Stock.findOne({ symbol: symbol.toUpperCase().trim() });
    if (existingStock) {
      return res.status(400).json({
        success: false,
        message: `Stock with symbol ${symbol.toUpperCase().trim()} already exists`
      });
    }

    const stock = await Stock.create({
      symbol: symbol.toUpperCase().trim(),
      name: name.trim(),
      sector: sector.trim(),
      price: Number(price),
      previousClose: previousClose !== undefined ? Number(previousClose) : Number(price),
      change: change !== undefined ? Number(change) : 0,
      changePercent: changePercent !== undefined ? Number(changePercent) : 0,
      volume: volume !== undefined ? Number(volume) : 0,
      marketCap: marketCap !== undefined ? Number(marketCap) : 0,
      high52: high52 !== undefined ? Number(high52) : Number(price),
      low52: low52 !== undefined ? Number(low52) : Number(price),
      dayHigh: dayHigh !== undefined ? Number(dayHigh) : Number(price),
      dayLow: dayLow !== undefined ? Number(dayLow) : Number(price),
      openPrice: openPrice !== undefined ? Number(openPrice) : Number(price),
      historicalData: Array.isArray(historicalData) ? historicalData : []
    });

    return res.status(201).json({
      success: true,
      message: 'Stock created successfully',
      data: stock
    });
  } catch (error) {
    console.error('Create stock error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating stock'
    });
  }
};

// @desc    Update stock
// @route   PUT /api/stocks/:id
// @access  Private/Admin
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;

    let stock = await Stock.findById(id);
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock not found'
      });
    }

    const updates = { ...req.body };
    if (updates.symbol) {
      updates.symbol = updates.symbol.toUpperCase().trim();
    }
    updates.updatedAt = new Date();

    stock = await Stock.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    return res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      data: stock
    });
  } catch (error) {
    console.error('Update stock error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating stock'
    });
  }
};

// @desc    Delete stock
// @route   DELETE /api/stocks/:id
// @access  Private/Admin
export const deleteStock = async (req, res) => {
  try {
    const { id } = req.params;

    const stock = await Stock.findById(id);
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock not found'
      });
    }

    await Stock.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Stock deleted successfully'
    });
  } catch (error) {
    console.error('Delete stock error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting stock'
    });
  }
};

// @desc    Simulate random price changes (-3% to +3%) for all stocks
// @route   POST /api/stocks/simulate-update
// @access  Private/Admin
export const simulatePriceUpdates = async (req, res) => {
  try {
    const stocks = await Stock.find();

    if (!stocks || stocks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No stocks available to simulate'
      });
    }

    const updatedStocks = [];

    for (const stock of stocks) {
      // Random percentage adjustment between -3% and +3%
      const percentageDelta = (Math.random() * 6 - 3) / 100;
      const currentPrice = stock.price;
      const baseClose = stock.previousClose || currentPrice;

      const newPrice = Math.max(0.05, Number((currentPrice * (1 + percentageDelta)).toFixed(2)));
      const change = Number((newPrice - baseClose).toFixed(2));
      const changePercent = Number(((change / baseClose) * 100).toFixed(2));

      stock.price = newPrice;
      stock.change = change;
      stock.changePercent = changePercent;
      stock.dayHigh = Math.max(stock.dayHigh, newPrice);
      stock.dayLow = Math.min(stock.dayLow, newPrice);
      stock.high52 = Math.max(stock.high52, newPrice);
      stock.low52 = Math.min(stock.low52, newPrice);
      stock.volume = stock.volume + Math.floor(Math.random() * 15000 + 5000);
      stock.updatedAt = new Date();

      // If historical data exists, update latest entry or keep it synced
      if (stock.historicalData && stock.historicalData.length > 0) {
        const lastEntry = stock.historicalData[stock.historicalData.length - 1];
        lastEntry.close = newPrice;
        lastEntry.high = Math.max(lastEntry.high, newPrice);
        lastEntry.low = Math.min(lastEntry.low, newPrice);
        lastEntry.volume = stock.volume;
      }

      await stock.save();
      updatedStocks.push({
        _id: stock._id,
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        change: stock.change,
        changePercent: stock.changePercent,
        dayHigh: stock.dayHigh,
        dayLow: stock.dayLow,
        volume: stock.volume
      });
    }

    return res.status(200).json({
      success: true,
      message: `Simulated price updates for ${updatedStocks.length} stocks`,
      count: updatedStocks.length,
      data: updatedStocks
    });
  } catch (error) {
    console.error('Simulate price updates error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error simulating price updates'
    });
  }
};
