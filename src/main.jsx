import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { env } from './config/env';

registerSW({ immediate: true });

if (env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.25,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
