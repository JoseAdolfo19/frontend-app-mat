import * as Sentry from '@sentry/react';

const isDev = import.meta.env.DEV;

export const logger = {
  error(...args) {
    if (isDev) {
      console.error(...args);
    } else {
      const err = args[0];
      if (err instanceof Error) {
        Sentry.captureException(err);
      } else {
        Sentry.captureMessage(args.map(String).join(' '));
      }
    }
  },
  warn(...args) {
    if (isDev) {
      console.warn(...args);
    }
  },
};