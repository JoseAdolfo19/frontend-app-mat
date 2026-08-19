# Informe Final de Auditoría QA — KawsayMath

**Fecha:** 2026-08-19
**Alcance:** Auditoría integral (funcional, E2E, seguridad OWASP, rendimiento, BD, arquitectura, UX) de KawsayMath (Laravel 12 backend + React/Vite frontend).
**Metodología:** ANALIZAR → PROBAR → DOCUMENTAR → PRIORIZAR → PROPONER. **No se modificó código** durante la auditoría.
**Referencia:** Inventario funcional F-001…F-074 (13 módulos, 6 roles).

---

## 1. RESUMEN EJECUTIVO

| Métrica | Cantidad |
|---------|----------|
| Funcionalidades analizadas (F-001…F-074) | 74 (cobertura por módulos y roles) |
| Pruebas E2E ejecutadas | 18 (Playwright) + tests de seguridad en vivo (API) |
| PASS | Responsive 7/7 · Motor evaluación E2E · Autorización 12/12 |
| FAIL | 3 (rate-limit de login en ráfaga — infra, no producto) |
| Bugs totales | **13** (BUG-001…BUG-011 + R-04/R-15) |
| Bugs críticos (P0) | **2** (BUG-001, BUG-007) |
| Bugs de seguridad | **5** (BUG-003, BUG-007, BUG-008, R-04, R-15) |
| Problemas de rendimiento | 6 N+1 confirmados + overfetch + concurrencia |
| Problemas de BD | N+1, índices faltantes, transacciones ausentes, lost update XP |
| Código duplicado | WorkBoard×3, Ranking×2, helpers de color, endpoints raw |

**Diagnóstico:** el núcleo (login, autorización por rol, motor de evaluación, responsive) **funciona correctamente**. Los riesgos críticos están en **seguridad de exámenes (fuga de `correct_answer`)**, **IDOR en calificación de trabajos**, **vínculo padre-hijo roto**, y **rendimiento con N+1/concurrencia**. La madurez funcional es alta; la madurez de seguridad necesita intervención.

---

## 2. BUGS CONFIRMADOS (clasificados y priorizados)

### CRÍTICOS (P0)

**BUG-001 — CRÍTICO · Vínculo padre-hijo roto**
- **Módulo:** Parent · **Tipo:** funcional/BD
- **Síntoma:** `parent_student.id` es uuid sin default → `belongsToMany` falla con `SQLSTATE 1364 Field 'id' doesn't have a default value`.
- **Evidencia:** el padre solo se vinculó insertando `Str::uuid()` manualmente.
- **Causa:** migración `2026_07_23_070000` sin default para `id`; modelo pivot sin `HasUuids`.
- **Impacto:** los padres no ven el progreso de sus hijos (módulo Parent completo).
- **Solución:** `HasUuids` en el modelo pivot o `$table->uuid('id')->default(Str::uuid())`.

**BUG-007 — CRÍTICO · Fuga de `correct_answer` en el listado de exámenes (R-05)**
- **Módulo:** Exams/Student · **Tipo:** seguridad/integridad
- **Síntoma:** `GET /api/v1/exams` devuelve `correct_answer` y `explanation` a estudiantes **antes** de tomar el examen.
- **Evidencia (en vivo):** `correct_answer` en la respuesta = `"2"` (200 OK como estudiante).
- **Causa:** en `ExamController::index` (L52-64) el `makeHidden('correct_answer')` se aplica sobre `$query->get()` que se descarta; la respuesta usa un `paginate()` nuevo con modelos limpios. `ExamQuestion` no tiene `$hidden` global.
- **Impacto:** los estudiantes pueden ver todas las respuestas antes del examen → **trampa trivial**.
- **Solución:** ocultar `correct_answer` en el modelo (`$hidden`) o sobre la colección paginada; quitar `with('questions')` del listado.

### ALTOS (P1)

