import api from './api';

export const reservationService = {
  reserveBook: async (bookId) => {
    const response = await api.post('/student/reservations', { bookId });
    return response.data;
  },

  getMyReservations: async () => {
    const response = await api.get('/student/reservations');
    return response.data;
  },

  cancelReservation: async (reservationId) => {
    const response = await api.delete(`/student/reservations/${reservationId}`);
    return response.data;
  },

  getAllReservations: async () => {
    const response = await api.get('/librarian/reservations');
    return response.data;
  },

  processReservation: async (reservationId) => {
    const response = await api.put(`/librarian/reservations/${reservationId}/process`);
    return response.data;
  },
};
