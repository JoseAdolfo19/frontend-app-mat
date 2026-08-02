import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import useAntiCheat from '../../hooks/useAntiCheat';
import Loading from '../Common/Loading';
import toast from 'react-hot-toast';
import { FaChevronLeft, FaChevronRight, FaExclamationTriangle, FaCheck, FaTimes } from 'react-icons/fa';

const ExamPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);
  const isSubmittingRef = useRef(false);

  const { tabSwitchCount } = useAntiCheat(attempt?.id, !!attempt && !result);

  useEffect(() => {
    if (tabSwitchCount > 0) {
      setWarningMessage(t('exam.cheatingWarning'));
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 10000);
    }
  }, [tabSwitchCount, t]);

  const submitExam = useCallback(async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setSubmitting(true);
    try {
      const response = await api.post(`/exams/attempts/${attempt.id}/submit`);
      setResult(response.data.data || response.data);
      if (timerRef.current) clearInterval(timerRef.current);
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
      isSubmittingRef.current = false;
    } finally {
      setSubmitting(false);
    }
  }, [attempt, t]);

  useEffect(() => {
    const startExam = async () => {
      setLoading(true);
      try {
        const response = await api.post(`/exams/${id}/start`);
        const data = response.data.data || response.data;
        setExam(data.exam);
        setAttempt(data.attempt);
        setQuestions(data.questions || []);
        setAnswers({});
        if (data.attempt?.time_limit || data.exam?.time_limit) {
          const limit = data.attempt?.time_limit || data.exam.time_limit;
          const endAt = new Date(data.attempt.started_at).getTime() + limit * 60 * 1000;
          const remaining = Math.max(0, Math.floor((endAt - Date.now()) / 1000));
          setTimeLeft(remaining);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || t('common.error'));
        navigate('/exams');
      } finally {
        setLoading(false);
      }
    };
    startExam();
  }, [id, navigate, t]);

  useEffect(() => {
    if (timeLeft === null || result) return;
    if (timeLeft <= 0) {
      submitExam();
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft !== null && !result, submitExam, result]);

  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  if (loading) return <Loading />;

  if (result) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="bg-[var(--surface)] rounded-2xl p-8 shadow-sm border border-[var(--surface-container)] text-center">
          <div className="text-5xl mb-4">
            {result.score >= 11 ? '&#127881;' : '&#128221;'}
          </div>
          <h2 className="text-2xl font-bold text-[var(--on-surface)] mb-2">{t('exam.result')}</h2>
          <div className="text-6xl font-bold text-[var(--primary)] my-6">
            {result.score !== undefined ? result.score.toFixed(1) : '—'}
          </div>
          {result.passed !== undefined && (
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold mb-4 ${
              result.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {result.passed ? t('exam.passed') : t('exam.failed')}
            </span>
          )}
          <div className="grid grid-cols-2 gap-4 mt-6 text-left">
            {result.correct_answers !== undefined && (
              <div className="bg-green-50 p-4 rounded-xl">
                <p className="text-sm text-green-600">{t('exam.correctAnswers')}</p>
                <p className="text-2xl font-bold text-green-700">{result.correct_answers}</p>
              </div>
            )}
            {result.incorrect_answers !== undefined && (
              <div className="bg-red-50 p-4 rounded-xl">
                <p className="text-sm text-red-600">{t('exam.incorrectAnswers')}</p>
                <p className="text-2xl font-bold text-red-700">{result.incorrect_answers}</p>
              </div>
            )}
          </div>
        </div>

        {result.questions && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[var(--on-surface)]">{t('evaluations.result.questionReview')}</h3>
            {result.questions.map((q, i) => (
              <div key={q.id || i} className="bg-[var(--surface)] rounded-xl p-5 border border-[var(--surface-container)]">
                <p className="font-medium text-[var(--on-surface)] mb-2">
                  {t('exam.question')} {i + 1}: {q.question_text}
                </p>
                <div className="flex items-center gap-2 mb-2">
                  {q.is_correct ? (
                    <FaCheck className="text-green-500" />
                  ) : (
                    <FaTimes className="text-red-500" />
                  )}
                  <span className="text-sm text-[var(--on-surface-variant)]">
                    {t('evaluations.result.correctAnswer')}: {q.correct_answer}
                  </span>
                </div>
                {q.explanation && (
                  <p className="text-sm text-[var(--on-surface-variant)] bg-[var(--surface-container-low)] p-3 rounded-lg">
                    {t('evaluations.result.explanation')}: {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={() => navigate('/exams')}
            className="px-8 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all"
          >
            {t('evaluations.result.back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {showWarning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-pulse">
          <FaExclamationTriangle className="w-6 h-6 flex-shrink-0" />
          <p className="font-bold text-sm">{warningMessage}</p>
        </div>
      )}

      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[var(--surface)] rounded-2xl p-8 max-w-md mx-4 shadow-xl border border-[var(--surface-container)]">
            <h3 className="text-lg font-bold text-[var(--on-surface)] mb-2">{t('exam.submitExam')}</h3>
            <p className="text-[var(--on-surface-variant)] mb-6">{t('exam.confirmSubmit')}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="px-4 py-2 bg-[var(--surface-container)] text-[var(--on-surface)] font-bold rounded-xl hover:bg-[var(--surface-container-high)] transition-all"
              >
                {t('exam.cancelExam')}
              </button>
              <button
                onClick={() => { setShowConfirmSubmit(false); submitExam(); }}
                disabled={submitting}
                className="px-4 py-2 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
              >
                {submitting ? t('common.loading') : t('exam.submitExam')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[var(--surface)] rounded-2xl p-4 shadow-sm border border-[var(--surface-container)] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-[var(--on-surface)]">{exam?.title || t('exam.title')}</h1>
          <p className="text-sm text-[var(--on-surface-variant)]">
            {t('exam.question')} {currentIndex + 1} {t('exam.of')} {totalQuestions}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--on-surface-variant)]">
            {answeredCount}/{totalQuestions}
          </span>
          {timeLeft !== null && (
            <div className={`font-mono text-lg font-bold px-4 py-2 rounded-xl ${
              timeLeft <= 300 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-[var(--surface-container)] text-[var(--on-surface)]'
            }`}>
              {formatTime(timeLeft)}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {questions.map((q, i) => (
          <button
            key={q.id || i}
            onClick={() => setCurrentIndex(i)}
            className={`min-w-[40px] h-10 rounded-lg text-sm font-bold transition-all ${
              i === currentIndex
                ? 'bg-[var(--primary)] text-white'
                : answers[q.id] !== undefined
                ? 'bg-green-100 text-green-700'
                : 'bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)]'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {currentQuestion && (
        <div className="bg-[var(--surface)] rounded-2xl p-6 md:p-8 shadow-sm border border-[var(--surface-container)]">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full text-sm font-bold">
              {currentQuestion.points} pts
            </span>
            <span className="text-sm text-[var(--on-surface-variant)] capitalize">
              {currentQuestion.type === 'true_false' ? t('exam.trueFalse') : t('exam.multipleChoice')}
            </span>
          </div>
          <p className="text-lg font-medium text-[var(--on-surface)] mb-6">
            {currentQuestion.question_text}
          </p>

          {currentQuestion.type === 'true_false' ? (
            <div className="space-y-3">
              {[t('exam.trueFalse').includes('Verdadero') ? 'true' : 'true', 'false'].map((val) => (
                <button
                  key={val}
                  onClick={() => handleAnswer(currentQuestion.id, val)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium ${
                    answers[currentQuestion.id] === val
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                      : 'border-[var(--outline-variant)] hover:border-[var(--primary)]/50 text-[var(--on-surface)]'
                  }`}
                >
                  {val === 'true' ? 'Verdadero / Ritiy' : 'Falso /Mana riti'}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {(currentQuestion.options || []).map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(currentQuestion.id, opt)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium ${
                    answers[currentQuestion.id] === opt
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                      : 'border-[var(--outline-variant)] hover:border-[var(--primary)]/50 text-[var(--on-surface)]'
                  }`}
                >
                  <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-3 bg-[var(--surface)] text-[var(--on-surface)] font-bold rounded-xl border border-[var(--surface-container)] hover:bg-[var(--surface-container)] transition-all disabled:opacity-40"
        >
          <FaChevronLeft /> {t('exam.previous')}
        </button>
        {currentIndex === totalQuestions - 1 ? (
          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all"
          >
            {t('exam.submitExam')}
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))}
            className="flex items-center gap-2 px-4 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all"
          >
            {t('exam.next')} <FaChevronRight />
          </button>
        )}
      </div>
    </div>
  );
};

export default ExamPlayer;
