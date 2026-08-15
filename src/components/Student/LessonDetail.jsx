import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { lessonsApi } from '../../api/lessons';
import { FaArrowLeft, FaArrowRight, FaClock, FaTag } from 'react-icons/fa';
import { formatDate, getDifficultyColor } from '../../utils/helpers';
import Loading from '../Common/Loading';
import toast from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../hooks/useAuth';

const LessonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isTeacher, isAdmin } = useAuth();
  const isStaff = isTeacher() || isAdmin();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lessons, setLessons] = useState([]);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    fetchLesson();
    startTimeRef.current = Date.now();
    return () => {};
  }, [id]);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await lessonsApi.getLessons();
      const data = response.data?.data ?? response.data;
      setLessons(Array.isArray(data) ? data : []);
    } catch (error) {
      setLessons([]);
    }
  };

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const response = await lessonsApi.getLesson(id);
      const lessonData = response.data?.data || null;
      setLesson(lessonData);
      if (lessonData?.user_progress) {
        setProgress(lessonData.user_progress.progress || 0);
      }
    } catch (error) {
      toast.error(t('lessonDetail.loadError'));
      setLesson(null);
    } finally {
      setLoading(false);
    }
  };

  const getTimeSpent = () => {
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000 / 60);
    return Math.max(elapsed, 1);
  };

  const updateProgress = async (newProgress) => {
    try {
      setIsUpdating(true);
      await lessonsApi.updateProgress(id, {
        progress: newProgress,
        time_spent: getTimeSpent()
      });
      setProgress(newProgress);
      if (newProgress >= 100) {
        toast.success(t('lessonDetail.completed'));
      }
    } catch (error) {
      toast.error(t('lessonDetail.progressError'));
    } finally {
      setIsUpdating(false);
    }
  };

  const sanitizeHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const tags = ['SCRIPT', 'IFRAME', 'OBJECT', 'EMBED', 'FORM', 'INPUT', 'TEXTAREA', 'SELECT', 'LINK', 'META'];
    tags.forEach((tag) => {
      doc.querySelectorAll(tag).forEach((el) => el.remove());
    });
    doc.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach((attr) => {
        if (attr.name.startsWith('on') || attr.value.trim().toLowerCase().startsWith('javascript:')) {
          el.removeAttribute(attr.name);
        }
      });
    });
    return doc.body.innerHTML;
  };

  const currentIndex = lessons.findIndex(l => String(l.id) === String(id));
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  if (loading) return <Loading />;
  if (!lesson) return (
    <div className="text-center py-12">
      <h3 className="text-xl font-bold text-[var(--on-surface)]">{t('lessonDetail.notFound')}</h3>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button
        onClick={() => navigate('/lessons')}
        className="flex items-center gap-2 text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors"
        aria-label={t('lessonDetail.backToLessons') || 'Volver a lecciones'}
      >
        <FaArrowLeft className="w-4 h-4" />
        {t('lessonDetail.backToLessons')}
      </button>

      <div className="bg-[var(--surface)] rounded-2xl p-8 shadow-sm border border-[var(--surface-container)]">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(lesson.difficulty)}`}>
                {lesson.difficulty === 'basic' ? t('lessonDetail.basic') :
                 lesson.difficulty === 'intermediate' ? t('lessonDetail.intermediate') : t('lessonDetail.advanced')}
              </span>
              {lesson.unit && (
                <span className="text-xs text-[var(--on-surface-variant)] bg-[var(--surface-container-low)] px-2 py-1 rounded">
                  {lesson.unit}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-[var(--on-surface)]">{lesson.title}</h1>
            {lesson.description && (
              <p className="text-[var(--on-surface-variant)]">{lesson.description}</p>
            )}
          </div>

          {lesson.estimated_time && (
            <div className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)] bg-[var(--surface-container-low)] px-4 py-2 rounded-xl">
              <FaClock className="w-4 h-4" />
              {lesson.estimated_time} {t('lessonDetail.minApprox')}
            </div>
          )}
        </div>

        {!isStaff && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--on-surface-variant)]">{t('lessonDetail.progress')}</span>
              <span className="font-bold text-[var(--on-surface)]">{progress}%</span>
            </div>
            <div className="w-full bg-[var(--surface-container)] rounded-full h-3 overflow-hidden">
              <div
                className="bg-[var(--primary)] h-full rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-[var(--on-surface-variant)]">
              <span>{t('lessonDetail.notStarted')}</span>
              <span>{t('lessonDetail.completedLabel')}</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-[var(--surface)] rounded-2xl p-8 shadow-sm border border-[var(--surface-container)] prose prose-sm max-w-none">
        <div className="prose-headings:text-[var(--on-surface)] prose-p:text-[var(--on-surface-variant)] prose-strong:text-[var(--on-surface)]">
          <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(lesson.content) }} />
        </div>
      </div>

      {lesson.resources && lesson.resources.length > 0 && (
        <div className="bg-[var(--surface)] rounded-2xl p-8 shadow-sm border border-[var(--surface-container)]">
          <h3 className="text-xl font-bold text-[var(--on-surface)] mb-4">{t('lessonDetail.resources')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lesson.resources.map((resource, index) => (
          <a
            key={index}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 bg-[var(--surface-container-low)] rounded-xl hover:bg-[var(--surface-container)] transition-colors"
            aria-label={`${resource.title} - ${resource.type}`}
          >
                <span className="text-2xl">
                  {resource.type === 'pdf' ? '📄' :
                   resource.type === 'video' ? '🎥' :
                   resource.type === 'image' ? '🖼️' : '🔗'}
                </span>
                <div>
                  <p className="font-medium text-[var(--on-surface)]">{resource.title}</p>
                  <p className="text-xs text-[var(--on-surface-variant)]">{resource.type}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-[var(--surface-container)]">
        <button
          onClick={() => prevLesson && navigate(`/lessons/${prevLesson.id}`)}
          disabled={!prevLesson}
          className="px-6 py-3 text-[var(--on-surface-variant)] font-bold hover:bg-[var(--surface-container)] rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label={t('lessonDetail.previousLesson') || 'Lección anterior'}
        >
          {t('lessonDetail.previousLesson')}
        </button>
        <div className="flex gap-3">
          {nextLesson && (
            <button
              onClick={() => navigate(`/lessons/${nextLesson.id}`)}
              className="px-6 py-3 text-[var(--on-surface-variant)] font-bold hover:bg-[var(--surface-container)] rounded-xl transition-all flex items-center gap-2"
              aria-label={t('lessonDetail.nextLesson') || 'Siguiente lección'}
            >
              {t('lessonDetail.nextLesson')}
              <FaArrowRight className="w-4 h-4" />
            </button>
          )}
          {!isStaff && progress < 100 && (
            <button
              onClick={() => updateProgress(Math.min(progress + 20, 100))}
              disabled={isUpdating}
              className="px-8 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isUpdating ? t('lessonDetail.updating') : t('lessonDetail.markComplete')}
              <FaArrowRight className="w-4 h-4" />
            </button>
          )}
          {!isStaff && progress >= 100 && (
            <Link
              to="/evaluations"
              className="px-8 py-3 bg-[var(--secondary)] text-white font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-2"
            >
              {t('lessonDetail.goToEvaluations')}
              <FaArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonDetail;
