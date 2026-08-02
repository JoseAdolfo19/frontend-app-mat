import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loading from './Loading';
import { useLanguage } from '../../contexts/LanguageContext';

const ProtectedRoute = ({ roles = [] }) => {
  const { user, loading, hasRole } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return <Loading />;
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
