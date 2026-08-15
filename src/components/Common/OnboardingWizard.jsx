import React, { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaChevronLeft, FaChevronRight, FaTimes, FaFastForward } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { getOnboardingSteps, ONBOARDING_DONE_KEY } from '../../data/onboardingConfig';

const OnboardingWizard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  const role = user?.role?.name;
  const steps = getOnboardingSteps(role);
  const total = steps?.length || 0;

  const markDone = useCallback(() => {
    try {
      const current = JSON.parse(localStorage.getItem(ONBOARDING_DONE_KEY) || '{}');
      if (user?.id) current[user.id] = true;
      localStorage.setItem(ONBOARDING_DONE_KEY, JSON.stringify(current));
    } catch {
      localStorage.setItem(ONBOARDING_DONE_KEY, JSON.stringify({ [user?.id]: true }));
    }
  }, [user?.id]);

  useEffect(() => {
    if (!steps || !user?.id) return;
    let done = false;
    try {
      const current = JSON.parse(localStorage.getItem(ONBOARDING_DONE_KEY) || '{}');
      done = !!current[user.id];
    } catch {
      done = false;
    }
    if (!done) {
      // Pequeño retraso para que el layout esté listo y no sea disruptivo.
      const timer = setTimeout(() => {
        setStep(0);
        setOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [steps, user?.id]);

  const close = useCallback(() => {
    markDone();
    setOpen(false);
  }, [markDone]);

  const next = () => {
    if (step >= total - 1) {
      close();
    } else {
      setStep((s) => s + 1);
    }
  };

  const prev = () => setStep((s) => Math.max(0, s - 1));

  const onKeyDown = (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  };

  if (!open || !steps || total === 0) return null;

  const StepIcon = steps[step].icon;
  const title = t(`onboarding.${role}.${step}.title`);
  const body = t(`onboarding.${role}.${step}.body`);
  const isLast = step === total - 1;
  const progress = ((step + 1) / total) * 100;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('onboarding.title')}
      onKeyDown={onKeyDown}
      tabIndex={-1}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-lg bg-[var(--surface)] rounded-3xl shadow-2xl border border-[var(--surface-container)] overflow-hidden">
        {/* Barra de progreso */}
        <div className="h-1.5 bg-[var(--surface-container)]">
          <div
            className="h-full bg-[var(--primary)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between mb-6">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
              <FaHandPeace className="text-lg" />
              {t('onboarding.title')}
            </span>
            <span className="text-sm font-medium text-[var(--on-surface-variant)]">
              {step + 1} / {total}
            </span>
          </div>

          <div
            key={step}
            className="flex flex-col items-center text-center animate-[fadeSlide_0.3s_ease-out]"
          >
            <div className="w-20 h-20 rounded-2xl bg-[var(--primary)] bg-opacity-10 flex items-center justify-center mb-5">
              <StepIcon className="text-4xl text-[var(--primary)]" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--on-surface)] mb-3">
              {title}
            </h2>
            <p className="text-[var(--on-surface-variant)] leading-relaxed max-w-sm">
              {body}
            </p>
          </div>

          {/* Puntos indicadores */}
          <div className="flex justify-center gap-2 mt-6" aria-hidden="true">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                aria-label={`${t('onboarding.goto')} ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step ? 'w-6 bg-[var(--primary)]' : 'w-2 bg-[var(--surface-container)]'
                }`}
              />
            ))}
          </div>

          {/* Acciones: Anterior / Saltar / Continuar */}
          <div className="flex items-center justify-between gap-3 mt-8">
            <button
              onClick={prev}
              disabled={step === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <FaChevronLeft className="text-xs" />
              {t('onboarding.prev')}
            </button>

            <button
              onClick={close}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] transition-colors"
            >
              <FaFastForward className="text-xs" />
              {t('onboarding.skip')}
            </button>

            <button
              onClick={next}
              autoFocus
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[var(--primary)] text-white hover:opacity-90 shadow-sm transition-opacity"
            >
              {isLast ? t('onboarding.finish') : t('onboarding.next')}
              {!isLast && <FaChevronRight className="text-xs" />}
            </button>
          </div>

          <button
            onClick={close}
            aria-label={t('onboarding.close')}
            className="absolute top-4 right-4 p-2 rounded-lg text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] transition-colors"
          >
            <FaTimes />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default OnboardingWizard;