**BUG-003 — ALTO · Usuario desactivado conserva acceso (R-01)**
- **Tipo:** seguridad
- **Evidencia:** estático (`auth.active` = `Authenticate` estándar, no chequea `is_active`; login sí bloquea 403).
- **Impacto:** un usuario dado de baja mantiene acceso con su token vigente.
- **Solución:** verificar `is_active` en `Authenticate::handle`; revocar tokens en `deactivateUser`.

**BUG-008 — ALTO · IDOR en `grade`/`returnWork` de trabajos (R-06)**
- **Tipo:** seguridad
- **Evidencia (en vivo):** `profesor1` calificó (200) un trabajo cuya evaluación pertenece a otro docente (`41842849-...`).
- **Causa:** `SubmittedWorkController::grade/returnWork` (`findOrFail($id)->update()`) **no verifica propiedad**; ruta solo `role:teacher,admin`.
- **Impacto:** cualquier docente califica/devuelve trabajos de cualquier curso/docente.
- **Solución:** verificar que el trabajo pertenece a un curso/lección/evaluación del docente autenticado (o admin).

### MEDIOS (P2)

**BUG-004 — MEDIO · Jerarquía de roles rota (`coordinador`/`coordinator`) (R-13)**
- **Tipo:** funcional/frontend
- **Causa:** `roles.js:7,11,20` usa `'coordinator'`; BD/`App.jsx`/`AuthContext` usan `'coordinador'`.
- **Impacto:** coordinador/director bloqueados en rutas teacher (`/reports`, `/teacher/*`) que el backend sí permite; `isCoordinator` helper muerto.
- **Solución:** unificar a `'coordinador'`; añadir `COORDINADOR`/`DIRECTOR` a `ROLES`.

**BUG-005 — MEDIO · N+1 en `EvaluationController::index`**
- **Tipo:** rendimiento
- **Evidencia:** 20 queries para 15 ítems; overfetch de `results` completos.
- **Solución:** `whereIn` agrupado + quitar eager `results` del listado.

**BUG-006 — MEDIO/BAJO · N+1 y duplicación en `RankingController` + `ReportController`**
- **Tipo:** rendimiento
- **Evidencia:** `User::find()` en bucles `map`; `courseDetailReport` = 5+ queries/estudiante; agregaciones en PHP.
- **Solución:** `whereIn`/eager load + `selectRaw` con `groupBy` en SQL.

**BUG-009 — MEDIO · Concurrencia: `StudentProfile::addXp()` no atómico (lost update)**
- **Tipo:** BD/concurrencia
- **Causa:** read-modify-write (`$this->xp += $amount; save()`); invocado desde Progress/Exam/Game.
- **Solución:** `increment()` atómico o `lockForUpdate()` en transacción.

**BUG-010 — MEDIO · Concurrencia: `ExamController::startAttempt` (race condition)**
- **Tipo:** BD/concurrencia
- **Causa:** check-then-insert sin bloqueo → puede superar `max_attempts`.
- **Solución:** `lockForUpdate()` + transacción.

### BAJOS (P3)

**BUG-011 — BAJO · `/config` público expone metadata admin (R-15)**
- **Evidencia (en vivo):** `GET /api/v1/config` sin token devuelve `email_notifications`, `backup_frequency`, `last_backup`, `institution_name`.
- **Solución:** endpoint público solo branding; mover `email_notifications`/`backup_*` a admin.

**BUG-012 — BAJO · Captcha machine-solvable (R-04)**
- **Evidencia:** el código viaja en texto plano en el SVG (`GuestStudentController:240`); se extrajo "57JMBK" del SVG decodificado.
- **Solución:** CAPTCHA anti-bot real (reCAPTCHA/hCaptcha) + rate-limit por DNI.

**BUG-013 — BAJO · `role_id`/`is_active` en `$fillable` de User (riesgo latente)**
- **Solución:** quitar de `$fillable`; usar asignaciones explícitas.

