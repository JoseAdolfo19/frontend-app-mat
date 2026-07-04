import api from './axios';

export const lessonsApi = {
  // ===== LECCIONES =====
  getLessons: (params = {}) => api.get('/lessons', { params }),
  getLesson: (id) => api.get(`/lessons/${id}`),
  createLesson: (data) => api.post('/lessons', data),
  updateLesson: (id, data) => api.put(`/lessons/${id}`, data),
  deleteLesson: (id) => api.delete(`/lessons/${id}`),
  publishLesson: (id) => api.post(`/lessons/${id}/publish`),
  unpublishLesson: (id) => api.post(`/lessons/${id}/unpublish`),
  duplicateLesson: (id) => api.post(`/lessons/${id}/duplicate`),
  getLessonsByUnit: (unit) => api.get(`/lessons/unit/${unit}`),
  getLessonStats: (id) => api.get(`/lessons/${id}/stats`),
  
  // ===== RECURSOS =====
  getResources: (id) => api.get(`/lessons/${id}/resources`),
  addResource: (id, data) => api.post(`/lessons/${id}/resources`, data),
  removeResource: (id, resourceId) => api.delete(`/lessons/${id}/resources/${resourceId}`),
  
  // ===== PROGRESO =====
  getProgress: (lessonId) => api.get(`/lessons/${lessonId}/progress`),
  updateProgress: (lessonId, data) => api.post(`/lessons/${lessonId}/progress`, data),
};