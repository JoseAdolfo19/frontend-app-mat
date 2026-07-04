import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { evaluationsApi } from '../../api/evaluations';
import { lessonsApi } from '../../api/lessons';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { FaSave, FaTimes, FaPlus, FaTrash, FaCopy } from 'react-icons/fa';
import Loading from '../Common/Loading';

const questionSchema = yup.object().shape({
  type: yup.string().required(),
  question_text: yup.string().required('El texto de la pregunta es requerido'),
  options: yup.array().when('type', {
    is: 'multiple_choice',
    then: () => yup.array().min(2, 'Mínimo 2 opciones').of(
      yup.object().shape({
        label: yup.string().required(),
        value: yup.string().required()
      })
    )
  }),
  correct_answer: yup.string().required('La respuesta correcta es requerida'),
  explanation: yup.string().nullable(),
  points: yup.number().min(1, 'Mínimo 1 punto')
});

const schema = yup.object().shape({
  title: yup.string().required('El título es requerido'),
  description: yup.string().nullable(),
  lesson_id: yup.string().nullable(),
  type: yup.string().required('El tipo es requerido'),
  difficulty: yup.string().required('La dificultad es requerida'),
  time_limit: yup.number().min(1, 'Mínimo 1 minuto'),
  due_date: yup.string().nullable(),
  max_attempts: yup.number().min(1, 'Mínimo 1 intento'),
  questions: yup.array().of(questionSchema)
});

