import api from './axios';

export const salonesApi = {
  // Salones
  getSalones: () => api.get('/salones'),
  getSalon: (id) => api.get(`/salones/${id}`),
  createSalon: (data) => api.post('/salones', data),
  updateSalon: (id, data) => api.put(`/salones/${id}`, data),
  deleteSalon: (id) => api.delete(`/salones/${id}`),

  // Cursos por salón
  getSalonCourses: (salonId) => api.get(`/salones/${salonId}/courses`),
  createCourse: (salonId, data) => api.post(`/salones/${salonId}/courses`, data),
  updateCourse: (courseId, data) => api.put(`/courses/${courseId}`, data),
  deleteCourse: (courseId) => api.delete(`/courses/${courseId}`),

  // Lecciones por curso
  getCourseLessons: (courseId) => api.get(`/courses/${courseId}/lessons`),
  createLesson: (courseId, data) => api.post(`/courses/${courseId}/lessons`, data),

  // Matrícula
  enrollStudents: (courseId, studentIds) => api.post(`/courses/${courseId}/enroll`, { student_ids: studentIds }),
  unenrollStudent: (courseId, studentId) => api.post(`/courses/${courseId}/unenroll`, { student_id: studentId }),
  getCourseStudents: (courseId) => api.get(`/courses/${courseId}/students`),

  // Estudiante
  getStudentCourses: () => api.get('/salones'),
  getStudentCourse: (courseId) => api.get(`/courses/${courseId}`),

  // Catálogos (coordinador/director)
  getTeachers: () => api.get('/catalog/teachers'),
  getStudents: () => api.get('/catalog/students'),
};