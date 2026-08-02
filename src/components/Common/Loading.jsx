import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const Loading = () => {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--background)]" role="status" aria-live="polite">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[var(--primary)]/20 rounded-full animate-spin border-t-[var(--primary)]"></div>
          <div className="mt-4 text-[var(--on-surface-variant)] font-medium">
            {t('common.loading')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;