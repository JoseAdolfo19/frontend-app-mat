import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  FaDoorOpen, FaPlus, FaTrash, FaEdit, FaArrowLeft, FaUsers, FaBook,
  FaChalkboardTeacher, FaUserPlus, FaTimes,
} from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { salonesApi } from '../../api/salones';
import Loading from '../Common/Loading';
import { toArray } from '../../utils/helpers';

const CoordinatorSalones = () => {
  const { t } = useLanguage();
  const cp = (key) => t(`coordinatorSalones.${key}`);
  const [loading, setLoading] = useState(true);
  const [salones, setSalones] = useState([]);
  const [showCreateSalon, setShowCreateSalon] = useState(false);
  const [salonForm, setSalonForm] = useState({ grade: '', section: '' });
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({ name: '', description: '', teacher_id: '' });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [showEnroll, setShowEnroll] = useState(false);
  const [selectedEnroll, setSelectedEnroll] = useState([]);

  const loadTeachers = async () => {
    try {
      const res = await salonesApi.getTeachers();
      setTeachers(toArray(res.data));
    } catch (e) {
      toast.error(cp('loadError'));
    }
  };

  const loadStudents = async () => {
    try {
      const res = await salonesApi.getStudents();
      setStudents(toArray(res.data));
    } catch (e) {
      toast.error(cp('loadError'));
    }
  };

  useEffect(() => {
    salonesApi
      .getSalones()
      .then((res) => setSalones(toArray(res.data)))
      .catch(() => toast.error(cp('loadError')))
      .finally(() => setLoading(false));
    loadTeachers();
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createSalon = async () => {
    if (!salonForm.grade.trim() || !salonForm.section.trim()) return;
    try {
      const res = await salonesApi.createSalon(salonForm);
      setSalones((prev) => [...prev, res.data]);
      setShowCreateSalon(false);
      setSalonForm({ grade: '', section: '' });
      toast.success(cp('createSalonSuccess'));
    } catch (e) {
      toast.error(cp('createError'));
    }
  };

  const deleteSalon = async (id) => {
    if (!window.confirm(cp('confirmDeleteSalon'))) return;
    try {
      await salonesApi.deleteSalon(id);
      setSalones((prev) => prev.filter((s) => s.id !== id));
      toast.success(cp('deleteSalonSuccess'));
    } catch (e) {
      toast.error(cp('deleteError'));
    }
  };

  const openSalon = async (salon) => {
    setSelectedSalon(salon);
    setSelectedCourse(null);
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

  const addCourse = async () => {
    if (!courseForm.name.trim() || !courseForm.teacher_id) return;
    try {
      const res = await salonesApi.createCourse(selectedSalon.id, courseForm);
      setCourses((prev) => [...prev, res.data]);
      setShowAddCourse(false);
      setCourseForm({ name: '', description: '', teacher_id: '' });
      toast.success(cp('createCourseSuccess'));
    } catch (e) {
      toast.error(cp('createError'));
    }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm(cp('confirmDeleteCourse'))) return;
    try {
      await salonesApi.deleteCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      toast.success(cp('deleteCourseSuccess'));
    } catch (e) {
      toast.error(cp('deleteError'));
    }
  };

  const openEnroll = async (course) => {
    setSelectedCourse(course);
    setShowEnroll(true);
    setSelectedEnroll([]);
    try {
      const res = await salonesApi.getCourseStudents(course.id);
      setEnrolledStudents(toArray(res.data));
    } catch (e) {
      toast.error(cp('loadError'));
    }
  };

  const doEnroll = async () => {
    if (selectedEnroll.length === 0) return;
    try {
      await salonesApi.enrollStudents(selectedCourse.id, selectedEnroll);
      toast.success(cp('enrollSuccess'));
      const res = await salonesApi.getCourseStudents(selectedCourse.id);
      setEnrolledStudents(toArray(res.data));
      setSelectedEnroll([]);
    } catch (e) {
      toast.error(cp('enrollError'));
    }
  };

  const toggleEnroll = (id) => {
    setSelectedEnroll((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const unenroll = async (studentId) => {
    try {
      await salonesApi.unenrollStudent(selectedCourse.id, studentId);
      setEnrolledStudents((prev) => prev.filter((s) => s.id !== studentId));
      toast.success(cp('unenrollSuccess'));
    } catch (e) {
      toast.error(cp('enrollError'));
    }
  };

  if (loading) return <Loading />;

  // ---- Panel de matrícula ----
  if (showEnroll && selectedCourse) {
    const alreadyEnrolled = new Set(enrolledStudents.map((s) => s.id));
    return (
      <div className="bg-[var(--surface)] rounded-2xl p-6 shadow-sm border border-[var(--surface-container)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEnroll(false)}
              className="p-2 rounded-lg bg-[var(--surface-container-low)] hover:bg-[var(--surface-container-high)]"
              aria-label={cp('back')}
            >
              <FaArrowLeft />
            </button>
            <h3 className="font-bold text-xl text-[var(--on-surface)]">
              {cp('enrollTitle')}: {selectedCourse.name}
            </h3>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold mb-2 text-[var(--on-surface)]">
            {cp('enrolledStudents')} ({enrolledStudents.length})
          </h4>
          {enrolledStudents.length === 0 ? (
            <p className="text-sm text-[var(--on-surface-variant)]">{cp('noEnrolled')}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {enrolledStudents.map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center gap-2 bg-[var(--primary)]/10 text-[var(--primary)] px-3 py-1 rounded-full text-sm"
                >
                  <FaUsers className="text-xs" /> {s.full_name}
                  <button onClick={() => unenroll(s.id)} aria-label={cp('unenroll')} className="hover:text-[var(--error)]">
                    <FaTimes />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-[var(--surface-container)] pt-4">
          <h4 className="font-semibold mb-2 text-[var(--on-surface)]">{cp('selectStudents')}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-72 overflow-y-auto">
            {students
              .filter((s) => !alreadyEnrolled.has(s.id))
              .map((s) => (
                <label
                  key={s.id}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedEnroll.includes(s.id)
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-[var(--surface-container-high)] hover:bg-[var(--surface-container-low)]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedEnroll.includes(s.id)}
                    onChange={() => toggleEnroll(s.id)}
                    className="accent-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--on-surface)]">{s.full_name}</span>
                </label>
              ))}
          </div>
          <button
            onClick={doEnroll}
            disabled={selectedEnroll.length === 0}
            className="mt-4 px-6 py-3 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 disabled:opacity-50 font-bold flex items-center gap-2"
          >
            <FaUserPlus /> {cp('enrollBtn')} ({selectedEnroll.length})
          </button>
        </div>
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
            <h2 className="text-2xl font-bold text-[var(--on-surface)]">
              {selectedSalon.grade} "{selectedSalon.section}"
            </h2>
          </div>
          <button
            onClick={() => setShowAddCourse((v) => !v)}
            className="ml-auto px-4 py-2 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 flex items-center gap-2 font-bold"
          >
            <FaPlus /> {cp('addCourse')}
          </button>
        </div>

        {showAddCourse && (
          <div className="bg-[var(--surface)] rounded-2xl p-5 shadow-sm border border-[var(--surface-container)] space-y-3">
            <input
              type="text"
              value={courseForm.name}
              onChange={(e) => setCourseForm((f) => ({ ...f, name: e.target.value }))}
              placeholder={cp('courseNamePlaceholder')}
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
            />
            <input
              type="text"
              value={courseForm.description}
              onChange={(e) => setCourseForm((f) => ({ ...f, description: e.target.value }))}
              placeholder={cp('courseDescPlaceholder')}
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
            />
            <select
              value={courseForm.teacher_id}
              onChange={(e) => setCourseForm((f) => ({ ...f, teacher_id: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
            >
              <option value="">{cp('selectTeacher')}</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name}
                </option>
              ))}
            </select>
            <button
              onClick={addCourse}
              disabled={!courseForm.name.trim() || !courseForm.teacher_id}
              className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 disabled:opacity-50 font-bold"
            >
              {cp('createCourse')}
            </button>
          </div>
        )}

        {loadingCourses ? (
          <Loading />
        ) : courses.length === 0 ? (
          <div className="bg-[var(--surface)] rounded-2xl p-10 text-center shadow-sm border border-[var(--surface-container)]">
            <FaBook className="mx-auto text-4xl text-[var(--on-surface-variant)] mb-3" />
            <p className="text-[var(--on-surface-variant)]">{cp('noCourses')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-[var(--surface)] rounded-2xl p-6 shadow-sm border border-[var(--surface-container)] hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center mb-3 text-[var(--primary)]">
                  <FaBook />
                </div>
                <h3 className="font-bold text-lg text-[var(--on-surface)]">{course.name}</h3>
                <p className="text-sm text-[var(--on-surface-variant)] mt-1 flex items-center gap-1">
                  <FaChalkboardTeacher className="text-xs" /> {course.teacher?.full_name || '—'}
                </p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openEnroll(course)}
                    className="flex-1 px-3 py-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg text-sm font-bold hover:bg-[var(--primary)]/20 flex items-center justify-center gap-1"
                  >
                    <FaUsers /> {cp('enroll')}
                  </button>
                  <button
                    onClick={() => deleteCourse(course.id)}
                    className="p-2 bg-[var(--surface-container-low)] text-[var(--error)] rounded-lg hover:bg-[var(--surface-container-high)]"
                    aria-label={cp('delete')}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ---- Vista principal: salones ----
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--on-surface)]">{cp('title')}</h2>
          <p className="text-[var(--on-surface-variant)]">{cp('subtitle')}</p>
        </div>
        <button
          onClick={() => setShowCreateSalon((v) => !v)}
          className="px-4 py-2 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 flex items-center gap-2 font-bold"
        >
          <FaPlus /> {cp('createSalon')}
        </button>
      </div>

      {showCreateSalon && (
        <div className="bg-[var(--surface)] rounded-2xl p-5 shadow-sm border border-[var(--surface-container)] flex gap-3 flex-wrap">
          <input
            type="text"
            value={salonForm.grade}
            onChange={(e) => setSalonForm((f) => ({ ...f, grade: e.target.value }))}
            placeholder={cp('gradePlaceholder')}
            className="px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
          />
          <input
            type="text"
            value={salonForm.section}
            onChange={(e) => setSalonForm((f) => ({ ...f, section: e.target.value }))}
            placeholder={cp('sectionPlaceholder')}
            className="px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
          />
          <button
            onClick={createSalon}
            disabled={!salonForm.grade.trim() || !salonForm.section.trim()}
            className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 disabled:opacity-50 font-bold"
          >
            {cp('createSalon')}
          </button>
        </div>
      )}

      {salones.length === 0 ? (
        <div className="bg-[var(--surface)] rounded-2xl p-10 text-center shadow-sm border border-[var(--surface-container)]">
          <FaDoorOpen className="mx-auto text-4xl text-[var(--on-surface-variant)] mb-3" />
          <p className="text-[var(--on-surface-variant)]">{cp('noSalones')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {salones.map((salon) => (
            <div
              key={salon.id}
              className="bg-[var(--surface)] rounded-2xl p-6 shadow-sm border border-[var(--surface-container)] hover:shadow-md transition-all"
            >
              <button onClick={() => openSalon(salon)} className="text-left w-full">
                <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center mb-3 text-[var(--primary)]">
                  <FaDoorOpen />
                </div>
                <h3 className="font-bold text-xl text-[var(--on-surface)]">
                  {salon.grade} "{salon.section}"
                </h3>
                <p className="text-sm text-[var(--on-surface-variant)] mt-1">
                  {toArray(salon.courses).length} {cp('courseCount')}
                </p>
              </button>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => deleteSalon(salon.id)}
                  className="p-2 bg-[var(--surface-container-low)] text-[var(--error)] rounded-lg hover:bg-[var(--surface-container-high)]"
                  aria-label={cp('delete')}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoordinatorSalones;