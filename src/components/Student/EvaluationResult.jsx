import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { evaluationsApi } from '../../api/evaluations';
import { FaCheckCircle, FaTimesCircle, FaClock, FaArrowLeft, FaDownload } from 'react-icons/fa';
import { formatDate, formatDateTime } from '../../utils/helpers';
import Loading from '../Common/Loading';
import toast from 'react-hot-toast';

const EvaluationResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [id]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      // Obtener resultados
      const resultsRes = await evaluationsApi.getResults(id);
      const results = resultsRes.data.data || [];
      
      // Tomar el último resultado completado
      const lastResult = results.find(r => r.status === 'completed');
      if (lastResult) {
        setResult(lastResult);
        // Obtener detalles de la evaluación
        const evalRes = await evaluationsApi.getEvaluation(id);
        setEvaluation(evalRes.data.data);
      } else {
        toast.error('No se encontraron resultados para esta evaluación');
        navigate('/evaluations');
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Error al cargar los resultados');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score) => {
    if (score >= 8) return '¡Excelente trabajo! 🎉';
    if (score >= 6) return 'Buen trabajo, sigue así 💪';
    if (score >= 4) return 'Puedes mejorar, sigue practicando 📚';
    return 'Necesitas reforzar estos temas 🤔';
  };

  if (loading) return <Loading />;
  if (!result || !evaluation) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/evaluations')}
        className="flex items-center gap-2 text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors"
      >
        <FaArrowLeft className="w-4 h-4" />
        Volver a evaluaciones
      </button>

      {/* Header */}
      <div className="bg-[var(--surface)] rounded-2xl p-8 shadow-sm border border-[var(--surface-container)]">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--on-surface)]">{evaluation.title}</h1>
            <p className="text-[var(--on-surface-variant)]">
              Completada el {formatDateTime(result.completed_at)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 border border-[var(--outline-variant)] rounded-xl text-sm font-medium hover:bg-[var(--surface-container-low)] transition-colors flex items-center gap-2">
              <FaDownload className="w-4 h-4" />
              Descargar PDF
            </button>
          </div>
        </div>
      </div>

      {/* Score Card */}
      <div className="bg-[var(--surface)] rounded-2xl p-8 shadow-sm border border-[var(--surface-container)]">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Score Circle */}
          <div className="relative w-40 h-40">
            <div className="w-full h-full rounded-full border-8 border-[var(--surface-container)] flex items-center justify-center">
              <div className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                {result.score.toFixed(1)}
                <span className="text-base text-[var(--on-surface-variant)]">/10</span>
              </div>
            </div>
            <svg className="absolute top-0 left-0 w-full h-full -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="72"
                fill="none"
                stroke="var(--surface-container)"
                strokeWidth="8"
              />
              <circle
                cx="80"
                cy="80"
                r="72"
                fill="none"
                stroke={result.score >= 8 ? '#22c55e' : result.score >= 6 ? '#eab308' : '#ef4444'}
                strokeWidth="8"
                strokeDasharray="452.16"
                strokeDashoffset={452.16 - (result.score / 10) * 452.16}
                className="transition-all duration-1000"
              />
            </svg>
          </div>

          {/* Stats */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold text-[var(--on-surface)] mb-2">
              {getScoreMessage(result.score)}
            </h3>
            <p className="text-[var(--on-surface-variant)] mb-4">
              Has superado el promedio del grupo por un 12%. ¡Sigue así!
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-[var(--surface-container-low)] rounded-xl">
                <p className="text-sm text-[var(--on-surface-variant)]">Correctas</p>
                <p className="text-xl font-bold text-[var(--secondary)]">
                  {result.correct_answers}/{result.total_questions}
                </p>
              </div>
              <div className="p-4 bg-[var(--surface-container-low)] rounded-xl">
                <p className="text-sm text-[var(--on-surface-variant)]">Tiempo</p>
                <p className="text-xl font-bold text-[var(--tertiary)]">
                  {Math.floor(result.time_taken / 60)}:{String(result.time_taken % 60).padStart(2, '0')}
                </p>
              </div>
              <div className="p-4 bg-[var(--surface-container-low)] rounded-xl">
                <p className="text-sm text-[var(--on-surface-variant)]">Intento</p>
                <p className="text-xl font-bold text-[var(--on-surface)]">
                  #{result.attempt_number}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Review */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-[var(--on-surface)]">Revisión de respuestas</h3>
        {result.student_answers && result.student_answers.map((answer, index) => (
          <div
            key={answer.id}
            className={`p-6 rounded-2xl border-l-4 ${
              answer.is_correct
                ? 'border-[var(--secondary)] bg-[var(--surface)]'
                : 'border-[var(--error)] bg-[var(--surface)]'
            } shadow-sm hover:shadow-md transition-all`}
          >
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                answer.is_correct ? 'bg-[var(--secondary)]' : 'bg-[var(--error)]'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-[var(--on-surface)]">
                    {answer.question?.question_text || 'Pregunta sin texto'}
                  </h4>
                  <span className={`flex items-center gap-1 text-sm font-bold ${
                    answer.is_correct ? 'text-[var(--secondary)]' : 'text-[var(--error)]'
                  }`}>
                    {answer.is_correct ? (
                      <FaCheckCircle className="w-4 h-4" />
                    ) : (
                      <FaTimesCircle className="w-4 h-4" />
                    )}
                    {answer.is_correct ? 'Correcto' : 'Incorrecto'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="p-3 bg-[var(--surface-container-low)] rounded-lg">
                    <p className="text-xs text-[var(--on-surface-variant)]">Tu respuesta</p>
                    <p className={`font-mono ${answer.is_correct ? 'text-[var(--secondary)]' : 'text-[var(--error)]'}`}>
                      {answer.answer || 'Sin respuesta'}
                    </p>
                  </div>
                  {!answer.is_correct && answer.question?.correct_answer && (
                    <div className="p-3 bg-[var(--secondary)]/10 rounded-lg border border-[var(--secondary)]/20">
                      <p className="text-xs text-[var(--on-surface-variant)]">Respuesta correcta</p>
                      <p className="font-mono text-[var(--secondary)]">
                        {answer.question.correct_answer}
                      </p>
                    </div>
                  )}
                </div>
                {answer.question?.explanation && (
                  <div className="mt-3 p-3 bg-[var(--surface-container-low)] rounded-lg">
                    <p className="text-xs text-[var(--on-surface-variant)]">💡 Explicación</p>
                    <p className="text-sm text-[var(--on-surface)]">
                      {answer.question.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Suggested Actions */}
      <div className="bg-[var(--primary)] p-8 rounded-2xl text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">Tu Próximo Paso</h3>
            <p className="text-blue-100">
              Basado en tus errores, te recomendamos repasar {result.score < 6 ? 'temas básicos' : 'conceptos avanzados'}
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-white text-[var(--primary)] font-bold rounded-xl hover:shadow-lg transition-all">
              Repasar temas
            </button>
            <Link
              to="/lessons"
              className="px-6 py-3 bg-[var(--primary)] border border-white/30 font-bold rounded-xl hover:bg-white/10 transition-all"
            >
              Ver guía de estudio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationResult;