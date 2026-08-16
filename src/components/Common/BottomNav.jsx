import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { FaHome, FaBook, FaClipboardList, FaUser, FaUsers, FaChartBar, FaChild, FaFileAlt, FaTrophy, FaClipboardCheck, FaFlask } from 'react-icons/fa';

const BottomNav = () => {
  const location = useLocation();
  const { isAdmin, isTeacher, isParent } = useAuth();
  const { t } = useLanguage();

  const isActive = (path) => location.pathname.startsWith(path);

  const dashboardPath = isAdmin()
    ? '/admin/dashboard'
    : isTeacher()
      ? '/teacher/dashboard'
      : isParent()
        ? '/parent'
        : '/dashboard';

  const baseItems = [
    { path: dashboardPath, label: t('nav.dashboard'), icon: FaHome, alwaysShow: true },
    { path: '/lessons', label: t('nav.lessons'), icon: FaBook, alwaysShow: true },
    { path: '/evaluations', label: t('nav.evaluations'), icon: FaClipboardList, alwaysShow: true },
    { path: '/my-work', label: t('workBoard.title'), icon: FaClipboardList, studentOnly: true },
    { path: '/ranking', label: t('ranking.title'), icon: FaTrophy, studentOnly: true },
    { path: '/gamification', label: t('nav.gamification'), icon: FaTrophy, studentOnly: true },
    { path: '/simulations', label: t('nav.simulations'), icon: FaFlask, studentOnly: true },
    { path: '/exams', label: t('exam.title'), icon: FaFileAlt, studentOnly: true },
    { path: '/teacher/works', label: t('teacherWorkBoard.title'), icon: FaClipboardCheck, teacherOnly: true },
    { path: '/teacher/ranking', label: t('ranking.title'), icon: FaTrophy, teacherOnly: true },
    { path: '/admin/works', label: t('workBoard.title'), icon: FaClipboardList, adminOnly: true },
    { path: '/parent', label: t('nav.children'), icon: FaChild, parentOnly: true },
    { path: '/admin', label: t('nav.users'), icon: FaUsers, adminOnly: true },
    { path: '/reports', label: t('nav.reports'), icon: FaChartBar, teacherOnly: true },
    { path: '/teacher/exams', label: t('exam.title'), icon: FaFileAlt, teacherOnly: true },
    { path: '/profile', label: t('topbar.profile'), icon: FaUser, alwaysShow: true },
  ];

  const navItems = baseItems.filter(item => {
    if (item.alwaysShow) return true;
    if (item.studentOnly) return !isAdmin() && !isTeacher() && !isParent();
    if (item.parentOnly) return isParent();
    if (item.adminOnly) return isAdmin();
    if (item.teacherOnly) return isTeacher();
    return false;
  }).slice(0, 5);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--surface)] shadow-[0px_-4px_20px_rgba(0,0,0,0.05)] flex justify-around items-center py-3 z-50 border-t border-[var(--outline-variant)]/20" role="navigation" aria-label={t('nav.bottomNav') || 'Navegación principal'}>
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex flex-col items-center gap-1 ${
            isActive(item.path)
              ? 'text-[var(--primary)]'
              : 'text-[var(--on-surface-variant)]'
          }`}
        >
          <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-bold">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default BottomNav;
