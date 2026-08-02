import React, { useState, useEffect } from 'react';
import { reportsApi } from '../../api/reports';
import toast from 'react-hot-toast';
import {
  FaFilePdf, FaFileExcel, FaChartLine, FaTable,
  FaSearch, FaTrophy, FaUsers, FaCheckCircle
} from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import Loading from '../Common/Loading';
import { useLanguage } from '../../contexts/LanguageContext';
import { toArray } from '../../utils/helpers';

const Reports = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  const [grades, setGrades] = useState([]);
  const [stats, setStats] = useState(null);

  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('current');

  useEffect(() => {
    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    setLoading(true);

    const [gradesResult, performanceResult] = await Promise.allSettled([
      reportsApi.getGradesReport({ period }),
      reportsApi.getPerformanceReport({ period }),
    ]);

    if (gradesResult.status === 'fulfilled') {
      setGrades(toArray(gradesResult.value.data?.data));
    } else {
      toast.error(t('teacher.reports.loadGradesError'));
      setGrades([]);
    }

    if (performanceResult.status === 'fulfilled') {
      setStats(performanceResult.value.data?.data || null);
    } else {
      toast.error(t('teacher.reports.loadPerfError'));
      setStats(null);
    }

    setLoading(false);
  };

  const downloadBlob = (blobData, filename) => {
    const url = window.URL.createObjectURL(new Blob([blobData]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    try {
      setExportingPDF(true);
      const response = await reportsApi.exportPDF({ period });
      downloadBlob(response.data, `reporte-rendimiento-${period}.pdf`);
      toast.success(t('teacher.reports.pdfSuccess'));
    } catch (error) {
      toast.error(t('teacher.reports.pdfError'));
    } finally {
      setExportingPDF(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExportingExcel(true);
      const response = await reportsApi.exportExcel({ period });
      downloadBlob(response.data, `reporte-rendimiento-${period}.xlsx`);
      toast.success(t('teacher.reports.excelSuccess'));
    } catch (error) {
      toast.error(t('teacher.reports.excelError'));
    } finally {
      setExportingExcel(false);
    }
  };

  const filteredGrades = grades.filter((row) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      row.user?.full_name?.toLowerCase().includes(term) ||
      row.user?.email?.toLowerCase().includes(term) ||
      row.evaluation?.title?.toLowerCase().includes(term)
    );
  });

  const getScoreBadge = (score) => {
    const value = Number(score) || 0;
    if (value >= 16) return 'bg-green-100 text-green-700';
    if (value >= 12) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const chartData = toArray(stats?.difficulty_areas).map((item) => ({
    type: item.type || 'Sin tipo',
    avg_score: Number(item.avg_score) || 0,
    total: Number(item.total) || 0,
  }));

  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[var(--on-surface)]">{t('teacher.reports.title')}</h2>
          <p className="text-[var(--on-surface-variant)]">
            {t('teacher.reports.subtitle')}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportPDF}
            disabled={exportingPDF}
            className="px-4 py-2.5 bg-[var(--error)] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <FaFilePdf />
            {exportingPDF ? t('teacher.reports.generating') : t('teacher.reports.exportPdf')}
          </button>
          <button
            onClick={handleExportExcel}
            disabled={exportingExcel}
            className="px-4 py-2.5 bg-[var(--secondary)] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <FaFileExcel />
            {exportingExcel ? t('teacher.reports.generating') : t('teacher.reports.exportExcel')}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--surface-container)]">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--outline)]" />
            <input
              type="text"
              placeholder={t('teacher.reports.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)]"
            />
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-3 rounded-xl border-2 border-[var(--surface-container-high)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface-container-low)] min-w-[180px]"
          >
            <option value="current">{t('teacher.reports.last30Days')}</option>
            <option value="week">{t('teacher.reports.thisWeek')}</option>
            <option value="month">{t('teacher.reports.thisMonth')}</option>
            <option value="last_month">{t('teacher.reports.lastMonth')}</option>
            <option value="quarter">{t('teacher.reports.thisQuarter')}</option>
            <option value="last_quarter">{t('teacher.reports.lastQuarter')}</option>
            <option value="year">{t('teacher.reports.thisYear')}</option>
            <option value="all_time">{t('teacher.reports.allTime')}</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="p-2 bg-[var(--primary)]/10 rounded-lg text-[var(--primary)] w-fit mb-2">
            <FaTable className="w-5 h-5" />
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">{t('teacher.reports.evaluations')}</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">
            {stats?.total_evaluations ?? 0}
          </p>
        </div>
        <div className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="p-2 bg-[var(--secondary)]/10 rounded-lg text-[var(--secondary)] w-fit mb-2">
            <FaUsers className="w-5 h-5" />
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">{t('teacher.reports.students')}</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">
            {stats?.total_students ?? 0}
          </p>
        </div>
        <div className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="p-2 bg-[var(--tertiary)]/10 rounded-lg text-[var(--tertiary)] w-fit mb-2">
            <FaChartLine className="w-5 h-5" />
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">{t('teacher.reports.average')}</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">
            {stats?.average_score !== undefined && stats?.average_score !== null
              ? Number(stats.average_score).toFixed(1)
              : '0.0'}
          </p>
        </div>
        <div className="bg-[var(--surface)] p-6 rounded-xl shadow-sm border border-[var(--surface-container)]">
          <div className="p-2 bg-green-500/10 rounded-lg text-green-600 w-fit mb-2">
            <FaCheckCircle className="w-5 h-5" />
          </div>
          <p className="text-sm text-[var(--on-surface-variant)]">{t('teacher.reports.passRate')}</p>
          <p className="text-2xl font-bold text-[var(--on-surface)]">
            {stats?.passing_rate ?? 0}%
          </p>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--surface-container)]">
        <h3 className="text-lg font-bold text-[var(--on-surface)] mb-4 flex items-center gap-2">
          <FaChartLine className="text-[var(--primary)]" />
          {t('teacher.reports.avgByEvalType')}
        </h3>
        <div className="h-72" aria-label={t('teacher.reports.avgByEvalType') || 'Gráfico de rendimiento promedio'} role="img">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-container)" />
                <XAxis dataKey="type" stroke="var(--on-surface-variant)" fontSize={12} />
                <YAxis stroke="var(--on-surface-variant)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface)',
                    border: '1px solid var(--outline-variant)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="avg_score" name={t('teacher.reports.average')} fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-[var(--on-surface-variant)]">
              {t('teacher.reports.noPerformanceData')}
            </div>
          )}
        </div>
      </div>

      {/* Top Performers */}
      {toArray(stats?.top_performers).length > 0 && (
        <div className="bg-[var(--surface)] p-6 rounded-2xl shadow-sm border border-[var(--surface-container)]">
          <h3 className="text-lg font-bold text-[var(--on-surface)] mb-4 flex items-center gap-2">
            <FaTrophy className="text-[var(--tertiary)]" />
            {t('teacher.reports.topStudents')}
          </h3>
          <div className="space-y-2">
            {toArray(stats.top_performers).map((performer, index) => (
              <div key={performer.user_id || index} className="flex items-center justify-between p-3 bg-[var(--surface-container-low)] rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-bold text-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                  <p className="font-medium text-[var(--on-surface)]">
                    {performer.user?.full_name || t('teacher.reports.student')}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                  {Number(performer.avg_score || 0).toFixed(1)}/20
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grades Table */}
      <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--surface-container)] overflow-hidden">
        <div className="p-6 pb-0">
          <h3 className="text-lg font-bold text-[var(--on-surface)] mb-4 flex items-center gap-2">
            <FaTable className="text-[var(--primary)]" />
            {t('teacher.reports.grades')}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" aria-label={t('teacher.reports.grades') || 'Tabla de calificaciones'}>
            <thead className="bg-[var(--surface-container-low)]">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--on-surface-variant)]">{t('teacher.reports.student')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--on-surface-variant)]">{t('teacher.reports.email')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--on-surface-variant)]">{t('teacher.reports.evaluation')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--on-surface-variant)]">{t('teacher.reports.date')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[var(--on-surface-variant)]">{t('teacher.reports.score')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--surface-container)]">
              {filteredGrades.map((row, index) => (
                <tr key={row.id || index} className="hover:bg-[var(--surface-container-low)] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold text-sm">
                        {row.user?.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <p className="font-medium text-[var(--on-surface)]">
                        {row.user?.full_name || '—'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[var(--on-surface-variant)]">
                    {row.user?.email || '—'}
                  </td>
                  <td className="px-6 py-4 text-[var(--on-surface)]">
                    {row.evaluation?.title || '—'}
                  </td>
                  <td className="px-6 py-4 text-[var(--on-surface-variant)] text-sm">
                    {row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getScoreBadge(row.score)}`}>
                      {row.score !== undefined && row.score !== null ? Number(row.score).toFixed(1) : '0.0'}/20
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredGrades.length === 0 && (
          <div className="text-center py-12">
            <FaTrophy className="mx-auto text-4xl text-[var(--on-surface-variant)] mb-3" />
            <h3 className="text-lg font-bold text-[var(--on-surface)]">
              {search ? t('teacher.reports.noResults') : t('teacher.reports.noGrades')}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
