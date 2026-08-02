import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-black text-white tracking-tight drop-shadow-lg">
            Math<span className="text-indigo-300">Flow</span>
          </h1>
          <p className="text-white text-sm mt-1 opacity-80 font-medium">{t('auth.login.subtitle')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white border-opacity-20"
        >
          <h2 className="text-2xl font-bold text-white mb-6">{t('auth.login.welcome')}</h2>

          {/* Botón Google */}
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error(t('auth.login.googleError'))}
            theme="filled_black"
            shape="pill"
            text="continue_with"
            size="large"
            width="100%"
          />

          {/* Separador */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-white border-opacity-30"></div>
            <span className="px-4 text-white text-sm opacity-60">{t('auth.login.orContinueWith')}</span>
            <div className="flex-1 border-t border-white border-opacity-30"></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="login-email" className="block text-white text-sm font-medium opacity-80">{t('auth.login.email')}</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-3.5 text-white text-opacity-50" />
                <input
                  id="login-email"
                  type="email"
                  {...register('email')}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white bg-opacity-10 text-white placeholder-white placeholder-opacity-50 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                  placeholder="estudiante@mathflow.edu"
                  aria-required="true"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-pink-300 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="login-password" className="block text-white text-sm font-medium opacity-80">{t('auth.login.password')}</label>
                <Link to="/forgot-password" className="text-sm text-indigo-200 hover:text-white transition opacity-80 hover:opacity-100 font-medium">
                  {t('auth.login.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <FaLock className="absolute left-4 top-3.5 text-white text-opacity-50" />
                <input
                  id="login-password"
                  type="password"
                  {...register('password')}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white bg-opacity-10 text-white placeholder-white placeholder-opacity-50 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                  placeholder="••••••••"
                  aria-required="true"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-pink-300 font-medium">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/30 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 mt-2"
            >
              {loading ? t('auth.login.loading') : t('auth.login.submit')}
            </button>
          </form>

          <p className="text-center text-white text-sm mt-6 opacity-80">
            {t('auth.login.noAccount')}{' '}
            <Link to="/register" className="text-indigo-200 font-semibold hover:text-white transition">
              {t('auth.login.signUp')}
            </Link>
          </p>
        </motion.div>

        <p className="text-center mt-6 text-xs text-white opacity-50">
          {t('auth.login.termsText')} <a href="#" className="underline hover:text-white">{t('auth.login.terms')}</a> {t('auth.login.and')} <a href="#" className="underline hover:text-white">{t('auth.login.privacy')}</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
