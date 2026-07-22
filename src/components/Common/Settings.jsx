import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FaBell, FaUser, FaGlobe, FaSignOutAlt, FaInfoCircle } from 'react-icons/fa';

const STORAGE_KEY = 'mathflow_preferences';

const defaultPreferences = {
  email_notifications: true,
  reminder_notifications: true,
};

const Settings = () => {
  const { user, logout } = useAuth();
  const [preferences, setPreferences] = useState(defaultPreferences);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setPreferences({ ...defaultPreferences, ...JSON.parse(saved) });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }, []);

  const updatePreference = (key, value) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      toast.success('Preferencia guardada');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Error al guardar la preferencia');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-[var(--on-surface)]">Ajustes</h2>
        <p className="text-[var(--on-surface-variant)]">
          Configura tus preferencias en la plataforma
        </p>
      </div>

      {/* Notificaciones */}
      <div className="bg-[var(--surface)] rounded-2xl p-8 shadow-sm border border-[var(--surface-container)]">
        <h3 className="text-lg font-bold text-[var(--on-surface)] mb-6 flex items-center gap-2">
          <FaBell className="text-[var(--primary)]" />
          Notificaciones
        </h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-[var(--on-surface)]">Notificaciones por correo</p>
              <p className="text-sm text-[var(--on-surface-variant)]">
                Recibe un resumen de tu actividad y novedades por email
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.email_notifications}
              onChange={(e) => updatePreference('email_notifications', e.target.checked)}
              className="w-5 h-5 accent-[var(--primary)]"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-[var(--on-surface)]">Recordatorios de estudio</p>
              <p className="text-sm text-[var(--on-surface-variant)]">
                Recibe recordatorios para continuar tus lecciones pendientes
              </p>
            </div>
            <input
              type="checkbox"
              checked={preferences.reminder_notifications}
              onChange={(e) => updatePreference('reminder_notifications', e.target.checked)}
              className="w-5 h-5 accent-[var(--primary)]"
            />
          </label>
        </div>
      </div>

      {/* Idioma */}
      <div className="bg-[var(--surface)] rounded-2xl p-8 shadow-sm border border-[var(--surface-container)]">
        <h3 className="text-lg font-bold text-[var(--on-surface)] mb-6 flex items-center gap-2">
          <FaGlobe className="text-[var(--primary)]" />
          Idioma
        </h3>
        <select
          disabled
          className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] bg-[var(--surface-container-low)] text-[var(--on-surface-variant)]"
        >
          <option>Español</option>
        </select>
        <p className="text-xs text-[var(--on-surface-variant)] mt-2">
          Por ahora la plataforma solo está disponible en español
        </p>
      </div>

      {/* Cuenta */}
      <div className="bg-[var(--surface)] rounded-2xl p-8 shadow-sm border border-[var(--surface-container)]">
        <h3 className="text-lg font-bold text-[var(--on-surface)] mb-6 flex items-center gap-2">
          <FaUser className="text-[var(--primary)]" />
          Cuenta
        </h3>
        <div className="flex flex-col md:flex-row gap-3">
          <Link
            to="/profile"
            className="px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all text-center"
          >
            Editar perfil y contraseña
          </Link>
          <button
            onClick={logout}
            className="px-6 py-3 bg-[var(--error)]/10 text-[var(--error)] font-bold rounded-xl hover:bg-[var(--error)]/20 transition-all flex items-center justify-center gap-2"
          >
            <FaSignOutAlt />
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)] justify-center">
        <FaInfoCircle />
        <span>Conectado como {user?.email}</span>
      </div>
    </div>
  );
};

export default Settings;