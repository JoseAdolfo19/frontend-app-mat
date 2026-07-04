import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaHome, FaBook, FaClipboardList, FaUser } from 'react-icons/fa';

const BottomNav = () => {
  const location = useLocation();
  const { isAdmin, isTeacher } = useAuth();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Inicio', icon: FaHome },
    { path: '/lessons', label: 'Lecciones', icon: FaBook },
    { path: '/evaluations', label: 'Tests', icon: FaClipboardList },
    { path: '/profile', label: 'Perfil', icon: FaUser },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--surface)] shadow-[0px_-4px_20px_rgba(0,0,0,0.05)] flex justify-around items-center py-3 z-50 border-t border-[var(--outline-variant)]/20">
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