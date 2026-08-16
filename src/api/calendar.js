import api from './axios';

export const calendarApi = {
  getEvents: (params = {}) => api.get('/calendar', { params }),
  createEvent: (data) => api.post('/calendar', data),
  updateEvent: (id, data) => api.put(`/calendar/${id}`, data),
  deleteEvent: (id) => api.delete(`/calendar/${id}`),
};