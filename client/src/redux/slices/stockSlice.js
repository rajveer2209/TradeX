import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import stockService from '../../services/stockService';

const initialState = {
  stocks: [],
  currentStock: null,
  loading: false,
  error: null,
  simulateLoading: false,
};

export const getStocks = createAsyncThunk(
  'stocks/getStocks',
  async (params, { rejectWithValue }) => {
    try {
      const data = await stockService.getStocks(params);
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to fetch stocks';
      return rejectWithValue(message);
    }
  }
);

export const getStockById = createAsyncThunk(
  'stocks/getStockById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await stockService.getStockById(id);
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to fetch stock details';
      return rejectWithValue(message);
    }
  }
);

export const createStock = createAsyncThunk(
  'stocks/createStock',
  async (stockData, { rejectWithValue }) => {
    try {
      const data = await stockService.createStock(stockData);
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to create stock';
      return rejectWithValue(message);
    }
  }
);

export const updateStock = createAsyncThunk(
  'stocks/updateStock',
  async ({ id, stockData }, { rejectWithValue }) => {
    try {
      const data = await stockService.updateStock(id, stockData);
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to update stock';
      return rejectWithValue(message);
    }
  }
);

export const deleteStock = createAsyncThunk(
  'stocks/deleteStock',
  async (id, { rejectWithValue }) => {
    try {
      await stockService.deleteStock(id);
      return id;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to delete stock';
      return rejectWithValue(message);
    }
  }
);

export const simulateMarketUpdate = createAsyncThunk(
  'stocks/simulateMarketUpdate',
  async (_, { rejectWithValue }) => {
    try {
      const data = await stockService.simulateUpdate();
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to simulate market update';
      return rejectWithValue(message);
    }
  }
);

const stockSlice = createSlice({
  name: 'stocks',
  initialState,
  reducers: {
    clearCurrentStock: (state) => {
      state.currentStock = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getStocks
      .addCase(getStocks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStocks.fulfilled, (state, action) => {
        state.loading = false;
        const resData = action.payload?.data || action.payload;
        state.stocks = resData?.stocks || (Array.isArray(resData) ? resData : []);
      })
      .addCase(getStocks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // getStockById
      .addCase(getStockById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStockById.fulfilled, (state, action) => {
        state.loading = false;
        const resData = action.payload?.data || action.payload;
        state.currentStock = resData?.stock || resData;
      })
      .addCase(getStockById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createStock
      .addCase(createStock.fulfilled, (state, action) => {
        const resData = action.payload?.data || action.payload;
        const newStock = resData?.stock || resData;
        if (newStock) {
          state.stocks.unshift(newStock);
        }
      })
      // updateStock
      .addCase(updateStock.fulfilled, (state, action) => {
        const updated = action.payload.stock || action.payload;
        if (updated) {
          const index = state.stocks.findIndex(
            (s) => (s._id || s.id) === (updated._id || updated.id)
          );
          if (index !== -1) {
            state.stocks[index] = updated;
          }
          if (
            state.currentStock &&
            (state.currentStock._id || state.currentStock.id) ===
              (updated._id || updated.id)
          ) {
            state.currentStock = updated;
          }
        }
      })
      // deleteStock
      .addCase(deleteStock.fulfilled, (state, action) => {
        const id = action.payload;
        state.stocks = state.stocks.filter((s) => (s._id || s.id) !== id);
        if (
          state.currentStock &&
          (state.currentStock._id || state.currentStock.id) === id
        ) {
          state.currentStock = null;
        }
      })
      // simulateMarketUpdate
      .addCase(simulateMarketUpdate.pending, (state) => {
        state.simulateLoading = true;
      })
      .addCase(simulateMarketUpdate.fulfilled, (state, action) => {
        state.simulateLoading = false;
        if (action.payload.stocks) {
          state.stocks = action.payload.stocks;
        }
      })
      .addCase(simulateMarketUpdate.rejected, (state, action) => {
        state.simulateLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentStock, clearError } = stockSlice.actions;
export default stockSlice.reducer;
