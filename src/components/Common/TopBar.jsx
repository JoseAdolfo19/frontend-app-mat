import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { FaSearch, FaBell, FaUserCircle, FaBars } from 'react-icons/fa';

const TopBar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="bg-[var(--surface)] shadow-sm sticky top-0 z-40 flex justify-between items-center w-full px-6 py-4">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 hover:bg-[var(--surface-container-low)] rounded-full transition-colors"
        >
          <FaBars className="w-5 h-5 text-[var(--on-surface-variant)]" />
        </button>
        <div className="hidden md:block">
          <h2 className="text-xl font-bold text-[var(--primary)]">
            {user?.role?.name === 'admin' ? 'Administración' : 
             user?.role?.name === 'teacher' ? 'Panel Docente' : 
             'Mi Aprendizaje'}
          </h2>
        </div>
      </div>

      {/* Center - Search */}
      <div className="hidden lg:flex flex-1 max-w-xl mx-8">
        <div className="relative w-full">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--outline)]" />
          <input
            type="text"
            placeholder="Buscar temas, lecciones..."
            className="w-full bg-[var(--surface-container-low)] border-none rounded-full py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-[var(--primary)] transition-all text-sm"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Notificaciones */}
        <Link
          to="/notifications"
          className="relative p-2 hover:bg-[var(--surface-container-low)] rounded-full transition-colors"
        >
          <FaBell className="w-5 h-5 text-[var(--on-surface-variant)]" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[var(--error)] rounded-full border-2 border-[var(--surface)]"></span>
          )}
        </Link>

        {/* Perfil */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 hover:bg-[var(--surface-container-low)] p-1 rounded-full pr-3 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-[var(--on-surface)]">
                {user?.full_name || 'Usuario'}
              </p>
              <p className="text-[10px] text-[var(--on-surface-variant)]">
                {user?.role?.name || 'Rol'}
              </p>
            </div>
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-[var(--surface)] rounded-xl shadow-lg border border-[var(--outline-variant)] py-1 z-50">
              <Link
                to="/profile"
                className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-[var(--surface-container-low)] transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                <FaUserCircle className="w-4 h-4" />
                Mi Perfil
              </Link>
              <hr className="my-1 border-[var(--outline-variant)]/30" />
              <button
                onClick={() => {
                  setShowDropdown(false);
                  logout();
                }}
                className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--error)] hover:bg-[var(--surface-container-low)] transition-colors w-full"
              >
                <span>🚪</span>
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;