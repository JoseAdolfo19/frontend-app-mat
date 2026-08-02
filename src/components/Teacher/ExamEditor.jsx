import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useLanguage } from '../../contexts/LanguageContext';
import Loading from '../Common/Loading';
import toast from 'react-hot-toast';
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const emptyQuestion = () => ({
  id: Date.now(),
  type: 'multiple_choice',
  question_text: '',
  options: ['', '', '', ''],
  correct_answer: '',
  points: 1,
  explanation: '',
});

const ExamEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    unit: '',
    difficulty: 'basic',
    time_limit: '',
    max_attempts: 1,
    auto_correct: true,
    randomize_questions: false,
  });
  const [questions, setQuestions] = useState([emptyQuestion()]);

  useEffect(() => {
    if (!isEdit) return;
    const loadExam = async () => {
      try {
        const response = await api.get(`/exams/${id}`);
        const data = response.data.data || response.data;
        setForm({
          title: data.title || '',
          description: data.description || '',
          unit: data.unit || '',
          difficulty: data.difficulty || 'basic',
          time_limit: data.time_limit || '',
          max_attempts: data.max_attempts || 1,
          auto_correct: data.auto_correct !== false,
          randomize_questions: data.randomize_questions || false,
        });
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions.map((q) => ({
            ...q,
            id: q.id || Date.now() + Math.random(),
            options: q.options || ['', '', '', ''],
          })));
        }
      } catch (err) {
        toast.error(t('exam.loadError') || t('common.error'));
        navigate('/teacher/exams');
      } finally {
        setLoading(false);
      }
    };
    loadExam();
  }, [id, isEdit, navigate, t]);

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  };

  const removeQuestion = (index) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const moveQuestion = (index, direction) => {
    const newQ = [...questions];
    const swap = index + direction;
    if (swap < 0 || swap >= newQ.length) return;
    [newQ[index], newQ[swap]] = [newQ[swap], newQ[index]];
    setQuestions(newQ);
  };

  const updateQuestion = (index, field, value) => {
    setQuestions((prev) => prev.map((q, i) => i === index ? { ...q, [field]: value } : q));
  };

  const updateOption = (qIndex, oIndex, value) => {
    setQuestions((prev) => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const newOpts = [...(q.options || [])];
      newOpts[oIndex] = value;
      return { ...q, options: newOpts };
    }));
  };

  const addOption = (qIndex) => {
    setQuestions((prev) => prev.map((q, i) => {
      if (i !== qIndex) return q;
      return { ...q, options: [...(q.options || []), ''] };
    }));
  };

  const removeOption = (qIndex, oIndex) => {
    setQuestions((prev) => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const newOpts = (q.options || []).filter((_, oi) => oi !== oIndex);
      return { ...q, options: newOpts };
    }));
  };

  const handleSave = async (activate = false) => {
    if (!form.title.trim()) {
      toast.error(t('exam.titleRequired') || 'Title is required');
      return;
    }
    if (questions.some((q) => !q.question_text.trim())) {
      toast.error(t('exam.questionTextRequired') || 'All questions need text');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        time_limit: form.time_limit ? Number(form.time_limit) : null,
        max_attempts: Number(form.max_attempts) || 1,
        status: activate ? 'active' : 'draft',
        questions: questions.map((q, i) => ({
          type: q.type,
          question_text: q.question_text,
          options: q.type === 'true_false' ? ['Verdadero', 'Falso'] : q.options.filter((o) => o.trim()),
          correct_answer: q.correct_answer,
          points: Number(q.points) || 1,
          explanation: q.explanation || '',
          order: i + 1,
        })),
      };

      if (isEdit) {
        await api.put(`/exams/${id}`, payload);
      } else {
        await api.post('/exams/', payload);
      }
      toast.success(t('exam.saveSuccess') || t('common.success'));
      navigate('/teacher/exams');
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold text-[var(--on-surface)]">
        {isEdit ? t('exam.editExam') : t('exam.createExam')}
      </h1>

      <div className="bg-[var(--surface)] rounded-2xl p-6 shadow-sm border border-[var(--surface-container)] space-y-4">
        <h2 className="font-bold text-[var(--on-surface)]">{t('teacher.evaluationCreator.basicInfo')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[var(--on-surface-variant)] mb-1">{t('exam.examTitle')}</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleFormChange('title', e.target.value)}
              className="w-full p-3 bg-[var(--surface-container-low)] border border-[var(--outline-variant)] rounded-xl text-[var(--on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[var(--on-surface-variant)] mb-1">{t('exam.unit')}</label>
            <input
              type="text"
              value={form.unit}
              onChange={(e) => handleFormChange('unit', e.target.value)}
              className="w-full p-3 bg-[var(--surface-container-low)] border border-[var(--outline-variant)] rounded-xl text-[var(--on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-[var(--on-surface-variant)] mb-1">{t('exam.examDescription')}</label>
            <textarea
              value={form.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              rows={3}
              className="w-full p-3 bg-[var(--surface-container-low)] border border-[var(--outline-variant)] rounded-xl text-[var(--on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[var(--on-surface-variant)] mb-1">{t('exam.difficulty')}</label>
            <select
              value={form.difficulty}
              onChange={(e) => handleFormChange('difficulty', e.target.value)}
              className="w-full p-3 bg-[var(--surface-container-low)] border border-[var(--outline-variant)] rounded-xl text-[var(--on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="basic">{t('lessons.basic')}</option>
              <option value="intermediate">{t('lessons.intermediate')}</option>
              <option value="advanced">{t('lessons.advanced')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-[var(--on-surface-variant)] mb-1">{t('exam.timeLimit')}</label>
            <input
              type="number"
              min="1"
              value={form.time_limit}
              onChange={(e) => handleFormChange('time_limit', e.target.value)}
              className="w-full p-3 bg-[var(--surface-container-low)] border border-[var(--outline-variant)] rounded-xl text-[var(--on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[var(--on-surface-variant)] mb-1">{t('exam.maxAttempts')}</label>
            <input
              type="number"
              min="1"
              value={form.max_attempts}
              onChange={(e) => handleFormChange('max_attempts', e.target.value)}
              className="w-full p-3 bg-[var(--surface-container-low)] border border-[var(--outline-variant)] rounded-xl text-[var(--on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.auto_correct}
                onChange={(e) => handleFormChange('auto_correct', e.target.checked)}
                className="w-4 h-4 accent-[var(--primary)]"
              />
              <span className="text-sm font-bold text-[var(--on-surface-variant)]">{t('exam.autoCorrect')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.randomize_questions}
                onChange={(e) => handleFormChange('randomize_questions', e.target.checked)}
                className="w-4 h-4 accent-[var(--primary)]"
              />
              <span className="text-sm font-bold text-[var(--on-surface-variant)]">{t('exam.randomQuestions')}</span>
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-[var(--on-surface)]">{t('exam.questions')}</h2>
          <button
            onClick={addQuestion}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)]/10 text-[var(--primary)] font-bold rounded-xl hover:bg-[var(--primary)]/20 transition-all text-sm"
          >
            <FaPlus className="w-3 h-3" /> {t('exam.addQuestion')}
          </button>
        </div>

        {questions.map((q, qIndex) => (
          <div
            key={q.id}
            className="bg-[var(--surface)] rounded-2xl p-6 shadow-sm border border-[var(--surface-container)] space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-[var(--on-surface)]">{t('evaluations.result.questionReview')} {qIndex + 1}</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => moveQuestion(qIndex, -1)} disabled={qIndex === 0} className="p-1 text-[var(--on-surface-variant)] hover:text-[var(--primary)] disabled:opacity-30"><FaArrowUp /></button>
                <button onClick={() => moveQuestion(qIndex, 1)} disabled={qIndex === questions.length - 1} className="p-1 text-[var(--on-surface-variant)] hover:text-[var(--primary)] disabled:opacity-30"><FaArrowDown /></button>
                <button onClick={() => removeQuestion(qIndex)} disabled={questions.length <= 1} className="p-1 text-red-500 hover:bg-red-50 rounded disabled:opacity-30"><FaTrash /></button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-[var(--on-surface-variant)] mb-1">{t('exam.type')}</label>
                <select
                  value={q.type}
                  onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                  className="w-full p-3 bg-[var(--surface-container-low)] border border-[var(--outline-variant)] rounded-xl text-[var(--on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="multiple_choice">{t('exam.multipleChoice')}</option>
                  <option value="true_false">{t('exam.trueFalse')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--on-surface-variant)] mb-1">{t('exam.points')}</label>
                <input
                  type="number"
                  min="1"
                  value={q.points}
                  onChange={(e) => updateQuestion(qIndex, 'points', e.target.value)}
                  className="w-full p-3 bg-[var(--surface-container-low)] border border-[var(--outline-variant)] rounded-xl text-[var(--on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--on-surface-variant)] mb-1">{t('exam.questionText')}</label>
              <input
                type="text"
                value={q.question_text}
                onChange={(e) => updateQuestion(qIndex, 'question_text', e.target.value)}
                className="w-full p-3 bg-[var(--surface-container-low)] border border-[var(--outline-variant)] rounded-xl text-[var(--on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>

            {q.type === 'multiple_choice' && (
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[var(--on-surface-variant)]">{t('exam.options')}</label>
                {(q.options || []).map((opt, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                      placeholder={`${String.fromCharCode(65 + oIndex)}.`}
                      className="flex-1 p-3 bg-[var(--surface-container-low)] border border-[var(--outline-variant)] rounded-xl text-[var(--on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                    {(q.options || []).length > 2 && (
                      <button onClick={() => removeOption(qIndex, oIndex)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><FaTrash className="w-3 h-3" /></button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addOption(qIndex)}
                  className="text-sm text-[var(--primary)] font-bold hover:underline"
                >
                  + {t('teacher.evaluationCreator.addOption')}
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[var(--on-surface-variant)] mb-1">{t('exam.correctAnswer')}</label>
                {q.type === 'true_false' ? (
                  <select
                    value={q.correct_answer}
                    onChange={(e) => updateQuestion(qIndex, 'correct_answer', e.target.value)}
                    className="w-full p-3 bg-[var(--surface-container-low)] border border-[var(--outline-variant)] rounded-xl text-[var(--on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <option value="">--</option>
                    <option value="Verdadero">Verdadero</option>
                    <option value="Falso">Falso</option>
                  </select>
                ) : (
                  <select
                    value={q.correct_answer}
                    onChange={(e) => updateQuestion(qIndex, 'correct_answer', e.target.value)}
                    className="w-full p-3 bg-[var(--surface-container-low)] border border-[var(--outline-variant)] rounded-xl text-[var(--on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <option value="">--</option>
                    {(q.options || []).filter((o) => o.trim()).map((opt, i) => (
                      <option key={i} value={opt}>{String.fromCharCode(65 + i)}. {opt}</option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--on-surface-variant)] mb-1">{t('teacher.evaluationCreator.explanationOptional')}</label>
                <input
                  type="text"
                  value={q.explanation}
                  onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                  className="w-full p-3 bg-[var(--surface-container-low)] border border-[var(--outline-variant)] rounded-xl text-[var(--on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 sticky bottom-20 bg-[var(--background)] py-4">
        <button
          onClick={() => navigate('/teacher/exams')}
          className="px-6 py-3 bg-[var(--surface-container)] text-[var(--on-surface)] font-bold rounded-xl hover:bg-[var(--surface-container-high)] transition-all"
        >
          {t('common.cancel')}
        </button>
        <button
          onClick={() => handleSave(false)}
          disabled={saving}
          className="px-6 py-3 bg-[var(--surface)] text-[var(--on-surface)] font-bold rounded-xl border border-[var(--outline-variant)] hover:bg-[var(--surface-container)] transition-all disabled:opacity-50"
        >
          {saving ? t('common.loading') : t('exam.saveDraft')}
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={saving}
          className="px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
        >
          {saving ? t('common.loading') : t('exam.saveAndActivate')}
        </button>
      </div>
    </div>
  );
};

export default ExamEditor;
