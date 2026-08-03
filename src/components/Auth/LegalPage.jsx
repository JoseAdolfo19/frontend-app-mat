import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaUsers } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';

const LegalPage = ({ kind }) => {
  const { t, lang, changeLanguage } = useLanguage();
  const isTerms = kind === 'terms';
  const sections = isTerms ? t('legal.termsSections') : t('legal.privacySections');
  const title = isTerms ? t('legal.termsTitle') : t('legal.privacyTitle');

  const langs = [
    { code: 'es', label: 'ES' },
    { code: 'en', label: 'EN' },
    { code: 'qu', label: 'QU' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-6 py-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 font-semibold transition"
          >
            <FaArrowLeft />
            {t('legal.backToLogin')}
          </Link>

          <h1 className="text-xl font-black text-gray-900 tracking-tight">
            Math<span className="text-purple-600">Flow</span>
          </h1>

          <div className="relative">
            <select
              value={lang}
              onChange={(e) => changeLanguage(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {langs.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-2">
          <FaUsers className="text-purple-600 text-xl" />
          <span className="text-purple-600 font-bold">SIM Community</span>
        </div>

        <h2 className="text-3xl font-black text-gray-900 leading-tight mb-1">{title}</h2>
        <p className="text-sm text-gray-500 mb-8">{t('legal.lastUpdated')}</p>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <section key={index}>
              <h3 className="text-lg font-bold text-gray-900 mb-1.5">{section.title}</h3>
              <p className="text-gray-600 leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
          <Link
            to={isTerms ? '/privacy' : '/terms'}
            className="flex-1 text-center px-6 py-3 border-2 border-purple-600 text-purple-600 font-bold rounded-xl hover:bg-purple-50 transition"
          >
            {isTerms ? t('legal.privacyTitle') : t('legal.termsTitle')}
          </Link>
          <Link
            to="/login"
            className="flex-1 text-center px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition"
          >
            {t('legal.backToLogin')}
          </Link>
        </div>
      </main>
    </div>
  );
};

export default LegalPage;
