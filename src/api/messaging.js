import api from './axios';

export const messagingApi = {
  // Conversaciones
  getConversations: () => api.get('/conversations'),
  getConversation: (id) => api.get(`/conversations/${id}`),
  createConversation: (data) => api.post('/conversations', data),
  reply: (id, body) => api.post(`/conversations/${id}/reply`, { body }),

  // Foro
  getThreads: () => api.get('/forum'),
  getThread: (id) => api.get(`/forum/${id}`),
  createThread: (data) => api.post('/forum', data),
  postInThread: (id, body) => api.post(`/forum/${id}/post`, { body }),
  closeThread: (id) => api.post(`/forum/${id}/close`),
};