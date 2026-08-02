import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { FaTrophy, FaMedal } from 'react-icons/fa';
import Loading from '../Common/Loading';
import api from '../../api/axios';

const StudentRanking = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState([]);
  const [myPosition, setMyPosition] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('all');

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
      const res = await api.get('/student/ranking', { params });
      setRanking(Array.isArray(res.data?.data) ? res.data.data : []);
      setMyPosition(res.data?.my_position || null);
    } catch {
      setRanking([]);
      setMyPosition(null);
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

  const isCurrentUser = (student) => {
    return student.user_id === user?.id || student.id === user?.id;
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-[var(--primary)] p-8 md:p-10">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <FaTrophy className="w-7 h-7" />
            {t('ranking.title')}
          </h1>
          <p className="text-blue-100">{t('ranking.subtitle')}</p>
        </div>
      </div>

      {myPosition && (
        <div className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border-2 border-[var(--primary)]/30">
          <p className="text-sm text-[var(--on-surface-variant)] mb-1">{t('ranking.myPosition')}</p>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold text-[var(--primary)]">#{myPosition}</span>
            <span className="text-[var(--on-surface-variant)]">{user?.full_name}</span>
          </div>
        </div>
      )}

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
            <div className="hidden md:grid grid-cols-[80px_1fr_120px_120px] gap-4 p-4 bg-[var(--surface-container-low)] text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider">
              <span>{t('ranking.position')}</span>
              <span>{t('ranking.student')}</span>
              <span className="text-center">{t('ranking.average')}</span>
              <span className="text-center">{t('ranking.worksSubmitted')}</span>
            </div>
            <div className="divide-y divide-[var(--surface-container)]">
              {ranking.map((student, idx) => {
                const position = idx + 1;
                const highlight = isCurrentUser(student);
                return (
                  <div
                    key={student.user_id || student.id || idx}
                    className={`grid grid-cols-[auto_1fr] md:grid-cols-[80px_1fr_120px_120px] gap-4 items-center p-4 transition-colors ${
                      highlight ? 'bg-[var(--primary)]/5 border-l-4 border-[var(--primary)]' : 'hover:bg-[var(--surface-container-low)]'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border ${getPositionBadge(position)}`}>
                      {getTrophyIcon(position)}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[var(--surface-container)] flex items-center justify-center text-sm font-bold text-[var(--on-surface-variant)]">
                        {student.full_name?.[0] || 'S'}
                      </div>
                      <div>
                        <p className={`font-bold ${highlight ? 'text-[var(--primary)]' : 'text-[var(--on-surface)]'}`}>
                          {student.full_name}
                          {highlight && <span className="ml-2 text-xs text-[var(--primary)]">({t('ranking.youAreHere')})</span>}
                        </p>
                        <p className="text-xs text-[var(--on-surface-variant)] md:hidden">
                          {t('ranking.average')}: {student.average_score?.toFixed(1) || '0.0'} · {student.works_submitted || 0}
                        </p>
                      </div>
                    </div>
                    <span className="hidden md:block text-center font-bold text-[var(--on-surface)]">
                      {student.average_score?.toFixed(1) || '0.0'}
                    </span>
                    <span className="hidden md:block text-center text-sm text-[var(--on-surface-variant)]">
                      {student.works_submitted || 0}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentRanking;
