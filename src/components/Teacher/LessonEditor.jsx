import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lessonsApi } from '../../api/lessons';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FaSave, FaTimes, FaPlus, FaTrash, FaUpload } from 'react-icons/fa';
import Loading from '../Common/Loading';
import { useLanguage } from '../../contexts/LanguageContext';

const LessonEditor = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const schema = yup.object().shape({
    title: yup.string().required(t('teacher.lessonEditor.title') + ' *'),
    description: yup.string().nullable(),
    content: yup.string().required(t('teacher.lessonEditor.content') + ' *'),
    unit: yup.string().nullable(),
    topic: yup.string().nullable(),
    difficulty: yup.string().required(t('teacher.lessonEditor.difficulty') + ' *'),
    tags: yup.array().of(yup.string()),
    estimated_time: yup.number().min(1, 'Min 1'),
    resources: yup.array().of(
      yup.object().shape({
        type: yup.string().required(),
        url: yup.string().url().required(),
        title: yup.string().required()
      })
    )
  });

  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      content: '',
      unit: '',
      topic: '',
      difficulty: 'basic',
      tags: [],
      estimated_time: 45,
      resources: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'resources'
  });

  const tags = watch('tags') || [];

  useEffect(() => {
    if (id) {
      fetchLesson();
    }
  }, [id]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const response = await lessonsApi.getLesson(id);
      const lesson = response.data?.data;

      if (!lesson) {
        toast.error(t('teacher.lessonEditor.notFound'));
        navigate('/lessons');
        return;
      }

      setValue('title', lesson.title);
      setValue('description', lesson.description || '');
      setValue('content', lesson.content);
      setValue('unit', lesson.unit || '');
      setValue('topic', lesson.topic || '');
      setValue('difficulty', lesson.difficulty);
      setValue('tags', Array.isArray(lesson.tags) ? lesson.tags : []);
      setValue('estimated_time', lesson.estimated_time || 45);
      setValue('resources', Array.isArray(lesson.resources) ? lesson.resources : []);
    } catch (error) {
      toast.error(t('teacher.lessonEditor.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      if (id) {
        await lessonsApi.updateLesson(id, data);
        toast.success(t('teacher.lessonEditor.saveSuccess'));
      } else {
        await lessonsApi.createLesson(data);
        toast.success(t('teacher.lessonEditor.saveSuccess'));
      }
      navigate('/lessons');
    } catch (error) {
      toast.error(error.response?.data?.message || t('teacher.lessonEditor.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setValue('tags', [...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setValue('tags', tags.filter(tag => tag !== tagToRemove));
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--on-surface)]">
          {id ? t('teacher.lessonEditor.editLesson') : t('teacher.lessonEditor.newLesson')}
        </h2>
        <button
          onClick={() => navigate('/lessons')}
          className="px-4 py-2 text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] rounded-xl transition-colors"
        >
          {t('teacher.lessonEditor.cancel')}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--surface-container)]">
          <h3 className="text-lg font-bold text-[var(--on-surface)] mb-4">{t('teacher.lessonEditor.basicInfo')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="lesson-title" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                {t('teacher.lessonEditor.title')} *
              </label>
              <input
                id="lesson-title"
                type="text"
                {...register('title')}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
                placeholder={t('teacher.lessonEditor.titlePlaceholder')}
              />
              {errors.title && (
                <p className="text-sm text-[var(--error)] mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="lesson-difficulty" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                {t('teacher.lessonEditor.difficulty')} *
              </label>
              <select
                id="lesson-difficulty"
                {...register('difficulty')}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
              >
                <option value="basic">{t('lessons.basic')}</option>
                <option value="intermediate">{t('lessons.intermediate')}</option>
                <option value="advanced">{t('lessons.advanced')}</option>
              </select>
            </div>

            <div>
              <label htmlFor="lesson-unit" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                {t('teacher.lessonEditor.unit')}
              </label>
              <input
                id="lesson-unit"
                type="text"
                {...register('unit')}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
                placeholder={t('teacher.lessonEditor.unitPlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="lesson-topic" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                {t('teacher.lessonEditor.topic')}
              </label>
              <input
                id="lesson-topic"
                type="text"
                {...register('topic')}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
                placeholder={t('teacher.lessonEditor.topicPlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="lesson-estimated-time" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
                {t('teacher.lessonEditor.estimatedTime')}
              </label>
              <input
                id="lesson-estimated-time"
                type="number"
                {...register('estimated_time')}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
                placeholder="45"
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="lesson-description" className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">
              {t('teacher.lessonEditor.description')}
            </label>
            <textarea
              id="lesson-description"
              {...register('description')}
              rows="3"
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)] resize-none"
              placeholder={t('teacher.lessonEditor.descriptionPlaceholder')}
            />
          </div>
        </div>

        {/* Tags */}
        <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--surface-container)]">
          <h3 className="text-lg font-bold text-[var(--on-surface)] mb-4">{t('teacher.lessonEditor.tags')}</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="flex items-center gap-1 px-3 py-1 bg-[var(--surface-container)] rounded-full text-sm"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-[var(--outline)] hover:text-[var(--error)] transition-colors"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              className="flex-1 px-4 py-2 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
              placeholder={t('teacher.lessonEditor.addTag')}
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 transition-all"
            >
              <FaPlus />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--surface-container)]">
          <h3 className="text-lg font-bold text-[var(--on-surface)] mb-4">{t('teacher.lessonEditor.content')} *</h3>
          <ReactQuill
            theme="snow"
            value={watch('content')}
            onChange={(value) => setValue('content', value)}
            className="bg-white rounded-xl"
            modules={{
              toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link', 'image'],
                ['clean']
              ]
            }}
          />
          {errors.content && (
            <p className="text-sm text-[var(--error)] mt-1">{errors.content.message}</p>
          )}
        </div>

        {/* Resources */}
        <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--surface-container)]">
          <h3 className="text-lg font-bold text-[var(--on-surface)] mb-4">{t('teacher.lessonEditor.resources')}</h3>
          
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-4 mb-3 p-4 bg-[var(--surface-container-low)] rounded-xl">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  {...register(`resources.${index}.type`)}
                  className="px-4 py-2 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-white"
                >
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                  <option value="image">{t('teacher.evaluationCreator.formula')}</option>
                  <option value="link">Link</option>
                </select>
                <input
                  {...register(`resources.${index}.title`)}
                  placeholder={t('teacher.lessonEditor.titleField')}
                  className="px-4 py-2 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-white"
                />
                <input
                  {...register(`resources.${index}.url`)}
                  placeholder="URL"
                  className="px-4 py-2 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-white"
                />
              </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-[var(--error)] hover:bg-[var(--error)]/10 p-2 rounded-xl transition-colors"
                  aria-label={`Eliminar recurso ${index + 1}`}
                >
                <FaTrash />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => append({ type: 'pdf', title: '', url: '' })}
            className="w-full py-3 border-2 border-dashed border-[var(--outline-variant)] rounded-xl text-[var(--outline)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all flex items-center justify-center gap-2"
          >
            <FaUpload />
            {t('teacher.lessonEditor.addResource')}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <FaSave />
            {saving ? t('teacher.lessonEditor.saving') : id ? t('teacher.lessonEditor.updateLesson') : t('teacher.lessonEditor.createLesson')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/lessons')}
            className="px-6 py-3 bg-[var(--surface-container)] text-[var(--on-surface)] font-bold rounded-xl hover:bg-[var(--surface-container-high)] transition-all"
          >
            {t('teacher.lessonEditor.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LessonEditor;
