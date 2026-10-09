// Provides authentication state, session recovery, sign-in, and role checks.
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from '../api/axios';
import { getTranslation, getSavedLanguage } from '../utils/i18n';
import { canAccess } from '../utils/roles';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const translate = (key) => getTranslation(getSavedLanguage(), key);

const getAuthErrorMessage = (error, fallbackKey) => {
  const message = error?.response?.data?.message;
  if (typeof message === 'string' && message.trim() && !/^auth\.[\w.-]+$/.test(message.trim())) {
    return message;
  }
  return translate(fallbackKey);
};

/** Errores que no invalidan la sesión y conviene reintentar. */
const isTransient = (error) => {
  const status = error?.response?.status;
  if (!status) return true; // sin respuesta: red caída o servidor inaccesible
  return status === 429 || status >= 500;
};

const MAX_RETRIES = 3;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Espera indicada por el servidor en un 429, acotada para no esperar de más. */
const backoffDelay = (error, attempt) => {
  const retryAfter = Number(error?.response?.headers?.['retry-after']);
  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    return Math.min(retryAfter * 1000, 10000);
  }
  return Math.min(1000 * 2 ** attempt, 8000);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('access_token'));
  const mountedRef = useRef(true);

  // El setup debe volver a poner `true`: en React 18 el efecto se monta,
  // desmonta y vuelve a montarse, y si el cleanup dejaba el ref en `false`
  // para siempre, todas las actualizaciones posteriores se ignoraban.
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    // `loading` se mantiene en true durante TODOS los reintentos. Antes se
    // liberaba en un `finally` que se ejecutaba en cuanto se encadenaba el
    // reintento, y ProtectedRoute veía `user === null` sin `authError` y
    // expulsaba al usuario al login. El bucle evita esa condición de carrera.
    setLoading(true);

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await axios.get('/user/profile');
        if (!mountedRef.current) return;
        setUser(response.data.user);
        setAuthError(null);
        setLoading(false);
        return;
      } catch (error) {
        if (!mountedRef.current) return;

        const status = error?.response?.status;

        // Solo un 401/403 real significa sesión inválida.
        if (status === 401 || status === 403) {
          setLoading(false);
          logout();
          return;
        }

        const canRetry = isTransient(error) && attempt < MAX_RETRIES;

        if (!canRetry) {
          // Se agotaron los reintentos: se informa del problema de conexión
          // en lugar de expulsar al usuario.
          setAuthError(
            status === 429
              ? translate('auth.load.rateLimited')
              : translate('auth.load.unavailable')
          );
          setLoading(false);
          return;
        }

        await wait(backoffDelay(error, attempt));
        if (!mountedRef.current) return;
      }
    }

    setLoading(false);
  };

  const retryAuth = useCallback(() => {
    setAuthError(null);
    setLoading(true);
    fetchUser();
  }, []);

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
        error: getAuthErrorMessage(error, 'auth.login.error')
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
        error: getAuthErrorMessage(error, 'auth.login.googleError')
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
        error: getAuthErrorMessage(error, 'auth.register.error')
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
    setAuthError(null);
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
      authError,
      retryAuth,
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
