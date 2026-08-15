# Security Policy

## Reporting a Vulnerability

Si encuentras una vulnerabilidad de seguridad, **no** abras un issue público. Contacta al mantenedor por correo a **ibericosunaa@gmail.com** con los detalles.

Por favor incluye:

- Descripción del problema.
- Pasos para reproducirlo.
- Impacto estimado.
- (Opcional) una sugerencia de mitigación.

Agradecemos la divulgación responsable; normalmente respondemos en un plazo de 5 días hábiles.

## Principios del proyecto

- **Secretos**: las API keys (Groq, FCM, Google, NVIDIA) viven **solo** en el backend/proxy, nunca con prefijo `VITE_` ni en el frontend.
- **Entorno**: `VITE_API_URL` y `VITE_GOOGLE_CLIENT_ID` son públicas por diseño y se validan al arranque (`src/config/env.js`).
- **CSP / saneado**: el contenido HTML de lecciones se saneado en el backend; el frontend no inyecta scripts externos.
- **Anti-trampa**: los eventos de sospecha se reportan al backend (`/exams/attempts/{id}/cheat`); el backend decide sobre los intentos.