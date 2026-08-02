import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from '../../api/axios';
import { useLanguage } from '../../contexts/LanguageContext';
import { FaArrowLeft, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import Loading from '../Common/Loading';
import CompetencyEvolution from '../Common/CompetencyEvolution';

const ChildReport = () => {
  const { studentId } = useParams();
  const { t, lang } = useLanguage();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [studentId]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/parent/children/${studentId}/report`);
      setReport(response.data.data || response.data);
    } catch (error) {
      toast.error(t('parent.loadReportError'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!report) return null;

  const summary = report.summary || {};
  const strengths = report.strengths || [];
  const weaknesses = report.weaknesses || [];
  const evaluations = report.evaluations || [];
  const competencyEvolution = report.competency_evolution || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          to={`/parent/children/${studentId}`}
          className="p-2 rounded-lg hover:bg-[var(--surface-container)] transition-colors text-[var(--on-surface-variant)]"
        >
          <FaArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-[var(--on-surface)]">
            {t('parent.report')}
          </h2>
          <p className="text-[var(--on-surface-variant)]">
            {report.student?.full_name || report.student?.name}
          </p>
        </div>
      </div>

      <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--surface-container)] p-6">
        <h3 className="text-xl font-bold text-[var(--on-surface)] mb-4">{t('parent.performance')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-[var(--surface-container-low)] rounded-xl">
            <p className="text-3xl font-bold text-[var(--primary)]">
              {summary.average_score !== null && summary.average_score !== undefined
                ? Number(summary.average_score).toFixed(1)
                : '—'}
            </p>
            <p className="text-sm text-[var(--on-surface-variant)] mt-1">{t('parent.average')}</p>
          </div>
          <div className="text-center p-4 bg-[var(--surface-container-low)] rounded-xl">
            <p className="text-3xl font-bold text-[var(--secondary)]">
              {summary.total_evaluations || 0}
            </p>
            <p className="text-sm text-[var(--on-surface-variant)] mt-1">{t('parent.evaluationsCompleted')}</p>
          </div>
          <div className="text-center p-4 bg-[var(--surface-container-low)] rounded-xl">
            <p className="text-3xl font-bold text-[var(--tertiary)]">
              {summary.completed_lessons || 0}/{summary.total_lessons || 0}
            </p>
            <p className="text-sm text-[var(--on-surface-variant)] mt-1">{t('parent.lessonsCompleted')}</p>
          </div>
          <div className="text-center p-4 bg-[var(--surface-container-low)] rounded-xl">
            <p className="text-3xl font-bold text-[var(--primary)]">
              {summary.pass_rate !== null && summary.pass_rate !== undefined
                ? `${Number(summary.pass_rate).toFixed(0)}%`
                : '—'}
            </p>
            <p className="text-sm text-[var(--on-surface-variant)] mt-1">{t('parent.passRate')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--surface-container)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaCheckCircle className="w-5 h-5 text-green-500" />
            <h3 className="text-xl font-bold text-[var(--on-surface)]">{t('parent.strengths')}</h3>
          </div>
          {strengths.length === 0 ? (
            <p className="text-[var(--on-surface-variant)]">{t('common.noData')}</p>
          ) : (
            <ul className="space-y-2">
              {strengths.map((item, index) => (
                <li key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-xl">
                  <FaCheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-[var(--on-surface)]">{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--surface-container)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaExclamationTriangle className="w-5 h-5 text-yellow-500" />
            <h3 className="text-xl font-bold text-[var(--on-surface)]">{t('parent.weaknesses')}</h3>
          </div>
          {weaknesses.length === 0 ? (
            <p className="text-[var(--on-surface-variant)]">{t('common.noData')}</p>
          ) : (
            <ul className="space-y-2">
              {weaknesses.map((item, index) => (
                <li key={index} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-xl">
                  <FaExclamationTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-[var(--on-surface)]">{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--surface-container)] p-6">
        <h3 className="text-xl font-bold text-[var(--on-surface)] mb-4">{t('parent.evaluationHistory')}</h3>
        <div className="space-y-3">
          {evaluations.length === 0 ? (
            <p className="text-center text-[var(--on-surface-variant)] py-4">{t('common.noData')}</p>
          ) : (
            evaluations.map((eval_) => (
              <div key={eval_.id} className="flex items-center justify-between p-4 bg-[var(--surface-container-low)] rounded-xl">
                <div>
                  <p className="font-medium text-[var(--on-surface)]">{eval_.title}</p>
                  <p className="text-sm text-[var(--on-surface-variant)]">{eval_.date}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  eval_.score >= 15
                    ? 'bg-green-100 text-green-700'
                    : eval_.score >= 12
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {Number(eval_.score).toFixed(1)}/20
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--surface-container)] p-6">
        <h3 className="text-xl font-bold text-[var(--on-surface)] mb-4">{t('parent.evolution')}</h3>
        <CompetencyEvolution
          data={competencyEvolution}
          title={t('parent.evolution')}
          height={300}
        />
      </div>
    </div>
  );
};

export default ChildReport;
