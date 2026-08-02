# MathFlow Frontend

Plataforma educativa de matemáticas — **frontend en React + Vite**. Interfaz para **estudiantes**, **docentes**, **padres de familia** y **administradores**, con soporte **trilingüe** (español, inglés y quechua), temas dinámicos, chat IA (Profesor Euler), exámenes con anti-trampa, rankings, tablero de trabajos y reportes exportables.

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
| React Hot Toast | Notificaciones toast |
| React Icons (Font Awesome) | Iconografía |
| Framer Motion | Animaciones |
| Recharts | Gráficos (reportes, progreso) |
| React Quill | Editor de contenido HTML (lecciones) |
| @react-oauth/google | Login con Google |
| @google/generative-ai | Integración IA (chat) |

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
| `VITE_AI_SERVICE` | Proveedor IA (`groq`/`gemini`) | `groq` |

> ⚠️ El archivo `.env` contiene credenciales reales. **No debe compartirse ni subirse al repositorio** (está en `.gitignore`). Para producción se usa `.env.production` con `VITE_API_URL` apuntando al backend desplegado.

### Scripts

```bash
npm run dev       # Servidor de desarrollo (Vite)
npm run build     # Build de producción
npm run preview   # Previsualizar build
```

---

## Estructura general

```
frontend-app-mat/
├── .env                     # Variables de entorno (secretos, no versionar)
├── .env.production          # Variables para el build de producción
├── .gitignore               # Excluye node_modules, dist, .env, etc.
├── index.html               # HTML raíz (raíz real de Vite)
├── index.css                # CSS global (importa Tailwind v4 + fuentes)
├── package.json             # Dependencias y scripts
├── postcss.config.js        # PostCSS (Tailwind + Autoprefixer)
├── tailwind.config.js       # Configuración de Tailwind
├── vite.config.js           # Configuración de Vite (build, chunks)
├── public/                  # Assets estáticos (favicons, manifest, logo)
└── src/
    ├── main.jsx             # Punto de entrada de React
    ├── App.jsx              # Providers, rutas y layout global
    ├── App.css              # Estilos globales de la app
    ├── index.css            # Tailwind directives + design tokens
    ├── api/                 # Cliente Axios y endpoints por dominio
    ├── components/          # Componentes agrupados por rol
    ├── contexts/            # Contextos globales (Auth, Idioma, Tema, Notifs)
    ├── hooks/               # Hooks personalizados
    ├── styles/              # Tema base CSS
    └── utils/               # Constantes y helpers
```

---

## Descripción de archivos por ubicación

### Raíz del proyecto

| Archivo | Qué hace |
|---------|----------|
| `index.html` | HTML de entrada. Carga fuentes (Plus Jakarta Sans / Hanken Grotesk), meta tags SEO/OG, manifest PWA y el punto de montaje `#root` donde Vite inyecta `/src/main.jsx`. |
| `index.css` | CSS global raíz: importa fuentes de Google y **Tailwind v4** (`@import "tailwindcss"`), define `@theme` (fuentes y animaciones) y scrollbars personalizados. |
| `package.json` | Manifiesto del proyecto (`mathflow-frontend`). Lista dependencias (React, Router, Axios, Recharts, Quill, etc.) y scripts `dev`, `build`, `preview`. |
| `postcss.config.js` | Configura PostCSS: procesa Tailwind CSS y Autoprefixer. |
| `tailwind.config.js` | Extiende Tailwind: mapea clases utilitarias (`.primary`, `.surface`, `.error`, etc.) a **CSS variables** del tema, define fuentes, bordes, sombras y animaciones. |
| `vite.config.js` | Configuración de **Vite**: plugin de React, puerto de dev (5173) y build de producción con `sourcemap: false` y **code-splitting** en chunks (`vendor`, `charts`, `editor`). |
| `.env` | Variables de entorno de desarrollo (URL del API, Google Client ID). ⚠️ Contiene secretos, está en `.gitignore`. |
| `.env.production` | Variables de entorno para el **build de producción** (`VITE_API_URL` → URL del backend desplegado). |
| `.gitignore` | Excluye del repositorio `node_modules/`, `dist/`, `.vite/`, `.env*` y archivos de editor. |
| `.gitattributes` | Reglas de normalización de fin de línea / diff de git. |
| `.vite/` | Caché interna de Vite (generada, no versionar). |

