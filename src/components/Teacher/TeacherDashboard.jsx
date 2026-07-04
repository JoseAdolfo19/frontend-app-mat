import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersApi } from '../../api/users';
import { lessonsApi } from '../../api/lessons';
import { evaluationsApi } from '../../api/evaluations';
import { adminApi } from '../../api/admin';
import { useAuth } from '../../hooks/useAuth';
import { 
  FaUsers, FaBook, FaClipboardList, FaChartLine, 
  FaUserPlus, FaFileAlt, FaCheckCircle, FaClock 
} from 'react-icons/fa';
import Loading from '../Common/Loading';
import { formatDate } from '../../utils/helpers';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentEvaluations, setRecentEvaluations] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, studentsRes, evaluationsRes] = await Promise.all([
        usersApi.getMyStats(),
        adminApi.getUsers({ limit: 5, role: 'student' }),
        evaluationsApi.getEvaluations({ limit: 5 })
      ]);

      setStats(dashboardRes.data);
      setRecentStudents(studentsRes.data.data || []);
      setRecentEvaluations(evaluationsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-[var(--surface)] rounded-2xl p-8 shadow-sm border border-[var(--surface-container)]">
        <h2 className="text-2xl font-bold text-[var(--on-surface)]">
          Bienvenido de nuevo, {user?.full_name?.split(' ')[0]} 👋
        </h2>
        <p className="text-[var(--on-surface-variant)]">
          Aquí tienes un resumen de tu actividad docente
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--primary)]/10 rounded-lg text-[var(--primary)]">
              <FaUsers className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">Estudiantes</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">
            {stats?.summary?.total_students || 0}
          </p>
        </div>

        <div className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--secondary)]/10 rounded-lg text-[var(--secondary)]">
              <FaBook className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">Lecciones</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">
            {stats?.summary?.total_lessons || 0}
          </p>
        </div>

        <div className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--tertiary)]/10 rounded-lg text-[var(--tertiary)]">
              <FaClipboardList className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">Evaluaciones</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">
            {stats?.summary?.total_evaluations || 0}
          </p>
        </div>

        <div className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--error)]/10 rounded-lg text-[var(--error)]">
              <FaCheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">Tasa de aprobación</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">
            {stats?.summary?.passing_rate || 0}%
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          to="/teacher/lessons/create"
          className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)] hover:shadow-md transition-all text-center group"
        >
          <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[var(--primary)] group-hover:text-white transition-all">
            <FaFileAlt className="w-6 h-6 text-[var(--primary)] group-hover:text-white" />
          </div>
          <p className="font-bold text-[var(--on-surface)]">Nueva Lección</p>
          <p className="text-xs text-[var(--on-surface-variant)]">Crear contenido</p>
        </Link>

        <Link
          to="/teacher/evaluations/create"
          className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)] hover:shadow-md transition-all text-center group"
        >
          <div className="w-12 h-12 bg-[var(--secondary)]/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[var(--secondary)] group-hover:text-white transition-all">
            <FaClipboardList className="w-6 h-6 text-[var(--secondary)] group-hover:text-white" />
          </div>
          <p className="font-bold text-[var(--on-surface)]">Nueva Evaluación</p>
          <p className="text-xs text-[var(--on-surface-variant)]">Crear examen</p>
        </Link>

        <Link
          to="/admin/users"
          className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)] hover:shadow-md transition-all text-center group"
        >
          <div className="w-12 h-12 bg-[var(--tertiary)]/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[var(--tertiary)] group-hover:text-white transition-all">
            <FaUserPlus className="w-6 h-6 text-[var(--tertiary)] group-hover:text-white" />
          </div>
          <p className="font-bold text-[var(--on-surface)]">Gestionar Estudiantes</p>
          <p className="text-xs text-[var(--on-surface-variant)]">Ver progreso</p>
        </Link>

        <Link
          to="/reports"
          className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)] hover:shadow-md transition-all text-center group"
        >
          <div className="w-12 h-12 bg-[var(--error)]/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[var(--error)] group-hover:text-white transition-all">
            <FaChartLine className="w-6 h-6 text-[var(--error)] group-hover:text-white" />
          </div>
          <p className="font-bold text-[var(--on-surface)]">Reportes</p>
          <p className="text-xs text-[var(--on-surface-variant)]">Analizar datos</p>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--surface-container)]">
          <h3 className="text-lg font-bold text-[var(--on-surface)] mb-4">
            Estudiantes Recientes
          </h3>
          <div className="space-y-3">
            {recentStudents.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-3 bg-[var(--surface-container-low)] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold">
                    {student.full_name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--on-surface)]">{student.full_name}</p>
                    <p className="text-xs text-[var(--on-surface-variant)]">{student.email}</p>
                  </div>
                </div>
                <Link
                  to={`/teacher/students/${student.id}/progress`}
                  className="text-sm text-[var(--primary)] font-medium hover:underline"
                >
                  Ver
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Evaluations */}
        <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--surface-container)]">
          <h3 className="text-lg font-bold text-[var(--on-surface)] mb-4">
            Evaluaciones Recientes
          </h3>
          <div className="space-y-3">
            {recentEvaluations.map((eval_) => (
              <div key={eval_.id} className="flex items-center justify-between p-3 bg-[var(--surface-container-low)] rounded-xl">
                <div>
                  <p className="font-medium text-[var(--on-surface)]">{eval_.title}</p>
                  <div className="flex items-center gap-2 text-xs text-[var(--on-surface-variant)]">
                    <span>{eval_.type}</span>
                    <span>•</span>
                    <span>{formatDate(eval_.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    eval_.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {eval_.is_published ? 'Publicada' : 'Borrador'}
                  </span>
                  <Link
                    to={`/teacher/evaluations/${eval_.id}/edit`}
                    className="text-[var(--primary)] hover:underline text-sm"
                  >
                    Editar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;