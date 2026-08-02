import React, { useState } from 'react';
import { FaQuestionCircle, FaChevronDown, FaEnvelope, FaBook } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';

const Help = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const { t } = useLanguage();

  const faqs = [
    { question: t('help.q1'), answer: t('help.a1') },
    { question: t('help.q2'), answer: t('help.a2') },
    { question: t('help.q3'), answer: t('help.a3') },
    { question: t('help.q4'), answer: t('help.a4') },
    { question: t('help.q5'), answer: t('help.a5') },
  ];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <FaQuestionCircle className="mx-auto text-4xl text-[var(--primary)] mb-3" />
        <h2 className="text-3xl font-bold text-[var(--on-surface)]">{t('help.title')}</h2>
        <p className="text-[var(--on-surface-variant)]">
          {t('help.subtitle')}
        </p>
      </div>

      <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--surface-container)] overflow-hidden">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-[var(--surface-container)] last:border-b-0">
            <button
              onClick={() => toggleFaq(index)}
              className="w-full flex justify-between items-center p-5 text-left hover:bg-[var(--surface-container-low)] transition-colors"
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
            >
              <span className="font-medium text-[var(--on-surface)]">{faq.question}</span>
              <FaChevronDown
                className={`text-[var(--on-surface-variant)] transition-transform flex-shrink-0 ml-4 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openIndex === index && (
              <div id={`faq-answer-${index}`} role="region" className="px-5 pb-5 text-[var(--on-surface-variant)] text-sm leading-relaxed">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-[var(--primary)] rounded-2xl p-8 text-white text-center">
        <FaEnvelope className="mx-auto text-3xl mb-3" />
        <h3 className="text-xl font-bold mb-2">{t('help.contactTitle')}</h3>
        <p className="text-blue-100 mb-4">{t('help.contactSubtitle')}</p>
        <a
          href="mailto:ibericosunaa@gmail.com"
          className="inline-block px-6 py-3 bg-white text-[var(--primary)] font-bold rounded-xl hover:shadow-lg transition-all"
        >
          ibericosunaa@gmail.com
        </a>
      </div>

      <div className="flex items-center gap-3 p-5 bg-[var(--surface-container-low)] rounded-2xl">
        <FaBook className="text-[var(--primary)] text-xl flex-shrink-0" />
        <p className="text-sm text-[var(--on-surface-variant)]">
          {t('help.advice')}
        </p>
      </div>
    </div>
  );
};

export default Help;