import api from './api';

export const borrowService = {
  borrowBook: async (barcode, days, copies) => {
    const response = await api.post('/student/borrow', { barcode, days, copies });
    return response.data;
  },

  getBorrowedBooks: async () => {
    const response = await api.get('/student/borrowed-books');
    return response.data;
  },

  getBorrowHistory: async () => {
    const response = await api.get('/student/borrow-history');
    return response.data;
  },

  returnBook: async (barcode) => {
    const response = await api.post('/librarian/return', { barcode });
    return response.data;
  },
};
