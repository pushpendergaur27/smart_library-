import api from './api';

export const notificationService = {
  getNotifications: async () => {
    const response = await api.get('/student/notifications');
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await api.put(`/student/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/student/notifications/read-all');
    return response.data;
  },
};
