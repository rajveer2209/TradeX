import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import watchlistService from '../../services/watchlistService';

const initialState = {
  watchlist: [],
  loading: false,
  error: null,
};

export const getWatchlist = createAsyncThunk(
  'watchlist/getWatchlist',
  async (_, { rejectWithValue }) => {
    try {
      const data = await watchlistService.getWatchlist();
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch watchlist';
      return rejectWithValue(message);
    }
  }
);

export const addToWatchlist = createAsyncThunk(
  'watchlist/addToWatchlist',
  async (stockId, { rejectWithValue }) => {
    try {
      const data = await watchlistService.addToWatchlist(stockId);
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to add to watchlist';
      return rejectWithValue(message);
    }
  }
);

export const removeFromWatchlist = createAsyncThunk(
  'watchlist/removeFromWatchlist',
  async (stockId, { rejectWithValue }) => {
    try {
      await watchlistService.removeFromWatchlist(stockId);
      return stockId;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to remove from watchlist';
      return rejectWithValue(message);
    }
  }
);

const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState,
  reducers: {
    clearWatchlistError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getWatchlist
      .addCase(getWatchlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getWatchlist.fulfilled, (state, action) => {
        state.loading = false;
        const resData = action.payload?.data || action.payload;
        const raw = resData?.stocks || resData?.watchlist || resData;
        if (Array.isArray(raw)) {
          state.watchlist = raw;
        } else if (raw && Array.isArray(raw.stocks)) {
          state.watchlist = raw.stocks;
        } else {
          state.watchlist = [];
        }
      })
      .addCase(getWatchlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // addToWatchlist
      .addCase(addToWatchlist.fulfilled, (state, action) => {
        const added = action.payload.stock || action.payload.watchlistItem;
        if (added) {
          const exists = state.watchlist.some(
            (item) =>
              (item._id || item.id || item) === (added._id || added.id || added)
          );
          if (!exists) {
            state.watchlist.push(added);
          }
        }
      })
      // removeFromWatchlist
      .addCase(removeFromWatchlist.fulfilled, (state, action) => {
        const stockId = action.payload;
        state.watchlist = state.watchlist.filter((item) => {
          const id = item._id || item.id || (item.stock && (item.stock._id || item.stock.id)) || item;
          return id !== stockId;
        });
      });
  },
});

export const { clearWatchlistError } = watchlistSlice.actions;
export default watchlistSlice.reducer;
