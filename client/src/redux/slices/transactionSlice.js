import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import transactionService from '../../services/transactionService';

const initialState = {
  transactions: [],
  stats: null,
  loading: false,
  tradingLoading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
  totalTransactions: 0,
};

export const buyStock = createAsyncThunk(
  'transactions/buyStock',
  async ({ stockId, quantity }, { rejectWithValue }) => {
    try {
      const data = await transactionService.buyStock(stockId, quantity);
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Buy order failed';
      return rejectWithValue(message);
    }
  }
);

export const sellStock = createAsyncThunk(
  'transactions/sellStock',
  async ({ stockId, quantity }, { rejectWithValue }) => {
    try {
      const data = await transactionService.sellStock(stockId, quantity);
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Sell order failed';
      return rejectWithValue(message);
    }
  }
);

export const getTransactions = createAsyncThunk(
  'transactions/getTransactions',
  async (params, { rejectWithValue }) => {
    try {
      const data = await transactionService.getTransactions(params);
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch transactions';
      return rejectWithValue(message);
    }
  }
);

export const getTransactionStats = createAsyncThunk(
  'transactions/getTransactionStats',
  async (_, { rejectWithValue }) => {
    try {
      const data = await transactionService.getTransactionStats();
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch transaction stats';
      return rejectWithValue(message);
    }
  }
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearTransactionError: (state) => {
      state.error = null;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Buy
      .addCase(buyStock.pending, (state) => {
        state.tradingLoading = true;
        state.error = null;
      })
      .addCase(buyStock.fulfilled, (state, action) => {
        state.tradingLoading = false;
        const newTx = action.payload.transaction || action.payload;
        if (newTx && newTx._id) {
          state.transactions.unshift(newTx);
        }
      })
      .addCase(buyStock.rejected, (state, action) => {
        state.tradingLoading = false;
        state.error = action.payload;
      })
      // Sell
      .addCase(sellStock.pending, (state) => {
        state.tradingLoading = true;
        state.error = null;
      })
      .addCase(sellStock.fulfilled, (state, action) => {
        state.tradingLoading = false;
        const newTx = action.payload.transaction || action.payload;
        if (newTx && newTx._id) {
          state.transactions.unshift(newTx);
        }
      })
      .addCase(sellStock.rejected, (state, action) => {
        state.tradingLoading = false;
        state.error = action.payload;
      })
      // getTransactions
      .addCase(getTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransactions.fulfilled, (state, action) => {
        state.loading = false;
        const resData = action.payload?.data || action.payload;
        state.transactions =
          resData?.transactions ||
          (Array.isArray(resData) ? resData : []);
        state.totalPages =
          resData?.pagination?.pages ||
          action.payload.totalPages ||
          1;
        state.currentPage =
          resData?.pagination?.page ||
          action.payload.currentPage ||
          1;
        state.totalTransactions =
          resData?.pagination?.total ||
          action.payload.totalTransactions ||
          state.transactions.length;
      })
      .addCase(getTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // getTransactionStats
      .addCase(getTransactionStats.fulfilled, (state, action) => {
        const resData = action.payload?.data || action.payload;
        state.stats = {
          totalTrades: resData?.totalTransactions || resData?.totalTrades || 0,
          buyTrades: resData?.buyTransactions || resData?.buyTrades || 0,
          sellTrades: resData?.sellTransactions || resData?.sellTrades || 0,
          ...resData,
        };
      });
  },
});

export const { clearTransactionError, setCurrentPage } = transactionSlice.actions;
export default transactionSlice.reducer;
