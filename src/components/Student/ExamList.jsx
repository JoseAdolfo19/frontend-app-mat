import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useLanguage } from '../../contexts/LanguageContext';
import Loading from '../Common/Loading';
import { getDifficultyLabel } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { FaPlay, FaClock, FaRedo, FaBan, FaClipboardList } from 'react-icons/fa';

const ExamList = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      try {
        const response = await api.get('/exams/', { params: { is_active: true } });
        setExams(response.data.data || response.data || []);
      } catch (err) {
        toast.error(err.response?.data?.message || t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [t]);

  const handleStart = async (examId) => {
    try {
      const response = await api.post(`/exams/${examId}/start`);
      const data = response.data.data || response.data;
      if (data.attempt?.id) {
        navigate(`/exams/${examId}/take`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || t('common.error');
      toast.error(msg);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-[var(--primary)] p-8 md:p-10">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-bold text-white mb-2">{t('exam.title')}</h1>
          <p className="text-blue-100">{t('exam.noExams')}</p>
        </div>
        <div className="absolute right-[-5%] top-[-10%] opacity-10 text-9xl font-bold text-white select-none pointer-events-none">
          &#128202;
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="bg-[var(--surface)] rounded-2xl p-6 shadow-sm border border-[var(--surface-container)] hover:shadow-lg transition-all"
          >
            <div className="flex justify-between items-start mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                exam.difficulty === 'basic' ? 'bg-green-100 text-green-700' :
                exam.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {getDifficultyLabel(exam.difficulty, lang)}
              </span>
              {exam.unit && (
                <span className="text-xs text-[var(--on-surface-variant)] bg-[var(--surface-container-low)] px-2 py-1 rounded-full">
                  {exam.unit}
                </span>
              )}
            </div>

            <h3 className="font-bold text-[var(--on-surface)] mb-2">{exam.title}</h3>
            <p className="text-sm text-[var(--on-surface-variant)] mb-4 line-clamp-2">
              {exam.description || t('lessons.noDescription')}
            </p>

            <div className="flex items-center gap-4 text-xs text-[var(--on-surface-variant)] mb-4">
              {exam.time_limit && (
                <span className="flex items-center gap-1">
                  <FaClock className="w-3 h-3" />
                  {exam.time_limit} min
                </span>
              )}
              {exam.max_attempts && (
                <span className="flex items-center gap-1">
                  <FaRedo className="w-3 h-3" />
                  {exam.attempts_remaining ?? exam.max_attempts} {t('exam.attemptsRemaining')}
                </span>
              )}
              {exam.total_questions && (
                <span>{exam.total_questions} {t('exam.questions')}</span>
              )}
            </div>

            {(exam.attempts_remaining !== undefined && exam.attempts_remaining <= 0) || exam.no_attempts ? (
              <button
                disabled
                className="w-full py-3 bg-[var(--surface-container)] text-[var(--on-surface-variant)] font-bold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <FaBan className="w-4 h-4" />
                {t('exam.noAttempts')}
              </button>
            ) : (
              <button
                onClick={() => handleStart(exam.id)}
                className="w-full py-3 bg-[var(--primary)] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all"
              >
                <FaPlay className="w-4 h-4" />
                {t('exam.startExam')}
              </button>
            )}
          </div>
        ))}
      </div>

      {exams.length === 0 && (
        <div className="text-center py-16">
          <FaClipboardList className="w-16 h-16 text-[var(--on-surface-variant)] mx-auto mb-4 opacity-30" />
          <p className="text-lg text-[var(--on-surface-variant)]">{t('exam.noExams')}</p>
        </div>
      )}
    </div>
  );
};

export default ExamList;
