# KawsayMath Frontend — Plataforma de aprendizaje de matemáticas

Plataforma educativa de matemáticas — **frontend en React + Vite**. Interfaz para **estudiantes**, **docentes**, **padres de familia** y **administradores**, con soporte **trilingüe** (español, inglés y quechua), temas dinámicos, chat IA (Profesor Euler), exámenes con anti-trampa, rankings, tablero de trabajos y reportes exportables. Incluye **PWA con soporte offline**, **tests automatizados** y configuración incremental de **TypeScript**.

---

## Stack tecnológico

| Tecnología | Uso |
|------------|-----|
| React 18 | Interfaz de usuario |
| Vite 7 | Bundler / dev server |
| Tailwind CSS 3 | Estilos (design tokens vía CSS variables) |
| React Router v6 | Navegación |
| Axios | Cliente HTTP con interceptores (refresh de token) |
| React Hook Form + Yup | Formularios y validación |
| Vitest + React Testing Library | Tests unitarios y de componentes |
| vite-plugin-pwa | PWA / Service Worker / offline |
| @dnd-kit | Preguntas de arrastrar y soltar (drag & drop) |
| React Hot Toast | Notificaciones toast |
| React Icons (Font Awesome) | Iconografía |
| Framer Motion | Animaciones |
| Recharts | Gráficos (reportes, progreso) |
| React Quill | Editor de contenido HTML (lecciones) |
| @react-oauth/google | Login con Google |
| Groq (AI SDK) | Integración IA (chat "Profesor Euler" + generación de lecciones) |

---

## Requisitos e instalación

- Node.js 18+
- npm / yarn / pnpm

```bash
npm install
cp .env.example .env   # (o usar el .env existente)
npm run dev            # http://localhost:5173
```

### Variables de entorno (`.env`)

| Variable | Descripción | Default |
|----------|-------------|---------|
| `VITE_API_URL` | URL base del backend API | `http://localhost:8000/api/v1` |
| `VITE_GOOGLE_CLIENT_ID` | Client ID de Google OAuth | — |
| `VITE_SENTRY_DSN` | DSN de Sentry para monitoreo de errores (opcional) | — |

> ⚠️ **Seguridad:** el `.env` NO debe subirse al repositorio (está en `.gitignore`). El `VITE_GOOGLE_CLIENT_ID` es público por diseño; pero **las API keys secretas** (ej. NVIDIA) **nunca** deben vivir en el frontend ni llevar prefijo `VITE_` — van solo en el backend/proxy. Usa `.env.example` como plantilla (sin valores reales) y `.env.production` para el build de producción.

> 🔒 Las variables de entorno se **validan al arranque** (`src/config/env.js`): si faltan `VITE_API_URL` o `VITE_GOOGLE_CLIENT_ID`, la app falla con un mensaje claro en lugar de fallar silenciosamente en runtime.

### Despliegue (producción)

