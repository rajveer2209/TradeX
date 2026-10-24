import mongoose from 'mongoose';

const holdingSchema = new mongoose.Schema(
  {
    stockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stock',
      required: true
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true
    },
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    avgBuyPrice: {
      type: Number,
      required: true,
      min: [0, 'Average buy price cannot be negative']
    }
  },
  { _id: true }
);

const portfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    holdings: {
      type: [holdingSchema],
      default: []
    },
    totalInvested: {
      type: Number,
      default: 0,
      min: [0, 'Total invested cannot be negative']
    },
    currentValue: {
      type: Number,
      default: 0,
      min: [0, 'Current value cannot be negative']
    }
  },
  {
    timestamps: true
  }
);

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

export default Portfolio;
