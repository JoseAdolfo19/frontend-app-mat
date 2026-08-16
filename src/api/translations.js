import api from './axios';

export const translationsApi = {
  getOverrides: (locale) => api.get('/translations/overrides', { params: { locale } }),
  getAdmin: (params = {}) => api.get('/admin/translations', { params }),
  create: (data) => api.post('/admin/translations', data),
  bulkUpdate: (items, group = 'frontend') => api.post('/admin/translations/bulk', { items, group }),
  remove: (id) => api.delete(`/admin/translations/${id}`),
};