### `public/` — Assets estáticos

| Archivo | Qué hace |
|---------|----------|
| `index.html` | Copia de respaldo del HTML raíz (no usado por Vite; el real está en la raíz del proyecto). |
| `favicon.ico` / `favicon.svg` | Ícono de la pestaña del navegador. |
| `logo192.png` / `logo512.png` | Logos usados para favicon en alta resolución, PWA y Open Graph. |
| `manifest.json` | Manifest de PWA (nombre, iconos, theme color). |

---

### `src/` — Código fuente

#### Entrada de la aplicación

| Archivo | Qué hace |
|---------|----------|
| `src/main.jsx` | Punto de entrada de React. Monta `<App />` en `#root` dentro de `<React.StrictMode>`. |
| `src/App.jsx` | **Corazón de la app.** Envuelve todo con providers anidados: `GoogleOAuthProvider` → `Router` → `LanguageProvider` → `ThemeProvider` → `AuthProvider` → `NotificationProvider` → `ErrorBoundary`. Define **todas las rutas** de la app con `React.lazy()` (carga diferida) y `Suspense`, usa `ProtectedRoute` con roles (student/teacher/admin/parent) y un `Toaster` de react-hot-toast con los colores del tema. |
| `src/App.css` | Estilos globales de la aplicación (layout general). |
| `src/index.css` | `@tailwind` base/components/utilities + **design tokens** en `:root` (colores Material: `--primary`, `--surface`, `--error`, etc.). Define clases reutilizables `.card`, `.btn-primary`, `.badge`, `.avatar`, `.progress-bar`, `.table`, skeleton, glass, animaciones y sombras. Incluye estilos para React Quill, Google Login, Recharts, hot toast y el modo oscuro. |

#### `src/api/` — Cliente HTTP y endpoints

| Archivo | Qué hace |
|---------|----------|
| `src/api/axios.js` | Instancia central de **Axios**. BaseURL desde `VITE_API_URL`. Interceptor de request: inyecta `Authorization: Bearer <token>` desde `localStorage`. Interceptor de response: maneja **401** haciendo refresh del token (`/user/refresh-token`), encolando peticiones fallidas mientras refresca; si el refresh falla, limpia el token y redirige a `/login`. |
| `src/api/auth.js` | Endpoints de autenticación: `register`, `login`, `googleLogin`, `logout`, `forgotPassword`, `resetPassword`, perfil (`getProfile`/`updateProfile`), `changePassword`, vincular/desvincular Google, `refreshToken`, gestión de sesiones por plataforma (`logoutPlatform`, `logoutAll`, `getDevices`). |
| `src/api/users.js` | Perfil del usuario, **progreso** (`getMyStats`, `getBadges`) y **notificaciones** (listar, conteo no leído, marcar leídas, eliminar). |
| `src/api/lessons.js` | CRUD de **lecciones**: listar, obtener, crear, actualizar, eliminar, publicar/despublicar, duplicar, por unidad, estadísticas. Recursos por lección y **progreso** (`updateProgress`). |
| `src/api/evaluations.js` | CRUD de **evaluaciones** (publicar/despublicar/duplicar/estadísticas). Preguntas (CRUD). Resultados: `submitEvaluation`, `getResults`, `getStudentResult`. |
| `src/api/admin.js` | Panel admin: dashboard, CRUD de **usuarios** (incluye activar/desactivar e **importar CSV / exportar**), configuración del sistema (`getConfig`/`updateConfig`), **períodos académicos** (CRUD) y **backups** de base de datos (crear, consultar último, descargar como blob). |
| `src/api/notifications.js` | Endpoints de notificaciones (listar con params, conteo no leído, marcar como leída/todas, eliminar una o las leídas). |
| `src/api/reports.js` | Reportes: `getPerformanceReport` (gráfico), `getGradesReport` (tabla), `getStudentReport` (individual) y **exportación PDF/Excel** (`responseType: 'blob'`). |
| `src/api/gemini.js` | Cliente del **chat IA** ("Profesor Euler"). `sendMessage` hace POST a `/ai/chat` con historial de conversación y procesa respuesta **SSE en streaming** (parsea líneas `data:`), y `resetChat` limpia el historial en memoria. |

#### `src/contexts/` — Estado global

| Archivo | Qué hace |
|---------|----------|
| `src/contexts/AuthContext.jsx` | **Estado de autenticación global.** Almacena `user`, `token` y `loading`. Expone `login`, `loginWithGoogle`, `register`, `logout` y helpers de rol (`hasRole`, `isAdmin`, `isTeacher`, `isStudent`, `isParent`). Al cargar, si hay token, obtiene el perfil; ante 401 cierra sesión. |
| `src/contexts/LanguageContext.jsx` | **i18n trilingüe** (es/en/qu). Guarda el idioma en `localStorage`, detecta el del navegador y expone `t('clave.ruta')` para traducir. Contiene el **diccionario de traducciones** completo (~2500 líneas) con textos de navegación, auth, dashboards, exámenes, etc. |
| `src/contexts/ThemeContext.jsx` | **Temas dinámicos.** Paletas `light`, `dark` y `grayscale` (filtro CSS). Carga colores institucionales desde `/config` y los aplica como CSS variables; expone `setTheme` y `updateColors` (guarda en `/admin/config`). Incluye utilidades `lightenColor`/`darkenColor`. |
| `src/contexts/NotificationContext.jsx` | Estado de **notificaciones** global: lista, `unreadCount` y `loading`. Expone marcar leídas/todas, eliminar y refetch. Consulta el conteo no leído cada 30 s cuando hay usuario logueado. |

#### `src/hooks/` — Hooks personalizados

| Archivo | Qué hace |
|---------|----------|
| `src/hooks/useAuth.js` | Re-exporta `useAuth` del contexto con guarda de error si se usa fuera del provider. |
| `src/hooks/useTheme.js` | Re-exporta `useTheme` del contexto con guarda de error. |
| `src/hooks/useNotifications.js` | Re-exporta `useNotifications` del contexto con guarda de error. |
| `src/hooks/useAntiCheat.js` | **Sistema anti-trampa para exámenes.** Detecta cambio de pestaña, blur/focus prolongado, copiar/cortar/pegar, clic derecho, atajos `Ctrl+C/V/X/U`, y apertura de DevTools (F12/Ctrl+Shift+I). Reporta cada evento al backend (`/exams/attempts/{id}/cheat`) con tipo, detalle y contador de cambios de pestaña. |

#### `src/utils/` — Utilidades

| Archivo | Qué hace |
|---------|----------|
| `src/utils/constants.js` | Constantes: `ROLES`, `DIFFICULTY_LEVELS`, `EVALUATION_TYPES`, `QUESTION_TYPES`, `NOTIFICATION_TYPES`, `API_URL` y `APP_NAME`. |
| `src/utils/helpers.js` | Funciones auxiliares: `formatDate`/`formatDateTime` (con locale por idioma), `getInitials`, `truncateText`, colores por dificultad/rol/estado (`getDifficultyColor`, `getRoleColor`, `getStatusColor`), `calculateProgress`, iconos/nombres de insignias (`getBadgeIcon`, `getBadgeName`), etiquetas de dificultad (trilingües), `getLetterGrade` (AD/A/B/C), y `toArray` (normaliza respuestas API). |

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
| `ErrorBoundary.jsx` | Captura errores de renderizado en el árbol de React y muestra pantalla de error con botón "Reintentar". |
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

#### `Layout/`

| Archivo | Qué hace |
|---------|----------|
| `MainLayout.jsx` | **Layout principal** de las rutas protegidas: `Sidebar` + `TopBar` + `<Outlet/>` (contenido de la ruta) + `BottomNav` móvil + `ChatWidget` flotante. |

#### `Landing/`

| Archivo | Qué hace |
|---------|----------|
| `LandingPage.jsx` | **Página de aterrizaje pública** (ruta `/`). Hero con botones de login/registro, sección "Acerca de", características, y una **consulta de notas por DNI** (con captcha) que muestra el resumen académico de un estudiante (promedio, lecciones, racha, calificaciones por área). |

#### `Auth/`

| Archivo | Qué hace |
|---------|----------|
| `Login.jsx` | Formulario de **inicio de sesión** (validación Yup) + **login con Google**. Redirige a `/dashboard`. |
| `Register.jsx` | Formulario de **registro de estudiantes** (nombre, email, contraseña con confirmación, nivel académico) con validación y animaciones. |
| `ForgotPassword.jsx` | Solicitud de **recuperación de contraseña** por email; muestra confirmación de envío. |

#### `Student/` — Vistas del estudiante

| Archivo | Qué hace |
|---------|----------|
| `StudentDashboard.jsx` | Dashboard del estudiante: bienvenida personalizada, estadísticas (lecciones completadas, evaluaciones, promedio, racha de días), lecciones en progreso con barra de avance, evaluaciones recientes y **insignias/logros**. |
| `LessonList.jsx` | Lista de **lecciones** con búsqueda y filtros (dificultad, unidad), tarjetas con dificultad, tiempo estimado, tags, unidad y progreso. |
| `LessonDetail.jsx` | Detalle de lección: contenido HTML **saneado** (elimina scripts/eventos peligrosos), recursos descargables, barra de progreso y botones para avanzar/marcar completada (envía `time_spent`). |
| `EvaluationList.jsx` | Lista de **evaluaciones** con filtros (búsqueda, tipo, dificultad) y estados (completado con nota, vencida, pendiente). |
| `EvaluationResult.jsx` | **Resultado de evaluación**: anillo de puntaje /20, respuestas correctas/incorrectas con retroalimentación pregunta por pregunta, tiempo, intento, descarga de PDF y acciones sugeridas. |
| `ExamList.jsx` | Lista de **exámenes disponibles** con dificultad, tiempo límite, intentos restantes y botón para iniciar (crea el intento vía `POST /exams/{id}/start`). |
| `ExamPlayer.jsx` | **Reproductor de examen**: navegación por preguntas (opción múltiple / verdadero-falso), contador de tiempo con autoenvío al agotarse, panel de respuestas, **aviso anti-trampa**, confirmación de envío y pantalla de resultado. |
| `StudentWorkBoard.jsx` | **Tablero de trabajos** del estudiante: estadísticas (asignados, enviados, calificados, pendientes, promedio), filtros por tipo/estado/área y lista de trabajos con feedback y nota. |
| `StudentRanking.jsx` | **Ranking** de estudiantes por promedio (con filtro por curso), trofeos para top 3 y resaltado de mi posición. |

#### `Teacher/` — Vistas del docente

| Archivo | Qué hace |
|---------|----------|
| `TeacherDashboard.jsx` | Dashboard docente: estadísticas (estudiantes, lecciones, evaluaciones, tasa de aprobación), acciones rápidas (crear lección/evaluación) y actividad reciente (estudiantes y evaluaciones). |
| `LessonEditor.jsx` | **Editor de lecciones** (crear/editar): datos básicos, dificultad, unidad/tema, tags, **contenido HTML con React Quill**, y lista dinámica de **recursos** (PDF/video/imagen/link) con `useFieldArray`. |
| `EvaluationCreator.jsx` | **Creador/editor de evaluaciones**: configuración (tipo, dificultad, lección vinculada, límite de tiempo, fecha límite, intentos máximos) y **preguntas** (opción múltiple con opciones dinámicas, completar, fórmula) con duplicado y validación Yup. |
| `ExamManager.jsx` | **Gestión de exámenes** (listar, filtrar por estado): crear, editar, activar/desactivar, ver estadísticas y eliminar. |
| `ExamEditor.jsx` | **Editor de exámenes** (crear/editar): configuración (título, unidad, dificultad, tiempo, intentos, autocorrección, preguntas aleatorias) y preguntas de opción múltiple/verdadero-falso con reordenamiento y opciones dinámicas. Guarda como borrador o publicado/activo. |
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
- **Chat IA "Profesor Euler"** con streaming (SSE) y renderizado de markdown.
- **Exámenes con anti-trampa** (detección y reporte de eventos) y estadísticas por examen.
- **Reportes** con gráficos (Recharts) y exportación PDF/Excel.
- **Manifest PWA** con iconos y meta tags (sin Service Worker; `sw.js` no está implementado).
