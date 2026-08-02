import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const schema = yup.object().shape({
    full_name: yup.string().required(t('auth.register.nameRequired')),
    email: yup.string().email(t('auth.register.emailInvalid')).required(t('auth.register.emailRequired')),
    password: yup.string().min(8, t('auth.register.passwordMin')).required(t('auth.register.passwordRequired')),
    password_confirmation: yup.string()
      .oneOf([yup.ref('password')], t('auth.register.passwordMatch'))
      .required(t('auth.register.confirmPasswordRequired')),
    academic_level: yup.string().required(t('auth.register.levelRequired')),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await registerUser({ ...data, role: 'student' });
    setLoading(false);

    if (result.success) {
      toast.success(t('auth.register.successMsg'));
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <div className="grid md:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">

          {/* Left Side - Branding */}
          <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-600 to-blue-700 relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500 rounded-full opacity-50 blur-3xl"></div>
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-500 rounded-full opacity-50 blur-3xl"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-12">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                  </svg>
                </div>
                <span className="text-white font-bold text-xl tracking-tight">MathFlow</span>
              </div>

              <h1 className="text-white font-bold text-4xl mb-6 leading-tight">{t('auth.register.brandingTitle')}</h1>
              <p className="text-white/90 font-medium max-w-md leading-relaxed">
                {t('auth.register.brandingDesc')}
              </p>
            </div>

            <div className="relative z-10 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/50 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-blue-300 to-indigo-300"></div>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{t('auth.register.mentorName')}</p>
                  <p className="text-blue-100 text-xs uppercase tracking-widest font-bold">{t('auth.register.mentorRole')}</p>
                </div>
              </div>
              <p className="text-white/80 italic font-medium text-sm leading-relaxed">
                {t('auth.register.mentorQuote')}
              </p>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="p-8 md:p-16 flex flex-col justify-center">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.register.title')}</h2>
              <p className="text-gray-600 text-sm">{t('auth.register.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <label htmlFor="reg-fullname" className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaUser className="inline mr-2 text-blue-600" />
                  {t('auth.register.fullName')}
                </label>
                <input
                  id="reg-fullname"
                  type="text"
                  {...register('full_name')}
                  aria-required="true"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-600 focus:outline-none bg-white text-gray-900 transition-all placeholder-gray-400"
                  placeholder={t('auth.register.fullNamePlaceholder')}
                />
                {errors.full_name && (
                  <p className="text-sm text-red-500 mt-1 font-medium">{errors.full_name.message}</p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                <label htmlFor="reg-email" className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaEnvelope className="inline mr-2 text-blue-600" />
                  {t('auth.register.email')}
                </label>
                <input
                  id="reg-email"
                  type="email"
                  {...register('email')}
                  aria-required="true"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-600 focus:outline-none bg-white text-gray-900 transition-all placeholder-gray-400"
                  placeholder={t('auth.register.emailPlaceholder')}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1 font-medium">{errors.email.message}</p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <label htmlFor="reg-password" className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaLock className="inline mr-2 text-blue-600" />
                  {t('auth.register.password')}
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    aria-required="true"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-600 focus:outline-none bg-white text-gray-900 transition-all placeholder-gray-400"
                    placeholder={t('auth.register.passwordPlaceholder')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                    aria-label={showPassword ? t('auth.register.hidePassword') || 'Ocultar contraseña' : t('auth.register.showPassword') || 'Mostrar contraseña'}
                    aria-controls="reg-password"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1 font-medium">{errors.password.message}</p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
              >
                <label htmlFor="reg-password-confirm" className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaLock className="inline mr-2 text-blue-600" />
                  {t('auth.register.confirmPassword')}
                </label>
                <input
                  id="reg-password-confirm"
                  type="password"
                  {...register('password_confirmation')}
                  aria-required="true"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-600 focus:outline-none bg-white text-gray-900 transition-all placeholder-gray-400"
                  placeholder={t('auth.register.confirmPasswordPlaceholder')}
                />
                {errors.password_confirmation && (
                  <p className="text-sm text-red-500 mt-1 font-medium">{errors.password_confirmation.message}</p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <label htmlFor="reg-level" className="block text-sm font-semibold text-gray-700 mb-2">
                  <svg className="inline mr-2 w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.669 0-3.218.51-4.5 1.385A7.968 7.968 0 009 4.804z"/></svg>
                  {t('auth.register.academicLevel')}
                </label>
                <select
                  id="reg-level"
                  {...register('academic_level')}
                  aria-required="true"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-600 focus:outline-none bg-white text-gray-900 transition-all"
                >
                  <option value="">{t('auth.register.selectLevel')}</option>
                  <option value="basic">{t('auth.register.basic')}</option>
                  <option value="intermediate">{t('auth.register.intermediate')}</option>
                  <option value="advanced">{t('auth.register.advanced')}</option>
                </select>
                {errors.academic_level && (
                  <p className="text-sm text-red-500 mt-1 font-medium">{errors.academic_level.message}</p>
                )}
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 mt-8 shadow-md"
              >
                {loading ? t('auth.register.loading') : t('auth.register.submit')}
              </motion.button>
            </form>

            <p className="text-center mt-6 text-gray-600 text-sm">
              {t('auth.register.haveAccount')}{' '}
              <Link
                to="/login"
                className="text-blue-600 font-bold hover:underline"
              >
                {t('auth.register.signIn')}
              </Link>
            </p>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8 text-xs text-gray-500"
        >
          {t('auth.register.termsText')} <a href="#" className="underline hover:text-blue-600">{t('auth.register.terms')}</a> {t('auth.register.and')} <a href="#" className="underline hover:text-blue-600">{t('auth.register.privacy')}</a>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Register;