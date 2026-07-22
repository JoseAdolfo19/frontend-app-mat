import api from './axios';

export const reportsApi = {
  // Reporte de rendimiento (para gráfico)
  getPerformanceReport: (params) => api.get('/reports/performance', { params }),

  // Reporte de calificaciones (para tabla)
  getGradesReport: (params) => api.get('/reports/grades', { params }),

  // Reporte individual de un estudiante
  getStudentReport: (userId) => api.get(`/reports/student/${userId}`),

  // Exportar a PDF (devuelve el archivo binario)
  exportPDF: (params) => api.get('/reports/export/pdf', {
    params,
    responseType: 'blob',
  }),

  // Exportar a Excel (devuelve el archivo binario)
  exportExcel: (params) => api.get('/reports/export/excel', {
    params,
    responseType: 'blob',
  }),
};