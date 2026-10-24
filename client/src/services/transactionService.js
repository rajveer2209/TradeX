import api from './api';

const transactionService = {
  buyStock: async (stockId, quantity) => {
    const response = await api.post('/transactions/buy', { stockId, quantity: Number(quantity) });
    return response.data;
  },

  sellStock: async (stockId, quantity) => {
    const response = await api.post('/transactions/sell', { stockId, quantity: Number(quantity) });
    return response.data;
  },

  getTransactions: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.type && params.type !== 'ALL') queryParams.append('type', params.type);

    const queryString = queryParams.toString();
    const url = `/transactions${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  getTransactionStats: async () => {
    const response = await api.get('/transactions/stats');
    return response.data;
  },
};

export default transactionService;