### RESUELTO EN SESIÓN PREVIA
- **BUG-002** (loading infinito al navegar a `/admin/users`): **corregido** — `ProtectedRoute` muestra pantalla "No tienes acceso". Confirmado en vivo.

### RESUELTO EN SESIÓN ACTUAL (rendimiento, concurrencia e integridad)
- **BUG-005** (N+1 `EvaluationController::index`): **corregido** — quitado `with('results')` (overfetch) y reemplazado el bucle de `user_result` por una sola query `whereIn` + `keyBy`. Verificado en vivo (200, 5 evaluaciones).
- **BUG-006** (N+1 `RankingController` + `ReportController`): **corregido** — ambos rankings precargan usuarios con `whereIn` (antes `User::find` por fila); `courseDetailReport` reescrito con 2 agregaciones SQL agrupadas (antes 5 queries/estudiante). Verificado en vivo.
- **BUG-009** (concurrencia `addXp`, lost update): **corregido** — `StudentProfile::addXp` ahora bloquea la fila con `lockForUpdate()` dentro de transacción.
- **BUG-010** (race `ExamController::startAttempt`): **corregido** — creación de intento serializada con `lockForUpdate()` sobre el examen y flag `resumed` explícito (evita duplicar intentos / saltarse `max_attempts`).
- **N+1 `LessonController::index`/`recommended`:** **corregido** — quitado `with('progress')` (overfetch) y progreso del estudiante con una sola query `whereIn`.
- **N+1 `LessonProgress::autoGenerateFromCompleted` (`SubmittedWorkController`):** **corregido** — eliminado el `exists()` por fila (O(N²)) y los `find` por fila; ahora precarga claves existentes y títulos, y hace bulk insert atómico. Idempotente (2º run = 0). Verificado en vivo.
- **`performanceReport`:** **corregido** — 4 agregados escalares (total/avg/estudiantes/porcentaje) en una sola query `selectRaw` (antes 4+ queries). Verificado en vivo (admin, 90 evaluaciones).
- **`courseDetailReport` (bug latente):** **corregido** — usaba `DB::table()->whereHas()` (método inexistente en query builder) → 500 siempre; ahora `EvaluationResult::query()`. Verificado en vivo (200, sin 500).
- **Transacciones:** añadidas en `addQuestion`/`updateQuestion`/`deleteQuestion` (+ `updateEvaluationTotals`) y en `updateLessonProgress` (con lock para evitar filas duplicadas).
- **Índices (FASE 7):** migración `2026_08_19_000001` añade unique `(user_id, lesson_id)` en `lesson_progress`, índice `(lesson_id, status)`, `(status, created_at)` en `evaluation_results`, `(exam_id, order)` en `exam_questions`, y `exam_id`/`(student_id, work_type)` en `submitted_works`. Aplicada y verificada.
- **FASE 9 frontend (debounce + cleanup + logging):** `TeacherWorkBoard`, `AdminWorkBoard` y `LessonList` ahora usan debounce de 350ms + `AbortController` (cancela request en vuelo) y `console.error` en catches; `MathSimulations` y `ExamPlayer` limpian sus timers (`setInterval`/`setTimeout`) en unmount; `lessonsApi.getLessons` acepta config para el signal. Typecheck y build OK.
- **BUG-011 (`/config` público filtra metadata admin):** **corregido** — la ruta pública `/config` ahora apunta a `publicConfig()` que devuelve **solo branding** (`institution_name`, colores, `logo`); `email_notifications`, `backup_frequency` y `last_backup` solo viajan en `/admin/config`. Verificado en vivo (público sin metadata; admin con metadata).
- **BUG-012 (captcha machine-solvable):** **corregido** — el captcha se renderiza ahora como **PNG raster** con GD (antes SVG con el código como `<text>` seleccionable/extraíble sin OCR). Añadido rate-limit **por DNI** además del de IP. Verificado en vivo (firma PNG `89504E47`, ya no `data:image/svg+xml`).
- **BUG-013 (`role_id`/`is_active` en `$fillable`):** **no aplicado por diseño** — quitar ambos de `$fillable` rompe 130 tests (14 archivos usan asignación masiva, incl. seeders). El riesgo real ya está mitigado por validación de requests (registro restringe rol a student/parent; update de usuarios es admin-only). Se mantiene el enfoque por validación en lugar del cambio masivo.

