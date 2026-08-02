import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/admin';
import { reportsApi } from '../../api/reports';
import { evaluationsApi } from '../../api/evaluations';
import { FaArrowLeft, FaBook, FaClipboardList, FaChartLine, FaClock } from 'react-icons/fa';
import { formatDate, calculateProgress, toArray } from '../../utils/helpers';
import Loading from '../Common/Loading';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext';

const StudentProgress = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [progress, setProgress] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStudentData();
  }, [id]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);

      // Obtener datos del estudiante
      const studentRes = await adminApi.getUser(id);
      const studentData = studentRes.data?.data || studentRes.data || null;
      setStudent(studentData);

      if (!studentData) {
        setLoading(false);
        return;
      }

      // Obtener reporte individual del estudiante (incluye progreso de lecciones)
      let progressData = [];
      try {
        const studentReportRes = await reportsApi.getStudentReport(id);
        const reportData = studentReportRes.data?.data || studentReportRes.data;
        if (reportData) {
          progressData = toArray(reportData.lessons || reportData.progress);
          setProgress(progressData);
        }
      } catch {
        toast.error('Error al cargar reporte del estudiante');
      }

      // Obtener evaluaciones del estudiante
      let evaluationsData = [];
      try {
        const evalRes = await evaluationsApi.getResults(id);
        evaluationsData = toArray(evalRes.data?.data);
        setEvaluations(evaluationsData);
      } catch {
        toast.error('Error al cargar evaluaciones');
      }

      // Calcular estadísticas usando los datos recién obtenidos
      const totalLessons = progressData.length;
      const completedLessons = progressData.filter(p => p.status === 'completed').length;
      const averageScore = evaluationsData.length > 0
        ? evaluationsData.reduce((sum, e) => sum + (e.score || 0), 0) / evaluationsData.length
        : 0;

      setStats({
        totalLessons,
        completedLessons,
        completionRate: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
        averageScore,
        totalEvaluations: evaluationsData.length
      });

    } catch {
      toast.error('Error al cargar datos del estudiante');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!student) return (
    <div className="text-center py-12">
      <h3 className="text-xl font-bold text-[var(--on-surface)]">{t('teacher.studentProgress.notFound')}</h3>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Back */}
      <button
        onClick={() => navigate('/reports')}
        className="flex items-center gap-2 text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors"
        aria-label={t('teacher.studentProgress.backToUsers') || 'Volver a reportes'}
      >
        <FaArrowLeft className="w-4 h-4" />
        {t('teacher.studentProgress.backToUsers')}
      </button>

      {/* Header */}
      <div className="bg-[var(--surface)] rounded-2xl p-8 shadow-sm border border-[var(--surface-container)]">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-3xl font-bold text-[var(--primary)]">
            {student.full_name?.charAt(0) || 'S'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--on-surface)]">{student.full_name}</h2>
            <p className="text-[var(--on-surface-variant)]">{student.email}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="px-3 py-1 bg-[var(--surface-container)] rounded-full text-sm">
                📚 {student.grade || t('teacher.studentProgress.noGrade')}
              </span>
              <span className="px-3 py-1 bg-[var(--surface-container)] rounded-full text-sm">
                🏫 {student.institution || t('teacher.studentProgress.noInstitution')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--primary)]/10 rounded-lg text-[var(--primary)]">
              <FaBook className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">{t('teacher.studentProgress.lessons')}</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">
            {stats?.completedLessons || 0}/{stats?.totalLessons || 0}
          </p>
        </div>

        <div className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--secondary)]/10 rounded-lg text-[var(--secondary)]">
              <FaClipboardList className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">{t('teacher.studentProgress.evaluations')}</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">
            {stats?.totalEvaluations || 0}
          </p>
        </div>

        <div className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--tertiary)]/10 rounded-lg text-[var(--tertiary)]">
              <FaChartLine className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">{t('teacher.studentProgress.average')}</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">
            {stats?.averageScore?.toFixed(1) || 0}
          </p>
        </div>

        <div className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--error)]/10 rounded-lg text-[var(--error)]">
              <FaClock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">{t('teacher.studentProgress.completionRate')}</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">
            {stats?.completionRate?.toFixed(0) || 0}%
          </p>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--surface-container)]">
        <h3 className="text-lg font-bold text-[var(--on-surface)] mb-4">{t('teacher.studentProgress.lessonProgress')}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={(Array.isArray(progress) ? progress : []).slice(0, 10)} aria-label={t('teacher.studentProgress.lessonProgress') || 'Gráfico de progreso por lección'}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-container)" />
              <XAxis dataKey="lesson.title" stroke="var(--on-surface-variant)" fontSize={12} />
              <YAxis stroke="var(--on-surface-variant)" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  background: 'var(--surface)', 
                  border: '1px solid var(--outline-variant)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="progress" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Evaluations */}
      <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--surface-container)]">
        <h3 className="text-lg font-bold text-[var(--on-surface)] mb-4">
          {t('teacher.studentProgress.recentEvaluations')}
        </h3>
        <div className="space-y-3">
          {(Array.isArray(evaluations) ? evaluations : []).slice(0, 5).map((eval_) => (
            <div key={eval_.id} className="flex items-center justify-between p-4 bg-[var(--surface-container-low)] rounded-xl">
              <div>
                <p className="font-medium text-[var(--on-surface)]">{eval_.evaluation?.title || '—'}</p>
                <p className="text-sm text-[var(--on-surface-variant)]">
                  {formatDate(eval_.created_at)} • {eval_.type || '—'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  eval_.score >= 15 ? 'bg-green-100 text-green-700' :
                  eval_.score >= 12 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {eval_.score?.toFixed(1) || 0}/20
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  eval_.status === 'completed' ? 'bg-green-100 text-green-700' :
                  eval_.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {eval_.status || t('student.pending')}
                </span>
              </div>
            </div>
          ))}
          {evaluations.length === 0 && (
            <p className="text-center text-[var(--on-surface-variant)] py-4">
              {t('teacher.studentProgress.noEvaluations')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProgress;
