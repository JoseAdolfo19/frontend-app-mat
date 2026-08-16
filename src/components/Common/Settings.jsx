import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { FaBell, FaUser, FaGlobe, FaSignOutAlt, FaInfoCircle, FaPalette } from 'react-icons/fa';
import PushSettings from './PushSettings';

const STORAGE_KEY = 'sim_preferences';

const defaultPreferences = {
  email_notifications: true,
  reminder_notifications: true,
};

const LANGUAGES = [
  { code: 'es', name: 'Español', native: 'Español' },
  { code: 'en', name: 'English', native: 'English' },
  { code: 'qu', name: 'Quechua', native: 'Runasimi' },
];

const THEMES = [
  { id: 'light', icon: '☀️', label: 'Claro' },
  { id: 'dark', icon: '🌙', label: 'Oscuro' },
  { id: 'grayscale', icon: '🩶', label: 'Escala de Grises' },
];

const Settings = () => {
  const { user, logout } = useAuth();
  const { lang, changeLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [preferences, setPreferences] = useState(defaultPreferences);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setPreferences({ ...defaultPreferences, ...JSON.parse(saved) });
      }
    } catch {
      toast.error(t('settings.loadError'));
    }
  }, []);

  const updatePreference = (key, value) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      toast.success(t('settings.saved'));
    } catch (error) {
      toast.error(t('settings.saveError'));
    }
  };

  const handleLanguageChange = (code) => {
    changeLanguage(code);
    toast.success(t('settings.saved'));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-[var(--on-surface)]">{t('settings.title')}</h2>
        <p className="text-[var(--on-surface-variant)]">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* Notificaciones */}
      <div className="bg-[var(--surface)] rounded-2xl p-8 shadow-sm border border-[var(--surface-container)]">
        <h3 className="text-lg font-bold text-[var(--on-surface)] mb-6 flex items-center gap-2">
          <FaBell className="text-[var(--primary)]" />
          {t('settings.notifications')}
        </h3>
        <div className="space-y-4">
          <label htmlFor="pref-email-notifications" className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-[var(--on-surface)]">{t('settings.emailNotifications')}</p>
              <p className="text-sm text-[var(--on-surface-variant)]">
                {t('settings.emailNotificationsDesc')}
              </p>
            </div>
            <input
              id="pref-email-notifications"
              type="checkbox"
              checked={preferences.email_notifications}
              onChange={(e) => updatePreference('email_notifications', e.target.checked)}
              className="w-5 h-5 accent-[var(--primary)]"
            />
          </label>
          <label htmlFor="pref-reminders" className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-[var(--on-surface)]">{t('settings.reminders')}</p>
              <p className="text-sm text-[var(--on-surface-variant)]">
                {t('settings.remindersDesc')}
              </p>
            </div>
            <input
              id="pref-reminders"
              type="checkbox"
              checked={preferences.reminder_notifications}
              onChange={(e) => updatePreference('reminder_notifications', e.target.checked)}
              className="w-5 h-5 accent-[var(--primary)]"
            />
          </label>
        </div>
      </div>

      {/* Notificaciones push */}
      <div className="bg-[var(--surface)] rounded-2xl p-8 shadow-sm border border-[var(--surface-container)]">
        <h3 className="text-lg font-bold text-[var(--on-surface)] mb-6 flex items-center gap-2">
          <FaBell className="text-[var(--primary)]" />
          {t('settings.push.title')}
        </h3>
        <PushSettings />
      </div>

      {/* Idioma */}
      <div className="bg-[var(--surface)] rounded-2xl p-8 shadow-sm border border-[var(--surface-container)]">
        <h3 className="text-lg font-bold text-[var(--on-surface)] mb-6 flex items-center gap-2">
          <FaGlobe className="text-[var(--primary)]" />
          {t('settings.language')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => handleLanguageChange(l.code)}
              aria-label={`Cambiar idioma a ${l.native}`}
              aria-pressed={lang === l.code}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                lang === l.code
                  ? 'border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)] font-bold'
                  : 'border-[var(--surface-container-high)] bg-[var(--surface-container-low)] text-[var(--on-surface)] hover:border-[var(--primary)]/40'
              }`}
            >
              <span className="text-lg">
                {l.code === 'es' ? '🇪🇸' : l.code === 'en' ? '🇬🇧' : '🇵🇪'}
              </span>
              <div className="text-left">
                <p className="text-sm font-medium">{l.native}</p>
                <p className="text-xs text-[var(--on-surface-variant)]">
                  {l.name === l.native ? '' : l.name}
                </p>
              </div>
              {lang === l.code && (
                <span className="ml-auto text-[var(--primary)]">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tema */}
      <div className="bg-[var(--surface)] rounded-2xl p-8 shadow-sm border border-[var(--surface-container)]">
        <h3 className="text-lg font-bold text-[var(--on-surface)] mb-6 flex items-center gap-2">
          <FaPalette className="text-[var(--primary)]" />
          {t('settings.theme') || 'Tema'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {THEMES.map((th) => (
            <button
              key={th.id}
              onClick={() => setTheme(th.id)}
              aria-label={`Cambiar tema a ${th.label}`}
              aria-pressed={theme === th.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                theme === th.id
                  ? 'border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)] font-bold'
                  : 'border-[var(--surface-container-high)] bg-[var(--surface-container-low)] text-[var(--on-surface)] hover:border-[var(--primary)]/40'
              }`}
            >
              <span className="text-lg">{th.icon}</span>
              <div className="text-left">
                <p className="text-sm font-medium">{th.label}</p>
              </div>
              {theme === th.id && (
                <span className="ml-auto text-[var(--primary)]">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Cuenta */}
      <div className="bg-[var(--surface)] rounded-2xl p-8 shadow-sm border border-[var(--surface-container)]">
        <h3 className="text-lg font-bold text-[var(--on-surface)] mb-6 flex items-center gap-2">
          <FaUser className="text-[var(--primary)]" />
          {t('settings.account')}
        </h3>
        <div className="flex flex-col md:flex-row gap-3">
          <Link
            to="/profile"
            className="px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all text-center"
          >
            {t('settings.editProfile')}
          </Link>
          <button
            onClick={logout}
            className="px-6 py-3 bg-[var(--error)]/10 text-[var(--error)] font-bold rounded-xl hover:bg-[var(--error)]/20 transition-all flex items-center justify-center gap-2"
          >
            <FaSignOutAlt />
            {t('settings.logout')}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)] justify-center">
        <FaInfoCircle />
        <span>{t('settings.connectedAs')} {user?.email}</span>
      </div>
    </div>
  );
};

export default Settings;
