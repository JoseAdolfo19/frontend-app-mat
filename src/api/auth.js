import api from './axios';

export const authApi = {
  // Registro
  register: (data) => api.post('/auth/register', data),
  
  // Login tradicional
  login: (email, password) => api.post('/auth/login', { email, password }),
  
  // Login con Google
  googleLogin: (accessToken) => api.post('/auth/google/login', { access_token: accessToken }),
  
  // Logout
  logout: () => api.post('/auth/logout'),
  
  // Recuperar contraseña
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  
  // Resetear contraseña
  resetPassword: (data) => api.post('/auth/reset-password', data),
  
  // Obtener perfil
  getProfile: () => api.get('/user/profile'),
  
  // Actualizar perfil
  updateProfile: (data) => api.put('/user/profile', data),
  
  // Cambiar contraseña
  changePassword: (data) => api.put('/user/change-password', data),
  
  // Vincular Google
  connectGoogle: (accessToken) => api.post('/user/connect-google', { access_token: accessToken }),
  
  // Desvincular Google
  disconnectGoogle: () => api.post('/user/disconnect-google'),
};