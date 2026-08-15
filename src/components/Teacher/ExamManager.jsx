import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useLanguage } from '../../contexts/LanguageContext';
import Loading from '../Common/Loading';
import { getDifficultyLabel, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaChartBar, FaClipboardList } from 'react-icons/fa';

const ExamManager = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const response = await api.get('/exams/');
      const data = response.data.data ?? response.data;
      setExams(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (exam) => {
    try {
      if (exam.status === 'active') {
        await api.patch(`/exams/${exam.id}/deactivate`);
        toast.success(t('exam.deactivated') || 'Desactivado');
      } else {
        await api.patch(`/exams/${exam.id}/activate`);
        toast.success(t('exam.activated') || 'Activado');
      }
      fetchExams();
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    }
  };

  const deleteExam = async (examId) => {
    if (!window.confirm(t('exam.confirmDelete') || 'Are you sure?')) return;
    try {
      await api.delete(`/exams/${examId}`);
      toast.success(t('common.success'));
      fetchExams();
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    }
  };

  const filtered = exams.filter((e) => {
    if (filterStatus === 'all') return true;
    return e.status === filterStatus;
  });

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-[var(--primary)] p-8 md:p-10">
        <div className="relative z-10 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{t('exam.title')}</h1>
            <p className="text-blue-100">{t('exam.questions')}</p>
          </div>
          <button
            onClick={() => navigate('/teacher/exams/create')}
            className="bg-white text-[var(--primary)] font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:shadow-lg transition-all"
          >
            <FaPlus className="w-4 h-4" />
            {t('exam.createExam')}
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {['all', 'active', 'draft'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              filterStatus === status
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--surface)] text-[var(--on-surface-variant)] border border-[var(--surface-container)] hover:bg-[var(--surface-container)]'
            }`}
          >
            {status === 'all' ? t('exam.all') : status === 'active' ? t('exam.active') : t('exam.draft')}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((exam) => (
          <div
            key={exam.id}
            className="bg-[var(--surface)] rounded-xl p-5 shadow-sm border border-[var(--surface-container)] flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-bold text-[var(--on-surface)] truncate">{exam.title}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  exam.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {exam.status === 'active' ? t('exam.examActive') : t('exam.examDraft')}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-[var(--on-surface-variant)]">
                {exam.unit && <span>{exam.unit}</span>}
                <span>{getDifficultyLabel(exam.difficulty, lang)}</span>
                {exam.time_limit && <span>{exam.time_limit} min</span>}
                <span>{exam.total_questions || 0} {t('exam.questions')}</span>
                {exam.attempts_count !== undefined && <span>{exam.attempts_count} intentos</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/teacher/exams/${exam.id}/stats`)}
                className="p-2 rounded-lg text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] transition-all"
                title={t('exam.examStats')}
              >
                <FaChartBar className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate(`/teacher/exams/${exam.id}/edit`)}
                className="p-2 rounded-lg text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] transition-all"
                title={t('common.edit')}
              >
                <FaEdit className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleActive(exam)}
                className={`p-2 rounded-lg transition-all ${
                  exam.status === 'active'
                    ? 'text-green-600 hover:bg-green-50'
                    : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)]'
                }`}
                title={exam.status === 'active' ? t('exam.deactivate') : t('exam.activate')}
              >
                {exam.status === 'active' ? <FaToggleOn className="w-5 h-5" /> : <FaToggleOff className="w-5 h-5" />}
              </button>
              <button
                onClick={() => deleteExam(exam.id)}
                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-all"
                title={t('common.delete')}
              >
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <FaClipboardList className="w-16 h-16 text-[var(--on-surface-variant)] mx-auto mb-4 opacity-30" />
          <p className="text-lg text-[var(--on-surface-variant)]">{t('exam.noExams')}</p>
        </div>
      )}
    </div>
  );
};

export default ExamManager;
