import api from './api';

export const recommendationService = {
  getRecommendations: async () => {
    const response = await api.get('/student/recommendations');
    return response.data;
  },
};
