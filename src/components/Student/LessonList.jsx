import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { lessonsApi } from '../../api/lessons';
import { useLanguage } from '../../contexts/LanguageContext';
import { FaSearch, FaFilter, FaBook, FaClock, FaChevronRight } from 'react-icons/fa';
import { getDifficultyColor, getDifficultyLabel, formatDate, calculateProgress, toArray } from '../../utils/helpers';
import Loading from '../Common/Loading';

const LessonList = () => {
  const { lang, t } = useLanguage();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', difficulty: '', unit: '' });
  const [units, setUnits] = useState([]);

  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchLessons();
    }, 350);

    return () => {
      clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchLessons = async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      setLoading(true);
      const response = await lessonsApi.getLessons(filters, { signal: controller.signal });
      const lessonsArray = toArray(response.data?.data);
      setLessons(lessonsArray);
      setUnits([...new Set(lessonsArray.map(l => l.unit).filter(Boolean))]);
    } catch (error) {
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') return;
      console.error('[LessonList] error al listar lecciones', error);
      toast.error(t('lessons.loadError'));
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[var(--on-surface)]">{t('lessons.title')}</h2>
          <p className="text-[var(--on-surface-variant)]">{t('lessons.subtitle')}</p>
        </div>
      </div>

      <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--surface-container)]">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--outline)]" />
            <input
              type="text"
              placeholder={t('lessons.search')}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
            />
          </div>
          <select
            value={filters.difficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            className="px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)] min-w-[150px]"
          >
            <option value="">{t('lessons.allDifficulties')}</option>
            <option value="basic">{t('lessons.basic')}</option>
            <option value="intermediate">{t('lessons.intermediate')}</option>
            <option value="advanced">{t('lessons.advanced')}</option>
          </select>
          <select
            value={filters.unit}
            onChange={(e) => handleFilterChange('unit', e.target.value)}
            className="px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)] min-w-[150px]"
          >
            <option value="">{t('lessons.allUnits')}</option>
            {units.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
          <button className="px-6 py-3 bg-[var(--surface-container-high)] rounded-xl hover:bg-[var(--surface-container-highest)] transition-colors" aria-label={t('lessons.filter') || 'Filtrar lecciones'}>
            <FaFilter />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson) => (
          <Link
            key={lesson.id}
            to={`/lessons/${lesson.id}`}
            aria-label={lesson.title}
            className="bg-[var(--surface)] rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-[var(--surface-container)] hover:border-[var(--primary)]/20 group flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getDifficultyColor(lesson.difficulty)}`}>
                {getDifficultyLabel(lesson.difficulty, lang)}
              </span>
              {lesson.estimated_time && (
                <span className="flex items-center gap-1 text-xs text-[var(--on-surface-variant)]">
                  <FaClock className="w-3 h-3" />
                  {lesson.estimated_time} min
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-[var(--on-surface)] mb-2 group-hover:text-[var(--primary)] transition-colors line-clamp-2">
              {lesson.title}
            </h3>
            
            <p className="text-sm text-[var(--on-surface-variant)] mb-4 line-clamp-2 flex-1">
              {lesson.description || t('lessons.noDescription')}
            </p>

            {lesson.unit && (
              <div className="mb-4">
                <span className="text-xs font-medium text-[var(--on-surface-variant)] bg-[var(--surface-container-low)] px-2 py-1 rounded">
                  📚 {lesson.unit}
                </span>
              </div>
            )}

            {lesson.tags && lesson.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {lesson.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="text-xs px-2 py-1 bg-[var(--surface-container)] rounded-full text-[var(--on-surface-variant)]">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {lesson.user_progress && (
              <div className="mt-auto space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--on-surface-variant)]">{t('student.progress')}</span>
                  <span className="font-bold text-[var(--on-surface)]">{lesson.user_progress.progress || 0}%</span>
                </div>
                <div className="w-full bg-[var(--surface-container)] rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-[var(--primary)] h-full rounded-full transition-all duration-1000"
                    style={{ width: `${lesson.user_progress.progress || 0}%` }}
                  ></div>
                </div>
              </div>
            )}

            {!lesson.user_progress && (
              <div className="mt-auto pt-4">
                <span className="text-sm font-medium text-[var(--primary)] flex items-center gap-1">
                  {t('student.startNow')}
                  <FaChevronRight className="w-3 h-3" />
                </span>
              </div>
            )}
          </Link>
        ))}
      </div>

      {lessons.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-bold text-[var(--on-surface)]">{t('student.noLessons')}</h3>
          <p className="text-[var(--on-surface-variant)]">{t('student.comingSoon')}</p>
        </div>
      )}
    </div>
  );
};

export default LessonList;
