import mongoose from 'mongoose';

const watchlistItemSchema = new mongoose.Schema(
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
    addedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const watchlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    stocks: {
      type: [watchlistItemSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

export default Watchlist;
