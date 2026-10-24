import api from './api';

const portfolioService = {
  getPortfolio: async () => {
    const response = await api.get('/portfolio');
    return response.data;
  },

  getPortfolioSummary: async () => {
    const response = await api.get('/portfolio/summary');
    return response.data;
  },
};

export default portfolioService;
