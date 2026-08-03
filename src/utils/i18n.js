import translations from '../contexts/LanguageContext';

const STORAGE_KEY = 'sim_language';

export const getSavedLanguage = () => localStorage.getItem(STORAGE_KEY) || 'es';
export const saveLanguage = (lang) => localStorage.setItem(STORAGE_KEY, lang);

export const getTranslation = (lang, key) => {
  const keys = key.split('.');
  let value = translations[lang];
  for (const k of keys) {
    value = value?.[k];
  }
  return value || key;
};

export const getT = (lang) => (key) => getTranslation(lang, key);
