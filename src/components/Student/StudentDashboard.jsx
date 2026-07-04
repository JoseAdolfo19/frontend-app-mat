import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersApi } from '../../api/users';
import { lessonsApi } from '../../api/lessons';
import { evaluationsApi } from '../../api/evaluations';
import { useAuth } from '../../hooks/useAuth';
import { FaBook, FaClipboardList, FaChartLine, FaFire, FaClock } from 'react-icons/fa';
import { formatDate, calculateProgress, getBadgeIcon, getBadgeName } from '../../utils/helpers';
import Loading from '../Common/Loading';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [inProgressLessons, setInProgressLessons] = useState([]);
  const [recentEvaluations, setRecentEvaluations] = useState([]);
  const [upcomingEvaluations, setUpcomingEvaluations] = useState([]);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, progressRes, evaluationsRes] = await Promise.all([
        usersApi.getMyStats(),
        lessonsApi.getLessons({ status: 'in_progress' }),
        evaluationsApi.getEvaluations({ limit: 5 })
      ]);

      setStats(statsRes.data);
      setInProgressLessons(progressRes.data.data || []);
      setRecentEvaluations(evaluationsRes.data.data || []);
      
      // Obtener insignias
      const badgesRes = await usersApi.getBadges();
      setBadges(badgesRes.data.badges || []);
      
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-[var(--primary)] p-8 md:p-12">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold text-white mb-2">
            ¡Hola de nuevo, {user?.full_name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-blue-100 mb-6">
            Has completado el {stats?.summary?.completion_rate || 0}% de tus objetivos semanales.
            Estás a solo {stats?.summary?.total_lessons - stats?.summary?.completed_lessons || 0} lecciones de dominar el módulo.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/lessons"
              className="bg-white text-[var(--primary)] font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:shadow-lg transition-all"
            >
              Continuar: Álgebra Lineal
              <span className="text-lg">→</span>
            </Link>
            <button className="bg-white/10 border border-white/20 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/20 transition-all">
              Ver mis logros
            </button>
          </div>
        </div>
        {/* Decorative Math Symbol */}
        <div className="absolute right-[-5%] top-[-10%] opacity-10 select-none pointer-events-none text-9xl font-bold text-white">
          ∑
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--primary)]/10 rounded-lg text-[var(--primary)]">
              <FaBook className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[var(--secondary)] bg-[var(--secondary)]/10 px-2 py-0.5 rounded-full">
              {stats?.summary?.completion_rate || 0}%
            </span>
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">Lecciones</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">
            {stats?.summary?.completed_lessons || 0}/{stats?.summary?.total_lessons || 0}
          </p>
        </div>

        <div className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--secondary)]/10 rounded-lg text-[var(--secondary)]">
              <FaClipboardList className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">Evaluaciones</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">
            {stats?.summary?.completed_evaluations || 0}
          </p>
        </div>

        <div className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--tertiary)]/10 rounded-lg text-[var(--tertiary)]">
              <FaChartLine className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">Promedio</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">
            {stats?.summary?.average_score || 0}
          </p>
        </div>

        <div className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--error)]/10 rounded-lg text-[var(--error)]">
              <FaFire className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">Racha</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">
            {stats?.summary?.current_streak || 0} días
          </p>
        </div>
      </div>

      {/* Lecciones en progreso */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[var(--on-surface)]">
            Lecciones en curso
          </h3>
          <Link to="/lessons" className="text-sm text-[var(--primary)] font-bold hover:underline">
            Ver todas
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inProgressLessons.slice(0, 4).map((lesson) => (
            <Link
              key={lesson.id}
              to={`/lessons/${lesson.id}`}
              className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all border border-[var(--surface-container)] hover:border-[var(--primary)]/20 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-[var(--surface-container)] rounded-2xl flex items-center justify-center text-[var(--primary)]">
                  <FaBook className="w-6 h-6" />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${lesson.difficulty === 'basic' ? 'bg-green-100 text-green-700' : lesson.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                  {lesson.difficulty}
                </span>
              </div>
              <h4 className="font-bold text-[var(--on-surface)] mb-1 group-hover:text-[var(--primary)] transition-colors">
                {lesson.title}
              </h4>
              <p className="text-sm text-[var(--on-surface-variant)] mb-4">
                {lesson.unit || 'Sin unidad'}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--on-surface-variant)]">Progreso</span>
                  <span className="font-bold text-[var(--on-surface)]">
                    {lesson.progress?.progress || 0}%
                  </span>
                </div>
                <div className="w-full bg-[var(--surface-container)] rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-[var(--primary)] h-full rounded-full transition-all duration-1000"
                    style={{ width: `${lesson.progress?.progress || 0}%` }}
                  ></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Evaluaciones y Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evaluaciones recientes */}
        <div className="lg:col-span-2 bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--surface-container)]">
          <h3 className="text-xl font-bold text-[var(--on-surface)] mb-4">
            Evaluaciones Recientes
          </h3>
          <div className="space-y-3">
            {recentEvaluations.slice(0, 5).map((eval_) => (
              <div key={eval_.id} className="flex items-center justify-between p-4 bg-[var(--surface-container-low)] rounded-xl hover:bg-[var(--surface-container)] transition-colors">
                <div>
                  <p className="font-medium text-[var(--on-surface)]">{eval_.title}</p>
                  <p className="text-sm text-[var(--on-surface-variant)]">
                    {formatDate(eval_.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {eval_.user_result?.score !== undefined ? (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${eval_.user_result.score >= 7 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {eval_.user_result.score.toFixed(1)}/10
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                      Pendiente
                    </span>
                  )}
                  <Link
                    to={`/evaluations/${eval_.id}/result`}
                    className="text-[var(--primary)] hover:underline text-sm font-medium"
                  >
                    Ver
                  </Link>
                </div>
              </div>
            ))}
            {recentEvaluations.length === 0 && (
              <p className="text-center text-[var(--on-surface-variant)] py-4">
                No tienes evaluaciones recientes
              </p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--surface-container)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-[var(--on-surface)]">Mis Logros</h3>
            <span className="text-sm text-[var(--primary)] font-bold">
              {badges.filter(b => b.unlocked).length}/{badges.length}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {badges.slice(0, 6).map((badge) => (
              <div 
                key={badge.id}
                className={`flex flex-col items-center text-center p-3 rounded-xl transition-all ${
                  badge.unlocked 
                    ? 'hover:bg-[var(--surface-container-low)]' 
                    : 'opacity-40 grayscale'
                }`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-2 ${
                  badge.unlocked 
                    ? 'bg-[var(--primary)]/10' 
                    : 'bg-[var(--surface-container)]'
                }`}>
                  {getBadgeIcon(badge.id)}
                </div>
                <p className="text-xs font-medium text-[var(--on-surface)] leading-tight">
                  {getBadgeName(badge.id)}
                </p>
                {!badge.unlocked && (
                  <p className="text-[10px] text-[var(--on-surface-variant)] mt-1">🔒</p>
                )}
              </div>
            ))}
          </div>
          {badges.length === 0 && (
            <p className="text-center text-[var(--on-surface-variant)] py-4">
              Completa más lecciones para desbloquear insignias
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;