La app se publica en **Vercel** (https://frontend-app-mat.vercel.app). El proyecto está vinculado en `.vercel/`; para desplegar manualmente:

```bash
npm run build
npx vercel --prod
```

**Deploy automático (recomendado):** conecta el repositorio a Vercel (Vercel → Add New Project → importa `frontend-app-mat`). El CI de GitHub (`test` + `typecheck` + `build`) valida antes de cada push a `main`, y Vercel despliega automáticamente el último commit exitoso. Configura en el dashboard de Vercel las variables `VITE_API_URL` (backend de producción), `VITE_GOOGLE_CLIENT_ID` y `VITE_SENTRY_DSN`. No subas `.env.production` con valores reales al repo: defínelos en el dashboard.

### Backend (API)

El frontend depende de `VITE_API_URL` (API REST en Laravel). El backend es un repositorio separado: **`JoseAdolfo19/backend-app-mat`** (Laravel, `GET/POST/PUT/DELETE` bajo `/api/v1`). El backend califica las respuestas de exámenes/evaluaciones normalizando `Verdadero`/`Falso`/`true`/`false` a los valores canónicos `'true'`/`'false'`, en sintonía con `src/utils/grading.js`.

### Scripts

```bash
npm run dev           # Servidor de desarrollo (Vite)
npm run build         # Build de producción (incluye PWA + service worker)
npm run preview       # Previsualizar build
npm test              # Ejecuta los tests (Vitest) una vez
npm run test:watch    # Tests en modo watch
npm run typecheck     # Type check incremental (tsc, permite .js)
```

---

## Estructura general

```
frontend-app-mat/
├── .env                     # Variables de entorno de desarrollo (no versionar)
├── .env.example             # Plantilla de variables (sin valores reales)
├── .env.production          # Variables para el build de producción
├── .github/workflows/ci.yml # CI: tests + build + typecheck en cada push/PR
├── .gitignore               # Excluye node_modules, dist, .env*, etc.
├── CREDITS.md               # Créditos de imágenes y recursos externos
├── index.html               # HTML raíz (raíz real de Vite)
├── index.css                # CSS global raíz (importa fuentes + Tailwind v4)
├── package.json             # Dependencias y scripts
├── postcss.config.js        # PostCSS (Tailwind + Autoprefixer)
├── tailwind.config.js       # Configuración de Tailwind
├── tsconfig.json            # TypeScript incremental (permite .js, noEmit)
├── tsconfig.node.json       # TS para archivos de configuración de Vite
├── vite.config.js           # Vite (React, PWA, tests, code-splitting)
├── public/                  # Assets estáticos (favicons, logos, imágenes)
└── src/
    ├── main.jsx             # Punto de entrada de React (+ registro Service Worker)
    ├── App.jsx              # Providers, rutas y layout global
    ├── App.css              # Estilos globales de la app
    ├── index.css            # Tailwind directives + design tokens
    ├── api/                 # Cliente Axios y endpoints por dominio
    ├── components/          # Componentes agrupados por rol
    ├── config/env.js        # Validación de variables de entorno (fail-fast)
    ├── contexts/            # Contextos globales (Auth, Idioma, Tema, Notifs)
    ├── hooks/               # Hooks personalizados
    ├── styles/              # Tema base CSS
    ├── test/setup.js        # Setup de Vitest (jest-dom, polyfills)
    └── utils/               # Constantes, validadores y helpers (+ tests)
```

---

## Descripción de archivos por ubicación

### Raíz del proyecto

| Archivo | Qué hace |
|---------|----------|
| `index.html` | HTML de entrada. Carga fuentes (Plus Jakarta Sans / Hanken Grotesk), meta tags SEO/OG, **script inline anti-flash de dark mode** (aplica la clase `.dark` antes del render para evitar parpadeo), enlace al manifest PWA generado y el punto de montaje `#root` donde Vite inyecta `/src/main.jsx`. |
| `index.css` | CSS global raíz: importa fuentes de Google y **Tailwind v4** (`@import "tailwindcss"`), define `@theme` (fuentes y animaciones) y scrollbars personalizados. |
| `package.json` | Manifiesto del proyecto (`sim-frontend`). Lista dependencias (React, Router, Axios, Recharts, Quill, @dnd-kit, vite-plugin-pwa, Vitest, etc.) y scripts `dev`, `build`, `preview`, `test`, `test:watch` y `typecheck`. |
| `postcss.config.js` | Configura PostCSS: procesa Tailwind CSS y Autoprefixer. |
| `tailwind.config.js` | Extiende Tailwind: mapea clases utilitarias (`.primary`, `.surface`, `.error`, etc.) a **CSS variables** del tema, define fuentes, bordes, sombras y animaciones. |
| `vite.config.js` | Configuración de **Vite**: plugin de React, **vite-plugin-pwa** (genera Service Worker + manifest al build), bloque `test` de **Vitest**, puerto de dev (5173) y build con `sourcemap: false` y **code-splitting** en chunks (`vendor`, `charts`, `editor`). |
| `.env` | Variables de entorno de desarrollo (URL del API, Google Client ID). ⚠️ Está en `.gitignore` y solo debe contener valores públicos; las API keys secretas no van aquí. |
| `.env.example` | **Plantilla** de variables de entorno documentadas (sin valores reales), para que un nuevo colaborador sepa qué configurar. Protegido con `!.env.example` en `.gitignore`. |
| `.env.production` | Variables de entorno para el **build de producción** (`VITE_API_URL` → URL del backend desplegado). |
| `.gitignore` | Excluye del repositorio `node_modules/`, `dist/`, `.vite/`, `.env` (pero **no** `.env.example`) y archivos de editor. |
| `.gitattributes` | Reglas de normalización de fin de línea / diff de git. |
| `tsconfig.json` | **TypeScript incremental**: `allowJs: true`, `checkJs: false`, `noEmit: true` — permite migrar a TS gradualmente sin romper el `.js` actual. |
| `tsconfig.node.json` | Configuración TS para `vite.config.js` (dominio de Node). |
| `.github/workflows/ci.yml` | **CI**: en cada push/PR instala dependencias, corre los tests (Vitest), el typecheck y el build. Inyecta `VITE_API_URL` y `VITE_GOOGLE_CLIENT_ID` (públicas) para que la validación de env no falle. |
| `CREDITS.md` | Créditos de las imágenes y recursos de terceros utilizados (ej. fotos de Unsplash). |
| `.vite/` | Caché interna de Vite (generada, no versionar). |

### `public/` — Assets estáticos

> El manifest de PWA (`manifest.webmanifest`) y el Service Worker ya no se mantienen a mano: los **genera `vite-plugin-pwa`** durante el build.

| Archivo | Qué hace |
|---------|----------|
| `favicon.ico` / `favicon.svg` | Ícono de la pestaña del navegador. |
| `logo192.png` / `logo512.png` | Logos usados para favicon en alta resolución, PWA y Open Graph. |
| `images/` | Imágenes locales del landing (`classroom.jpg`, `students.jpg`, `education.jpg`) — cargadas con `loading="lazy"`. |
| `kawsaymath_login.jpg` / `kawsaymath_register.jpg` / `ejemplo_login.png` | Capturas/imágenes de las páginas de login y registro. |

---

### `src/` — Código fuente

#### Entrada de la aplicación

| Archivo | Qué hace |
|---------|----------|
| `src/main.jsx` | Punto de entrada de React. Monta `<App />` en `#root` dentro de `<React.StrictMode>` y registra el **Service Worker** de la PWA (`registerSW({ immediate: true })`) con actualización automática. |
| `src/App.jsx` | **Corazón de la app.** Envuelve todo con providers anidados: `GoogleOAuthProvider` → `Router` → `LanguageProvider` → `ThemeProvider` → `AuthProvider` → `NotificationProvider` → `ErrorBoundary`. Define **todas las rutas** de la app con `React.lazy()` (carga diferida) y `Suspense`, usa `ProtectedRoute` con roles (student/teacher/admin/parent) y un `Toaster` de react-hot-toast con los colores del tema. |
| `src/App.css` | Estilos globales de la aplicación (layout general). |
| `src/index.css` | `@tailwind` base/components/utilities + **design tokens** en `:root` (colores Material: `--primary`, `--surface`, `--error`, etc.). Define clases reutilizables `.card`, `.btn-primary`, `.badge`, `.avatar`, `.progress-bar`, `.table`, skeleton, glass, animaciones y sombras. Incluye estilos para React Quill, Google Login, Recharts, hot toast y el modo oscuro. |

#### `src/api/` — Cliente HTTP y endpoints

| Archivo | Qué hace |
|---------|----------|
| `src/api/axios.js` | Instancia central de **Axios**. BaseURL desde `VITE_API_URL`. Interceptor de request: inyecta `Authorization: Bearer <token>` desde `localStorage`. Interceptor de response: maneja **401** haciendo refresh del token (`/user/refresh-token`), encolando peticiones fallidas mientras refresca; si el refresh falla, limpia el token y redirige a `/login`. |
| `src/api/auth.js` | Endpoints de autenticación: `register`, `login`, `googleLogin`, `logout`, `forgotPassword`, `resetPassword`, perfil (`getProfile`/`updateProfile`), `changePassword`, vincular/desvincular Google, `refreshToken`, gestión de sesiones por plataforma (`logoutPlatform`, `logoutAll`, `getDevices`). |
| `src/api/users.js` | Perfil del usuario, **progreso** (`getMyStats`, `getBadges`) y **notificaciones** (listar, conteo no leído, marcar leídas, eliminar). |
| `src/api/lessons.js` | CRUD de **lecciones**: listar, obtener, crear, actualizar, eliminar, publicar/despublicar, duplicar, por unidad, estadísticas. Recursos por lección (listar/añadir/eliminar y **subida de archivos** a `/lessons/resources/upload`) y **progreso** (`updateProgress`). Incluye `generateLesson` para la **generación de lecciones con IA** (`/ai/generate-lesson`). |
| `src/api/evaluations.js` | CRUD de **evaluaciones** (publicar/despublicar/duplicar/estadísticas). Preguntas (CRUD). Resultados: `submitEvaluation`, `getResults`, `getStudentResult`. |
| `src/api/admin.js` | Panel admin: dashboard, CRUD de **usuarios** (incluye activar/desactivar e **importar CSV / exportar**), configuración del sistema (`getConfig`/`updateConfig`), **períodos académicos** (CRUD) y **backups** de base de datos (crear, consultar último, descargar como blob). |
| `src/api/notifications.js` | Endpoints de notificaciones (listar con params, conteo no leído, marcar como leída/todas, eliminar una o las leídas). |
| `src/api/reports.js` | Reportes: `getPerformanceReport` (gráfico), `getGradesReport` (tabla), `getStudentReport` (individual) y **exportación PDF/Excel** (`responseType: 'blob'`). |
| `src/api/ai.js` | Cliente del **chat IA** ("Profesor Euler"). `sendMessage` hace POST a `/ai/chat` con historial de conversación y procesa respuesta **SSE en streaming** (parsea líneas `data:`), y `resetChat` limpia el historial en memoria. El proveedor lo resuelve el backend (Groq). |

#### `src/config/` — Configuración y validación

| Archivo | Qué hace |
|---------|----------|
| `src/config/env.js` | **Validación de variables de entorno** con Yup (fail-fast): lanza un error claro al arranque si faltan `VITE_API_URL` o `VITE_GOOGLE_CLIENT_ID`. Incluye un test personalizado de URL (`new URL()`) porque la validación `.url()` de Yup rechaza `localhost`. Consumido por `axios.js`, `ai.js`, `constants.js`, `App.jsx` y `LandingPage.jsx`. |

#### `src/contexts/` — Estado global

| Archivo | Qué hace |
|---------|----------|
| `src/contexts/AuthContext.jsx` | **Estado de autenticación global.** Almacena `user`, `token` y `loading`. Expone `login`, `loginWithGoogle`, `register`, `logout` y helpers de rol (`hasRole`, `isAdmin`, `isTeacher`, `isStudent`, `isParent`). Al cargar, si hay token, obtiene el perfil; ante 401 cierra sesión. |
| `src/contexts/LanguageContext.jsx` | **i18n trilingüe** (es/en/qu). Guarda el idioma en `localStorage`, detecta el del navegador y expone `t('clave.ruta')` para traducir. Contiene el **diccionario de traducciones** completo (~2500 líneas) con textos de navegación, auth, dashboards, exámenes, etc. La lectura/guardado del idioma se delega en `src/utils/i18n.js`. |
| `src/contexts/ThemeContext.jsx` | **Temas dinámicos.** Paletas `light`, `dark` y `grayscale` (filtro CSS). El modo oscuro aplica la clase `.dark` en `<html>` (con **script anti-flash** en `index.html`) y una paleta dark completa en CSS; en dark mode `applyColors` no pisa los colores de fondo/superficie. Carga colores institucionales desde `/config` y los aplica como CSS variables; expone `setTheme` y `updateColors` (guarda en `/admin/config`). Incluye utilidades `lightenColor`/`darkenColor`. |
| `src/contexts/NotificationContext.jsx` | Estado de **notificaciones** global: lista, `unreadCount` y `loading`. Expone marcar leídas/todas, eliminar y refetch. Consulta el conteo no leído cada 30 s cuando hay usuario logueado. |

#### `src/hooks/` — Hooks personalizados

| Archivo | Qué hace |
|---------|----------|
| `src/hooks/useAuth.js` | Re-exporta `useAuth` del contexto con guarda de error si se usa fuera del provider. |
| `src/hooks/useTheme.js` | Re-exporta `useTheme` del contexto con guarda de error. |
| `src/hooks/useNotifications.js` | Re-exporta `useNotifications` del contexto con guarda de error. |
| `src/hooks/useAntiCheat.js` | **Sistema anti-trampa para exámenes.** Detecta cambio de pestaña, blur/focus prolongado, copiar/cortar/pegar, clic derecho, atajos `Ctrl+C/V/X/U`, y apertura de DevTools (F12/Ctrl+Shift+I). Reporta cada evento al backend (`/exams/attempts/{id}/cheat`) con tipo, detalle y contador de cambios de pestaña. Los errores se registran con el logger (no `console.error`). |

#### `src/utils/` — Utilidades

| Archivo | Qué hace |
|---------|----------|
| `src/utils/constants.js` | Constantes: `ROLES` (incluye `PARENT`), `DIFFICULTY_LEVELS`, `EVALUATION_TYPES`, `QUESTION_TYPES` (incluye `drag_drop`), `TRUE_FALSE_OPTIONS`, `NOTIFICATION_TYPES`, `API_URL` y `APP_NAME`. |
| `src/utils/helpers.js` | Funciones auxiliares: `formatDate`/`formatDateTime` (con locale por idioma), `getInitials`, `truncateText`, colores por dificultad/rol/estado (`getDifficultyColor`, `getRoleColor`, `getStatusColor`), `calculateProgress`, iconos/nombres de insignias (`getBadgeIcon`, `getBadgeName`), etiquetas de dificultad (trilingües), `getLetterGrade` (AD/A/B/C), y `toArray` (normaliza respuestas API). |
| `src/utils/grading.js` | **Lógica de calificación** de exámenes: `normalizeTrueFalse` (normaliza booleanos, strings canónicos `'true'`/`'false'` y labels legacy `Verdadero`/`Falso`), `isAnswerCorrect` y `gradeExam`. Tiene **tests** en `grading.test.js`. |
| `src/utils/roles.js` | Helpers de roles: `canAccess` y `isTeacherLike` (permite admin cuando el rol exige teacher). Con **tests** en `roles.test.js`. |
| `src/utils/i18n.js` | Servicio de i18n: `getTranslation`, `getSavedLanguage` y `saveLanguage`. Lo usan los contexts (Auth/Theme/Notifications) sin depender de `LanguageContext`. |
| `src/utils/logger.js` | Logger de desarrollo: en producción se silencia; sustituye `console.error`/`console.warn` directos en `useAntiCheat.js` y `ErrorBoundary.jsx`. |

#### `src/test/` — Tests

| Archivo | Qué hace |
|---------|----------|
| `src/test/setup.js` | Setup global de **Vitest**: importa `@testing-library/jest-dom` y polyfills necesarios. Se incluye vía el bloque `test` de `vite.config.js`. |

#### `src/styles/`

| Archivo | Qué hace |
|---------|----------|
| `src/styles/theme.css` | Hoja de tema base con los **design tokens** por defecto (colores primarios, superficies, texto, bordes y errores) como CSS variables. |

---

### `src/components/` — Componentes por rol

#### `Common/` — Componentes compartidos

| Archivo | Qué hace |
|---------|----------|
| `Loading.jsx` | Pantalla de carga full-screen con spinner animado y texto según idioma. |
| `Skeletons.jsx` | Placeholders de carga (`SkeletonLine`, `CardSkeleton`, `ListSkeleton`, `TableSkeleton`, `DashboardSkeleton`) con animación `animate-pulse`. |
| `ErrorBoundary.jsx` | Captura errores de renderizado en el árbol de React y muestra pantalla de error con botón "Reintentar". Registra los errores con el logger (`src/utils/logger.js`). |
| `ProtectedRoute.jsx` | **Guarda de rutas.** Si no hay sesión redirige a `/login`; si el rol no está permitido (`roles`) muestra pantalla de "no autorizado". |
| `Sidebar.jsx` | Menú lateral (desktop). Navegación según rol (dashboard, lecciones, evaluaciones, reportes, usuarios, config), botón "Nueva Lección" para docentes, y accesos a ajustes/ayuda. |
| `TopBar.jsx` | Barra superior: menú móvil, búsqueda de lecciones, campana de notificaciones (punto rojo con `unreadCount`) y menú desplegable de usuario (perfil / cerrar sesión). |
| `BottomNav.jsx` | Navegación inferior para **móvil** (máx. 5 ítems según rol). |
| `ChatWidget.jsx` | **Chat flotante "Profesor Euler"** (IA). Botón flotante animado, panel de chat con streaming, renderizado de **markdown** (código, negritas, listas, encabezados), limpiar chat y avatar SVG de Euler. |
| `Profile.jsx` | Página de perfil: ver/editar nombre y email (bloqueado si cuenta Google), cambiar contraseña con confirmación. |
| `Notifications.jsx` | Página de notificaciones: lista con estado leído/no leído, marcar individual/todas como leídas y eliminar. |
| `Settings.jsx` | Ajustes: preferencias de notificaciones (localStorage), **selector de idioma** (ES/EN/Quechua), **selector de tema** (claro/oscuro/escala de grises), enlaces a perfil y cerrar sesión. |
| `Help.jsx` | Página de ayuda con FAQ desplegable (acordeón), contacto por correo y consejos. |
| `CheatingAlert.jsx` | Alerta visual temporal (10 s) cuando un estudiante es detectado abandonando un examen; muestra nombre, examen y tipo de evento. |
| `CompetencyEvolution.jsx` | **Gráfico de líneas SVG** de evolución de competencias por asignatura a lo largo del tiempo (autoresponsivo vía `ResizeObserver`, escala 0–20). |
| `DragDropQuestion.jsx` | Componente de pregunta **arrastrar y soltar** (drag & drop) con `@dnd-kit`: ordena ítems arrastrables, muestra retroalimentación y valida el orden enviado. Usado por el reproductor de exámenes. |

#### `Layout/`

| Archivo | Qué hace |
|---------|----------|
| `MainLayout.jsx` | **Layout principal** de las rutas protegidas: `Sidebar` + `TopBar` + `<Outlet/>` (contenido de la ruta) + `BottomNav` móvil + `ChatWidget` flotante. |

#### `Landing/`

| Archivo | Qué hace |
|---------|----------|
| `LandingPage.jsx` | **Página de aterrizaje pública** (ruta `/`). Hero con botones de login/registro, sección "Acerca de", características, e imágenes locales (`/images/*.jpg` con `loading="lazy"`). Incluye una **consulta de notas por DNI** (con captcha) que muestra el resumen académico de un estudiante (promedio, lecciones, racha, calificaciones por área). |

#### `Auth/`

| Archivo | Qué hace |
|---------|----------|
| `Login.jsx` | Formulario de **inicio de sesión** (validación Yup) + **login con Google**. Redirige a `/dashboard`. Incluye enlaces a las páginas legales (`/terms` y `/privacy`). |
| `Register.jsx` | Formulario de **registro de estudiantes** (nombre completo, email, contraseña con confirmación, nivel académico Primaria/Secundaria) con validación Yup (contraseña mínima de 8 caracteres, coherente con el backend) y animaciones. |
| `LegalPage.jsx` | Página legal reutilizable (prop `kind`: `terms` o `privacy`) con **Términos y Condiciones** y **Política de Privacidad** trilingües (es/en/qu), selector de idioma y enlaces cruzados entre ambas; botones de retorno al login. |
| `ForgotPassword.jsx` | Solicitud de **recuperación de contraseña** por email; muestra confirmación de envío. |

#### `Student/` — Vistas del estudiante

| Archivo | Qué hace |
|---------|----------|
| `StudentDashboard.jsx` | Dashboard del estudiante: bienvenida personalizada, estadísticas (lecciones completadas, evaluaciones, promedio, racha de días), lecciones en progreso con barra de avance, evaluaciones recientes y **insignias/logros**. |
| `LessonList.jsx` | Lista de **lecciones** con búsqueda y filtros (dificultad, unidad), tarjetas con dificultad, tiempo estimado, tags, unidad y progreso. |
| `LessonDetail.jsx` | Detalle de lección: contenido HTML **saneado** (elimina scripts/eventos peligrosos), recursos descargables, barra de progreso y botones para avanzar/marcar completada (envía `time_spent`). Incluye **navegación previo/siguiente** entre lecciones (`prevLesson`/`nextLesson`). |
| `EvaluationList.jsx` | Lista de **evaluaciones** con filtros (búsqueda, tipo, dificultad) y estados (completado con nota, vencida, pendiente). |
| `EvaluationResult.jsx` | **Resultado de evaluación**: anillo de puntaje /20, respuestas correctas/incorrectas con retroalimentación pregunta por pregunta, tiempo, intento, descarga de PDF y acciones sugeridas. |
| `ExamList.jsx` | Lista de **exámenes disponibles** con dificultad, tiempo límite, intentos restantes y botón para iniciar (crea el intento vía `POST /exams/{id}/start`). |
| `ExamPlayer.jsx` | **Reproductor de examen**: navegación por preguntas (opción múltiple / verdadero-falso / **drag & drop**), contador de tiempo con autoenvío al agotarse, panel de respuestas, **aviso anti-trampa**, confirmación de envío y pantalla de resultado. Envía las respuestas en el submit (`answers` con `question_id` + `answer`; drag & drop como JSON). Los valores verdadero/falso se normalizan a strings canónicos (`'true'`/`'false'`) y sus labels se traducen con `t('exam.true')`/`t('exam.false')`. Las preguntas drag & drop se mezclan con `useMemo`. **Resiliente a la conexión**: las respuestas se persisten en `localStorage` por intento, se restauran al volver a cargar, y si el envío falla por falta de red se reintenta automáticamente al reconectar (con botón de reintento manual). |
| `StudentWorkBoard.jsx` | **Tablero de trabajos** del estudiante: estadísticas (asignados, enviados, calificados, pendientes, promedio), filtros por tipo/estado/área y lista de trabajos con feedback y nota. |
| `StudentRanking.jsx` | **Ranking** de estudiantes por promedio (con filtro por curso), trofeos para top 3 y resaltado de mi posición. |

#### `Teacher/` — Vistas del docente

| Archivo | Qué hace |
|---------|----------|
| `TeacherDashboard.jsx` | Dashboard docente: estadísticas (estudiantes, lecciones, evaluaciones, tasa de aprobación), acciones rápidas (crear lección/evaluación) y actividad reciente (estudiantes y evaluaciones). |
| `LessonEditor.jsx` | **Editor de lecciones** (crear/editar): datos básicos, dificultad, unidad/tema, tags, **contenido HTML con React Quill**, **generación automática con IA (Groq)** y lista dinámica de **recursos** (PDF/video/imagen/link) con subida al backend (`useFieldArray`). |
| `EvaluationCreator.jsx` | **Creador/editor de evaluaciones**: configuración (tipo, dificultad, lección vinculada, límite de tiempo, fecha límite, intentos máximos) y **preguntas** (opción múltiple con opciones dinámicas, completar, fórmula) con duplicado y validación Yup. |
| `ExamManager.jsx` | **Gestión de exámenes** (listar, filtrar por estado): crear, editar, activar/desactivar, ver estadísticas y eliminar. |
| `ExamEditor.jsx` | **Editor de exámenes** (crear/editar): configuración (título, unidad, dificultad, tiempo, intentos, autocorrección, preguntas aleatorias) y preguntas de opción múltiple/verdadero-falso/**drag & drop** con reordenamiento y opciones dinámicas. Valida el formulario con un **schema Yup** (`examSchema`) que muestra errores inline (`exam.titleRequired`, `exam.minQuestions`, etc.) y guarda como borrador o publicado/activo. |
| `ExamStats.jsx` | **Estadísticas de examen**: total de intentos, promedio, tasa de aprobación, **distribución de puntajes** (gráfico de barras) y tabla de **incidentes anti-trampa**. |
| `StudentProgress.jsx` | **Progreso individual de un estudiante**: tarjetas de estadísticas, gráfico de progreso por lección (Recharts) y evaluaciones recientes con notas. |
| `Reports.jsx` | **Reportes de rendimiento**: exportación **PDF/Excel**, filtros por período, KPIs (evaluaciones, estudiantes, promedio, aprobación), gráfico de promedio por tipo de evaluación, top estudiantes y tabla de calificaciones con búsqueda. |
| `TeacherStudentRanking.jsx` | **Ranking de estudiantes** vista docente (filtro por curso, trofeos, tendencia de posición, exportación). |
| `TeacherWorkBoard.jsx` | **Tablero de trabajos del docente**: listar trabajos con filtros, **calificar** (nota 0–20 + feedback) y devolver trabajos. |

#### `Admin/` — Vistas del administrador

| Archivo | Qué hace |
|---------|----------|
| `AdminDashboard.jsx` | Dashboard admin: estadísticas del sistema (usuarios, docentes, lecciones, evaluaciones, servidor, base de datos), usuarios recientes e información del **último backup**. |
| `AdminWorkBoard.jsx` | **Tablero de trabajos a nivel institucional**: listar todos los trabajos con filtros (estudiante, docente, curso, estado, fechas), estadísticas y **exportación PDF/Excel**. |
| `UserManagement.jsx` | **Gestión de usuarios** (CRUD): listar, crear/editar con modal (nombre, email, contraseña, rol, institución, grado), activar/desactivar, eliminar e **importar/exportar usuarios CSV**. |
| `SystemConfig.jsx` | **Configuración del sistema**: datos institucionales, colores, logo, notificaciones por email, frecuencia de backups, **períodos académicos** (CRUD) e historial de backups. |
| `ColorSettings.jsx` | **Personalización de colores**: presets (predeterminado, grises, cálido, océano) y selectores de color para primario, secundario, terciario, fondo y superficie; guarda vía `updateColors`. |

#### `Parent/` — Vistas del padre de familia

| Archivo | Qué hace |
|---------|----------|
| `ParentDashboard.jsx` | Dashboard del padre: lista de **hijos vinculados** con promedio, lecciones completadas y última actividad. |
| `ChildProgress.jsx` | **Progreso de un hijo**: resumen (lecciones, evaluaciones, promedio, insignias), progreso por lección, resultados de evaluaciones e insignias obtenidas. |
| `ChildReport.jsx` | **Reporte de un hijo**: desempeño (promedio, evaluaciones, lecciones, tasa de aprobación), **fortalezas y áreas de mejora**, historial de evaluaciones y **evolución de competencias** (`CompetencyEvolution`). |
| `ParentStudentLookup.jsx` | **Consulta pública por DNI** (ruta `/parent/lookup`, sin login): captcha + DNI para ver el desempeño de un estudiante (promedio por área, trabajos, ranking). |

---

## Mapa de rutas (`src/App.jsx`)

| Ruta | Componente | Acceso |
|------|-----------|--------|
| `/` | LandingPage | Público |
| `/login`, `/register`, `/forgot-password` | Login, Register, ForgotPassword | Público |
| `/terms`, `/privacy` | LegalPage (términos / privacidad) | Público |
| `/parent/lookup` | ParentStudentLookup | Público |
| `/dashboard`, `/my-work`, `/ranking`, `/lessons`, `/lessons/:id`, `/evaluations`, `/evaluations/:id/result`, `/exams`, `/exams/:id/take` | Vistas de estudiante | Sesión |
| `/profile`, `/notifications`, `/settings`, `/help` | Páginas comunes | Sesión |
| `/teacher/dashboard`, `/teacher/lessons/create`, `/teacher/lessons/:id/edit`, `/teacher/evaluations/create`, `/teacher/evaluations/:id/edit`, `/teacher/exams`, `/teacher/exams/create`, `/teacher/exams/:id/edit`, `/teacher/exams/:id/stats`, `/teacher/ranking`, `/teacher/works`, `/teacher/students/:id/progress`, `/reports` | Vistas de docente | teacher/admin |
| `/admin/dashboard`, `/admin/users`, `/admin/config`, `/admin/colors`, `/admin/works` | Vistas de admin | admin |
| `/parent`, `/parent/children/:studentId`, `/parent/children/:studentId/report` | Vistas de padre | parent |
| `*` | Redirige a `/dashboard` | — |

---

## Roles del sistema

- **Estudiante**: lecciones, evaluaciones, exámenes (con anti-trampa), tablero de trabajos, ranking, logros.
- **Docente** (y admin): crear/editar lecciones, evaluaciones y exámenes, calificar trabajos, ver progreso y reportes, exportar PDF/Excel.
- **Administrador**: gestión de usuarios (CSV), configuración institucional, colores, períodos académicos, backups y panel de trabajos institucional.
- **Padre de familia**: monitoreo del progreso y reportes de sus hijos, y consulta pública de notas por DNI.

---

## Funcionalidades destacadas

- **Autenticación** tradicional + Google OAuth con refresh de token automático.
- **i18n trilingüe** (español / inglés / quechua) persistido en `localStorage`.
- **Temas dinámicos** (claro / oscuro / escala de grises) con colores institucionales configurables por el admin.
- **Chat IA "Profesor Euler"** con streaming (SSE) y renderizado de markdown, y **generación automática de lecciones con IA (Groq)** desde el editor del docente.
- **Exámenes con anti-trampa** (detección y reporte de eventos) y estadísticas por examen. Tipos de pregunta: opción múltiple, verdadero-falso y **arrastrar y soltar** (drag & drop con `@dnd-kit`).
- **Reportes** con gráficos (Recharts) y exportación PDF/Excel.
- **Páginas legales** de Términos y Condiciones y Política de Privacidad (rutas `/terms` y `/privacy`), trilingües y enlazadas desde el login y el registro.
- **PWA instalable**: manifest + Service Worker generados por `vite-plugin-pwa` con `autoUpdate`, estrategia *NetworkFirst* para el API y caché de imágenes → **soporte offline**. El envío de exámenes tolera caídas de red persistiendo las respuestas en `localStorage` y reintentando al reconectar.
- **Tests automatizados** con Vitest + React Testing Library: calificación con true/false legacy, roles, constantes, paridad i18n es/en/qu, anti-trampa (`useAntiCheat`), guards de rutas (`ProtectedRoute`) y validación Yup del editor de exámenes (`examSchema`). **CI** en GitHub Actions.
- **Validación de entorno fail-fast** (`src/config/env.js`): errores claros al arranque si faltan variables.
- **TypeScript incremental**: configuración de `tsc` con `allowJs` para migrar módulo por módulo.
- **Seguridad de credenciales**: API keys secretas excluidas del frontend; `.env` en `.gitignore` con `.env.example` como plantilla documentada.
- **Logging seguro**: todo `console.*` está centralizado en `src/utils/logger.js`, que se **silencia en producción** (con placeholder para Sentry/monitoreo); los únicos `console.error` restantes están en `env.js` (fail-fast al arranque). `useAntiCheat.js` y `ErrorBoundary.jsx` usan el logger.
- **Sin dependencias circulares**: verificado con `npx madge --circular src/`.

---

## Auditoría QA (2026-08)

Auditoría realizada siguiendo el rol de **QA Engineer** sobre el frontend. Hallazgos y correcciones aplicadas:

| Severidad | Hallazgo | Archivo | Corrección |
|-----------|----------|---------|------------|
| High | Crash si `data.attempt` es null/`started_at` falta → timer `NaN` | `src/components/Student/ExamPlayer.jsx` | Guard de `started_at` (usa `Date.now()` como fallback) y `formatTime` robusto ante `NaN`. |
| Medium | Contador anti-trampa con `useRef` no re-renderizaba → el aviso "actividad sospechosa" nunca aparecía en pantalla | `src/hooks/useAntiCheat.js` | Convertido a `useState` (mantiene un ref interno para el envío al backend). |
| Medium | Respuestas de API asumidas como array sin validar → `TypeError` si el backend devuelve un objeto | `ExamList.jsx`, `ExamManager.jsx`, `LessonDetail.jsx` | Normalización con `Array.isArray(...) ? ... : []`. |
| Medium | `score.toFixed(1)` / `Math.floor(time_taken/60)` sin guard → crash o "NaN" en pantalla | `EvaluationList.jsx`, `EvaluationResult.jsx` | Score derivado seguro (`safeScore`) y tiempo con fallback `--:--`. |
| Medium | Claves de traducción inexistentes se mostraban crudas (aria-labels y textos rotos) | `LanguageContext.jsx`, `ChatWidget.jsx`, `Sidebar.jsx` | Añadidas las claves `chat.*` y `nav.sidebar` en es/en/qu; guard de `user.role.name` en `Sidebar`. |
| Low | Captcha mostrado como texto plano en el landing (ahora es imagen SVG desde el backend) | `LandingPage.jsx` | Renderiza `captcha_image` y envía `captcha_token`. |

**Estado:** 47 tests ✓ · typecheck ✓ · build PWA ✓. Ver también la auditoría del **backend** en `README` de `backend-app-mat`.

---

## Contribución, seguridad y licencia

- **Contribución:** consulta [`CONTRIBUTING.md`](CONTRIBUTING.md). Flujo: rama desde `main`, ejecutar `npm run typecheck`, `npm test` y `npm run build` antes de cada PR a `main`.
- **Seguridad:** consulta [`SECURITY.md`](SECURITY.md). Para reportar una vulnerabilidad, contacta al mantenedor por correo en lugar de abrir un issue público.
- **Licencia:** este proyecto está bajo la **MIT License** — ver [`LICENSE`](LICENSE).
- **Capturas/demo:** pendiente añadir capturas de pantalla de las páginas principales.
