import api from './axios';

export const usersApi = {
  // ===== PERFIL =====
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  changePassword: (data) => api.put('/user/change-password', data),
  
  // ===== PROGRESO =====
  getMyStats: () => api.get('/progress/my-stats'),
  getBadges: () => api.get('/progress/badges'),
  
  // ===== NOTIFICACIONES =====
  getNotifications: (params = {}) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  deleteReadNotifications: () => api.delete('/notifications/read/delete'),
};