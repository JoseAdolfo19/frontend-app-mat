import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/auth';
import toast from 'react-hot-toast';
import { FaEnvelope, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success(t('auth.forgot.sentTitle'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('auth.forgot.sendError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-blue-600 mb-2 tracking-tight">SIM</h1>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          {sent ? (
            <div className="text-center">
              <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.forgot.sentTitle')}</h2>
              <p className="text-gray-600 mb-6">
                {t('auth.forgot.sentMessage')}
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline"
              >
                <FaArrowLeft /> {t('auth.forgot.backToLogin')}
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.forgot.title')}</h2>
              <p className="text-gray-600 mb-6">
                {t('auth.forgot.subtitle')}
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="forgot-email" className="block text-sm font-semibold text-gray-700">{t('auth.forgot.email')}</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-600 focus:outline-none bg-white text-gray-900 transition-all"
                      placeholder="estudiante@sim.edu"
                      aria-required="true"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 shadow-md"
                >
                  {loading ? t('auth.forgot.loading') : t('auth.forgot.submit')}
                </button>
              </form>

              <p className="text-center mt-6">
                <Link to="/login" className="text-blue-600 font-bold hover:underline inline-flex items-center gap-2">
                  <FaArrowLeft /> {t('auth.forgot.backToLogin')}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