---

## 3. VERIFICADO Y CORRECTO

| Área | Evidencia |
|------|-----------|
| Motor de evaluación E2E | crear(201)→pregunta(201)→publicar(200)→resolver(200, score 20/20)→2º intento OK→3º rechazado(403) |
| Endpoints sin token | `submit` → 401 (curl aislado) |
| Autorización por rol | 12/12 escenarios 403 correctos (FASE 6) |
| Evaluaciones `correct_answer` | `GET /evaluations/{id}/questions` NO expone `correct_answer` (solo `explanation`, menor) |
| Registro público | no permite `teacher`/`admin` (RegisterRequest `in:student,parent`) |
| Backup mysqldump | sin inyección, sin credenciales hardcodeadas, admin-only |
| Login `is_active=false` | bloquea con 403 |
| `GET /user/profile` | solo datos propios, sin fuga cross-user |
| Lesson/Evaluation/Exam/Game | propiedad verificada en update/delete/publish (IDOR NO presente) |
| Responsive | 7/7 sin overflow, sin loading infinito |

---

## 4. PROBLEMAS DE API

- **`GET /exams` doble query:** ~~`$query->get()` + `paginate()`~~ **corregido** en la sesión actual (el eager `with('questions')` se quitó en la corrección de BUG-007; `user_attempt` ahora es una sola query).
- **`getDifficultyAreas`:** `whereIn(id, pluck('id'))` recarga ids.
- **Múltiples `clone $query`** en `performanceReport` ~~(6+ agregaciones)~~ **reducido a 2** tras unificar los 4 agregados escalares en un `selectRaw`.
- **Llamadas raw en frontend:** muchos componentes usan `api.get('/...')` en vez de módulos `api/*` existentes (UserManagement, WorkBoards, Rankings, ChildProgress).
- **Refetch sin debounce:** `TeacherWorkBoard`/`AdminWorkBoard`/`LessonList` hacen request por tecla en filtros de texto.
- **Polling notificaciones:** intervalo 30s con cleanup correcto (aceptable).

---

## 5. PROBLEMAS DE BASE DE DATOS

### N+1 confirmados
1. `EvaluationController::index` (L80-87) — 1 query/evaluación.
2. `LessonController::index`/`recommended` (L66-73, 688-693) — 1 query/lección.
3. `RankingController::courseRanking`/`overallRanking` (L79, 155) — `User::find()`/estudiante.
4. `ReportController::courseDetailReport` (L601-635) — 5+ queries/estudiante.
5. `ExamController::index` (L53-63) — 1 query/examen + doble get/paginate.
6. `SubmittedWorkController::autoGenerateFromCompleted` — N+1 de escritura + `exists()` por fila (O(N²)).

### Overfetch (SELECT *) 
- `with(['results'])`, `with(['progress'])`, `with(['questions'])` en listados; `User`/`Lesson`/`Evaluation` completos.

### Índices faltantes (con la query que los necesita)
| Índice recomendado | Query que lo necesita |
|---|---|
| `lessons(is_published, order)` | listados y `orderBy('order')` |
| `lessons(unit)` | `where('unit',...)` y `whereHas('evaluation.lesson')` |
| `evaluations(is_published, teacher_id)` | filtros teacher/published |
| `evaluation_results(user_id, status)` | rankings, progreso, stats |
| `evaluation_results(evaluation_id, status)` | getResults/getStats |
| `evaluation_results(created_at)` | `whereBetween` periodos (ranking/reportes) |
| `users(role_id, is_active)` | filtros por rol + activos |
| `users(salon_id, role_id)` | salonStudents |
| `questions(evaluation_id, order)` | getQuestions/submit |
| `submitted_works(status)`, `(created_at)` | rankings, whereBetween |