const EvaluationCreator = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lessons, setLessons] = useState([]);

  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      lesson_id: '',
      type: 'quiz',
      difficulty: 'basic',
      time_limit: 30,
      due_date: '',
      max_attempts: 1,
      questions: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions'
  });

  useEffect(() => {
    fetchLessons();
    if (id) {
      fetchEvaluation();
    }
  }, [id]);

  const fetchLessons = async () => {
    try {
      const response = await lessonsApi.getLessons({ limit: 100 });
      setLessons(response.data.data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const fetchEvaluation = async () => {
    try {
      setLoading(true);
      const response = await evaluationsApi.getEvaluation(id);
      const evaluation = response.data.data;
      
      setValue('title', evaluation.title);
      setValue('description', evaluation.description || '');
      setValue('lesson_id', evaluation.lesson_id || '');
      setValue('type', evaluation.type);
      setValue('difficulty', evaluation.difficulty);
      setValue('time_limit', evaluation.time_limit || 30);
      setValue('due_date', evaluation.due_date || '');
      setValue('max_attempts', evaluation.max_attempts || 1);
      setValue('questions', evaluation.questions || []);
    } catch (error) {
      console.error('Error fetching evaluation:', error);
      toast.error('Error al cargar la evaluación');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      if (id) {
        await evaluationsApi.updateEvaluation(id, data);
        toast.success('Evaluación actualizada exitosamente');
      } else {
        await evaluationsApi.createEvaluation(data);
        toast.success('Evaluación creada exitosamente');
      }
      navigate('/evaluations');
    } catch (error) {
      console.error('Error saving evaluation:', error);
      toast.error(error.response?.data?.message || 'Error al guardar la evaluación');
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = () => {
    append({
      type: 'multiple_choice',
      question_text: '',
      options: [
        { label: 'A', value: '' },
        { label: 'B', value: '' }
      ],
      correct_answer: '',
      explanation: '',
      points: 1
    });
  };

  const duplicateQuestion = (index) => {
    const questions = watch('questions');
    const questionToDuplicate = questions[index];
    append({
      ...questionToDuplicate,
      question_text: questionToDuplicate.question_text + ' (Copia)'
    });
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--on-surface)]">
          {id ? 'Editar Evaluación' : 'Nueva Evaluación'}
        </h2>
        <button
          onClick={() => navigate('/evaluations')}
          className="px-4 py-2 text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] rounded-xl transition-colors"
        >
          Cancelar
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--surface-container)]">
          <h3 className="text-lg font-bold text-[var(--on-surface)] mb-4">Información Básica</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                Título *
              </label>
              <input
                type="text"
                {...register('title')}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
                placeholder="Título de la evaluación"
              />
              {errors.title && (
                <p className="text-sm text-[var(--error)] mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                Tipo *
              </label>
              <select
                {...register('type')}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
              >
                <option value="exam">Examen</option>
                <option value="quiz">Quiz</option>
                <option value="homework">Tarea</option>
                <option value="practice">Práctica</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                Dificultad *
              </label>
              <select
                {...register('difficulty')}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
              >
                <option value="basic">Básico</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                Lección asociada
              </label>
              <select
                {...register('lesson_id')}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
              >
                <option value="">Ninguna</option>
                {lessons.map(lesson => (
                  <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                Tiempo límite (minutos)
              </label>
              <input
                type="number"
                {...register('time_limit')}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
                placeholder="30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                Fecha de entrega
              </label>
              <input
                type="datetime-local"
                {...register('due_date')}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                Intentos máximos
              </label>
              <input
                type="number"
                {...register('max_attempts')}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
                placeholder="1"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
              Descripción
            </label>
            <textarea
              {...register('description')}
              rows="2"
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)] resize-none"
              placeholder="Descripción de la evaluación"
            />
          </div>
        </div>

        {/* Questions */}
        <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--surface-container)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-[var(--on-surface)]">
              Preguntas ({fields.length})
            </h3>
            <button
              type="button"
              onClick={addQuestion}
              className="px-4 py-2 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 transition-all flex items-center gap-2"
            >
              <FaPlus />
              Agregar pregunta
            </button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="mb-6 p-4 bg-[var(--surface-container-low)] rounded-xl border border-[var(--surface-container)]">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-bold text-[var(--on-surface)]">
                  Pregunta {index + 1}
                </h4>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => duplicateQuestion(index)}
                    className="text-[var(--primary)] hover:bg-[var(--primary)]/10 p-2 rounded-lg transition-colors"
                  >
                    <FaCopy />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-[var(--error)] hover:bg-[var(--error)]/10 p-2 rounded-lg transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                    Tipo
                  </label>
                  <select
                    {...register(`questions.${index}.type`)}
                    className="w-full px-4 py-2 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-white"
                  >
                    <option value="multiple_choice">Opción múltiple</option>
                    <option value="fill_blank">Completar</option>
                    <option value="formula">Fórmula</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                    Puntos
                  </label>
                  <input
                    type="number"
                    {...register(`questions.${index}.points`)}
                    className="w-full px-4 py-2 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-white"
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                  Texto de la pregunta *
                </label>
                <input
                  type="text"
                  {...register(`questions.${index}.question_text`)}
                  className="w-full px-4 py-2 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-white"
                  placeholder="Escribe la pregunta"
                />
              </div>

              {/* Opciones para preguntas de opción múltiple */}
              {watch(`questions.${index}.type`) === 'multiple_choice' && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                    Opciones
                  </label>
                  {watch(`questions.${index}.options`)?.map((option, optIndex) => (
                    <div key={optIndex} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        {...register(`questions.${index}.options.${optIndex}.value`)}
                        className="flex-1 px-4 py-2 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-white"
                        placeholder={`Opción ${String.fromCharCode(65 + optIndex)}`}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const options = watch(`questions.${index}.options`) || [];
                      setValue(`questions.${index}.options`, [
                        ...options,
                        { label: String.fromCharCode(65 + options.length), value: '' }
                      ]);
                    }}
                    className="text-sm text-[var(--primary)] hover:underline"
                  >
                    + Agregar opción
                  </button>
                </div>
              )}

              <div className="mt-3">
                <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                  Respuesta correcta *
                </label>
                <input
                  type="text"
                  {...register(`questions.${index}.correct_answer`)}
                  className="w-full px-4 py-2 rounded-xl border-2 border-[var(--secondary)] focus:border-[var(--primary)] focus:outline-none bg-white"
                  placeholder="Respuesta correcta"
                />
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                  Explicación (opcional)
                </label>
                <textarea
                  {...register(`questions.${index}.explanation`)}
                  rows="2"
                  className="w-full px-4 py-2 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-white resize-none"
                  placeholder="Explicación de la respuesta"
                />
              </div>
            </div>
          ))}

          {fields.length === 0 && (
            <div className="text-center py-8">
              <p className="text-[var(--on-surface-variant)]">No hay preguntas agregadas</p>
              <button
                type="button"
                onClick={addQuestion}
                className="mt-2 text-[var(--primary)] font-bold hover:underline"
              >
                Agregar primera pregunta
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <FaSave />
            {saving ? 'Guardando...' : id ? 'Actualizar Evaluación' : 'Crear Evaluación'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/evaluations')}
            className="px-6 py-3 bg-[var(--surface-container)] text-[var(--on-surface)] font-bold rounded-xl hover:bg-[var(--surface-container-high)] transition-all"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EvaluationCreator;