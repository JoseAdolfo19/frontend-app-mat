import * as yup from 'yup';

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
  VITE_API_URL: yup.string().required().test('is-url', 'Debe ser una URL válida', isUrl),
  VITE_GOOGLE_CLIENT_ID: yup.string().min(1).required(),
  VITE_SENTRY_DSN: yup.string().test('is-url', 'Debe ser una URL válida', (v) => !v || isUrl(v)).notRequired(),
}).noUnknown(false);

const parseResult = (() => {
  try {
    return {
      value: envSchema.validateSync(import.meta.env, { abortEarly: false, stripUnknown: false }),
      error: null,
    };
  } catch (err) {
    return { value: null, error: err };
  }
})();

if (parseResult.error) {
  const details = parseResult.error.inner
    ?.map((e) => `${e.path}: ${e.message}`)
    .join('\n');
  console.error('Variables de entorno inválidas:', details || parseResult.error.message);
  throw new Error('Configuración de entorno incompleta. Revisa tu archivo .env');
}

export const env = parseResult.value;
