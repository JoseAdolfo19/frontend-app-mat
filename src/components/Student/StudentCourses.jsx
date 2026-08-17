import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaBook, FaArrowLeft, FaDoorOpen, FaList } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { salonesApi } from '../../api/salones';
import Loading from '../Common/Loading';
import { toArray } from '../../utils/helpers';

const StudentCourses = () => {
  const { t } = useLanguage();
  const cp = (key) => t(`studentCourses.${key}`);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);

  useEffect(() => {
    salonesApi
      .getStudentCourses()
      .then((res) => setCourses(toArray(res.data)))
      .catch(() => toast.error(cp('loadError')))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCourse = async (course) => {
    setSelected(course);
    setLoadingLessons(true);
    try {
      const res = await salonesApi.getStudentCourse(course.id);
      setLessons(toArray(res.data?.lessons));
    } catch (e) {
      toast.error(cp('loadError'));
    } finally {
      setLoadingLessons(false);
    }
  };

  if (loading) return <Loading />;

  if (selected) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelected(null)}
            className="p-2 rounded-lg bg-[var(--surface-container-low)] hover:bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]"
            aria-label={cp('back')}
          >
            <FaArrowLeft />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-[var(--on-surface)]">{selected.name}</h2>
            <p className="text-sm text-[var(--on-surface-variant)]">
              {selected.salon?.grade} "{selected.salon?.section}" · {selected.teacher?.full_name}
            </p>
          </div>
        </div>

        {loadingLessons ? (
          <Loading />
        ) : lessons.length === 0 ? (
          <div className="bg-[var(--surface)] rounded-2xl p-10 text-center shadow-sm border border-[var(--surface-container)]">
            <FaList className="mx-auto text-4xl text-[var(--on-surface-variant)] mb-3" />
            <p className="text-[var(--on-surface-variant)]">{cp('noLessons')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-[var(--surface)] rounded-2xl p-5 shadow-sm border border-[var(--surface-container)] hover:shadow-md transition-all"
              >
                <h3 className="font-bold text-[var(--on-surface)]">{lesson.title}</h3>
                {lesson.topic && (
                  <p className="text-xs text-[var(--primary)] mt-0.5">{lesson.topic}</p>
                )}
                {lesson.description && (
                  <p className="text-sm text-[var(--on-surface-variant)] mt-2 line-clamp-3">
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--on-surface)]">{cp('title')}</h2>
        <p className="text-[var(--on-surface-variant)]">{cp('subtitle')}</p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-[var(--surface)] rounded-2xl p-10 text-center shadow-sm border border-[var(--surface-container)]">
          <FaBook className="mx-auto text-4xl text-[var(--on-surface-variant)] mb-3" />
          <p className="text-[var(--on-surface-variant)]">{cp('noCourses')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {courses.map((course) => (
            <button
              key={course.id}
              onClick={() => openCourse(course)}
              className="bg-[var(--surface)] rounded-2xl p-6 text-left shadow-sm border border-[var(--surface-container)] hover:border-[var(--primary)] hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center mb-3 text-[var(--primary)]">
                <FaDoorOpen />
              </div>
              <h3 className="font-bold text-lg text-[var(--on-surface)] group-hover:text-[var(--primary)]">
                {course.name}
              </h3>
              <p className="text-sm text-[var(--on-surface-variant)] mt-1">
                {course.salon?.grade} "{course.salon?.section}"
              </p>
              <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">
                {course.teacher?.full_name}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCourses;