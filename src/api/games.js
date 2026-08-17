import api from './axios';

export const gamesApi = {
  // Listado por rol
  getGames: (params = {}) => api.get('/games', { params }),
  getGame: (id) => api.get(`/games/${id}`),

  // CRUD (docente)
  createGame: (data) => api.post('/games', data),
  updateGame: (id, data) => api.put(`/games/${id}`, data),
  deleteGame: (id) => api.delete(`/games/${id}`),

  // Cursos del docente (para asignar juegos)
  getTeacherCourses: () => api.get('/games/teacher-courses'),

  // Comprobante (estudiante)
  uploadScreenshot: (gameId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/games/${gameId}/screenshot`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  submitGame: (gameId, data) => api.post(`/games/${gameId}/submit`, data),

  // Calificación (docente)
  gradeSubmission: (submissionId, data) =>
    api.post(`/games/submissions/${submissionId}/grade`, data),
};