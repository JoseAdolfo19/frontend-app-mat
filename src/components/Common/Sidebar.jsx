import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaHome, FaBook, FaClipboardList, FaChartBar, 
  FaUsers, FaCog, FaQuestionCircle, FaPlus 
} from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();
  const { user, isAdmin, isTeacher } = useAuth();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FaHome },
    { path: '/lessons', label: 'Lecciones', icon: FaBook },
    { path: '/evaluations', label: 'Evaluaciones', icon: FaClipboardList },
  ];

  // Items para docentes y admin
  if (isTeacher() || isAdmin()) {
    navItems.push({ path: '/reports', label: 'Reportes', icon: FaChartBar });
  }

  // Items solo para admin
  if (isAdmin()) {
    navItems.push({ path: '/admin/users', label: 'Usuarios', icon: FaUsers });
    navItems.push({ path: '/admin/config', label: 'Configuración', icon: FaCog });
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[var(--surface-container)] flex flex-col z-40 hidden md:flex border-r border-[var(--outline-variant)]/20">
      {/* Logo */}
      <div className="px-6 py-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center text-white">
          <span className="text-2xl font-bold">∑</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--primary)]">MathFlow</h1>
          <p className="text-[10px] uppercase tracking-widest text-[var(--on-surface-variant)]">
            {user?.role?.name || 'Plataforma'}
          </p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
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

      {/* Botón Nueva Lección */}
      {(isTeacher() || isAdmin()) && (
        <div className="px-4 pb-4">
          <button className="w-full py-3 bg-[var(--primary)] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[var(--primary)]/20">
            <FaPlus />
            <span>Nueva Lección</span>
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 pb-6 border-t border-[var(--outline-variant)]/20 pt-4 space-y-1">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] rounded-xl transition-all"
        >
          <FaCog className="w-5 h-5" />
          <span className="text-sm">Ajustes</span>
        </Link>
        <Link
          to="/help"
          className="flex items-center gap-3 px-4 py-3 text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] rounded-xl transition-all"
        >
          <FaQuestionCircle className="w-5 h-5" />
          <span className="text-sm">Ayuda</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;