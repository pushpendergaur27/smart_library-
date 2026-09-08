import api from './api';

export const librarianService = {
  getDashboard: async () => {
    const response = await api.get('/librarian/dashboard');
    return response.data;
  },

  getStudents: async () => {
    const response = await api.get('/librarian/students');
    return response.data;
  },

  getReports: async (params = {}) => {
    const response = await api.get('/librarian/reports', { params });
    return response.data;
  },

  getCopies: async (bookId) => {
    const params = bookId ? { bookId } : {};
    const response = await api.get('/librarian/copies', { params });
    return response.data;
  },

  createCopy: async (copyData) => {
    const response = await api.post('/librarian/copies', copyData);
    return response.data;
  },

  updateCopy: async (id, copyData) => {
    const response = await api.put(`/librarian/copies/${id}`, copyData);
    return response.data;
  },

  updateCopyStatus: async (id, status) => {
    const response = await api.patch(`/librarian/copies/${id}/status`, { status });
    return response.data;
  },

  updateCopyLocation: async (id, locationData) => {
    const response = await api.put(`/librarian/copies/${id}/location`, locationData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },
};
