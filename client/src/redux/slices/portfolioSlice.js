import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import portfolioService from '../../services/portfolioService';

const initialState = {
  portfolio: null,
  summary: null,
  loading: false,
  error: null,
};

export const getPortfolio = createAsyncThunk(
  'portfolio/getPortfolio',
  async (_, { rejectWithValue }) => {
    try {
      const data = await portfolioService.getPortfolio();
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to load portfolio';
      return rejectWithValue(message);
    }
  }
);

export const getPortfolioSummary = createAsyncThunk(
  'portfolio/getPortfolioSummary',
  async (_, { rejectWithValue }) => {
    try {
      const data = await portfolioService.getPortfolioSummary();
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to load portfolio summary';
      return rejectWithValue(message);
    }
  }
);

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    clearPortfolioError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getPortfolio
      .addCase(getPortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPortfolio.fulfilled, (state, action) => {
        state.loading = false;
        const resData = action.payload?.data || action.payload;
        state.portfolio = resData?.portfolio || resData;
      })
      .addCase(getPortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // getPortfolioSummary
      .addCase(getPortfolioSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPortfolioSummary.fulfilled, (state, action) => {
        state.loading = false;
        const resData = action.payload?.data || action.payload;
        const raw = resData?.summary || resData;
        state.summary = {
          totalValue: raw?.portfolioValue ?? raw?.currentValue ?? raw?.totalValue ?? 0,
          totalInvested: raw?.totalInvested ?? 0,
          totalPnL: raw?.totalProfitLoss ?? raw?.totalPnL ?? 0,
          totalPnLPercent: raw?.totalProfitLossPercent ?? raw?.pnlPercent ?? 0,
          holdings: raw?.topHoldings || raw?.holdings || [],
          ...raw,
        };
      })
      .addCase(getPortfolioSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPortfolioError } = portfolioSlice.actions;
export default portfolioSlice.reducer;
