import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { FaTrophy, FaDownload, FaFilePdf, FaFileExcel, FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';
import Loading from '../Common/Loading';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const TeacherStudentRanking = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const courses = [
    { value: 'all', label: t('ranking.allCourses') },
    { value: 'algebra', label: 'Álgebra' },
    { value: 'geometry', label: 'Geometría' },
    { value: 'trigonometry', label: 'Trigonometría' },
  ];

  useEffect(() => {
    fetchRanking();
  }, [selectedCourse]);

  const fetchRanking = async () => {
    setLoading(true);
    try {
      const params = selectedCourse !== 'all' ? { course: selectedCourse } : {};
      const res = await api.get('/teacher/ranking', { params });
      setRanking(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      setRanking([]);
    }
    setLoading(false);
  };

  const getTrophyIcon = (position) => {
    if (position === 1) return <span className="text-xl">&#127942;</span>;
    if (position === 2) return <span className="text-xl">&#129352;</span>;
    if (position === 3) return <span className="text-xl">&#129353;</span>;
    return <span className="text-sm font-bold text-[var(--on-surface-variant)]">{position}</span>;
  };

  const getPositionBadge = (position) => {
    if (position === 1) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    if (position === 2) return 'bg-gray-100 text-gray-600 border-gray-300';
    if (position === 3) return 'bg-orange-100 text-orange-700 border-orange-300';
    return '';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <FaArrowUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <FaArrowDown className="w-4 h-4 text-red-500" />;
    return <FaMinus className="w-4 h-4 text-gray-400" />;
  };

  const handleExport = async (format) => {
    try {
      const params = { format, ...(selectedCourse !== 'all' ? { course: selectedCourse } : {}) };
      const res = await api.get('/teacher/ranking/export', { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ranking_${selectedCourse}_${new Date().toISOString().slice(0, 10)}.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(format === 'pdf' ? 'PDF descargado' : 'Excel descargado');
    } catch {
      toast.error('Error al exportar');
    }
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(selectedStudent?.user_id === student.user_id ? null : student);
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-[var(--primary)] p-8 md:p-10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 flex items-center gap-3">
              <FaTrophy className="w-7 h-7" />
              {t('ranking.title')}
            </h1>
            <p className="text-blue-100">{t('ranking.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all">
              <FaFilePdf className="w-4 h-4" />
              PDF
            </button>
            <button onClick={() => handleExport('excel')} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all">
              <FaFileExcel className="w-4 h-4" />
              Excel
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {courses.map(c => (
          <button
            key={c.value}
            onClick={() => setSelectedCourse(c.value)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              selectedCourse === c.value
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--surface)] text-[var(--on-surface-variant)] border border-[var(--outline-variant)] hover:bg-[var(--surface-container)]'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--surface-container)] overflow-hidden">
        {ranking.length === 0 ? (
          <div className="p-12 text-center">
            <FaTrophy className="w-12 h-12 mx-auto text-[var(--on-surface-variant)] opacity-30 mb-4" />
            <p className="text-[var(--on-surface-variant)]">{t('common.noData')}</p>
          </div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[80px_1fr_100px_130px_60px] gap-4 p-4 bg-[var(--surface-container-low)] text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider">
              <span>{t('ranking.position')}</span>
              <span>{t('ranking.student')}</span>
              <span className="text-center">{t('ranking.average')}</span>
              <span className="text-center">{t('ranking.worksSubmitted')}</span>
              <span className="text-center">↑↓</span>
            </div>
            <div className="divide-y divide-[var(--surface-container)]">
              {ranking.map((student, idx) => {
                const position = idx + 1;
                const totalWorks = student.total_works || 0;
                const submittedWorks = student.works_submitted || 0;
                return (
                  <React.Fragment key={student.user_id || idx}>
                    <div
                      className="grid grid-cols-[auto_1fr] md:grid-cols-[80px_1fr_100px_130px_60px] gap-4 items-center p-4 hover:bg-[var(--surface-container-low)] transition-colors cursor-pointer"
                      onClick={() => handleStudentClick(student)}
                    >
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border ${getPositionBadge(position)}`}>
                        {getTrophyIcon(position)}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[var(--surface-container)] flex items-center justify-center text-sm font-bold text-[var(--on-surface-variant)]">
                          {student.full_name?.[0] || 'S'}
                        </div>
                        <div>
                          <p className="font-bold text-[var(--on-surface)]">{student.full_name}</p>
                          <p className="text-xs text-[var(--on-surface-variant)] md:hidden">
                            {t('ranking.average')}: {student.average_score?.toFixed(1) || '0.0'}
                          </p>
                        </div>
                      </div>
                      <span className="hidden md:block text-center font-bold text-[var(--on-surface)]">
                        {student.average_score?.toFixed(1) || '0.0'}
                      </span>
                      <span className="hidden md:block text-center text-sm text-[var(--on-surface-variant)]">
                        {submittedWorks}/{totalWorks}
                      </span>
                      <span className="hidden md:flex items-center justify-center">
                        {getTrendIcon(student.trend)}
                      </span>
                    </div>
                    {selectedStudent?.user_id === student.user_id && (
                      <div className="bg-[var(--surface-container-low)] p-4 md:px-8 md:py-5">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-[var(--on-surface-variant)]">{t('ranking.average')}</p>
                            <p className="text-lg font-bold text-[var(--on-surface)]">{student.average_score?.toFixed(1) || '0.0'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[var(--on-surface-variant)]">{t('ranking.worksSubmitted')}</p>
                            <p className="text-lg font-bold text-[var(--on-surface)]">{submittedWorks}/{totalWorks}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[var(--on-surface-variant)]">{t('ranking.trend')}</p>
                            <div className="flex items-center gap-1 mt-1">
                              {getTrendIcon(student.trend)}
                              <span className="text-sm text-[var(--on-surface-variant)] capitalize">{student.trend || '—'}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-[var(--on-surface-variant)]">{t('ranking.deliveryRate')}</p>
                            <p className="text-lg font-bold text-[var(--on-surface)]">
                              {totalWorks > 0 ? ((submittedWorks / totalWorks) * 100).toFixed(0) : 0}%
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherStudentRanking;
