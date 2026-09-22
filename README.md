# KawsayMath Frontend

Aplicación web de KawsayMath para el aprendizaje de matemáticas. Ofrece experiencias diferenciadas para estudiantes, docentes, familias, coordinación y administración, conectándose con la API Laravel del proyecto.

## Stack

- React 18 y React Router 6.
- Vite 7 para desarrollo y compilación.
- Tailwind CSS, CSS propio y temas configurables.
- Axios para comunicación con la API.
- React Hook Form y Yup para formularios y validación.
- Recharts para visualización de datos.
- Framer Motion para transiciones.
- React Quill para edición de contenidos.
- PWA mediante `vite-plugin-pwa`.
- Vitest y Testing Library para pruebas de componentes.
- Playwright para pruebas end-to-end.

## Funcionalidades

- Landing, registro, inicio de sesión, Google OAuth y recuperación de contraseña.
- Términos, privacidad y política de datos.
- Dashboards adaptados al rol y diseño responsive para escritorio y móvil.
- Lecciones, recursos, cursos, simulaciones y juegos de matemáticas.
- Evaluaciones, resultados, exámenes, cronómetro y alertas de comportamiento no permitido.
- Paneles de trabajo para entregas de estudiantes y revisión docente.
- Progreso individual, competencias, niveles, insignias, rankings y gamificación.
- Reportes académicos y estadísticas para docentes.
- Gestión de salones y calendario académico.
- Seguimiento de hijos y reportes para familias.
- Administración de usuarios, configuración, colores, traducciones y trabajos.
- Mensajería, foros, ayuda, perfil, preferencias y notificaciones.
- Chat educativo conectado al proxy seguro de IA del backend.
- Notificaciones push y funcionamiento como aplicación instalable cuando el entorno PWA está habilitado.

## Roles y rutas principales

- Público: `/`, `/login`, `/register`, `/forgot-password`, `/terms`, `/privacy`, `/data-policy`.
- Estudiante: `/dashboard`, `/lessons`, `/evaluations`, `/exams`, `/my-work`, `/ranking`, `/gamification`, `/simulations`, `/games`.
- Docente: `/teacher/dashboard`, `/teacher/lessons/create`, `/teacher/evaluations/create`, `/teacher/exams`, `/reports`, `/teacher/calendar`, `/teacher/salones`.
- Coordinación: `/coordinator/salones`.
- Administración: `/admin/dashboard`, `/admin/users`, `/admin/config`, `/admin/colors`, `/admin/works`, `/admin/translations`.
- Familia: `/parent/lookup`, `/parent`, `/parent/children/:studentId` y reportes asociados.
- Compartido: `/profile`, `/notifications`, `/settings`, `/help`, `/messages`, `/forum`, `/my-courses`.

El acceso se controla mediante rutas protegidas y permisos por rol. La aplicación redirige las rutas desconocidas al dashboard.

## Requisitos

- Node.js 18+ recomendado.
- npm.
- Backend de KawsayMath disponible, normalmente en `http://localhost:8000`.
- Navegador moderno con soporte para APIs web usadas por la aplicación.

## Instalación

```bash
npm install
copy .env.example .env
```

En PowerShell:

```powershell
Copy-Item .env.example .env
```

Configura en `.env` la URL pública del backend:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_GOOGLE_CLIENT_ID=tu-client-id-publico.apps.googleusercontent.com
VITE_SENTRY_DSN=
```

`VITE_GOOGLE_CLIENT_ID` es un identificador público de OAuth, pero debe corresponder al entorno correcto. Las claves secretas de proveedores o de IA nunca deben usar el prefijo `VITE_`, porque Vite las incorpora al bundle del navegador. Configúralas únicamente en el backend.

## Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en la URL que muestre Vite, normalmente `http://localhost:5173`.

## Compilación y previsualización

```bash
npm run build
npm run preview
```

El directorio de salida de producción es generado por Vite y no debe contener secretos ni valores privados.

## Pruebas

Pruebas unitarias y de componentes:

```bash
npm test
npm run test:watch
```

Comprobación de tipos:

```bash
npm run typecheck
```

Pruebas end-to-end:

```bash
npm run test:e2e
```

Playwright inicia Vite automáticamente según `playwright.config.js`. Para pruebas locales alternativas se puede usar la configuración `playwright.local.config.js` cuando el entorno lo requiera.

## Variables de entorno

El archivo `.env.example` documenta las variables del frontend:

- `VITE_API_URL`: URL base de la API versionada.
- `VITE_GOOGLE_CLIENT_ID`: identificador público del cliente Google OAuth.
- `VITE_SENTRY_DSN`: DSN opcional para monitoreo de errores.

No guardes tokens de sesión, contraseñas, claves privadas, API keys, DSN privados ni datos reales de usuarios en el repositorio. Todo lo que tenga prefijo `VITE_` puede quedar expuesto al cliente final.

## Estructura

```text
src/
  api/          Clientes Axios agrupados por dominio
  components/   Vistas y componentes por rol y funcionalidad
  contexts/     Autenticación, idioma, tema y notificaciones
  config/       Lectura centralizada de variables de entorno
  hooks/        Hooks reutilizables
  styles/       Estilos específicos
  test/         Configuración y utilidades de pruebas
  utils/        Utilidades compartidas
public/         Activos públicos y service worker
scripts/        Herramientas de desarrollo
 e2e/           Flujos end-to-end con Playwright
```

## Seguridad

- El frontend no debe contener secretos: el bundle es público por definición.
- Las llamadas autenticadas deben usar la configuración central de Axios y la sesión proporcionada por el backend.
- No subas `.env`, archivos de resultados con datos personales, capturas con información de usuarios ni tokens.
- Configura CORS, OAuth, cookies y expiración de sesiones en el backend.
- Usa datos de prueba en desarrollo y revisa las variables antes de compilar para producción.
