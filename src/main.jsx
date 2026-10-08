// Inicializa el service worker, el monitoreo de errores y el punto de montaje de React.
import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { env, envError, isEnvValid } from './config/env';

registerSW({ immediate: true });

if (isEnvValid && env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.25,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
  });
}

/**
 * Se muestra en lugar de la aplicación cuando la configuración de entorno es
 * inválida. Antes, este error aparecía solo en la consola y el usuario veía
 * una página en blanco sin explicación.
 */
const EnvErrorScreen = () => (
  <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2.5rem 1.5rem', maxWidth: '46rem', margin: '0 auto' }}>
    <h1 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem', color: '#b91c1c' }}>
      Falta configuración del entorno
    </h1>
    <p style={{ margin: '0 0 1.25rem', color: '#475569' }}>
      La aplicación no puede arrancar hasta que se corrijan estos problemas:
    </p>
    <ul style={{ margin: '0 0 1.5rem', paddingLeft: '1.25rem', color: '#334155' }}>
      {envError.map((p) => (
        <li key={p} style={{ marginBottom: '0.4rem' }}>{p}</li>
      ))}
    </ul>
    <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>
      Define <code>VITE_API_URL</code> y <code>VITE_GOOGLE_CLIENT_ID</code> en tu archivo
      <code> .env</code> o en las variables de entorno del servidor de despliegue, y
      vuelve a compilar. <code>VITE_API_URL</code> debe terminar en <code>/api/v1</code>.
    </p>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isEnvValid ? <App /> : <EnvErrorScreen />}
  </React.StrictMode>
);
