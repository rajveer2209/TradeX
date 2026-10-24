import mongoose from 'mongoose';

const historicalDataPointSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true
    },
    open: {
      type: Number,
      required: true
    },
    high: {
      type: Number,
      required: true
    },
    low: {
      type: Number,
      required: true
    },
    close: {
      type: Number,
      required: true
    },
    volume: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const stockSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: [true, 'Stock symbol is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    sector: {
      type: String,
      required: [true, 'Sector is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Current price is required'],
      min: [0, 'Price must be non-negative']
    },
    previousClose: {
      type: Number,
      default: 0
    },
    change: {
      type: Number,
      default: 0
    },
    changePercent: {
      type: Number,
      default: 0
    },
    volume: {
      type: Number,
      default: 0
    },
    marketCap: {
      type: Number,
      default: 0
    },
    high52: {
      type: Number,
      default: 0
    },
    low52: {
      type: Number,
      default: 0
    },
    dayHigh: {
      type: Number,
      default: 0
    },
    dayLow: {
      type: Number,
      default: 0
    },
    openPrice: {
      type: Number,
      default: 0
    },
    historicalData: {
      type: [historicalDataPointSchema],
      default: []
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Index for sector and text search
stockSchema.index({ sector: 1 });
stockSchema.index({ name: 'text', symbol: 'text' });

const Stock = mongoose.model('Stock', stockSchema);

export default Stock;
