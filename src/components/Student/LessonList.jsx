import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { lessonsApi } from '../../api/lessons';
import { FaSearch, FaFilter, FaBook, FaClock, FaChevronRight } from 'react-icons/fa';
import { getDifficultyColor, formatDate, calculateProgress } from '../../utils/helpers';
import Loading from '../Common/Loading';

const LessonList = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    difficulty: '',
    unit: ''
  });
  const [units, setUnits] = useState([]);

  useEffect(() => {
    fetchLessons();
  }, [filters]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const response = await lessonsApi.getLessons(filters);
      setLessons(response.data.data || []);
      
      // Extraer unidades únicas
      const uniqueUnits = [...new Set(response.data.data?.map(l => l.unit).filter(Boolean))];
      setUnits(uniqueUnits);
    } catch (error) {
      console.error('Error fetching lessons:', error);
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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[var(--on-surface)]">Biblioteca de Lecciones</h2>
          <p className="text-[var(--on-surface-variant)]">
            Explora y aprende con nuestras lecciones interactivas
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--surface-container)]">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--outline)]" />
            <input
              type="text"
              placeholder="Buscar lecciones..."
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
            <option value="">Todas las dificultades</option>
            <option value="basic">Básico</option>
            <option value="intermediate">Intermedio</option>
            <option value="advanced">Avanzado</option>
          </select>
          <select
            value={filters.unit}
            onChange={(e) => handleFilterChange('unit', e.target.value)}
            className="px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)] min-w-[150px]"
          >
            <option value="">Todas las unidades</option>
            {units.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
          <button className="px-6 py-3 bg-[var(--surface-container-high)] rounded-xl hover:bg-[var(--surface-container-highest)] transition-colors">
            <FaFilter />
          </button>
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson) => (
          <Link
            key={lesson.id}
            to={`/lessons/${lesson.id}`}
            className="bg-[var(--surface)] rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-[var(--surface-container)] hover:border-[var(--primary)]/20 group flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getDifficultyColor(lesson.difficulty)}`}>
                {lesson.difficulty === 'basic' ? 'Básico' : 
                 lesson.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
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
              {lesson.description || 'Sin descripción'}
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

            {/* Progreso */}
            {lesson.user_progress && (
              <div className="mt-auto space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--on-surface-variant)]">Progreso</span>
                  <span className="font-bold text-[var(--on-surface)]">
                    {lesson.user_progress.progress || 0}%
                  </span>
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
                  Empezar ahora
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
          <h3 className="text-xl font-bold text-[var(--on-surface)]">No hay lecciones disponibles</h3>
          <p className="text-[var(--on-surface-variant)]">
            Pronto se agregarán nuevas lecciones
          </p>
        </div>
      )}
    </div>
  );
};

export default LessonList;