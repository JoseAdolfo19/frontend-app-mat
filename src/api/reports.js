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

  // Exportar reporte de rendimiento (Promedio por tipo + Mejores estudiantes)
  exportPerformancePDF: (params) => api.get('/reports/export/performance/pdf', {
    params,
    responseType: 'blob',
  }),
  exportPerformanceExcel: (params) => api.get('/reports/export/performance/excel', {
    params,
    responseType: 'blob',
  }),

  // Exportar reporte de calificaciones
  exportGradesPDF: (params) => api.get('/reports/export/grades/pdf', {
    params,
    responseType: 'blob',
  }),
  exportGradesExcel: (params) => api.get('/reports/export/grades/excel', {
    params,
    responseType: 'blob',
  }),

  // Exportar a CSV individual (reporte por estudiante / calificaciones)
  exportStudentCSV: (userId) => api.get(`/reports/export/student/${userId}/csv`, {
    responseType: 'blob',
  }),
  exportGradesCSV: (params) => api.get('/reports/export/grades/csv', {
    params,
    responseType: 'blob',
  }),
};