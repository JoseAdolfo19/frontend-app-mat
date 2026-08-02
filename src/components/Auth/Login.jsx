import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { FaEnvelope, FaLock, FaUsers, FaChevronDown, FaGlobe } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';

const GamerAvatar = () => (
  <svg viewBox="0 0 300 340" className="w-full max-w-sm mx-auto" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#7c3aed" />
      </linearGradient>
    </defs>
    <ellipse cx="150" cy="320" rx="90" ry="14" fill="#000" opacity="0.25" />
    <circle cx="150" cy="120" r="62" fill="#fbbf24" />
    <circle cx="118" cy="105" r="8" fill="#fff" />
    <circle cx="182" cy="105" r="8" fill="#fff" />
    <circle cx="121" cy="108" r="4" fill="#111" />
    <circle cx="179" cy="108" r="4" fill="#111" />
    <path d="M140 140 q10 10 20 0" stroke="#7c2d12" strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M88 95 q0 -50 40 -55 q40 5 44 35" fill="#7c3aed" />
    <path d="M212 95 q0 -50 -40 -55 q-40 5 -44 35" fill="#7c3aed" />
    <rect x="70" y="128" width="160" height="26" rx="13" fill="#7c3aed" />
    <rect x="84" y="140" width="132" height="10" rx="5" fill="#a855f7" />
    <rect x="95" y="155" width="110" height="120" rx="22" fill="url(#glow)" />
    <rect x="95" y="155" width="110" height="50" rx="22" fill="#9333ea" />
    <circle cx="150" cy="182" r="14" fill="#fff" />
    <rect x="62" y="262" width="36" height="56" rx="16" fill="#9333ea" />
    <rect x="202" y="262" width="36" height="56" rx="16" fill="#9333ea" />
    <rect x="130" y="270" width="40" height="16" rx="6" fill="#6d28d9" />
    <path d="M128 120 q0 10 10 10" stroke="#000" opacity="0.2" strokeWidth="3" fill="none" />
    <g fill="#c084fc" opacity="0.9">
      <rect x="40" y="40" width="12" height="12" rx="2" transform="rotate(45 46 46)" />
      <rect x="248" y="60" width="10" height="10" rx="2" transform="rotate(45 253 65)" />
      <rect x="30" y="180" width="14" height="14" rx="2" transform="rotate(45 37 187)" />
      <rect x="256" y="210" width="10" height="10" rx="2" transform="rotate(45 261 215)" />
      <rect x="52" y="280" width="12" height="12" rx="2" transform="rotate(45 58 286)" />
    </g>
    <path d="M235 250 l14 8 M235 250 l-4 -16" stroke="#e879f9" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.8" />
    <path d="M262 140 l10 6 M262 140 l-3 -12" stroke="#c084fc" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.6" />
    <path d="M52 96 l8 5 M52 96 l-2 -10" stroke="#a855f7" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.6" />
    <path d="M205 300 q25 -20 55 -18" stroke="#e879f9" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.5" />
    <path d="M40 320 q30 -10 55 0" stroke="#a855f7" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.5" />
  </svg>
);

const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { t, lang, changeLanguage } = useLanguage();
  const [loading, setLoading] = useState(false);

  const validationSchema = yup.object().shape({
    email: yup.string().email(t('auth.login.emailInvalid')).required(t('auth.login.emailRequired')),
    password: yup.string().required(t('auth.login.passwordRequired')),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema)
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await login(data.email, data.password);
    setLoading(false);

    if (result.success) {
      toast.success(t('auth.login.welcomeBack'));
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const result = await loginWithGoogle(credentialResponse.credential);
    if (result.success) {
      toast.success(t('auth.login.welcomeGoogle'));
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  const langs = [
    { code: 'es', label: 'ES' },
    { code: 'en', label: 'EN' },
    { code: 'qu', label: 'QU' },
  ];

  return (
    <div className="min-h-screen flex bg-white">
      {/* Panel izquierdo - Formulario */}
      <div className="w-full lg:w-1/2 flex flex-col px-6 sm:px-12 py-8">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Math<span className="text-purple-600">Flow</span>
          </h1>
          <div className="relative">
            <FaGlobe className="absolute left-3 top-2.5 text-gray-400 text-xs" />
            <select
              value={lang}
              onChange={(e) => changeLanguage(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {langs.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
            <FaChevronDown className="absolute right-3 top-3 text-gray-400 text-xs pointer-events-none" />
          </div>
        </div>

        <div className="max-w-md w-full mx-auto my-auto py-8">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
            {t('auth.login.welcome')}!
          </h2>
          <p className="text-gray-500 mt-2 font-medium">{t('auth.login.subtitle')}</p>

          <div className="mt-8 space-y-3">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error(t('auth.login.googleError'))}
              theme="outline"
              shape="pill"
              text="continue_with"
              size="large"
              width="100%"
            />

            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-xs font-semibold text-gray-400 uppercase">{t('auth.login.orContinueWith')}</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="login-email" className="block text-xs font-bold text-gray-600 tracking-wider">{t('auth.login.email')}</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-3.5 text-gray-400" />
                <input
                  id="login-email"
                  type="email"
                  {...register('email')}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white border border-transparent transition placeholder-gray-400"
                  placeholder="estudiante@mathflow.edu"
                  aria-required="true"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="login-password" className="block text-xs font-bold text-gray-600 tracking-wider">{t('auth.login.password')}</label>
                <Link to="/forgot-password" className="text-sm text-purple-600 hover:underline font-semibold">
                  {t('auth.login.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <FaLock className="absolute left-4 top-3.5 text-gray-400" />
                <input
                  id="login-password"
                  type="password"
                  {...register('password')}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white border border-transparent transition placeholder-gray-400"
                  placeholder="••••••••"
                  aria-required="true"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 font-medium">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
            >
              {loading ? t('auth.login.loading') : t('auth.login.submit')}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            {t('auth.login.noAccount')}{' '}
            <Link to="/register" className="text-purple-600 font-bold hover:underline">
              {t('auth.login.signUp')}
            </Link>
          </p>

          <p className="text-center mt-6 text-xs text-gray-400">
            {t('auth.login.termsText')} <a href="#" className="underline hover:text-purple-600">{t('auth.login.terms')}</a> {t('auth.login.and')} <a href="#" className="underline hover:text-purple-600">{t('auth.login.privacy')}</a>
          </p>
        </div>
      </div>

      {/* Panel derecho - Ilustración */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-fuchsia-500/20 blur-3xl"></div>

        <div className="relative z-10 flex items-center justify-between px-10 py-8">
          <div className="flex items-center gap-2 text-white font-semibold">
            <FaUsers className="text-purple-300" />
            <span>MathFlow Community</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/register" className="text-white/80 hover:text-white font-medium transition">
              {t('auth.login.signUp')}
            </Link>
            <Link
              to="/register"
              className="bg-white text-purple-900 font-bold px-5 py-2 rounded-full hover:bg-purple-100 transition"
            >
              Join Us
            </Link>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10 pb-12">
          <GamerAvatar />
          <h3 className="text-white text-2xl font-bold mt-6">¡Aprende matemáticas jugando!</h3>
          <p className="text-purple-200/80 mt-2 text-center max-w-sm">
            Lecciones interactivas, evaluaciones y progreso en tiempo real.
          </p>
        </div>

        <div className="absolute bottom-8 left-10 z-10 text-white/40 text-xs font-mono">
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            MathFlow v1.0
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
