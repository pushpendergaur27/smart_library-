import api from './api';

export const externalBookService = {
  search: async (q, limit = 10) => {
    const response = await api.get('/external-books/search', { params: { q, limit } });
    return response.data;
  },
};
