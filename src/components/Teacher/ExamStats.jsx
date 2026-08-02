import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../Common/Loading';
import { formatDateTime } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaExclamationTriangle, FaUsers, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const ExamStats = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [cheatingIncidents, setCheatingIncidents] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [statsRes, cheatRes] = await Promise.allSettled([
          api.get(`/exams/${id}/stats`),
          api.get(`/exams/${id}/cheating-incidents`),
        ]);
        if (statsRes.status === 'fulfilled') {
          const data = statsRes.value.data.data || statsRes.value.data;
          setStats(data);
        }
        if (cheatRes.status === 'fulfilled') {
          setCheatingIncidents(cheatRes.value.data.data || cheatRes.value.data || []);
        }
      } catch (err) {
        toast.error(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [id, t]);

  if (loading) return <Loading />;

  const scoreDistribution = stats?.score_distribution || [];
  const maxBar = Math.max(...scoreDistribution.map((b) => b.count), 1);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/teacher/exams')}
          className="p-2 rounded-lg text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] transition-all"
        >
          <FaArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--on-surface)]">{t('exam.examStats')}</h1>
          <p className="text-sm text-[var(--on-surface-variant)]">{stats?.exam_title || ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] p-5 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--primary)]/10 rounded-lg text-[var(--primary)]">
              <FaUsers className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">{t('exam.totalAttempts')}</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">{stats?.total_attempts || 0}</p>
        </div>
        <div className="bg-[var(--surface)] p-5 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--secondary)]/10 rounded-lg text-[var(--secondary)]">
              <FaCheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">{t('exam.averageScore')}</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">{stats?.average_score?.toFixed(1) || '—'}</p>
        </div>
        <div className="bg-[var(--surface)] p-5 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg text-green-600">
              <FaCheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">{t('exam.passRate')}</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">{stats?.pass_rate?.toFixed(0) || 0}%</p>
        </div>
        <div className="bg-[var(--surface)] p-5 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
              <FaExclamationTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">{t('exam.cheatingIncidents')}</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">{cheatingIncidents.length}</p>
        </div>
      </div>

      {scoreDistribution.length > 0 && (
        <div className="bg-[var(--surface)] rounded-2xl p-6 shadow-sm border border-[var(--surface-container)]">
          <h2 className="font-bold text-[var(--on-surface)] mb-4">{t('exam.scoreDistribution') || 'Distribución de Puntajes'}</h2>
          <div className="flex items-end gap-2 h-48">
            {scoreDistribution.map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                <span className="text-xs text-[var(--on-surface-variant)] mb-1">{bar.count}</span>
                <div
                  className="w-full bg-[var(--primary)] rounded-t-lg transition-all"
                  style={{ height: `${(bar.count / maxBar) * 100}%`, minHeight: bar.count > 0 ? '4px' : '0' }}
                />
                <span className="text-[10px] text-[var(--on-surface-variant)] mt-1">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {cheatingIncidents.length > 0 && (
        <div className="bg-[var(--surface)] rounded-2xl p-6 shadow-sm border border-[var(--surface-container)]">
          <h2 className="font-bold text-[var(--on-surface)] mb-4 flex items-center gap-2">
            <FaExclamationTriangle className="text-red-500" />
            {t('exam.cheatingIncidents')}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--surface-container)]">
                  <th className="text-left py-3 px-4 text-[var(--on-surface-variant)] font-bold">Estudiante</th>
                  <th className="text-left py-3 px-4 text-[var(--on-surface-variant)] font-bold">Tipo</th>
                  <th className="text-left py-3 px-4 text-[var(--on-surface-variant)] font-bold">Detalle</th>
                  <th className="text-left py-3 px-4 text-[var(--on-surface-variant)] font-bold">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {cheatingIncidents.map((incident, i) => (
                  <tr key={i} className="border-b border-[var(--surface-container-low)] hover:bg-[var(--surface-container-low)]">
                    <td className="py-3 px-4 font-medium text-[var(--on-surface)]">
                      {incident.student_name || incident.user_name || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                        {incident.event_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[var(--on-surface-variant)]">{incident.detail || '—'}</td>
                    <td className="py-3 px-4 text-[var(--on-surface-variant)]">
                      {formatDateTime(incident.timestamp || incident.created_at, lang)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamStats;
