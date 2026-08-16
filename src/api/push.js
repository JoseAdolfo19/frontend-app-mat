import api from './axios';

export const pushApi = {
  getConfig: () => api.get('/push/config'),
  subscribe: (data) => api.post('/push/subscribe', data),
  unsubscribe: (endpoint) => api.post('/push/unsubscribe', { endpoint }),
  sendTest: (data = {}) => api.post('/push/test', data),
};