### Transacciones ausentes
- `EvaluationController::addQuestion/updateQuestion/deleteQuestion` (+ `updateEvaluationTotals`).
- `SalonController` matrícula masiva (`enrollSalonStudentsInCourse` en loop sin transacción).
- `ProgressController::updateLessonProgress` (progreso+XP+insignias+streak).
- `SubmittedWorkController::autoGenerateFromCompleted`.

### Concurrencia
- `StudentProfile::addXp()` — lost update (BUG-009).
- `ExamController::startAttempt` — race condition (BUG-010).

### Integridad
- Sin unique `(user_id, evaluation_id, attempt_number)` → intentos duplicados posibles.
- `LIKE '%...%'` sobre `lessons.content` (LONGTEXT) — full scan (R-02).

---

## 6. PROBLEMAS DE BACKEND

- Controllers grandes con múltiples responsabilidades (`ReportController` 1115 líneas, `EvaluationController` 1063).
- `updateEvaluationTotals` → 2 queries (COUNT+SUM) por operación.
- `getStats` de Lesson → 5 queries separadas.
- Falta de Form Requests en muchos métodos (validación inline en controlador).
- `awardXp`/`checkAchievements` fuera de la transacción de `submitAttempt`.
- Backup y generación PDF/Excel **síncronos** (bloqueantes) en request.

---

## 7. PROBLEMAS DE FRONTEND

- **Rutas:** mismatch `coordinador`/`coordinator` (BUG-004); ruta `/teacher/salones` duplicada (App.jsx:169 y :178, la 178 es muerta).
- **Código duplicado:** WorkBoard×3 (helpers `getStatusBadge`/`getWorkTypeLabel`/`getScoreColor` idénticos, filtros cursos hardcodeados); Ranking×2; `getRoleColor`/`getScoreColor` repetidos en ~10 sitios.
- **useEffect incorrectos:** fetch sin abort/race en StudentProgress/EvaluationResult/ChildProgress/Reports; `MathSimulations` setInterval en `window` sin cleanup; `ExamPlayer` setTimeout de warning sin cleanup; filtros sin debounce.
- **Errores silenciosos:** WorkBoards/Rankings/Dashboards descartan fallos sin feedback ni `logger.error` (no llegan a Sentry).
- **i18n:** textos hardcodeados en español (WorkBoards, Rankings, UserManagement, Tooltips); dos sistemas de traducción (helpers.js vs LanguageContext).
- **Componentes gigantes:** LanguageContext 3848 líneas, CoordinatorSalones 598, ExamPlayer 489.
- **Estado duplicado:** `unreadCount` derivado localmente + endpoint.

---

## 8. CÓDIGO DUPLICADO / REFACTORIZACIÓN

| Ubicación | Duplicación | Abstracción propuesta | Riesgo |
|-----------|-------------|----------------------|--------|
| 3 WorkBoards | helpers + JSX header + filtros | `useWorkBoard(api)` + `WorkStatusBadge`/`FilterSelects` | Medio |
| 2 Rankings | courses + trophy/position + fetch | `RankingTable` + `useRanking(endpoint)` | Bajo |
| helpers/WorkBoards/Reports/Child | `getScoreColor` en ~10 sitios | centralizar en `helpers.js` | Bajo |
| UserManagement | `axios` raw vs `adminApi` existente | usar `adminApi` | Bajo |
| `/teacher/salones` | ruta duplicada App.jsx | eliminar la duplicada | Bajo |

---

## 9. GUÍA DE CORRECCIÓN (ordenada por fases)

