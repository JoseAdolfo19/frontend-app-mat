import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import { getTranslation, getSavedLanguage } from '../utils/i18n';
import { canAccess } from '../utils/roles';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const translate = (key) => getTranslation(getSavedLanguage(), key);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('access_token'));

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/user/profile');
      setUser(response.data.user);
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { access_token, user: userData } = response.data;

      localStorage.setItem('access_token', access_token);
      setToken(access_token);
      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || translate('auth.login.error')
      };
    }
  };

  const loginWithGoogle = async (googleToken) => {
    try {
      const response = await axios.post('/auth/google/login', {
        access_token: googleToken
      });
      const { access_token, user: userData } = response.data;

      localStorage.setItem('access_token', access_token);
      setToken(access_token);
      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || translate('auth.login.googleError')
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);
      const { access_token, user: newUser } = response.data;

      localStorage.setItem('access_token', access_token);
      setToken(access_token);
      setUser(newUser);

      return { success: true, user: newUser };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || translate('auth.register.error')
      };
    }
  };

  const logout = useCallback(async () => {
    try {
      await axios.post('/user/logout');
    } catch {
      // Token might already be invalid
    }

    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  }, []);

  const hasRole = (roles) => canAccess(user?.role?.name, roles);

  const isAdmin = () => hasRole(['admin']);
  const isTeacher = () => hasRole(['teacher', 'admin']);
  const isStudent = () => hasRole(['student']);
  const isParent = () => hasRole(['parent']);
  const isDirector = () => hasRole(['director']);
  const isCoordinator = () => hasRole(['coordinador']);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      token,
      login,
      loginWithGoogle,
      register,
      logout,
      hasRole,
      isAdmin,
      isTeacher,
      isStudent,
      isParent,
      isDirector,
      isCoordinator
    }}>
      {children}
    </AuthContext.Provider>
  );
};
