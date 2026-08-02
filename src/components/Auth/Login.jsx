import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { FaGoogle, FaEnvelope, FaLock } from 'react-icons/fa';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-blue-600 mb-2 tracking-tight">MathFlow</h1>
          <p className="text-gray-600 font-medium">{t('auth.login.subtitle')}</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('auth.login.welcome')}</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="login-email" className="block text-sm font-semibold text-gray-700">{t('auth.login.email')}</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                <input
                  id="login-email"
                  type="email"
                  {...register('email')}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-600 focus:outline-none bg-white text-gray-900 transition-all placeholder-gray-400"
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
                <label htmlFor="login-password" className="block text-sm font-semibold text-gray-700">{t('auth.login.password')}</label>
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline font-medium">
                  {t('auth.login.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <FaLock className="absolute left-3 top-3 text-gray-400" />
                <input
                  id="login-password"
                  type="password"
                  {...register('password')}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-600 focus:outline-none bg-white text-gray-900 transition-all placeholder-gray-400"
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
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 mt-8 shadow-md"
            >
              {loading ? t('auth.login.loading') : t('auth.login.submit')}
            </button>
          </form>

          <div className="relative flex items-center my-6">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-xs font-semibold text-gray-500 uppercase">{t('auth.login.orContinueWith')}</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-600 transition-all">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error(t('auth.login.googleError'))}
              theme="filled_blue"
              shape="pill"
              text="continue_with"
            />
          </div>

          <p className="text-center mt-6 text-gray-600">
            {t('auth.login.noAccount')}{' '}
            <Link
              to="/register"
              className="text-blue-600 font-bold hover:underline"
            >
              {t('auth.login.signUp')}
            </Link>
          </p>
        </div>

        <p className="text-center mt-6 text-xs text-gray-500">
          {t('auth.login.termsText')} <a href="#" className="underline hover:text-blue-600">{t('auth.login.terms')}</a> {t('auth.login.and')} <a href="#" className="underline hover:text-blue-600">{t('auth.login.privacy')}</a>
        </p>
      </div>
    </div>
  );
};

export default Login;