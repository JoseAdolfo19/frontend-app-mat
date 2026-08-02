import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from '../../api/axios';
import { useLanguage } from '../../contexts/LanguageContext';
import { FaChild, FaChartLine, FaBook, FaClock } from 'react-icons/fa';
import Loading from '../Common/Loading';

const ParentDashboard = () => {
  const { t } = useLanguage();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/parent/children');
      setChildren(response.data.data || response.data || []);
    } catch (error) {
      toast.error(t('parent.loadError'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-[var(--primary)] p-8 md:p-12">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold text-white mb-2">
            {t('parent.title')}
          </h2>
          <p className="text-blue-100">
            {t('parent.subtitle')}
          </p>
        </div>
        <div className="absolute right-[-5%] top-[-10%] opacity-10 select-none pointer-events-none text-9xl font-bold text-white">
          👨‍👧‍👦
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-[var(--surface)] rounded-2xl border border-[var(--surface-container)]">
            <FaChild className="w-12 h-12 mx-auto text-[var(--on-surface-variant)] mb-4" />
            <p className="text-[var(--on-surface-variant)] text-lg">
              {t('parent.noChildren')}
            </p>
          </div>
        ) : (
          children.map((child) => (
            <Link
              key={child.id}
              to={`/parent/children/${child.id}`}
              className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all border border-[var(--surface-container)] hover:border-[var(--primary)]/20 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-full flex items-center justify-center">
                  <FaChild className="w-6 h-6 text-[var(--primary)]" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--on-surface)] group-hover:text-[var(--primary)] transition-colors">
                    {child.full_name || child.name}
                  </h3>
                  <p className="text-sm text-[var(--on-surface-variant)]">
                    {child.grade || t('common.noData')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[var(--surface-container-low)] rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <FaChartLine className="w-3 h-3 text-[var(--primary)]" />
                    <span className="text-xs text-[var(--on-surface-variant)]">{t('parent.average')}</span>
                  </div>
                  <p className="text-lg font-bold text-[var(--on-surface)]">
                    {child.average_score !== null && child.average_score !== undefined
                      ? Number(child.average_score).toFixed(1)
                      : '—'}
                  </p>
                </div>

                <div className="bg-[var(--surface-container-low)] rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <FaBook className="w-3 h-3 text-[var(--secondary)]" />
                    <span className="text-xs text-[var(--on-surface-variant)]">{t('parent.lessonsCompleted')}</span>
                  </div>
                  <p className="text-lg font-bold text-[var(--on-surface)]">
                    {child.lessons_completed ?? 0}
                  </p>
                </div>
              </div>

              {child.last_activity && (
                <div className="mt-3 flex items-center gap-2 text-xs text-[var(--on-surface-variant)]">
                  <FaClock className="w-3 h-3" />
                  <span>{t('parent.lastActivity')}: {child.last_activity}</span>
                </div>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
