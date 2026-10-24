import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
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
    type: {
      type: String,
      enum: ['buy', 'sell'],
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price must be non-negative']
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total must be non-negative']
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

transactionSchema.index({ userId: 1, timestamp: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
