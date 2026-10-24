import api from './api';

const stockService = {
  getStocks: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.sector && params.sector !== 'All') queryParams.append('sector', params.sector);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const queryString = queryParams.toString();
    const url = `/stocks${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  getStockById: async (id) => {
    const response = await api.get(`/stocks/${id}`);
    return response.data;
  },

  createStock: async (stockData) => {
    const response = await api.post('/stocks', stockData);
    return response.data;
  },

  updateStock: async (id, stockData) => {
    const response = await api.put(`/stocks/${id}`, stockData);
    return response.data;
  },

  deleteStock: async (id) => {
    const response = await api.delete(`/stocks/${id}`);
    return response.data;
  },

  simulateUpdate: async () => {
    const response = await api.post('/stocks/simulate-update');
    return response.data;
  },
};

export default stockService;
