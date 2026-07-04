import api from './axios';

export const adminApi = {
  // ===== DASHBOARD =====
  getDashboard: () => api.get('/admin/dashboard'),
  
  // ===== USUARIOS =====
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  activateUser: (id) => api.post(`/admin/users/${id}/activate`),
  deactivateUser: (id) => api.post(`/admin/users/${id}/deactivate`),
  importUsers: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/users/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  exportUsers: (format = 'csv') => api.get(`/admin/users/export?format=${format}`),
  
  // ===== CONFIGURACIÓN =====
  getConfig: () => api.get('/admin/config'),
  updateConfig: (data) => api.put('/admin/config', data),
  
  // ===== PERÍODOS ACADÉMICOS =====
  getPeriods: () => api.get('/admin/periods'),
  createPeriod: (data) => api.post('/admin/periods', data),
  updatePeriod: (id, data) => api.put(`/admin/periods/${id}`, data),
  deletePeriod: (id) => api.delete(`/admin/periods/${id}`),
  
  // ===== BACKUP =====
  createBackup: () => api.post('/admin/backup'),
  getLastBackup: () => api.get('/admin/backup/last'),
  downloadBackup: (filename) => api.get(`/admin/backup/download/${filename}`, {
    responseType: 'blob'
  }),
};