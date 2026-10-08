// Validates and exports the frontend's environment configuration.
import * as yup from 'yup';

const PLACEHOLDER = /__REEMPLAZA_CON_[A-Z_]*__/;

const isUrl = (value) => {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const envSchema = yup.object().shape({
  VITE_API_URL: yup.string()
    .required('falta VITE_API_URL (URL del backend, terminada en /api/v1)')
    .test('no-placeholder', 'VITE_API_URL todavía tiene el marcador __REEMPLAZA_CON_URL_BACKEND__', (v) => !PLACEHOLDER.test(v || ''))
    .test('is-url', 'VITE_API_URL no es una URL válida (http:// o https://)', isUrl),
  VITE_GOOGLE_CLIENT_ID: yup.string()
    .required('falta VITE_GOOGLE_CLIENT_ID')
    .test('no-placeholder', 'VITE_GOOGLE_CLIENT_ID todavía tiene un marcador sin reemplazar', (v) => !PLACEHOLDER.test(v || ''))
    .min(1, 'VITE_GOOGLE_CLIENT_ID está vacío'),
  VITE_SENTRY_DSN: yup.string()
    .test('is-url', 'VITE_SENTRY_DSN no es una URL válida', (v) => !v || isUrl(v))
    .notRequired(),
}).noUnknown(false);

const validate = () => {
  try {
    const value = envSchema.validateSync(import.meta.env, { abortEarly: false, stripUnknown: false });
    return { value, error: null };
  } catch (err) {
    return { value: null, error: err };
  }
};

const result = validate();

const problems = result.error
  ? (result.error.inner || []).map((e) => (e.path ? `${e.path}: ${e.message}` : e.message))
  : null;

if (problems) {
  // Se registra para diagnóstico, pero NO se lanza: lanzar aquí dejaba la
  // aplicación completamente en blanco y sin mensaje al usuario.
  console.error('Configuración de entorno inválida:\n' + problems.join('\n'));
}

/**
 * Variables de entorno validadas.
 *
 * Siempre es un objeto (nunca `null`) para que los módulos que lo importan
 * durante el arranque —axios, main— no lancen excepciones en la evaluación
 * de imports, que ocurre antes de que React pueda renderizar nada. Cuando la
 * validación falla contiene los valores presentes aunque sean inválidos o
 * vacíos; revisa `envError` para saber si son utilizables.
 */
export const env = result.value || { ...import.meta.env };

/** Lista de problemas de configuración, o `null` si todo es correcto. */
export const envError = problems;

/** `true` cuando la app puede arrancar con esta configuración. */
export const isEnvValid = !problems;
