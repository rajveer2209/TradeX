import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import stockReducer from './slices/stockSlice';
import portfolioReducer from './slices/portfolioSlice';
import transactionReducer from './slices/transactionSlice';
import watchlistReducer from './slices/watchlistSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    stocks: stockReducer,
    portfolio: portfolioReducer,
    transactions: transactionReducer,
    watchlist: watchlistReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
