import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from '../../api/axios';
import { useLanguage } from '../../contexts/LanguageContext';
import { FaArrowLeft, FaBook, FaClipboardList, FaChartLine, FaMedal } from 'react-icons/fa';
import Loading from '../Common/Loading';

const ChildProgress = () => {
  const { studentId } = useParams();
  const { t, lang } = useLanguage();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, [studentId]);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/parent/children/${studentId}/progress`);
      setProgress(response.data.data || response.data);
    } catch (error) {
      toast.error(t('parent.loadProgressError'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!progress) return null;

  const summary = progress.summary || {};
  const lessons = progress.lessons || [];
  const evaluations = progress.evaluations || [];
  const badges = progress.badges || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          to="/parent"
          className="p-2 rounded-lg hover:bg-[var(--surface-container)] transition-colors text-[var(--on-surface-variant)]"
        >
          <FaArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-[var(--on-surface)]">
            {t('parent.progress')}
          </h2>
          <p className="text-[var(--on-surface-variant)]">
            {progress.student?.full_name || progress.student?.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--primary)]/10 rounded-lg text-[var(--primary)]">
              <FaBook className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">{t('parent.lessonsCompleted')}</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">
            {summary.completed_lessons || 0}/{summary.total_lessons || 0}
          </p>
        </div>

        <div className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--secondary)]/10 rounded-lg text-[var(--secondary)]">
              <FaClipboardList className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">{t('parent.evaluationsCompleted')}</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">
            {summary.completed_evaluations || 0}
          </p>
        </div>

        <div className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--tertiary)]/10 rounded-lg text-[var(--tertiary)]">
              <FaChartLine className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">{t('parent.average')}</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">
            {summary.average_score !== null && summary.average_score !== undefined
              ? Number(summary.average_score).toFixed(1)
              : '—'}
          </p>
        </div>

        <div className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--error)]/10 rounded-lg text-[var(--error)]">
              <FaMedal className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">{t('parent.badges')}</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">
            {badges.filter(b => b.unlocked).length}/{badges.length}
          </p>
        </div>
      </div>

      <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--surface-container)] p-6">
        <h3 className="text-xl font-bold text-[var(--on-surface)] mb-4">{t('parent.lessonProgress')}</h3>
        <div className="space-y-4">
          {lessons.length === 0 ? (
            <p className="text-center text-[var(--on-surface-variant)] py-4">
              {t('common.noData')}
            </p>
          ) : (
            lessons.map((lesson) => (
              <div key={lesson.id} className="p-4 bg-[var(--surface-container-low)] rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-[var(--on-surface)]">{lesson.title}</h4>
                  <span className="text-sm font-bold text-[var(--primary)]">
                    {lesson.progress || 0}%
                  </span>
                </div>
                <div className="w-full bg-[var(--surface-container)] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[var(--primary)] h-full rounded-full transition-all duration-1000"
                    style={{ width: `${lesson.progress || 0}%` }}
                  />
                </div>
                {lesson.completed_at && (
                  <p className="text-xs text-[var(--on-surface-variant)] mt-2">
                    {lesson.completed_at}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--surface-container)] p-6">
        <h3 className="text-xl font-bold text-[var(--on-surface)] mb-4">{t('parent.evaluationResults')}</h3>
        <div className="space-y-3">
          {evaluations.length === 0 ? (
            <p className="text-center text-[var(--on-surface-variant)] py-4">
              {t('common.noData')}
            </p>
          ) : (
            evaluations.map((eval_) => (
              <div key={eval_.id} className="flex items-center justify-between p-4 bg-[var(--surface-container-low)] rounded-xl">
                <div>
                  <p className="font-medium text-[var(--on-surface)]">{eval_.title}</p>
                  <p className="text-sm text-[var(--on-surface-variant)]">{eval_.date}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  eval_.score >= 15
                    ? 'bg-green-100 text-green-700'
                    : eval_.score >= 12
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {Number(eval_.score).toFixed(1)}/20
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--surface-container)] p-6">
        <h3 className="text-xl font-bold text-[var(--on-surface)] mb-4">{t('parent.badgesEarned')}</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {badges.length === 0 ? (
            <p className="col-span-full text-center text-[var(--on-surface-variant)] py-4">
              {t('student.noBadges')}
            </p>
          ) : (
            badges.map((badge) => (
              <div
                key={badge.id}
                className={`flex flex-col items-center text-center p-3 rounded-xl ${
                  badge.unlocked ? '' : 'opacity-40 grayscale'
                }`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-2 ${
                  badge.unlocked ? 'bg-[var(--primary)]/10' : 'bg-[var(--surface-container)]'
                }`}>
                  {badge.icon || '🏅'}
                </div>
                <p className="text-xs font-medium text-[var(--on-surface)] leading-tight">
                  {badge.name}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <Link
          to={`/parent/children/${studentId}/report`}
          className="bg-[var(--primary)] text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all"
        >
          {t('parent.report')}
        </Link>
      </div>
    </div>
  );
};

export default ChildProgress;
