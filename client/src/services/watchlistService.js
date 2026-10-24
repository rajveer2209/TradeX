import api from './api';

const watchlistService = {
  getWatchlist: async () => {
    const response = await api.get('/watchlist');
    return response.data;
  },

  addToWatchlist: async (stockId) => {
    const response = await api.post('/watchlist/add', { stockId });
    return response.data;
  },

  removeFromWatchlist: async (stockId) => {
    const response = await api.delete(`/watchlist/remove/${stockId}`);
    return response.data;
  },
};

export default watchlistService;
