import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  FaUsers, FaChalkboardTeacher, FaBook, FaClipboardList, 
  FaServer, FaDatabase, FaClock, FaShieldAlt 
} from 'react-icons/fa';
import Loading from '../Common/Loading';
import { toArray } from '../../utils/helpers';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [backupInfo, setBackupInfo] = useState(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);

    const results = await Promise.allSettled([
      adminApi.getDashboard(),
      adminApi.getUsers({ per_page: 10 }),
      adminApi.getLastBackup().catch(() => null)
    ]);

    if (results[0].status === 'fulfilled') {
      setStats(results[0].value.data?.stats);
    }

    if (results[1].status === 'fulfilled') {
      setRecentUsers(toArray(results[1].value.data?.data));
    }

    if (results[2].status === 'fulfilled' && results[2].value?.data?.backup) {
      setBackupInfo(results[2].value.data.backup);
    }

    setLoading(false);
  };

  if (loading) return <Loading />;

  const dp = (key) => t(`admin.dashboardPage.${key}`);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-[var(--on-surface)]">{dp('title')}</h2>
          <p className="text-[var(--on-surface-variant)]">
            {dp('subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          {dp('systemOperative')}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[var(--primary)]/10 rounded-lg text-[var(--primary)]">
              <FaUsers className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">{dp('totalUsers')}</p>
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
          <p className="text-sm text-[var(--on-surface-variant)]">{dp('teachers')}</p>
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
          <p className="text-sm text-[var(--on-surface-variant)]">{dp('lessons')}</p>
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
          <p className="text-sm text-[var(--on-surface-variant)]">{dp('evaluations')}</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">
            {stats?.total_evaluations || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--inverse-surface)] rounded-2xl p-8 text-[var(--inverse-on-surface)]">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <FaServer className="w-6 h-6 text-[var(--secondary-fixed-dim)]" />
              <h3 className="text-xl font-bold">{dp('systemStatus')}</h3>
            </div>
            <span className="flex items-center gap-1.5 text-[var(--secondary-fixed-dim)] font-bold text-xs">
              <span className="w-2 h-2 bg-[var(--secondary-fixed-dim)] rounded-full animate-pulse"></span>
              {dp('active')}
            </span>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>{dp('activePeriod')}</span>
                <span className="font-bold">{stats?.active_period?.name || dp('noPeriod')}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>{dp('publishedLessons')}</span>
                <span className="font-bold">{stats?.published_lessons || 0} / {stats?.total_lessons || 0}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>{dp('totalStudents')}</span>
                <span className="font-bold">{stats?.total_students || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs opacity-60">
              {dp('lastBackup')}: {backupInfo ? new Date(backupInfo.created_at).toLocaleString('es-PE') : dp('never')}
            </p>
          </div>
        </div>

        <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--surface-container)]">
          <h3 className="text-lg font-bold text-[var(--on-surface)] mb-4 flex items-center gap-2">
            <span className="text-[var(--primary)]">⚡</span>
            {dp('quickActions')}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="flex flex-col items-center justify-center p-6 bg-[var(--surface-container-low)] rounded-2xl hover:bg-[var(--surface-container)] transition-all group cursor-pointer"
              aria-label={dp('rolesPermissions')}
            >
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FaShieldAlt className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <span className="text-xs font-bold text-[var(--on-surface)]">{dp('rolesPermissions')}</span>
            </button>
            <button
              onClick={() => navigate('/admin/config')}
              className="flex flex-col items-center justify-center p-6 bg-[var(--surface-container-low)] rounded-2xl hover:bg-[var(--surface-container)] transition-all group cursor-pointer"
              aria-label={dp('periods')}
            >
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FaClock className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <span className="text-xs font-bold text-[var(--on-surface)]">{dp('periods')}</span>
            </button>
            <button
              onClick={() => navigate('/admin/users')}
              className="flex flex-col items-center justify-center p-6 bg-[var(--surface-container-low)] rounded-2xl hover:bg-[var(--surface-container)] transition-all group cursor-pointer"
              aria-label={dp('exportData')}
            >
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FaDatabase className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <span className="text-xs font-bold text-[var(--on-surface)]">{dp('exportData')}</span>
            </button>
            <button
              onClick={() => navigate('/admin/config')}
              className="flex flex-col items-center justify-center p-6 bg-[var(--surface-container-low)] rounded-2xl hover:bg-[var(--surface-container)] transition-all group cursor-pointer"
              aria-label={dp('config')}
            >
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FaClipboardList className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <span className="text-xs font-bold text-[var(--on-surface)]">{dp('config')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--surface-container)]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[var(--on-surface)]">{dp('recentActivity')}</h3>
        </div>
        <div className="space-y-4">
          {(Array.isArray(recentUsers) ? recentUsers : []).map((user) => (
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
                  {user.is_active ? dp('activeLabel') : dp('inactiveLabel')}
                </span>
              </div>
            </div>
          ))}
          {(!recentUsers || recentUsers.length === 0) && (
            <p className="text-center text-[var(--on-surface-variant)] py-4">{dp('noActivity')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
