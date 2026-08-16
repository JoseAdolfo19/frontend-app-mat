import React, { useState, useEffect } from 'react';
import { gamificationApi } from '../../api/gamification';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import { FaTrophy, FaMedal, FaFire, FaStar, FaLock } from 'react-icons/fa';
import Loading from '../Common/Loading';

const CATEGORY_ICONS = {
  lessons: '📖',
  exams: '📝',
  streak: '🔥',
  level: '🥇',
  general: '🎯',
};

const Gamification = () => {
  const { lang, t } = useLanguage();
  const gp = (key) => t(`gamification.${key}`);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, [lang]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await gamificationApi.getSummary(lang);
      setData(res.data?.gamification);
    } catch (e) {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (!data || data.available === false) {
    return (
      <div className="p-6 text-center text-[var(--on-surface-variant)]">
        <FaTrophy className="mx-auto text-4xl mb-3 text-[var(--on-surface-variant)]" />
        <p>{gp('unavailable')}</p>
      </div>
    );
  }

  const progress = data.level_progress || {};
  const pct = Math.min(100, Math.max(0, progress.progress_percent ?? 0));

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      {/* Cabecera nivel */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--outline-variant)]">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center text-2xl font-bold">
            {data.level}
          </div>
          <div className="flex-1">
            <p className="text-sm text-[var(--on-surface-variant)]">{gp('level')}</p>
            <p className="text-2xl font-bold">{gp('levelTitle')} {data.level}</p>
            <div className="mt-3">
              <div className="h-2.5 rounded-full bg-[var(--surface-container)] overflow-hidden">
                <div
                  className="h-full bg-[var(--primary)] transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-[var(--on-surface-variant)]">
                <span>{data.total_xp} XP</span>
                <span>{progress.xp_for_next_level ? `${progress.xp_in_level}/${progress.xp_for_next_level - progress.xp_for_current_level} XP` : ''}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--outline-variant)] text-center">
          <FaStar className="mx-auto text-[var(--primary)] mb-1" />
          <p className="text-xl font-bold">{data.total_xp}</p>
          <p className="text-xs text-[var(--on-surface-variant)]">{gp('totalXp')}</p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--outline-variant)] text-center">
          <FaMedal className="mx-auto text-amber-500 mb-1" />
          <p className="text-xl font-bold">{data.unlocked_count}/{data.total_count}</p>
          <p className="text-xs text-[var(--on-surface-variant)]">{gp('achievements')}</p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--outline-variant)] text-center">
          <FaFire className="mx-auto text-orange-500 mb-1" />
          <p className="text-xl font-bold">{data.badges?.length ?? 0}</p>
          <p className="text-xs text-[var(--on-surface-variant)]">{gp('badges')}</p>
        </div>
      </div>

      {/* Logros */}
      <div>
        <h2 className="text-lg font-semibold mb-3">{gp('achievementsList')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.achievements?.map((ach) => {
            const unlocked = ach.unlocked;
            return (
              <div
                key={ach.slug}
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  unlocked
                    ? 'bg-[var(--surface)] border-[var(--primary)]/40'
                    : 'bg-[var(--surface)] border-[var(--outline-variant)] opacity-60'
                }`}
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-2xl ${unlocked ? 'bg-[var(--primary)]/15' : 'bg-[var(--surface-container)]'}`}>
                  {unlocked ? (ach.icon || CATEGORY_ICONS[ach.category]) : <FaLock className="text-[var(--on-surface-variant)] text-lg" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{ach.name}</p>
                  <p className="text-xs text-[var(--on-surface-variant)]">{ach.description}</p>
                  {unlocked && (
                    <p className="text-xs mt-1 text-[var(--primary)]">+{ach.xp_reward} XP</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Gamification;