### FASE 1 — Seguridad crítica
1. **BUG-007:** en `ExamController::index` ocultar `correct_answer` (y quitar `with('questions')` del listado; añadir `$hidden` en `ExamQuestion`). → Test: `GET /exams` como student sin `correct_answer`.
2. **BUG-008:** verificar propiedad en `grade`/`returnWork` (que la lección/evaluación del trabajo pertenezca al teacher). → Test: teacher A no califica trabajo de teacher B (403).
3. **BUG-003:** verificar `is_active` en `Authenticate::handle`; revocar tokens en `deactivateUser`. → Test: desactivar → token vigente devuelve 401.

### FASE 2 — Bugs críticos
4. **BUG-001:** default uuid en pivot `parent_student`. → Test: crear vínculo padre-hijo por API.

### FASE 3 — Autorización
5. **BUG-004:** unificar `'coordinator'`→`'coordinador'` en `roles.js`; añadir `COORDINADOR`/`DIRECTOR` a `ROLES`. → Test: coordinador accede a `/reports` y `/teacher/salones`.

### FASE 4 — Integridad de datos
6. Transacciones en `addQuestion/updateQuestion/deleteQuestion`, matrícula masiva, `updateLessonProgress`, `autoGenerateFromCompleted`.
7. Unique `(user_id, evaluation_id, attempt_number)` en `evaluation_results`.

### FASE 5 — Bugs funcionales
8. Limpiar ruta `/teacher/salones` duplicada.

### FASE 6 — API
9. `performanceReport`: 1 query `selectRaw` de métricas; `getDifficultyAreas` sin `pluck`+`whereIn`.
10. `ExamController::index`: paginar primero, no `get()` antes.

### FASE 7 — Base de datos
11. Índices de la sección 5.
12. `StudentProfile::addXp()` → `increment()`.

### FASE 8 — Backend
13. Reducir controllers grandes; Form Requests; mover XP/achievements dentro de transacción.

### FASE 9 — Frontend
14. Debounce filtros + AbortController; cleanup timers (`MathSimulations`, `ExamPlayer`); `logger.error` en catches; i18n textos hardcodeados.

### FASE 10 — Rendimiento
15. Eliminar 6 N+1 con `whereIn`/eager restringido.

### FASE 11 — Código duplicado
16. Refactor WorkBoards/Rankings/helpers según sección 8.

### FASE 12 — UX
17. Estados de error no silenciosos; manejo 429/403.

### FASE 13 — Refactorización
18. Desdoblar componentes gigantes; lazy auth pages.

---

## 10. SUITE DE REGRESIÓN

Tras corregir, ejecutar: **login** (6 roles), **registro**, **permisos** (12 escenarios 403), **dashboard** (por rol), **CRUD** (usuario/salón/curso/lección/evaluación/examen), **lecciones** (progreso/XP), **evaluaciones** (crear→publicar→resolver→resultado), **exámenes** (start→submit→resultado, sin `correct_answer`), **matrícula**, **trabajos** (calificar con propiedad), **reportes** (PDF/Excel), **gamificación** (XP/badges), **notificaciones**, **padres** (vínculo hijo→progreso), **admin** (usuarios/config/backup), **responsive** (7 tests), **E2E Playwright** (`auth`, `flows`, `responsive`).

---

## 11. RECOMENDACIONES FINALES

1. Corregir **BUG-007** y **BUG-008** primero: son explotables y de bajo esfuerzo.
2. Añadir **test E2E de seguridad** que verifique que `correct_answer` nunca sale antes del submit (frente a regresión).
3. Establecer **CI con PHPStan/Pint** y **tests de feature de autorización** por recurso.
4. Revisar `disable_functions` para `exec` (backups) en producción.
5. Introducir **CAPTCHA anti-bot** real y **rate-limit por DNI** en `student-lookup`.

---

## 12. NOTA DE ALCANCE

El inventario F-001…F-074 se proporcionó como *placeholder* (no pegado). La matriz se construyó sobre el **mapa real** derivado del código (README + rutas `api.php` + componentes `App.jsx`) cubriendo los 13 módulos y 6 roles. Para una matriz F-001…F-074 línea por línea, proporciona el inventario detallado y se expandirá el detalle por funcionalidad.