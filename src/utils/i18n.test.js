import { describe, it, expect } from 'vitest';
import translations from '../contexts/LanguageContext';

const flattenKeys = (obj, prefix = '') => {
  const keys = new Set();
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object') {
      for (const k of flattenKeys(value, path)) keys.add(k);
    } else {
      keys.add(path);
    }
  }
  return keys;
};

describe('i18n parity', () => {
  it('tiene las mismas claves en es y en', () => {
    const es = flattenKeys(translations.es);
    const en = flattenKeys(translations.en);
    const missingEn = [...es].filter((k) => !en.has(k));
    const extraEn = [...en].filter((k) => !es.has(k));
    expect(missingEn).toEqual([]);
    expect(extraEn).toEqual([]);
  });

  it('quechua (qu) no deja ninguna clave de es sin traducir', () => {
    const es = flattenKeys(translations.es);
    const qu = flattenKeys(translations.qu);
    const missingQu = [...es].filter((k) => !qu.has(k));
    expect(missingQu).toEqual([]);
  });

  it('quechua (qu) no introduce claves que no existan en es', () => {
    const es = flattenKeys(translations.es);
    const qu = flattenKeys(translations.qu);
    const extraQu = [...qu].filter((k) => !es.has(k));
    expect(extraQu).toEqual([]);
  });
});