import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL;

const LandingPage = () => {
  const { t } = useLanguage();

  const [dni, setDni] = useState('');
  const [captcha, setCaptcha] = useState(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [error, setError] = useState('');

  const fetchCaptcha = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/guest/captcha`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCaptcha(data);
      setCaptchaAnswer('');
      setError('');
    } catch {
      setCaptcha(null);
    }
  }, []);

  useEffect(() => {
    fetchCaptcha();
  }, [fetchCaptcha]);

  const handleLookup = async (e) => {
    e.preventDefault();
    setError('');
    setStudentData(null);

    if (!/^\d{8}$/.test(dni)) return;
    if (!captchaAnswer) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/guest/student-lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dni,
          captcha_token: captcha?.captcha_code || '',
          captcha_answer: captchaAnswer,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'captcha_incorrect') {
          setError(t('landing.captchaError'));
        } else {
          setError(t('landing.noResults'));
        }
        fetchCaptcha();
        return;
      }
      const payload = data.data || data;
      setStudentData(payload);
    } catch {
      setError(t('landing.noResults'));
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 16) return 'var(--secondary)';
    if (score >= 12) return 'var(--tertiary)';
    return 'var(--error)';
  };

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative overflow-hidden py-24 px-6" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-container))' }}>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 tracking-tight" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.15)' }}>
            {t('landing.heroTitle')}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-3 font-medium">
            {t('landing.heroSubtitle')}
          </p>
          <p className="text-base md:text-lg text-white/75 mb-1 max-w-2xl mx-auto">
            {t('landing.schoolName')}
          </p>
          <p className="text-sm md:text-base text-white/60 mb-10">
            {t('landing.schoolLocation')}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              style={{ background: 'var(--surface)', color: 'var(--primary)' }}
            >
              {t('landing.login')}
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 border-2 border-white/40 text-white hover:bg-white/10"
            >
              {t('landing.register')}
            </Link>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </section>

      {/* ABOUT */}
      <section className="py-20 px-6" style={{ background: 'var(--background)' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-14" style={{ color: 'var(--on-surface)' }}>
            {t('landing.aboutTitle')}
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <p className="text-base leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>{t('landing.aboutP1')}</p>
              <p className="text-base leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>{t('landing.aboutP2')}</p>
              <p className="text-base leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>{t('landing.aboutP3')}</p>
              <div className="grid grid-cols-3 gap-4 pt-4">
                {[
                  { val: '429+', label: t('landing.students') },
                  { val: '21', label: t('landing.teachers') },
                  { val: '14', label: t('landing.sections') },
                ].map((s) => (
                  <div key={s.label} className="text-center p-4 rounded-xl" style={{ background: 'var(--primary-container)' }}>
                    <div className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>{s.val}</div>
                    <div className="text-xs mt-1 font-medium" style={{ color: 'var(--on-surface-variant)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 rounded-xl overflow-hidden shadow-md">
                <img src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&h=400&fit=crop" alt="School classroom" className="w-full h-52 object-cover" />
              </div>
              <div className="rounded-xl overflow-hidden shadow-md">
                <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop" alt="Students learning" className="w-full h-40 object-cover" />
              </div>
              <div className="rounded-xl overflow-hidden shadow-md">
                <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&h=400&fit=crop" alt="Education" className="w-full h-40 object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6" style={{ background: 'var(--surface)' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-14" style={{ color: 'var(--on-surface)' }}>
            {t('landing.whatIsTitle')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '\uD83D\uDCDA', titleKey: 'landing.feature1Title', descKey: 'landing.feature1Desc' },
              { icon: '\u2705', titleKey: 'landing.feature2Title', descKey: 'landing.feature2Desc' },
              { icon: '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67', titleKey: 'landing.feature3Title', descKey: 'landing.feature3Desc' },
            ].map((f) => (
              <div
                key={f.titleKey}
                className="rounded-2xl p-8 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg border"
                style={{ background: 'var(--surface-container-low)', borderColor: 'var(--outline-variant)' }}
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--on-surface)' }}>{t(f.titleKey)}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>{t(f.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DNI LOOKUP */}
      <section className="py-20 px-6" style={{ background: 'var(--background)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl p-8 md:p-10 shadow-lg border" style={{ background: 'var(--surface)', borderColor: 'var(--outline-variant)' }}>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-2" style={{ color: 'var(--on-surface)' }}>
              {t('landing.dniLookupTitle')}
            </h2>
            <p className="text-center text-sm mb-8" style={{ color: 'var(--on-surface-variant)' }}>
              {t('landing.dniLookupSubtitle')}
            </p>

            <form onSubmit={handleLookup} className="space-y-5">
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{8}"
                  maxLength={8}
                  value={dni}
                  onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                  placeholder={t('landing.dniPlaceholder')}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors focus:ring-2"
                  style={{ borderColor: 'var(--outline-variant)', background: 'var(--surface-container-low)', color: 'var(--on-surface)', '--tw-ring-color': 'var(--primary)' }}
                  required
                />
              </div>

              {captcha && (
                <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                  <div
                    className="flex items-center justify-center px-6 py-3 rounded-xl text-xl font-mono font-bold tracking-widest select-none min-w-[140px]"
                    style={{
                      background: 'repeating-linear-gradient(45deg, var(--surface-container), var(--surface-container) 5px, var(--surface-container-low) 5px, var(--surface-container-low) 10px)',
                      color: 'var(--primary)',
                      letterSpacing: '0.25em',
                      textShadow: '1px 1px 0 var(--outline-variant)',
                    }}
                  >
                    {captcha.captcha_code}
                  </div>
                  <input
                    type="text"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    placeholder={t('landing.captchaPlaceholder')}
                    className="flex-1 px-4 py-3 rounded-xl border text-sm outline-none transition-colors focus:ring-2"
                    style={{ borderColor: 'var(--outline-variant)', background: 'var(--surface-container-low)', color: 'var(--on-surface)', '--tw-ring-color': 'var(--primary)' }}
                    required
                  />
                </div>
              )}

              {error && (
                <p className="text-sm text-center font-medium" style={{ color: 'var(--error)' }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !/^\d{8}$/.test(dni) || !captchaAnswer}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                style={{ background: 'var(--primary)' }}
              >
                {loading ? t('landing.loading') : t('landing.consult')}
              </button>
            </form>

            {/* STUDENT SUMMARY */}
            {studentData && (
              <div className="mt-8 space-y-6 border-t pt-8" style={{ borderColor: 'var(--outline-variant)' }}>
                <div className="text-center">
                  <h3 className="text-xl font-bold" style={{ color: 'var(--on-surface)' }}>{t('landing.studentSummary')}</h3>
                </div>

                {/* Info cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <InfoCard label="Nombre" value={studentData.student?.name || studentData.student?.full_name || studentData.full_name || '-'} />
                  <InfoCard label="Grado" value={studentData.student?.grade || studentData.grade || '-'} />
                  <InfoCard label="Institución" value={studentData.student?.institution || studentData.institution || '-'} />
                  <div className="rounded-xl p-3 text-center" style={{ background: 'var(--surface-container-low)' }}>
                    <div className="text-xs font-medium mb-1" style={{ color: 'var(--on-surface-variant)' }}>{t('landing.averageScore')}</div>
                    <div className="text-xl font-bold" style={{ color: getScoreColor(studentData.average_score ?? studentData.average ?? studentData.student?.average ?? 0) }}>
                      {(studentData.average_score ?? studentData.average ?? studentData.student?.average ?? 0).toFixed(1)}
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl p-3 text-center" style={{ background: 'var(--surface-container-low)' }}>
                    <div className="text-xs font-medium mb-1" style={{ color: 'var(--on-surface-variant)' }}>{t('landing.lessonsCompleted')}</div>
                    <div className="text-lg font-bold" style={{ color: 'var(--primary)' }}>{studentData.total_lessons_completed ?? studentData.lessons_completed ?? studentData.student?.lessons_completed ?? 0}</div>
                  </div>
                  <div className="rounded-xl p-3 text-center" style={{ background: 'var(--surface-container-low)' }}>
                    <div className="text-xs font-medium mb-1" style={{ color: 'var(--on-surface-variant)' }}>{t('landing.currentStreak')}</div>
                    <div className="text-lg font-bold" style={{ color: 'var(--secondary)' }}>{studentData.current_streak ?? studentData.streak ?? studentData.student?.streak ?? 0}d</div>
                  </div>
                </div>

                {/* Recent evaluations */}
                {(Array.isArray(studentData.evaluation_results) && studentData.evaluation_results.length > 0) || (Array.isArray(studentData.recent_evaluations) && studentData.recent_evaluations.length > 0) ? (
                  <div>
                    <h4 className="text-sm font-bold mb-3" style={{ color: 'var(--on-surface)' }}>{t('landing.recentEvaluations')}</h4>
                    <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--outline-variant)' }}>
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ background: 'var(--surface-container)' }}>
                            <th className="px-4 py-2 text-left font-semibold" style={{ color: 'var(--on-surface-variant)' }}>{t('landing.area')}</th>
                            <th className="px-4 py-2 text-right font-semibold" style={{ color: 'var(--on-surface-variant)' }}>{t('landing.score')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(studentData.evaluation_results || studentData.recent_evaluations || []).slice(0, 5).map((ev, i) => (
                            <tr key={i} style={{ borderTop: '1px solid var(--outline-variant)' }}>
                              <td className="px-4 py-2" style={{ color: 'var(--on-surface)' }}>{ev.area || ev.title || ev.name || '-'}</td>
                              <td className="px-4 py-2 text-right font-semibold" style={{ color: getScoreColor(ev.score ?? 0) }}>{(ev.score ?? 0).toFixed(1)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}

                {/* Courses by area - new array format */}
                {Array.isArray(studentData.grades_by_area) && studentData.grades_by_area.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold mb-3" style={{ color: 'var(--on-surface)' }}>{t('landing.courses')}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {studentData.grades_by_area.map((course, i) => (
                        <div
                          key={i}
                          className="rounded-xl border p-4 transition-all hover:shadow-md"
                          style={{ borderColor: 'var(--outline-variant)', background: 'var(--surface-container-low)' }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--on-surface-variant)' }}>{course.area_name || course.area || '-'}</span>
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: getScoreColor(course.average_score ?? course.score ?? 0) }} />
                          </div>
                          <div className="text-2xl font-bold mb-1" style={{ color: getScoreColor(course.average_score ?? course.score ?? 0) }}>
                            {(course.average_score ?? course.score ?? 0).toFixed(1)}
                          </div>
                          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-container)' }}>
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(((course.average_score ?? course.score ?? 0) / 20) * 100, 100)}%`, background: getScoreColor(course.average_score ?? course.score ?? 0) }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grades by area bar chart (object format fallback) */}
                {studentData.grades_by_area && typeof studentData.grades_by_area === 'object' && !Array.isArray(studentData.grades_by_area) && (
                  <div>
                    <h4 className="text-sm font-bold mb-3" style={{ color: 'var(--on-surface)' }}>{t('landing.gradesByArea')}</h4>
                    <div className="space-y-2">
                      {Object.entries(studentData.grades_by_area).map(([area, score]) => (
                        <div key={area}>
                          <div className="flex justify-between text-xs mb-1">
                            <span style={{ color: 'var(--on-surface-variant)' }}>{area}</span>
                            <span className="font-semibold" style={{ color: 'var(--on-surface)' }}>{Number(score).toFixed(1)}</span>
                          </div>
                          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-container)' }}>
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min((Number(score) / 20) * 100, 100)}%`, background: getScoreColor(Number(score)) }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 text-center border-t" style={{ borderColor: 'var(--outline-variant)', background: 'var(--surface)' }}>
        <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>
          {t('landing.schoolName')} &mdash; {t('landing.schoolLocation')}
        </p>
        <p className="text-xs mt-2" style={{ color: 'var(--outline)' }}>
          MathFlow &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};

const InfoCard = ({ label, value }) => (
  <div className="rounded-xl p-3 text-center" style={{ background: 'var(--surface-container-low)' }}>
    <div className="text-xs font-medium mb-1" style={{ color: 'var(--on-surface-variant)' }}>{label}</div>
    <div className="text-sm font-bold truncate" style={{ color: 'var(--on-surface)' }}>{value}</div>
  </div>
);

export default LandingPage;
