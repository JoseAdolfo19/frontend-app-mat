const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:5173';

const USERS = {
  'estudiante1@mathflow.com': { password: 'password123', role: 'student', name: 'Estudiante Uno' },
  'profesor1@mathflow.com': { password: 'password123', role: 'teacher', name: 'Profesor Uno' },
  'admin@mathflow.com': { password: 'admin123456', role: 'admin', name: 'Administrador' },
};

// Mock del API: intercepta /api/v1/* para que los tests no dependan del backend.
function installApiMock(page) {
  return page.route('**/api/v1/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    const path = url.split('/api/v1')[1] || '/';

    // --- AUTH ---
    if (method === 'POST' && path === '/auth/login') {
      const body = route.request().postDataJSON();
      const user = USERS[body.email];
      if (!user || user.password !== body.password) {
        return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'invalid_credentials' }) });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 'u1', email: body.email, full_name: user.name, role: { name: user.role } },
          access_token: 'mock-token',
        }),
      });
    }
    if (method === 'GET' && (path === '/user/profile' || path === '/user')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: { id: 'u1', email: 'x@y.z', full_name: 'User', role: { name: 'student' } } }),
      });
    }
    if (method === 'POST' && path.includes('/user/refresh-token')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ access_token: 'mock-token' }) });
    }

    // --- LISTAS VACÍAS / datos mínimos para que rendericen sin crashear ---
    const emptyCollections = ['/lessons', '/evaluations', '/exams', '/submitted-works', '/notifications', '/rankings/course', '/rankings/overall', '/parent/children', '/progress/badges'];
    if (method === 'GET' && emptyCollections.some((e) => path.startsWith(e))) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    }

    // Dashboard / stats genéricos
    if (method === 'GET' && (path.includes('/dashboard') || path.includes('/progress/my-stats') || path.includes('/progress/level'))) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            student: {},
            stats: { total_lessons_completed: 0, average_score: 0, current_streak: 0 },
            recent_activity: [],
            notifications: [],
            upcoming: [],
          },
        }),
      });
    }
    if (method === 'GET' && path.includes('/admin')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            total_users: 0,
            total_students: 0,
            total_teachers: 0,
            total_lessons: 0,
            total_evaluations: 0,
            recent_users: [],
            recent_students: [],
          },
        }),
      });
    }
    if (method === 'GET' && path.includes('/config')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { institution_name: 'Test' } }) });
    }

    // Cualquier otra ruta de API no mapeada -> 200 vacío
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
  });
}

// Recoge errores de consola y requests fallidos en cada página
function attachDiagnostics(page) {
  const issues = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      issues.push(`[console:${msg.type()}] ${msg.text()}`);
    }
  });
  page.on('pageerror', (err) => issues.push(`[pageerror] ${err.message}`));
  page.on('requestfailed', (req) =>
    issues.push(`[requestfailed] ${req.url()} :: ${req.failure()?.errorText || ''}`)
  );
  return issues;
}

test('Recorre el landing sin errores fatales', async ({ page }) => {
  await installApiMock(page);
  const issues = attachDiagnostics(page);
  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  await expect(page).toHaveTitle(/KawsayMath|MathFlow|Sistema Interactivo/i);
  const fatal = issues.filter((i) => i.includes('pageerror') || i.includes('http 5'));
  expect(fatal).toEqual([]);
});

for (const [email, creds] of Object.entries(USERS)) {
  test(`Login como ${creds.role} y navegacion sin errores`, async ({ page }) => {
    await installApiMock(page);
    const issues = attachDiagnostics(page);
    await page.goto(`${BASE}/login`, { waitUntil: 'load' });
    await page.waitForTimeout(2500);
    await page.fill('#login-email', email);
    await page.fill('#login-password', creds.password);
    await page.locator('form button[type="submit"]').first().click();
    await page.waitForURL(/dashboard/, { timeout: 30000 });

    const routes = {
      student: ['/dashboard', '/lessons', '/evaluations', '/exams', '/ranking', '/my-work', '/notifications'],
      teacher: ['/dashboard', '/teacher/exams', '/teacher/works', '/reports', '/teacher/ranking', '/notifications'],
      admin: ['/dashboard', '/admin/users', '/admin/config', '/admin/works', '/admin/colors', '/notifications'],
    };
    for (const route of routes[creds.role]) {
      await page.goto(`${BASE}${route}`, { waitUntil: 'load' });
      await page.waitForTimeout(1800);
    }

    const fatal = issues.filter(
      (i) => i.includes('pageerror') || /undefined|is not a function|Cannot read/.test(i)
    ).filter((i) => !i.includes('accounts.google.com'));
    expect(fatal).toEqual([]);
  });
}
