import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { FaSearch, FaUserGraduate, FaTrophy, FaBook, FaChartLine } from 'react-icons/fa';
import Loading from '../Common/Loading';
import api from '../../api/axios';

const ParentStudentLookup = () => {
  const { t } = useLanguage();
  const [dni, setDni] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaKey, setCaptchaKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    loadCaptcha();
  }, []);

  const loadCaptcha = async () => {
    try {
      const res = await api.get('/guest/captcha');
      setCaptchaKey(res.data?.captcha_code || '');
    } catch {
      setCaptchaKey('');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!dni || dni.length < 8) return;
    setLoading(true);
    setError('');
    setResult(null);
    setSearched(true);
    try {
      const res = await api.post('/guest/student-lookup', { dni, captcha_token: captchaKey, captcha_answer: captcha });
      if (res.data?.student) {
        setResult(res.data.student);
      } else {
        setError(t('parentLookup.noResults'));
      }
    } catch (err) {
      setError(err.response?.data?.message || t('parentLookup.noResults'));
    }
    setLoading(false);
    loadCaptcha();
  };

  const getGradeColor = (grade) => {
    const n = parseFloat(grade);
    if (n >= 16) return 'text-green-600 bg-green-50 border-green-200';
    if (n >= 11) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getGradeColorDot = (grade) => {
    const n = parseFloat(grade);
    if (n >= 16) return 'bg-green-500';
    if (n >= 11) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaUserGraduate className="w-10 h-10 text-[var(--primary)]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--on-surface)] mb-3">
            {t('parentLookup.title')}
          </h1>
          <p className="text-[var(--on-surface-variant)] max-w-lg mx-auto">
            {t('parentLookup.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSearch} className="bg-[var(--surface)] rounded-2xl shadow-lg border border-[var(--surface-container)] p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider mb-2">
                DNI
              </label>
              <input
                type="text"
                value={dni}
                onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="12345678"
                maxLength={8}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--outline-variant)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface)] text-[var(--on-surface)] text-lg font-mono tracking-widest transition-all"
              />
            </div>
            <div className="w-full md:w-48">
              <label className="block text-xs font-bold text-[var(--on-surface-variant)] uppercase tracking-wider mb-2">
                Captcha
              </label>
              <div className="flex gap-2">
                {captchaKey && (
                  <div
                    className="w-28 h-12 rounded-lg flex items-center justify-center border border-[var(--outline-variant)] font-mono font-bold text-lg tracking-widest select-none"
                    style={{
                      background: 'repeating-linear-gradient(45deg, var(--surface-container), var(--surface-container) 5px, var(--surface-container-low) 5px, var(--surface-container-low) 10px)',
                      color: 'var(--primary)',
                      letterSpacing: '0.25em',
                      textShadow: '1px 1px 0 var(--outline-variant)',
                    }}
                  >
                    {captchaKey}
                  </div>
                )}
                <input
                  type="text"
                  value={captcha}
                  onChange={(e) => setCaptcha(e.target.value)}
                  placeholder={t('parentLookup.title')}
                  className="flex-1 px-3 py-2 rounded-xl border-2 border-[var(--outline-variant)] focus:border-[var(--primary)] focus:outline-none bg-[var(--surface)] text-[var(--on-surface)] text-sm transition-all"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading || dni.length < 8}
                className="w-full md:w-auto bg-[var(--primary)] text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
                ) : (
                  <FaSearch className="w-4 h-4" />
                )}
                {t('parentLookup.searchButton')}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center mb-8">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="bg-[var(--surface)] rounded-2xl shadow-lg border border-[var(--surface-container)] p-6 md:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-[var(--primary)]">
                    {result.full_name?.[0] || 'S'}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--on-surface)]">{result.full_name}</h2>
                  <p className="text-sm text-[var(--on-surface-variant)]">DNI: {result.dni}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[var(--surface-container-low)] p-4 rounded-xl text-center">
                  <FaChartLine className="w-6 h-6 mx-auto text-[var(--primary)] mb-2" />
                  <p className="text-xs text-[var(--on-surface-variant)]">{t('parentLookup.courseAverage')}</p>
                  <p className={`text-2xl font-bold ${getGradeColor(result.average)}`}>
                    {parseFloat(result.average).toFixed(1)}
                  </p>
                </div>
                <div className="bg-[var(--surface-container-low)] p-4 rounded-xl text-center">
                  <FaBook className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                  <p className="text-xs text-[var(--on-surface-variant)]">{t('parentLookup.worksSubmitted')}</p>
                  <p className="text-2xl font-bold text-[var(--on-surface)]">{result.works_submitted || 0}</p>
                </div>
                <div className="bg-[var(--surface-container-low)] p-4 rounded-xl text-center">
                  <FaBook className="w-6 h-6 mx-auto text-green-500 mb-2" />
                  <p className="text-xs text-[var(--on-surface-variant)]">{t('parentLookup.worksPercentage')}</p>
                  <p className="text-2xl font-bold text-[var(--on-surface)]">{result.works_percentage || 0}%</p>
                </div>
                <div className="bg-[var(--surface-container-low)] p-4 rounded-xl text-center">
                  <FaTrophy className="w-6 h-6 mx-auto text-yellow-500 mb-2" />
                  <p className="text-xs text-[var(--on-surface-variant)]">{t('parentLookup.rankingPosition')}</p>
                  <p className="text-2xl font-bold text-[var(--primary)]">#{result.ranking_position || '—'}</p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--surface)] rounded-2xl shadow-lg border border-[var(--surface-container)] p-6 md:p-8">
              <h3 className="text-lg font-bold text-[var(--on-surface)] mb-6 flex items-center gap-2">
                <FaBook className="w-5 h-5 text-[var(--primary)]" />
                {t('parentLookup.coursesByArea')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(result.courses || []).map((course, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl border-2 p-5 transition-all hover:shadow-md ${getGradeColor(course.average)}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-sm">{course.area}</h4>
                      <div className={`w-3 h-3 rounded-full ${getGradeColorDot(course.average)}`}></div>
                    </div>
                    <p className="text-3xl font-bold mb-2">
                      {parseFloat(course.average).toFixed(1)}
                    </p>
                    <div className="space-y-1 text-xs opacity-80">
                      <p>{t('parentLookup.worksSubmitted')}: {course.works_submitted || 0}/{course.total_works || 0}</p>
                      <p>{t('parentLookup.worksPercentage')}: {course.works_percentage || 0}%</p>
                      {course.ranking_position && (
                        <p>{t('parentLookup.rankingPosition')}: #{course.ranking_position}</p>
                      )}
                    </div>
                    <div className="mt-3 w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-current h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (parseFloat(course.average) / 20) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                {(!result.courses || result.courses.length === 0) && (
                  <p className="col-span-3 text-center text-[var(--on-surface-variant)] py-8">{t('common.noData')}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentStudentLookup;
