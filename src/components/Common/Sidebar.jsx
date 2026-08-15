import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  FaHome, FaBook, FaClipboardList, FaChartBar, 
  FaUsers, FaCog, FaQuestionCircle, FaPlus, FaChild 
} from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, isTeacher, isParent } = useAuth();
  const { t } = useLanguage();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: FaHome },
    { path: '/lessons', label: t('nav.lessons'), icon: FaBook },
    {
      path: isTeacher() ? '/teacher/exams' : '/evaluations',
      label: t('nav.evaluations'),
      icon: FaClipboardList,
    },
  ];

  if (isParent()) {
    navItems.push({ path: '/parent', label: t('nav.children'), icon: FaChild });
  }

  if (isTeacher() || isAdmin()) {
    navItems.push({ path: '/reports', label: t('nav.reports'), icon: FaChartBar });
  }

  if (isAdmin()) {
    navItems.push({ path: '/admin/users', label: t('nav.users'), icon: FaUsers });
    navItems.push({ path: '/admin/config', label: t('nav.config'), icon: FaCog });
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[var(--surface-container)] flex flex-col z-40 hidden md:flex border-r border-[var(--outline-variant)]/20">
      <div className="px-6 py-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center text-white">
          <span className="text-2xl font-bold">∑</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--primary)]">SIM</h1>
          <p className="text-[10px] uppercase tracking-widest text-[var(--on-surface-variant)]">
            {user?.role?.name ? t(`topbar.role.${user.role.name}`) : t('nav.dashboard')}
          </p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1" aria-label={t('nav.sidebar') || 'Menú de navegación'}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            aria-label={item.label}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive(item.path)
                ? 'bg-[var(--primary)] text-white font-bold shadow-lg'
                : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)]'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      {isTeacher() && !isAdmin() && (
        <div className="px-4 pb-4">
          <button
            onClick={() => navigate('/teacher/lessons/create')}
            className="w-full py-3 bg-[var(--primary)] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--primary)]/20"
          >
            <FaPlus />
            <span>{t('nav.newLesson')}</span>
          </button>
        </div>
      )}

      <div className="px-4 pb-6 border-t border-[var(--outline-variant)]/20 pt-4 space-y-1">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] rounded-xl transition-all"
        >
          <FaCog className="w-5 h-5" />
          <span className="text-sm">{t('nav.settings')}</span>
        </Link>
        <Link
          to="/help"
          className="flex items-center gap-3 px-4 py-3 text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] rounded-xl transition-all"
        >
          <FaQuestionCircle className="w-5 h-5" />
          <span className="text-sm">{t('nav.help')}</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
