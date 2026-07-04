import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import { 
  FaUsers, FaChalkboardTeacher, FaBook, FaClipboardList, 
  FaServer, FaDatabase, FaClock, FaShieldAlt 
} from 'react-icons/fa';
import Loading from '../Common/Loading';
import { formatDate } from '../../utils/helpers';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [serverStatus, setServerStatus] = useState({
    cpu: 24,
    memory: 28,
    uptime: '99.9%'
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, usersRes] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getUsers({ limit: 5 })
      ]);

      setStats(dashboardRes.data.stats);
      setRecentUsers(usersRes.data.data || []);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-[var(--on-surface)]">Administración Global</h2>
          <p className="text-[var(--on-surface-variant)]">
            Panel de control principal del sistema
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Sistema Operativo
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[var(--primary)]/10 rounded-lg text-[var(--primary)]">
              <FaUsers className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">+12%</span>
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">Total Usuarios</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">
            {stats?.total_users || 0}
          </p>
        </div>

        <div className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--secondary)]/10 rounded-lg text-[var(--secondary)]">
              <FaChalkboardTeacher className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">Docentes</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">
            {stats?.total_teachers || 0}
          </p>
        </div>

        <div className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--tertiary)]/10 rounded-lg text-[var(--tertiary)]">
              <FaBook className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">Lecciones</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">
            {stats?.total_lessons || 0}
          </p>
        </div>

        <div className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--error)]/10 rounded-lg text-[var(--error)]">
              <FaClipboardList className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">Evaluaciones</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">
            {stats?.total_evaluations || 0}
          </p>
        </div>
      </div>

      {/* Server Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--inverse-surface)] rounded-2xl p-8 text-[var(--inverse-on-surface)]">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <FaServer className="w-6 h-6 text-[var(--secondary-fixed-dim)]" />
              <h3 className="text-xl font-bold">Estado del Servidor</h3>
            </div>
            <span className="flex items-center gap-1.5 text-[var(--secondary-fixed-dim)] font-bold text-xs">
              <span className="w-2 h-2 bg-[var(--secondary-fixed-dim)] rounded-full animate-pulse"></span>
              OPTIMIZADO
            </span>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Carga de CPU</span>
                <span className="font-bold">{serverStatus.cpu}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[var(--secondary-fixed-dim)] rounded-full" style={{ width: `${serverStatus.cpu}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Memoria RAM</span>
                <span className="font-bold">{serverStatus.memory}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[var(--primary-fixed-dim)] rounded-full" style={{ width: `${serverStatus.memory}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Disponibilidad</span>
                <span className="font-bold">{serverStatus.uptime}</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-green-400 rounded-full" style={{ width: '99.9%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs opacity-60">Último backup: hace 14 minutos</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--surface-container)]">
          <h3 className="text-lg font-bold text-[var(--on-surface)] mb-4 flex items-center gap-2">
            <span className="text-[var(--primary)]">⚡</span>
            Accesos Rápidos
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center p-6 bg-[var(--surface-container-low)] rounded-2xl hover:bg-[var(--surface-container)] transition-all group">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FaShieldAlt className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <span className="text-xs font-bold text-[var(--on-surface)]">Gestión de Licencias</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 bg-[var(--surface-container-low)] rounded-2xl hover:bg-[var(--surface-container)] transition-all group">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FaClock className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <span className="text-xs font-bold text-[var(--on-surface)]">Períodos Académicos</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 bg-[var(--surface-container-low)] rounded-2xl hover:bg-[var(--surface-container)] transition-all group">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FaShieldAlt className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <span className="text-xs font-bold text-[var(--on-surface)]">Roles y Permisos</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 bg-[var(--surface-container-low)] rounded-2xl hover:bg-[var(--surface-container)] transition-all group">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FaDatabase className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <span className="text-xs font-bold text-[var(--on-surface)]">Exportar Datos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--surface-container)]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[var(--on-surface)]">Actividad Reciente</h3>
          <button className="text-sm text-[var(--primary)] font-bold hover:underline">
            Ver todo
          </button>
        </div>
        <div className="space-y-4">
          {recentUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-4 p-4 bg-[var(--surface-container-low)] rounded-xl">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold">
                {user.full_name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                <p className="font-medium text-[var(--on-surface)]">{user.full_name}</p>
                <p className="text-sm text-[var(--on-surface-variant)]">{user.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  user.role?.name === 'admin' ? 'bg-red-100 text-red-700' :
                  user.role?.name === 'teacher' ? 'bg-blue-100 text-blue-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {user.role?.name?.toUpperCase() || 'USUARIO'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {user.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;