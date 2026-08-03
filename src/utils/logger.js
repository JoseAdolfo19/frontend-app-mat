const isDev = import.meta.env.DEV;

export const logger = {
  error(...args) {
    if (isDev) {
      console.error(...args);
    } else {
      // En producción, enviar a un servicio de monitoreo (Sentry, LogRocket, backend de logs).
      // Ejemplo: Sentry.captureException(args[0])
    }
  },
  warn(...args) {
    if (isDev) {
      console.warn(...args);
    }
  },
};
