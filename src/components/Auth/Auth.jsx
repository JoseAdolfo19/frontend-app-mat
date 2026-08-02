import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUsers, FaGraduationCap, FaChevronDown, FaGlobe } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';

const Auth = () => {
  const { login, loginWithGoogle, register: registerUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, lang, changeLanguage } = useLanguage();
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isRegister = location.pathname === '/register';

  const loginSchema = yup.object().shape({
    email: yup.string().email(t('auth.login.emailInvalid')).required(t('auth.login.emailRequired')),
    password: yup.string().required(t('auth.login.passwordRequired')),
  });

  const registerSchema = yup.object().shape({
    full_name: yup.string().required(t('auth.register.nameRequired')),
    email: yup.string().email(t('auth.register.emailInvalid')).required(t('auth.register.emailRequired')),
    password: yup.string().min(8, t('auth.register.passwordMin')).required(t('auth.register.passwordRequired')),
    password_confirmation: yup.string()
      .oneOf([yup.ref('password')], t('auth.register.passwordMatch'))
      .required(t('auth.register.confirmPasswordRequired')),
    academic_level: yup.string().required(t('auth.register.levelRequired')),
  });

  const {
    register: regLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm({ resolver: yupResolver(loginSchema) });

  const {
    register: regRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
  } = useForm({ resolver: yupResolver(registerSchema) });

  const onSubmitLogin = async (data) => {
    setLoadingLogin(true);
    const result = await login(data.email, data.password);
    setLoadingLogin(false);
    if (result.success) {
      toast.success(t('auth.login.welcomeBack'));
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  const onGoogleSuccess = async (credentialResponse) => {
    const result = await loginWithGoogle(credentialResponse.credential);
    if (result.success) {
      toast.success(t('auth.login.welcomeGoogle'));
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  const onSubmitRegister = async (data) => {
    setLoadingRegister(true);
    const result = await registerUser({ ...data, role: 'student' });
    setLoadingRegister(false);
    if (result.success) {
      toast.success(t('auth.register.successMsg'));
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

  const inputClass = "w-full pl-11 pr-4 py-3 rounded-xl bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white border border-transparent transition placeholder-gray-400";

  return (
    <div className="min-h-screen flex bg-white">
      {/* Panel izquierdo - Formularios en carrusel */}
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

        <div className="max-w-md w-full mx-auto my-auto py-8 overflow-hidden">
          <div
            className={`flex transition-transform duration-500 ease-in-out ${isRegister ? '-translate-x-1/2' : 'translate-x-0'}`}
          >
            {/* Slide Login */}
            <div className="w-1/2 shrink-0 pr-6">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
                {t('auth.login.welcome')}!
              </h2>
              <p className="text-gray-500 mt-2 font-medium">{t('auth.login.subtitle')}</p>

              <div className="mt-8">
                <GoogleLogin
                  onSuccess={onGoogleSuccess}
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

              <form onSubmit={handleLoginSubmit(onSubmitLogin)} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="login-email" className="block text-xs font-bold text-gray-600 tracking-wider">{t('auth.login.email')}</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-3.5 text-gray-400" />
                    <input
                      id="login-email"
                      type="email"
                      {...regLogin('email')}
                      className={inputClass}
                      placeholder="estudiante@mathflow.edu"
                      aria-required="true"
                    />
                  </div>
                  {loginErrors.email && (
                    <p className="text-sm text-red-500 font-medium">{loginErrors.email.message}</p>
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
                      {...regLogin('password')}
                      className={inputClass}
                      placeholder="••••••••"
                      aria-required="true"
                    />
                  </div>
                  {loginErrors.password && (
                    <p className="text-sm text-red-500 font-medium">{loginErrors.password.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loadingLogin}
                  className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
                >
                  {loadingLogin ? t('auth.login.loading') : t('auth.login.submit')}
                </button>
              </form>

              <p className="text-center mt-6 text-gray-600">
                {t('auth.login.noAccount')}{' '}
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="text-purple-600 font-bold hover:underline"
                >
                  {t('auth.login.signUp')}
                </button>
              </p>

              <p className="text-center mt-6 text-xs text-gray-400">
                {t('auth.login.termsText')} <a href="#" className="underline hover:text-purple-600">{t('auth.login.terms')}</a> {t('auth.login.and')} <a href="#" className="underline hover:text-purple-600">{t('auth.login.privacy')}</a>
              </p>
            </div>

            {/* Slide Register */}
            <div className="w-1/2 shrink-0 pl-6">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">{t('auth.register.title')}</h2>
              <p className="text-gray-500 mt-2 font-medium">{t('auth.register.subtitle')}</p>

              <form onSubmit={handleRegisterSubmit(onSubmitRegister)} className="mt-8 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="reg-fullname" className="block text-xs font-bold text-gray-600 tracking-wider">{t('auth.register.fullName')}</label>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-3.5 text-gray-400" />
                    <input
                      id="reg-fullname"
                      type="text"
                      {...regRegister('full_name')}
                      className={inputClass}
                      placeholder={t('auth.register.fullNamePlaceholder')}
                      aria-required="true"
                    />
                  </div>
                  {registerErrors.full_name && (
                    <p className="text-sm text-red-500 font-medium">{registerErrors.full_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="reg-email" className="block text-xs font-bold text-gray-600 tracking-wider">{t('auth.register.email')}</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-3.5 text-gray-400" />
                    <input
                      id="reg-email"
                      type="email"
                      {...regRegister('email')}
                      className={inputClass}
                      placeholder={t('auth.register.emailPlaceholder')}
                      aria-required="true"
                    />
                  </div>
                  {registerErrors.email && (
                    <p className="text-sm text-red-500 font-medium">{registerErrors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="reg-password" className="block text-xs font-bold text-gray-600 tracking-wider">{t('auth.register.password')}</label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-3.5 text-gray-400" />
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      {...regRegister('password')}
                      className="w-full pl-11 pr-11 py-3 rounded-xl bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white border border-transparent transition placeholder-gray-400"
                      placeholder={t('auth.register.passwordPlaceholder')}
                      aria-required="true"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600"
                      aria-label={t('auth.register.showPassword') || 'Mostrar contraseña'}
                      aria-controls="reg-password"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {registerErrors.password && (
                    <p className="text-sm text-red-500 font-medium">{registerErrors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="reg-password-confirm" className="block text-xs font-bold text-gray-600 tracking-wider">{t('auth.register.confirmPassword')}</label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-3.5 text-gray-400" />
                    <input
                      id="reg-password-confirm"
                      type="password"
                      {...regRegister('password_confirmation')}
                      className={inputClass}
                      placeholder={t('auth.register.confirmPasswordPlaceholder')}
                      aria-required="true"
                    />
                  </div>
                  {registerErrors.password_confirmation && (
                    <p className="text-sm text-red-500 font-medium">{registerErrors.password_confirmation.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="reg-level" className="block text-xs font-bold text-gray-600 tracking-wider">{t('auth.register.academicLevel')}</label>
                  <div className="relative">
                    <FaGraduationCap className="absolute left-4 top-3.5 text-gray-400" />
                    <select
                      id="reg-level"
                      {...regRegister('academic_level')}
                      className="appearance-none w-full pl-11 pr-9 py-3 rounded-xl bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white border border-transparent transition cursor-pointer"
                      aria-required="true"
                    >
                      <option value="">{t('auth.register.selectLevel')}</option>
                      <option value="basic">{t('auth.register.basic')}</option>
                      <option value="intermediate">{t('auth.register.intermediate')}</option>
                      <option value="advanced">{t('auth.register.advanced')}</option>
                    </select>
                    <FaChevronDown className="absolute right-3 top-3 text-gray-400 text-xs pointer-events-none" />
                  </div>
                  {registerErrors.academic_level && (
                    <p className="text-sm text-red-500 font-medium">{registerErrors.academic_level.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loadingRegister}
                  className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
                >
                  {loadingRegister ? t('auth.register.loading') : t('auth.register.submit')}
                </button>
              </form>

              <p className="text-center mt-6 text-gray-600">
                {t('auth.register.haveAccount')}{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-purple-600 font-bold hover:underline"
                >
                  {t('auth.register.signIn')}
                </button>
              </p>

              <p className="text-center mt-6 text-xs text-gray-400">
                {t('auth.register.termsText')} <a href="#" className="underline hover:text-purple-600">{t('auth.register.terms')}</a> {t('auth.register.and')} <a href="#" className="underline hover:text-purple-600">{t('auth.register.privacy')}</a>
              </p>
            </div>
          </div>
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
            <button
              type="button"
              onClick={() => navigate(isRegister ? '/login' : '/register')}
              className="text-white/80 hover:text-white font-medium transition"
            >
              {isRegister ? t('auth.register.signIn') : t('auth.login.signUp')}
            </button>
            <button
              type="button"
              onClick={() => navigate(isRegister ? '/login' : '/register')}
              className="bg-white text-purple-900 font-bold px-5 py-2 rounded-full hover:bg-purple-100 transition"
            >
              {isRegister ? 'Sign In' : 'Join Us'}
            </button>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10 pb-12">
          <img
            src="/ejemplo_login.png"
            alt="MathFlow Community"
            className="w-full max-w-md mx-auto object-contain drop-shadow-[0_10px_30px_rgba(168,85,247,0.4)]"
          />
          <h3 className="text-white text-2xl font-bold mt-6">
            {isRegister ? t('auth.register.brandingTitle') : '¡Aprende matemáticas jugando!'}
          </h3>
          <p className="text-purple-200/80 mt-2 text-center max-w-sm">
            {isRegister ? t('auth.register.brandingDesc') : 'Lecciones interactivas, evaluaciones y progreso en tiempo real.'}
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

export default Auth;
