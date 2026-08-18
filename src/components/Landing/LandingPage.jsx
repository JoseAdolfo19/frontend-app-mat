import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { env } from '../../config/env';

const API_URL = env.VITE_API_URL;

const NAV_LINKS = ['navMisiones', 'navEuler', 'navPadres', 'navRankings'];
const LANGS = ['es', 'en', 'qu'];

const LandingPage = () => {
  const { t, lang, changeLanguage } = useLanguage();

  const [dni, setDni] = useState('');
  const [captcha, setCaptcha] = useState(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

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
          captcha_token: captcha?.captcha_token || '',
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
    if (score >= 16) return '#4ade80';
    if (score >= 12) return '#38bdf8';
    return '#fb7185';
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-cyan-500/20 bg-slate-800/60 text-slate-100 text-sm outline-none transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 placeholder:text-slate-500';

  const navTo = (id) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#070b18] text-slate-100 font-sans overflow-x-hidden">
      {/* ===== SECCIÓN 1: NAVBAR ===== */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070b18]/80 border-b border-cyan-500/10">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <a href="#hero" className="flex items-center gap-2 group">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.5)] group-hover:shadow-[0_0_28px_rgba(34,211,238,0.7)] transition-shadow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" fill="currentColor" />
              </svg>
            </span>
            <span className="text-lg font-bold tracking-tight">
              mathLogi <span className="text-cyan-400">SIM</span>
            </span>
          </a>

          <div className="hidden lg:flex items-center gap-8 text-sm text-slate-300">
            {NAV_LINKS.map((key, i) => (
              <button
                key={key}
                onClick={() => navTo(['hero', 'rescue', 'matrix', 'parents'][i])}
                className="hover:text-cyan-400 transition-colors duration-300 font-medium"
              >
                {t(`landing.${key}`)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Selector de idioma ES | EN | QU */}
            <div className="flex items-center rounded-lg border border-cyan-500/20 bg-slate-800/50 overflow-hidden text-xs font-bold">
              {LANGS.map((l) => (
                <button
                  key={l}
                  onClick={() => changeLanguage(l)}
                  className={`px-2.5 py-1.5 uppercase transition-colors duration-200 ${
                    lang === l ? 'bg-cyan-500 text-[#070b18]' : 'text-slate-300 hover:bg-slate-700/60'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <Link
              to="/login"
              className="hidden sm:inline-flex items-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] hover:-translate-y-0.5 transition-all duration-300"
            >
              {t('landing.accessSystem')}
            </Link>

            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="lg:hidden p-2 rounded-lg border border-cyan-500/20 text-cyan-300"
              aria-label="Menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                {menuOpen ? (
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div className="lg:hidden border-t border-cyan-500/10 bg-[#0a1024] px-6 py-4 flex flex-col gap-3">
            {NAV_LINKS.map((key, i) => (
              <button
                key={key}
                onClick={() => navTo(['hero', 'rescue', 'matrix', 'parents'][i])}
                className="text-left text-sm text-slate-300 hover:text-cyan-400 py-1"
              >
                {t(`landing.${key}`)}
              </button>
            ))}
            <Link to="/login" className="text-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold">
              {t('landing.accessSystem')}
            </Link>
          </div>
        )}
      </header>

      {/* ===== SECCIÓN 2: HERO ===== */}
      <section id="hero" className="relative overflow-hidden">
        {/* rejilla cartesiana atenuada de fondo */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(34,211,238,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.25) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 70% 20%, rgba(139,92,246,0.25), transparent 50%), radial-gradient(ellipse at 10% 80%, rgba(34,211,238,0.2), transparent 50%)' }} />

        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-16 items-center">
          {/* Columna izquierda */}
          <div>
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400 mb-5">
              {t('landing.eyebrow')}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
              {t('landing.heroTitleH1')}{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
                {t('landing.heroHighlight')}
              </span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-slate-300/90 max-w-xl leading-relaxed">
              {t('landing.heroSubtitle')}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-white text-base font-semibold shadow-[0_0_25px_rgba(34,211,238,0.5)] hover:shadow-[0_0_35px_rgba(34,211,238,0.7)] hover:-translate-y-0.5 transition-all duration-300"
              >
                {t('landing.ctaRegister')} <span aria-hidden>&rarr;</span>
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-cyan-500/40 text-cyan-300 text-base font-semibold hover:bg-cyan-500/10 hover:border-cyan-400 hover:-translate-y-0.5 transition-all duration-300"
              >
                {t('landing.ctaDemo')}
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-6">
              {[
                { label: t('landing.badgeCurriculum'), icon: 'M9 12l2 2 4-4' },
                { label: t('landing.badgeAnticopy'), icon: 'M12 2l7 4v6c0 4.4-3 8.4-7 10-4-1.6-7-5.6-7-10V6l7-4z' },
                { label: t('landing.badgeReports'), icon: 'M4 20V10M10 20V4M16 20v-7M22 20H2' },
              ].map((b) => (
                <span key={b.label} className="inline-flex items-center gap-2 text-sm text-slate-300">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/15 flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={b.icon} />
                    </svg>
                  </span>
                  {b.label}
                </span>
              ))}
            </div>
          </div>

          {/* Columna derecha: cabina Profesor Euler */}
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/30 to-violet-600/30 blur-2xl" />
              <div className="relative rounded-3xl border border-cyan-500/30 bg-[#0a1024]/80 p-8 backdrop-blur-xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
                {/* avatar holográfico del búho/androide */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 p-[3px] shadow-[0_0_40px_rgba(34,211,238,0.5)]">
                    <div className="w-full h-full rounded-full bg-[#0a1024] flex items-center justify-center">
                      <svg width="72" height="72" viewBox="0 0 64 64" fill="none" className="text-cyan-300">
                        <circle cx="32" cy="34" r="18" stroke="currentColor" strokeWidth="2" />
                        <path d="M26 40l-5 6M38 40l5 6M32 52v6M26 58h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="26" cy="32" r="2.5" fill="currentColor" />
                        <circle cx="38" cy="32" r="2.5" fill="currentColor" />
                        <path d="M27 40h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-cyan-300">Profesor Euler</h3>
                  <p className="text-xs text-slate-400 mt-1 tracking-wide uppercase">IA · Groq Llama 3.3</p>
                </div>
                <div className="mt-6 space-y-3 text-sm">
                  {['x² + 2x - 8 = (x+4)(x-2) ✓', '¿Cómo resolviste esa raíz?', '¡Sigue así, racha +3 días!'].map((msg, i) => (
                    <div
                      key={i}
                      className={`px-4 py-2.5 rounded-xl text-xs ${
                        i % 2 === 0
                          ? 'bg-cyan-500/10 text-cyan-200 border border-cyan-500/20 ml-auto'
                          : 'bg-slate-800/60 text-slate-200 border border-slate-700'
                      }`}
                      style={{ maxWidth: '80%' }}
                    >
                      {msg}
                    </div>
                  ))}
                </div>
                {/* mascota digital: Lógica Adaptativa */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[10px] text-violet-300 bg-violet-500/10 border border-violet-500/30 rounded-full px-3 py-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="animate-pulse">
                    <path d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v12M6 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Lógica Adaptativa
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECCIÓN 3: BANNER RESCATE ===== */}
      <section id="rescue" className="py-20 px-6 bg-[#0a1024] border-y border-cyan-500/10 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400 border border-cyan-500/30 rounded-full px-4 py-1.5 mb-6">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" /></svg>
            mathLogi SIM
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">{t('landing.rescueTitle')}</h2>
          <p className="mt-5 text-slate-300/90 leading-relaxed max-w-2xl mx-auto">{t('landing.rescueDesc')}</p>
        </div>
      </section>

      {/* ===== SECCIÓN 4: MATRIZ DE APRENDIZAJE ===== */}
      <section id="matrix" className="py-20 lg:py-24 px-6 bg-[#0B132B] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(34,211,238,0.3) 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
        <div className="relative max-w-7xl mx-auto">
          <h2 className="text-center text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white max-w-3xl mx-auto">
            {t('landing.matrixTitle')}
          </h2>
          <p className="text-center text-slate-300 mt-3">{t('landing.matrixHeadline')}</p>

          <div className="mt-14 grid md:grid-cols-3 gap-8">
            {[
              { key: 'cardEulerTitle', desc: 'cardEulerDesc', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
              { key: 'cardShieldTitle', desc: 'cardShieldDesc', icon: 'M12 2l7 4v6c0 4.4-3 8.4-7 10-4-1.6-7-5.6-7-10V6l7-4z' },
              { key: 'cardRankingTitle', desc: 'cardRankingDesc', icon: 'M3 17h4v5H3v-5zM10 11h4v11h-4zM17 5h4v17h-4z' },
            ].map((c) => (
              <div
                key={c.key}
                className="rounded-2xl p-8 border border-cyan-500/15 bg-[#0a1024]/60 hover:border-cyan-400/40 hover:-translate-y-1.5 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 flex items-center justify-center mb-6 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-shadow">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={c.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{t(`landing.${c.key}`)}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{t(`landing.${c.desc}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECCIÓN 5: PARA PADRES + CONSULTA POR DNI ===== */}
      <section id="parents" className="py-20 lg:py-24 px-6 bg-[#070b18]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">{t('landing.parentsTitle')}</h2>
            <p className="mt-4 text-slate-300/90 leading-relaxed max-w-lg">{t('landing.parentsDesc')}</p>
            <div className="mt-8 space-y-4">
              {[
                { icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zM8 12l2 2 4-4', label: 'Reportes PDF/Excel' },
                { icon: 'M5 3l14 18M3 3l18 18', label: 'Seguridad total de datos' },
                { icon: 'M3 17h4v5H3zM10 11h4v11h-4zM17 5h4v17h-4z', label: '6 insignias desbloqueables' },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-3 text-slate-300">
                  <span className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round"><path d={f.icon} /></svg>
                  </span>
                  <span className="text-sm">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-cyan-500/20 bg-[#0a1024]/80 p-8 sm:p-10 shadow-[0_0_40px_rgba(34,211,238,0.1)]">
            <h3 className="text-xl font-bold text-white mb-6">{t('landing.parentsTitle')}</h3>
            <form onSubmit={handleLookup} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                  {t('landing.dniPlaceholder')}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{8}"
                  maxLength={8}
                  value={dni}
                  onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                  placeholder={t('landing.dniPlaceholder')}
                  className={inputClass}
                  required
                />
              </div>

              {captcha && (
                <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                  {captcha.captcha_image ? (
                    <img
                      src={captcha.captcha_image}
                      alt="Captcha"
                      className="h-14 w-[160px] rounded-xl border border-cyan-500/20 select-none"
                      draggable="false"
                    />
                  ) : (
                    <div
                      className="flex items-center justify-center px-6 py-3 rounded-xl text-xl font-mono font-bold tracking-widest select-none min-w-[140px] border border-cyan-500/20 bg-slate-800/60"
                      style={{ color: '#22d3ee', letterSpacing: '0.25em' }}
                    >
                      {captcha.captcha_code}
                    </div>
                  )}
                  <input
                    type="text"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    placeholder={t('landing.captchaPlaceholder')}
                    className={inputClass}
                    required
                  />
                </div>
              )}

              {error && <p className="text-sm text-center font-medium text-rose-400">{error}</p>}

              <button
                type="submit"
                disabled={loading || !/^\d{8}$/.test(dni) || !captchaAnswer}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-semibold text-sm transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_25px_rgba(34,211,238,0.4)]"
              >
                {loading ? t('landing.loading') : t('landing.verifyBtn')}
              </button>
            </form>

            {studentData && (
              <div className="mt-8 space-y-6 border-t border-cyan-500/15 pt-8">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white">{t('landing.studentSummary')}</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <InfoCard label="Nombre" value={studentData.student?.name || studentData.student?.full_name || studentData.full_name || '-'} />
                  <InfoCard label="Grado" value={studentData.student?.grade || studentData.grade || '-'} />
                  <InfoCard label="Institución" value={studentData.student?.institution || studentData.institution || '-'} />
                  <div className="rounded-xl p-3 text-center border border-cyan-500/15 bg-slate-800/50">
                    <div className="text-xs font-medium mb-1 text-slate-400">{t('landing.averageScore')}</div>
                    <div className="text-xl font-bold" style={{ color: getScoreColor(studentData.average_score ?? studentData.average ?? studentData.student?.average ?? 0) }}>
                      {(studentData.average_score ?? studentData.average ?? studentData.student?.average ?? 0).toFixed(1)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl p-3 text-center border border-cyan-500/15 bg-slate-800/50">
                    <div className="text-xs font-medium mb-1 text-slate-400">{t('landing.lessonsCompleted')}</div>
                    <div className="text-lg font-bold text-cyan-300">{studentData.total_lessons_completed ?? studentData.lessons_completed ?? studentData.student?.lessons_completed ?? 0}</div>
                  </div>
                  <div className="rounded-xl p-3 text-center border border-cyan-500/15 bg-slate-800/50">
                    <div className="text-xs font-medium mb-1 text-slate-400">{t('landing.currentStreak')}</div>
                    <div className="text-lg font-bold text-emerald-400">{studentData.current_streak ?? studentData.streak ?? studentData.student?.streak ?? 0}d</div>
                  </div>
                </div>

                {(Array.isArray(studentData.evaluation_results) && studentData.evaluation_results.length > 0) || (Array.isArray(studentData.recent_evaluations) && studentData.recent_evaluations.length > 0) ? (
                  <div>
                    <h4 className="text-sm font-bold mb-3 text-slate-200">{t('landing.recentEvaluations')}</h4>
                    <div className="rounded-xl overflow-hidden border border-cyan-500/15">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-800/60">
                            <th className="px-4 py-2 text-left font-semibold text-slate-400">{t('landing.area')}</th>
                            <th className="px-4 py-2 text-right font-semibold text-slate-400">{t('landing.score')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(studentData.evaluation_results || studentData.recent_evaluations || []).slice(0, 5).map((ev, i) => (
                            <tr key={i} className="border-t border-cyan-500/10">
                              <td className="px-4 py-2 text-slate-200">{ev.area || ev.title || ev.name || '-'}</td>
                              <td className="px-4 py-2 text-right font-semibold" style={{ color: getScoreColor(ev.score ?? 0) }}>{(ev.score ?? 0).toFixed(1)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}

                {Array.isArray(studentData.grades_by_area) && studentData.grades_by_area.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold mb-3 text-slate-200">{t('landing.courses')}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {studentData.grades_by_area.map((course, i) => (
                        <div key={i} className="rounded-xl border border-cyan-500/15 p-4 bg-slate-800/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">{course.area_name || course.area || '-'}</span>
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: getScoreColor(course.average_score ?? course.score ?? 0) }} />
                          </div>
                          <div className="text-2xl font-bold mb-1" style={{ color: getScoreColor(course.average_score ?? course.score ?? 0) }}>
                            {(course.average_score ?? course.score ?? 0).toFixed(1)}
                          </div>
                          <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-700/60">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(((course.average_score ?? course.score ?? 0) / 20) * 100, 100)}%`, background: getScoreColor(course.average_score ?? course.score ?? 0) }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {studentData.grades_by_area && typeof studentData.grades_by_area === 'object' && !Array.isArray(studentData.grades_by_area) && (
                  <div>
                    <h4 className="text-sm font-bold mb-3 text-slate-200">{t('landing.gradesByArea')}</h4>
                    <div className="space-y-2">
                      {Object.entries(studentData.grades_by_area).map(([area, score]) => (
                        <div key={area}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">{area}</span>
                            <span className="font-semibold text-slate-200">{Number(score).toFixed(1)}</span>
                          </div>
                          <div className="h-2.5 rounded-full overflow-hidden bg-slate-700/60">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((Number(score) / 20) * 100, 100)}%`, background: getScoreColor(Number(score)) }} />
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

      {/* ===== SECCIÓN 6: FOOTER ===== */}
      <footer className="py-12 px-6 border-t border-cyan-500/10 bg-[#04060f]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" fill="currentColor" /></svg>
              </span>
              <span className="text-base font-bold">mathLogi <span className="text-cyan-400">SIM</span></span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <Link to="/privacy" className="hover:text-cyan-400 transition-colors">Política de Privacidad</Link>
              <Link to="/terms" className="hover:text-cyan-400 transition-colors">Términos de Uso</Link>
              <Link to="/data-policy" className="hover:text-cyan-400 transition-colors">Política de Datos</Link>
              <a href="#" className="hover:text-cyan-400 transition-colors">Contacto</a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-cyan-500/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 max-w-2xl text-center md:text-left">{t('landing.footerPrivacy')}</p>
            <p className="text-xs text-slate-500">KawsayMath &copy; {new Date().getFullYear()} · {t('landing.footerRights')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const InfoCard = ({ label, value }) => (
  <div className="rounded-xl p-3 text-center border border-cyan-500/15 bg-slate-800/50">
    <div className="text-xs font-medium mb-1 text-slate-400">{label}</div>
    <div className="text-sm font-bold truncate text-slate-100">{value}</div>
  </div>
);

export default LandingPage;