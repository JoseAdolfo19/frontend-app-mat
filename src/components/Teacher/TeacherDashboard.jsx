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
import { formatDate, toArray } from '../../utils/helpers';
import { useLanguage } from '../../contexts/LanguageContext';

const TeacherDashboard = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentEvaluations, setRecentEvaluations] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);

    const [dashboardResult, studentsResult, evaluationsResult] = await Promise.allSettled([
      usersApi.getMyStats(),
      adminApi.getUsers({ limit: 5, role: 'student' }),
      evaluationsApi.getEvaluations({ limit: 5 })
    ]);

    if (dashboardResult.status === 'fulfilled') {
      setStats(dashboardResult.value.data);
    }

    if (studentsResult.status === 'fulfilled') {
      setRecentStudents(toArray(studentsResult.value.data?.data));
    }

    if (evaluationsResult.status === 'fulfilled') {
      setRecentEvaluations(toArray(evaluationsResult.value.data?.data));
    }

    setLoading(false);
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-[var(--surface)] rounded-2xl p-8 shadow-sm border border-[var(--surface-container)]">
        <h2 className="text-2xl font-bold text-[var(--on-surface)]">
          {t('teacher.dashboard.welcome').replace('{name}', user?.full_name?.split(' ')[0])}
        </h2>
        <p className="text-[var(--on-surface-variant)]">
          {t('teacher.dashboard.summary')}
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
          <p className="text-sm text-[var(--on-surface-variant)]">{t('teacher.dashboard.students')}</p>
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
          <p className="text-sm text-[var(--on-surface-variant)]">{t('teacher.dashboard.lessons')}</p>
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
          <p className="text-sm text-[var(--on-surface-variant)]">{t('teacher.dashboard.evaluations')}</p>
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
          <p className="text-sm text-[var(--on-surface-variant)]">{t('teacher.dashboard.passRate')}</p>
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
          aria-label={t('teacher.dashboard.newLesson') || 'Crear nueva lección'}
        >
          <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[var(--primary)] group-hover:text-white transition-all">
            <FaFileAlt className="w-6 h-6 text-[var(--primary)] group-hover:text-white" />
          </div>
          <p className="font-bold text-[var(--on-surface)]">{t('teacher.dashboard.newLesson')}</p>
          <p className="text-xs text-[var(--on-surface-variant)]">{t('teacher.dashboard.createContent')}</p>
        </Link>

        <Link
          to="/teacher/evaluations/create"
          className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)] hover:shadow-md transition-all text-center group"
          aria-label={t('teacher.dashboard.newEvaluation') || 'Crear nueva evaluación'}
        >
          <div className="w-12 h-12 bg-[var(--secondary)]/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[var(--secondary)] group-hover:text-white transition-all">
            <FaClipboardList className="w-6 h-6 text-[var(--secondary)] group-hover:text-white" />
          </div>
          <p className="font-bold text-[var(--on-surface)]">{t('teacher.dashboard.newEvaluation')}</p>
          <p className="text-xs text-[var(--on-surface-variant)]">{t('teacher.dashboard.createExam')}</p>
        </Link>

        <Link
          to="/reports"
          className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)] hover:shadow-md transition-all text-center group"
        >
          <div className="w-12 h-12 bg-[var(--tertiary)]/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[var(--tertiary)] group-hover:text-white transition-all">
            <FaUserPlus className="w-6 h-6 text-[var(--tertiary)] group-hover:text-white" />
          </div>
          <p className="font-bold text-[var(--on-surface)]">{t('teacher.dashboard.manageStudents')}</p>
          <p className="text-xs text-[var(--on-surface-variant)]">{t('teacher.dashboard.viewProgress')}</p>
        </Link>

        <Link
          to="/reports"
          className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)] hover:shadow-md transition-all text-center group"
        >
          <div className="w-12 h-12 bg-[var(--error)]/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[var(--error)] group-hover:text-white transition-all">
            <FaChartLine className="w-6 h-6 text-[var(--error)] group-hover:text-white" />
          </div>
          <p className="font-bold text-[var(--on-surface)]">{t('teacher.dashboard.reports')}</p>
          <p className="text-xs text-[var(--on-surface-variant)]">{t('teacher.dashboard.analyzeData')}</p>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--surface-container)]">
          <h3 className="text-lg font-bold text-[var(--on-surface)] mb-4">
            {t('teacher.dashboard.recentStudents')}
          </h3>
          <div className="space-y-3">
            {(Array.isArray(recentStudents) ? recentStudents : []).map((student) => (
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
                  aria-label={`${t('teacher.dashboard.view')} ${student.full_name}`}
                >
                  {t('teacher.dashboard.view')}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Evaluations */}
        <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--surface-container)]">
          <h3 className="text-lg font-bold text-[var(--on-surface)] mb-4">
            {t('teacher.dashboard.recentEvaluations')}
          </h3>
          <div className="space-y-3">
            {(Array.isArray(recentEvaluations) ? recentEvaluations : []).map((eval_) => (
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
                    {eval_.is_published ? t('teacher.dashboard.published') : t('teacher.dashboard.draft')}
                  </span>
                  <Link
                    to={`/teacher/evaluations/${eval_.id}/edit`}
                    className="text-[var(--primary)] hover:underline text-sm"
                    aria-label={`${t('teacher.dashboard.edit')} ${eval_.title}`}
                  >
                    {t('teacher.dashboard.edit')}
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
