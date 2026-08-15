import { describe, it, expect } from 'vitest';
import translations from '../../contexts/LanguageContext';
import { ONBOARDING_STEPS, getOnboardingSteps } from '../../data/onboardingConfig';

const ROLES = ['student', 'teacher', 'admin', 'parent'];

const getNested = (obj, path) => {
  const keys = path.split('.');
  let value = obj;
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) return undefined;
  }
  return value;
};

describe('OnboardingWizard', () => {
  it('define pasos de onboarding para los 4 roles', () => {
    for (const role of ROLES) {
      expect(getOnboardingSteps(role), `role ${role}`).not.toBeNull();
      expect(ONBOARDING_STEPS[role].length).toBeGreaterThan(0);
    }
  });

  it('cada rol expone claves de traducción válidas en es/en/qu', () => {
    for (const lang of ['es', 'en', 'qu']) {
      for (const role of ROLES) {
        const steps = ONBOARDING_STEPS[role];
        for (let i = 0; i < steps.length; i++) {
          const title = getNested(translations[lang], `onboarding.${role}.${i}.title`);
          const body = getNested(translations[lang], `onboarding.${role}.${i}.body`);
          expect(title, `${lang}.${role}.${i}.title`).toBeTruthy();
          expect(body, `${lang}.${role}.${i}.body`).toBeTruthy();
        }
      }
    }
  });

  it('las claves genéricas de botones existen en los tres idiomas', () => {
    for (const lang of ['es', 'en', 'qu']) {
      for (const key of ['title', 'close', 'goto', 'prev', 'skip', 'next', 'finish']) {
        expect(
          getNested(translations[lang], `onboarding.${key}`),
          `${lang}.onboarding.${key}`
        ).toBeTruthy();
      }
    }
  });
});