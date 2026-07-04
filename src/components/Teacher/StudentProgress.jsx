import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { lessonsApi } from '../../api/lessons';
import { evaluationsApi } from '../../api/evaluations';
import { FaArrowLeft, FaBook, FaClipboardList, FaChartLine, FaClock } from 'react-icons/fa';
import { formatDate, calculateProgress } from '../../utils/helpers';
import Loading from '../Common/Loading';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StudentProgress = () => {
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
      setStudent(studentRes.data);
      
      // Obtener progreso del estudiante
      const progressRes = await lessonsApi.getProgress(id);
      setProgress(progressRes.data || []);
      
      // Obtener evaluaciones del estudiante
      const evalRes = await evaluationsApi.getResults(id);
      setEvaluations(evalRes.data.data || []);
      
      // Calcular estadísticas
      const totalLessons = progress.length;
      const completedLessons = progress.filter(p => p.status === 'completed').length;
      const averageScore = evaluations.length > 0 
        ? evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length 
        : 0;
      
      setStats({
        totalLessons,
        completedLessons,
        completionRate: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
        averageScore,
        totalEvaluations: evaluations.length
      });
      
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!student) return (
    <div className="text-center py-12">
      <h3 className="text-xl font-bold text-[var(--on-surface)]">Estudiante no encontrado</h3>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Back */}
      <button
        onClick={() => navigate('/admin/users')}
        className="flex items-center gap-2 text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors"
      >
        <FaArrowLeft className="w-4 h-4" />
        Volver a usuarios
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
                📚 {student.grade || 'Sin grado'}
              </span>
              <span className="px-3 py-1 bg-[var(--surface-container)] rounded-full text-sm">
                🏫 {student.institution || 'Sin institución'}
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
          <p className="text-sm text-[var(--on-surface-variant)]">Lecciones</p>
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
          <p className="text-sm text-[var(--on-surface-variant)]">Evaluaciones</p>
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
          <p className="text-sm text-[var(--on-surface-variant)]">Promedio</p>
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
          <p className="text-sm text-[var(--on-surface-variant)]">Tasa de finalización</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">
            {stats?.completionRate?.toFixed(0) || 0}%
          </p>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--surface-container)]">
        <h3 className="text-lg font-bold text-[var(--on-surface)] mb-4">Progreso en lecciones</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={progress.slice(0, 10)}>
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
          Evaluaciones Recientes
        </h3>
        <div className="space-y-3">
          {evaluations.slice(0, 5).map((eval_) => (
            <div key={eval_.id} className="flex items-center justify-between p-4 bg-[var(--surface-container-low)] rounded-xl">
              <div>
                <p className="font-medium text-[var(--on-surface)]">{eval_.evaluation?.title || 'Sin título'}</p>
                <p className="text-sm text-[var(--on-surface-variant)]">
                  {formatDate(eval_.created_at)} • {eval_.type || 'Sin tipo'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  eval_.score >= 7 ? 'bg-green-100 text-green-700' :
                  eval_.score >= 5 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {eval_.score?.toFixed(1) || 0}/10
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  eval_.status === 'completed' ? 'bg-green-100 text-green-700' :
                  eval_.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {eval_.status || 'Pendiente'}
                </span>
              </div>
            </div>
          ))}
          {evaluations.length === 0 && (
            <p className="text-center text-[var(--on-surface-variant)] py-4">
              No hay evaluaciones completadas
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProgress;