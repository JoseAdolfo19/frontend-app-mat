const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:5173';
const API = 'http://127.0.0.1:8000/api/v1';

const CREDS = {
  student: { email: 'estudiante1@mathflow.com', password: 'password123' },
  teacher: { email: 'profesor1@mathflow.com', password: 'password123' },
  admin: { email: 'admin@mathflow.com', password: 'admin123456' },
};

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
  page.on('response', (res) => {
    if (res.status() >= 400) issues.push(`[http ${res.status()}] ${res.request().method()} ${res.url()}`);
  });
  return issues;
}

test('Recorre el landing sin errores fatales', async ({ page }) => {
  const issues = attachDiagnostics(page);
  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  await expect(page).toHaveTitle(/SIM|MathFlow|Sistema Interactivo/i);
  const fatal = issues.filter((i) => i.includes('pageerror') || i.includes('http 5'));
  expect(fatal).toEqual([]);
});

for (const [role, creds] of Object.entries(CREDS)) {
  test(`Login como ${role} y navegacion sin errores`, async ({ page }) => {
    const issues = attachDiagnostics(page);
    await page.goto(`${BASE}/login`, { waitUntil: 'load' });
    await page.waitForTimeout(2500);
    await page.fill('#login-email', creds.email);
    await page.fill('#login-password', creds.password);
    await page.locator('form button[type="submit"]').first().click();
    await page.waitForURL(/dashboard/, { timeout: 30000 }).catch(async () => {
      // reintento único ante throttle/lazy-load lento
      await page.goto(`${BASE}/login`, { waitUntil: 'load' });
      await page.fill('#login-email', creds.email);
      await page.fill('#login-password', creds.password);
      await page.locator('form button[type="submit"]').first().click();
      await page.waitForURL(/dashboard/, { timeout: 30000 });
    });

    const routes = {
      student: ['/dashboard', '/lessons', '/evaluations', '/exams', '/ranking', '/my-work', '/notifications'],
      teacher: ['/dashboard', '/teacher/exams', '/teacher/works', '/reports', '/teacher/ranking', '/notifications'],
      admin: ['/dashboard', '/admin/users', '/admin/config', '/admin/works', '/admin/colors', '/notifications'],
    };
    for (const route of routes[role]) {
      await page.goto(`${BASE}${route}`, { waitUntil: 'load' });
      await page.waitForTimeout(1800);
    }

    const fatal = issues.filter(
      (i) => i.includes('pageerror') || i.includes('http 5') || /undefined|is not a function|Cannot read/.test(i)
    ).filter((i) => !i.includes('accounts.google.com'));
    expect(fatal).toEqual([]);
  });
}
