import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  FaDoorOpen, FaBook, FaArrowLeft, FaPlus, FaList, FaChalkboardTeacher,
} from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { salonesApi } from '../../api/salones';
import Loading from '../Common/Loading';
import { toArray } from '../../utils/helpers';

const TeacherSalones = () => {
  const { t } = useLanguage();
  const cp = (key) => t(`teacherSalones.${key}`);
  const [loading, setLoading] = useState(true);
  const [salones, setSalones] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', content: '', topic: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    salonesApi
      .getSalones()
      .then((res) => setSalones(toArray(res.data)))
      .catch(() => toast.error(cp('loadError')))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openSalon = async (salon) => {
    setSelectedSalon(salon);
    setSelectedCourse(null);
    setLessons([]);
    setLoadingCourses(true);
    try {
      const res = await salonesApi.getSalonCourses(salon.id);
      setCourses(toArray(res.data));
    } catch (e) {
      toast.error(cp('loadError'));
    } finally {
      setLoadingCourses(false);
    }
  };

  const openCourse = async (course) => {
    setSelectedCourse(course);
    setShowAdd(false);
    setLoadingLessons(true);
    try {
      const res = await salonesApi.getCourseLessons(course.id);
      setLessons(toArray(res.data));
    } catch (e) {
      toast.error(cp('loadError'));
    } finally {
      setLoadingLessons(false);
    }
  };

  const addLesson = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setSubmitting(true);
    try {
      await salonesApi.createLesson(selectedCourse.id, form);
      toast.success(cp('createSuccess'));
      setForm({ title: '', description: '', content: '', topic: '' });
      setShowAdd(false);
      await openCourse(selectedCourse);
    } catch (e) {
      toast.error(cp('createError'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  // ---- Detalle de curso: lecciones ----
  if (selectedCourse) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedCourse(null)}
            className="p-2 rounded-lg bg-[var(--surface-container-low)] hover:bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]"
            aria-label={cp('back')}
          >
            <FaArrowLeft />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-[var(--on-surface)]">{selectedCourse.name}</h2>
            <p className="text-sm text-[var(--on-surface-variant)]">
              {selectedSalon.grade} "{selectedSalon.section}"
            </p>
          </div>
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="ml-auto px-4 py-2 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 flex items-center gap-2 font-bold"
          >
            <FaPlus /> {cp('addLesson')}
          </button>
        </div>

        {showAdd && (
          <div className="bg-[var(--surface)] rounded-2xl p-5 shadow-sm border border-[var(--surface-container)] space-y-3">
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder={cp('titlePlaceholder')}
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
            />
            <input
              type="text"
              value={form.topic}
              onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
              placeholder={cp('topicPlaceholder')}
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder={cp('descriptionPlaceholder')}
              rows={2}
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)] resize-none"
            />
            <textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder={cp('contentPlaceholder')}
              rows={6}
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)] resize-none"
            />
            <button
              onClick={addLesson}
              disabled={submitting || !form.title.trim() || !form.content.trim()}
              className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 disabled:opacity-50 font-bold"
            >
              {submitting ? cp('saving') : cp('publish')}
            </button>
          </div>
        )}

        {loadingLessons ? (
          <Loading />
        ) : lessons.length === 0 ? (
          <div className="bg-[var(--surface)] rounded-2xl p-10 text-center shadow-sm border border-[var(--surface-container)]">
            <FaBook className="mx-auto text-4xl text-[var(--on-surface-variant)] mb-3" />
            <p className="text-[var(--on-surface-variant)]">{cp('noLessons')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-[var(--surface)] rounded-2xl p-5 shadow-sm border border-[var(--surface-container)] hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-[var(--on-surface)]">{lesson.title}</h3>
                    {lesson.topic && (
                      <p className="text-xs text-[var(--primary)] mt-0.5">{lesson.topic}</p>
                    )}
                  </div>
                  <FaList className="text-[var(--on-surface-variant)]" />
                </div>
                {lesson.description && (
                  <p className="text-sm text-[var(--on-surface-variant)] mt-2 line-clamp-2">
                    {lesson.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ---- Detalle de salón: cursos ----
  if (selectedSalon) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedSalon(null)}
            className="p-2 rounded-lg bg-[var(--surface-container-low)] hover:bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]"
            aria-label={cp('back')}
          >
            <FaArrowLeft />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center text-white">
              <FaDoorOpen />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--on-surface)]">
                {selectedSalon.grade} "{selectedSalon.section}"
              </h2>
              <p className="text-sm text-[var(--on-surface-variant)]">{cp('coursesSubtitle')}</p>
            </div>
          </div>
        </div>

        {loadingCourses ? (
          <Loading />
        ) : courses.length === 0 ? (
          <div className="bg-[var(--surface)] rounded-2xl p-10 text-center shadow-sm border border-[var(--surface-container)]">
            <FaChalkboardTeacher className="mx-auto text-4xl text-[var(--on-surface-variant)] mb-3" />
            <p className="text-[var(--on-surface-variant)]">{cp('noCourses')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => openCourse(course)}
                className="bg-[var(--surface)] rounded-2xl p-6 text-left shadow-sm border border-[var(--surface-container)] hover:border-[var(--primary)] hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center mb-3 text-[var(--primary)]">
                  <FaBook />
                </div>
                <h3 className="font-bold text-lg text-[var(--on-surface)] group-hover:text-[var(--primary)]">
                  {course.name}
                </h3>
                {course.description && (
                  <p className="text-sm text-[var(--on-surface-variant)] mt-1">{course.description}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ---- Vista principal: salones (cards estilo Moodle) ----
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--on-surface)]">{cp('title')}</h2>
        <p className="text-[var(--on-surface-variant)]">{cp('subtitle')}</p>
      </div>

      {salones.length === 0 ? (
        <div className="bg-[var(--surface)] rounded-2xl p-10 text-center shadow-sm border border-[var(--surface-container)]">
          <FaDoorOpen className="mx-auto text-4xl text-[var(--on-surface-variant)] mb-3" />
          <p className="text-[var(--on-surface-variant)]">{cp('noSalones')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {salones.map((salon) => (
            <button
              key={salon.id}
              onClick={() => openSalon(salon)}
              className="bg-[var(--surface)] rounded-2xl p-6 text-left shadow-sm border border-[var(--surface-container)] hover:border-[var(--primary)] hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center mb-3 text-[var(--primary)]">
                <FaDoorOpen />
              </div>
              <h3 className="font-bold text-xl text-[var(--on-surface)] group-hover:text-[var(--primary)]">
                {salon.grade} "{salon.section}"
              </h3>
              <p className="text-sm text-[var(--on-surface-variant)] mt-1">
                {toArray(salon.courses).length} {cp('courseCount')}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherSalones;