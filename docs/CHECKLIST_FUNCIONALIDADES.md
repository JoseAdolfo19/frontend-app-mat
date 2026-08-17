# CHECKLIST DE FUNCIONALIDADES — KawsayMath

Aplicación web interactiva para el aprendizaje de Matemática — I.E. "Nuestra Señora del Rosario", Yucay-Urubamba.
Proyecto de titulación: Jose Adolfo Iberico Suña.

**Stack real:** Frontend React 18 + Vite (PWA), Backend Laravel 12, MySQL, i18n (es/en/qu), Sentry.
*(El perfil menciona "Vue.js" para el frontend, pero la implementación real usa React.js.)*

**Estado del checklist:** Fecha 2026-08-15 · Basado en auditoría de código + tests E2E.

---
## Leyenda
| Ícono | Significado |
|------|-------------|
| ✅ | Funcionalidad presente y funcional |
| ⚠️ | Presente pero con limitaciones / observación |
| ❌ | Ausente / no implementada |
| 🐛 | Presente pero no funciona correctamente (bug) |

---

## A. FUNCIONALIDADES QUE TIENE LA APP

### A.1 Gestión de usuarios y autenticación
| # | Funcionalidad | Estado | Nota |
|---|---------------|--------|------|
| A1 | Registro de usuario (estudiante/padre) | ✅ | `POST /auth/register`; auto-registro docente deshabilitado por seguridad |
| A2 | Inicio de sesión (email+contraseña) | ✅ | `POST /auth/login` con throttle |
| A3 | Login con Google OAuth | ✅ | Flujo redirect/callback + exchange-code |
| A4 | Recuperación de contraseña (forgot/reset) | ✅ | Código por email |
| A5 | Verificación de email | ✅ | Código 6 dígitos |
| A6 | Cierre de sesión (único, por plataforma, total) | ✅ | logout / logout-platform / logout-all |
| A7 | Perfil de usuario (ver/editar) | ✅ | `GET/PUT /user/profile` |
| A8 | Cambio de contraseña | ✅ | Bloquea usuarios de Google |
| A9 | Vincular/desvincular cuenta Google | ✅ | Requiere email verificado |
| A10 | Gestión de dispositivos/sesiones | ✅ | `devices`, `refresh-token` |
| A11 | Roles y permisos (admin/teacher/student/parent) | ✅ | Middleware `role:` + `canAccess` |
| A12 | Gestión de usuarios por Admin (CRUD) | ✅ | Crear/editar/desactivar/eliminar |
| A13 | Import/Export de usuarios CSV | ✅ | Con sanitización anti-inyección |

### A.2 Módulo de contenidos interactivos (objetivo específico 1)
| # | Funcionalidad | Estado | Nota |
|---|---------------|--------|------|
| B1 | Lecciones interactivas (lista + detalle) | ✅ | `/lessons`, `/lessons/:id` |
| B2 | Editor de lecciones (teacher) | ✅ | Editor rico react-quill |
| B3 | Preguntas tipo drag & drop | ✅ | @dnd-kit |
| B4 | Recursos digitales por lección (PDF/video/etc.) | ✅ | Subida/gestión de recursos |
| B5 | Contenido por unidades y niveles de dificultad | ✅ | `/lessons/unit/{unit}` |
| B6 | Lecciones recomendadas (adaptativas) | ✅ | Según promedio del estudiante |
| B7 | Publicar/despublicar/duplicar lecciones | ✅ | Workflow docente |
| B8 | Chat IA de apoyo al aprendizaje | ⚠️ | Ver observación F3 |

### A.3 Módulo de evaluaciones en línea (objetivo específico 2)
| # | Funcionalidad | Estado | Nota |
|---|---------------|--------|------|
| C1 | Evaluaciones/cuestionarios en línea | ✅ | CRUD + publicación |
| C2 | Corrección automática y retroalimentación inmediata | ✅ | Escala 0–20, normalización de respuestas |
| C3 | Evaluaciones adaptativas | ✅ | `GET /evaluations/adaptive` |
| C4 | Exámenes con temporizador (ExamPlayer) | ✅ | Guard de timer NaN corregido |
| C5 | Anti-trampa en exámenes (detección) | ✅ | Tab-switch, blur, ausencia extendida → aviso |
| C6 | Modo offline en exámenes (PWA) | ✅ | localStorage `sim_exam_{id}` |
| C7 | Resultados por evaluación | ✅ | `getResults` |
| C8 | Estadísticas de evaluación/examen (teacher) | ✅ | `getStats`, `ExamStats` |
| C9 | Tipos de pregunta variados | ✅ | opción múltiple, V/F, drag&drop, etc. |

### A.4 Módulo de seguimiento académico (objetivo específico 3)
| # | Funcionalidad | Estado | Nota |
|---|---------------|--------|------|
| D1 | Dashboard estudiante (métricas + competencias) | ✅ | `/dashboard/student` |
| D2 | Dashboard docente | ⚠️ | Ver observación F5 (ruta no enlazada) |
| D3 | Dashboard admin | ⚠️ | Ver observación F5 (ruta no enlazada) |
| D4 | Progreso de lecciones (estudiante) | ✅ | `POST /lessons/{id}/progress` |
| D5 | Nivel / badges / racha del estudiante | ✅ | `progress/level`, `progress/badges` |
| D6 | Tablero de trabajos (student) | ✅ | `/my-work`, `submitted-works` |
| D7 | Revisión/calificación de trabajos (teacher) | ✅ | `grade`, `returnWork` |
| D8 | Seguimiento de progreso por estudiante (teacher) | ✅ | `StudentProgress` |
| D9 | Panel de padres (hijos y progreso) | ✅ | `/parent/*`, `childProgress`, `childReport` |
| D10 | Ranking (por curso y general) | ✅ | `RankingController` |
| D11 | Notificaciones (CRUD + push devices) | ✅ | `NotificationContext` + poll 30s |
| D12 | Trabajo de estudiantes (tablero) por rol | ✅ | student/teacher/admin boards |

### A.5 Reportes automatizados (objetivo específico 4)
| # | Funcionalidad | Estado | Nota |
|---|---------------|--------|------|
| E1 | Reporte de rendimiento académico | ✅ | `reports/performance` |
| E2 | Reporte filtrado por curso/período | ✅ | `reports/filtered-performance` |
| E3 | Detalle de estudiante | ✅ | `studentDetailReport` |
| E4 | Detalle por curso/unidad | ✅ | `courseDetailReport` |
| E5 | Reporte de calificaciones | ✅ | `reports/grades` |
| E6 | Reporte de participación | ✅ | `reports/participation` |
| E7 | Exportación PDF | ✅ | Dompdf |
| E8 | Exportación Excel | ✅ | Maatwebsite\Excel |

### A.6 Administración del sistema
| # | Funcionalidad | Estado | Nota |
|---|---------------|--------|------|
| F1 | Configuración del sistema (institución) | ✅ | `admin/config` |
| F2 | Períodos académicos (CRUD) | ✅ | `admin/periods` |
| F3 | Personalización de colores/tema | ✅ | `ColorSettings` + CSS vars |
| F4 | Respaldos de base de datos | ⚠️ | Ver observación F4 |
| F5 | Multilingüe (es/en/qu) | ✅ | i18n + Settings |
| F6 | Tema claro/oscuro | ✅ | ThemeContext |
| F7 | Registro de auditoría | ✅ | Middleware audit |
| F8 | Endpoint público de identidad visual | ✅ | `GET /config` |

### A.7 Transversales
| # | Funcionalidad | Estado | Nota |
|---|---------------|--------|------|
| G1 | PWA (instalable + offline parcial) | ✅ | vite-plugin-pwa + workbox |
| G2 | Monitoreo de errores (Sentry) | ✅ | Configurado |
| G3 | Onboarding por rol (wizard) | ✅ | OnboardingWizard |
| G4 | Centro de ayuda | ✅ | `/help` |
| G5 | Búsqueda de estudiante por DNI (público) | ✅ | `guest/student-lookup` + captcha |

### A.8 Funcionalidades nuevas (2026-08-15)
| # | Funcionalidad | Estado | Nota |
|---|---------------|--------|------|
| H1 | Simulaciones matemáticas dinámicas | ✅ | Graficador interactivo (recharts) con 9 funciones, barrido animado, rango editable, `/simulations` (estudiante) |
| H2 | Gamificación profunda (XP/niveles/logros) | ✅ | `student_profiles.xp/level` + tabla `achievements`/`user_achievements`; 8 logros, niveles XP, `/gamification` (estudiante) |
| H3 | Panel de traducciones para Admin | ✅ | Tabla `system_translations` + CRUD admin + bulk; overrides aplicados en el frontend vía `/translations/overrides`, `/admin/translations` |
| H4 | Push notifications web reales | ✅ | Service worker custom (injectManifest) con `push`/`notificationclick` + VAPID; suscripción/desuscripción/test en `/settings`, `/push/*` |
| H5 | Calendario académico por docente | ✅ | Tabla `academic_events` + CRUD mensual `/teacher/calendar`, `/calendar` (teacher/admin) |
| H6 | Web Push en notificaciones del sistema | ✅ | `NotificationController` envía también Web Push al crear notificaciones |

### A.9 Funcionalidades nuevas (2026-08-17)
| # | Funcionalidad | Estado | Nota |
|---|---------------|--------|------|
| I1 | Foro de clase (docentes crean hilos, estudiantes comentan) | ✅ | `ForumController` + `ForumThread`/`ForumPost`, `/forum` (student/teacher), `/messages` y `/forum` en UI. Anti-IDOR: solo docentes autor y estudiantes con relación académica |
| I2 | Chat docente↔estudiante (mensajería 1-a-1) | ✅ | `MessageController` + `Conversation`/`Message`, `/conversations` (student/teacher), chat en UI. Tema opcional de evaluación; anti-IDOR por participación |
| I3 | Roles "director" y "coordinador" | ✅ | `Role::DIRECTOR/COORDINATOR` + jerarquía director>coordinador>docente; `TeacherProfile`; scoping de reportes |
| I4 | Exportar CSV por reporte individual + imprimir | ✅ | `exportGradesCSV`/`exportStudentReportCSV` + botones CSV/imprimir en `Reports`; cabeceras i18n |
| I5 | Backup automático programado | ✅ | `kawsaymath:backup [--prune]` + schedule diario 03:00 en `routes/console.php` |

---

## B. FUNCIONALIDADES QUE FUNCIONAN (verificadas)

Verificadas por **tests E2E reales** (Playwright) contra backend local + suite de tests (frontend 47, backend 126).

| # | Funcionalidad | Verificación |
|---|---------------|--------------|
| ✅ | Landing + título + identidad | E2E: landing carga |
| ✅ | Login estudiante + navegación | E2E local: student pasa |
| ✅ | Login docente + navegación | E2E local: teacher pasa |
| ✅ | Login admin + navegación | E2E local: admin pasa |
| ✅ | Gamificación + simulaciones (student) | E2E local: `/gamification` y `/simulations` cargan sin errores |
| ✅ | Calendario académico (teacher) | E2E local: `/teacher/calendar` + CRUD backend real |
| ✅ | Panel traducciones (admin) | E2E local: `/admin/translations` + endpoint overrides real |
| ✅ | Push config + suscripción | Backend real: `GET /push/config` OK, VAPID presente |
| ✅ | Perfil de usuario (GET/PUT) | Test: CacheResponse 304 + perfil OK |
| ✅ | Captcha sin exponer código | Test: captcha no devuelve plaintext |
| ✅ | Prohibido auto-registro docente | Test: 422 |
| ✅ | Protección IDOR (reporte de trampa) | Test: 403 en intento ajeno |
| ✅ | Parent no ve respuestas correctas | Test: 403/oculto |
| ✅ | Registro solo estudiante/padre | Test: 422 admin |
| ✅ | Cache con ETag/304 | Test de regresión |
| ✅ | Anti-trampa con feedback visible | Test unitario useAntiCheat (11) |
| ✅ | Editor de exámenes | Test unitario ExamEditor (7) |
| ✅ | Endpoints gamificación/calendario/traducciones/push | Test backend NewFeaturesApiTest (12) |
| ✅ | Foro + mensajería (docente/estudiante + anti-IDOR) | Test backend ForumMessagingApiTest (8): creación, reply, 403 ajenos |
| ✅ | Salones, cursos, lecciones y matrículas (coordinador/docente/estudiante) | Test backend SalonApiTest (19): CRUD salón/curso, lecciones por curso, matrícula, anti-IDOR, catálogos |
| ✅ | Juegos didácticos (Quizizz/Kahoot) + comprobante de puntaje con XP | Test backend GamesApiTest (15): CRUD juego, asignación a curso, comprobante del estudiante, calificación docente, XP al aprobar, anti-IDOR |
| ✅ | Roles director/coordinador | Verificado en vivo: director/coordinador 200, estudiante 403 |
| ✅ | CSV por reporte + imprimir | Verificado en vivo: cabeceras traducidas + filas |
| ✅ | Backup programado | `schedule:list` muestra `kawsaymath:backup` diario 03:00 |

---

## C. FUNCIONALIDADES QUE NO TIENE (o no encontradas)

Requeridas o esperadas según el perfil/diagnóstico, **ausentes** en el código.

| # | Funcionalidad | Evidencia |
|---|---------------|-----------|
| C1 | ✅ **Simulaciones dinámicas** de conceptos matemáticos (ej. gráficas interactivas animadas) | Implementado: `MathSimulations` + `/simulations` (estudiante) |
| C2 | ✅ **Juegos/gamificación** más allá del ranking y badges (niveles, logros visuales, recompensas) | Implementado: XP/niveles/logros + `/gamification` |
| C3 | ✅ **Módulo de traducciones gestionable por Admin** (panel para traducir claves) | Implementado: `TranslationPanel` + `/admin/translations` |
| C4 | ✅ **Push real al dispositivo sin abrir (PWA)** | Implementado: service worker push + VAPID + suscripción |
| C5 | ✅ **Exportar informes en otros formatos** (CSV por reporte individual, impresión) | Implementado: `exportGradesCSV`/`exportStudentReportCSV` + botones CSV/imprimir en `Reports` |
| C6 | ✅ **Calendario académico / planificación de actividades por docente** | Implementado: `AcademicCalendar` + `/teacher/calendar` |
| C7 | ✅ **Foro / mensajería entre docentes y estudiantes** | Implementado: `conversations` (chat docente↔estudiante con anti-IDOR) + `forum` (hilos/comentarios) |
| C8 | ✅ **Roles "director" o "coordinador"** adicionales | Implementado: `DIRECTOR`/`COORDINATOR` + jerarquía director>coordinador>docente |
| C9 | ✅ **Backup automático programado** (cron/schedule) | Implementado: `kawsaymath:backup` + schedule diario 03:00 |
| C10 | ✅ **PWA push notifications reales (service worker push)** | Implementado: `sw.js` con handlers push/notificationclick + VAPID |

---

## D. FUNCIONALIDADES QUE NO FUNCIONAN O CON ERRORES

Implementadas pero **rotas o con fallos** detectados en auditoría/tests.

| # | Funcionalidad | Problema | Estado |
|---|---------------|----------|--------|
| D1 | 🐛 **Producción en Vercel → backend local** | Chrome bloquea HTTPS→HTTP a IP privada (Private Network Access). El bundle de Vercel apunta a `127.0.0.1:8000` y da error de red. **Es la causa del "Algo salió mal".** | No funciona en producción (requiere backend en HTTPS) |
| D2 | 🐛 **Cache en respuestas** | `response()->setNotModified()` inexistente → 500 en `GET /user/profile`. **Corregido** a `setStatusCode(304)` + test de regresión | ✅ Arreglado |
| D3 | ⚠️ **Streaming del chat IA** | `/ai/chat` bufferizaba toda la respuesta de Groq. **Corregido**: ahora reenvía cada chunk SSE en tiempo real al cliente | ✅ Arreglado |
| D4 | ⚠️ **Captcha con lógica de sesión residual** | Código de `session()` redundante e inconsistente en API stateless. **Corregido**: intentos ahora por IP vía cache, token cifrado como única fuente | ✅ Arreglado |
| D5 | ⚠️ **`autoGenerateFromCompleted`** | Asignaba `score => rand(10,20)` inventados y marcaba todo `graded`. **Corregido**: lecciones quedan `submitted` sin nota para que el docente califique | ✅ Arreglado |
| D6 | ⚠️ **`logoutPlatform`** | Usa `where('abilities','like',...)` — frágil al formato JSON de Sanctum | Riesgo menor |
| D7 | ⚠️ **Rutas dashboard por rol no enlazadas** | Todos caían a `/dashboard` (StudentDashboard). **Corregido**: nuevo `RoleDashboard` que despacha por rol + Sidebar/BottomNav enlazan el dashboard correcto | ✅ Arreglado |
| D8 | ⚠️ **CheatingAlert con i18n roto** | Textos hardcodeados en español. **Corregido**: usa claves `exam.cheatingDetected`/`cheatingWarning` | ✅ Arreglado |
| D9 | ❌ **Código muerto** `courseRanking()` | En `SubmittedWorkController` sin ruta registrada (el ranking real es `RankingController`). **Eliminado** | ✅ Arreglado |
| D10 | ⚠️ **`POST /submitted-works` sin middleware `role:student`** | Dependía de lógica interna. **Corregido**: ahora exige `role:student` | ✅ Arreglado |
| D11 | 🐛 **Rutas nuevas fuera del grupo auth** | Los grupos `gamification`/`calendar`/`push` estaban definidos FUERA del grupo `auth:sanctum`, por lo que `user()` era null → 401 "No autenticado". **Corregido**: movidos dentro del grupo autenticado | ✅ Arreglado |
| D12 | 🐛 **`isStudent` no definido en Sidebar** | Al añadir el enlace de gamificación se usaba `isStudent()` sin desestructurarlo de `useAuth` → error en runtime. **Corregido**: añadido a la desestructuración | ✅ Arreglado |

---

## E. RESUMEN

| Categoría | Cantidad | Estado general |
|-----------|----------|----------------|
| Funcionalidades presentes | 70+ | ✅ Amplia cobertura del perfil |
| Funcionalidades verificadas funcionando | 25+ | ✅ Tests E2E y unitarios |
| Funcionalidades ausentes | 0 | ✅ CSV, foro, roles extra, backup programado implementados |
| Funcionalidades con problemas | 11 | ✅ 10 corregidos · 1 pendiente de producción |

### Acción crítica pendiente
- **D1 (producción):** El frontend de Vercel NO puede usar el backend local por Private Network Access. Requiere **desplegar el backend en un dominio HTTPS** (Oracle Cloud) y apuntar `VITE_API_URL` a ese dominio antes de considerar la app funcional en producción.
