// Restricts nested routes to authenticated users with the required roles.
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loading from './Loading';
import { useLanguage } from '../../contexts/LanguageContext';

const ProtectedRoute = ({ roles = [] }) => {
  const { user, loading, hasRole, authError, retryAuth } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return <Loading />;
  }

  // Falló la verificación de la sesión por un problema de red o por límite de
  // peticiones. No es una sesión inválida, así que no se expulsa al usuario:
  // se ofrece reintentar. `authError` es undefined en consumidores antiguos.
  if (!user && authError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] p-6">
        <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--surface-container)] p-10 text-center max-w-md" role="alert">
          <div className="text-5xl mb-4">&#128225;</div>
          <h2 className="text-2xl font-bold text-[var(--on-surface)] mb-2">{t('auth.load.title')}</h2>
          <p className="text-[var(--on-surface-variant)] mb-6">{authError}</p>
          <button
            onClick={() => retryAuth?.()}
            className="px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all"
          >
            {t('auth.load.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !hasRole(roles)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] p-6">
        <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--surface-container)] p-10 text-center max-w-md" role="alert">
          <div className="text-5xl mb-4">&#128274;</div>
          <h2 className="text-2xl font-bold text-[var(--on-surface)] mb-2">{t('errors.unauthorized.title')}</h2>
          <p className="text-[var(--on-surface-variant)] mb-6">
            {t('errors.unauthorized.description')}
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all"
          >
            {t('errors.unauthorized.back')}
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
