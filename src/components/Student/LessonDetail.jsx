import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lessonsApi } from '../../api/lessons';
import { FaArrowLeft, FaArrowRight, FaClock, FaUser, FaTag } from 'react-icons/fa';
import { formatDate, getDifficultyColor } from '../../utils/helpers';
import Loading from '../Common/Loading';
import toast from 'react-hot-toast';

const LessonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchLesson();
  }, [id]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const response = await lessonsApi.getLesson(id);
      setLesson(response.data.data);
      if (response.data.data.user_progress) {
        setProgress(response.data.data.user_progress.progress || 0);
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
      toast.error('Error al cargar la lección');
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (newProgress) => {
    try {
      setIsUpdating(true);
      await lessonsApi.updateProgress(id, { 
        progress: newProgress,
        time_spent: 5 // Simular 5 minutos
      });
      setProgress(newProgress);
      if (newProgress >= 100) {
        toast.success('🎉 ¡Lección completada!');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Error al actualizar el progreso');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <Loading />;
  if (!lesson) return (
    <div className="text-center py-12">
      <h3 className="text-xl font-bold text-[var(--on-surface)]">Lección no encontrada</h3>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Navigation */}
      <button
        onClick={() => navigate('/lessons')}
        className="flex items-center gap-2 text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors"
      >
        <FaArrowLeft className="w-4 h-4" />
        Volver a lecciones
      </button>

      {/* Header */}
      <div className="bg-[var(--surface)] rounded-2xl p-8 shadow-sm border border-[var(--surface-container)]">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(lesson.difficulty)}`}>
                {lesson.difficulty === 'basic' ? 'Básico' : 
                 lesson.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
              </span>
              {lesson.unit && (
                <span className="text-xs text-[var(--on-surface-variant)] bg-[var(--surface-container-low)] px-2 py-1 rounded">
                  📚 {lesson.unit}
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
              {lesson.estimated_time} min aprox.
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--on-surface-variant)]">Progreso</span>
            <span className="font-bold text-[var(--on-surface)]">{progress}%</span>
          </div>
          <div className="w-full bg-[var(--surface-container)] rounded-full h-3 overflow-hidden">
            <div 
              className="bg-[var(--primary)] h-full rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-[var(--on-surface-variant)]">
            <span>No iniciado</span>
            <span>Completado</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-[var(--surface)] rounded-2xl p-8 shadow-sm border border-[var(--surface-container)] prose prose-sm max-w-none">
        <div className="prose-headings:text-[var(--on-surface)] prose-p:text-[var(--on-surface-variant)] prose-strong:text-[var(--on-surface)]">
          <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
        </div>
      </div>

      {/* Resources */}
      {lesson.resources && lesson.resources.length > 0 && (
        <div className="bg-[var(--surface)] rounded-2xl p-8 shadow-sm border border-[var(--surface-container)]">
          <h3 className="text-xl font-bold text-[var(--on-surface)] mb-4">Recursos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lesson.resources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-[var(--surface-container-low)] rounded-xl hover:bg-[var(--surface-container)] transition-colors"
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

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-[var(--surface-container)]">
        <button className="px-6 py-3 text-[var(--on-surface-variant)] font-bold hover:bg-[var(--surface-container)] rounded-xl transition-all">
          Lección anterior
        </button>
        <div className="flex gap-3">
          {progress < 100 && (
            <button
              onClick={() => updateProgress(Math.min(progress + 20, 100))}
              disabled={isUpdating}
              className="px-8 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isUpdating ? 'Actualizando...' : 'Marcar como completada'}
              <FaArrowRight className="w-4 h-4" />
            </button>
          )}
          {progress >= 100 && (
            <Link
              to="/evaluations"
              className="px-8 py-3 bg-[var(--secondary)] text-white font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-2"
            >
              Ir a evaluaciones
              <FaArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonDetail;