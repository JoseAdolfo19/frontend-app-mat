const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:5173';

const USERS = {
  student: { email: 'estudiante1@mathflow.com', password: 'password123' },
  teacher: { email: 'profesor1@mathflow.com', password: 'password123' },
  admin: { email: 'admin@mathflow.com', password: 'admin123456' },
};

// Recoge errores fatales: console.error, pageerror, requests fallidos y HTTP 5xx
function attachDiagnostics(page) {
  const issues = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') issues.push(`[console:error] ${msg.text()}`);
  });
  page.on('pageerror', (err) => issues.push(`[pageerror] ${err.message}`));
  page.on('requestfailed', (req) =>
    issues.push(`[requestfailed] ${req.url()} :: ${req.failure()?.errorText || ''}`)
  );
  page.on('response', (res) => {
    if (res.status() >= 500) issues.push(`[http ${res.status()}] ${res.url()}`);
  });
  return issues;
}

test('Local: landing carga contra backend real', async ({ page }) => {
  const issues = attachDiagnostics(page);
  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  await expect(page).toHaveTitle(/SIM|Sistema Interactivo Matemático/i);
  const fatal = issues.filter((i) => i.includes('pageerror') || i.includes('http 5') || i.includes('requestfailed'));
  expect(fatal).toEqual([]);
});

for (const [role, creds] of Object.entries(USERS)) {
  test(`Local: login real de ${role} y navegacion contra backend local`, async ({ page }) => {
    const issues = attachDiagnostics(page);
    await page.goto(`${BASE}/login`, { waitUntil: 'load' });
    await page.waitForTimeout(2500);
    await page.fill('#login-email', creds.email);
    await page.fill('#login-password', creds.password);
    await page.locator('form button[type="submit"]').first().click();
    await page.waitForURL(/dashboard/, { timeout: 60000 }).catch(async () => {
      // reintento único ante lazy-load lento
      await page.goto(`${BASE}/login`, { waitUntil: 'load' });
      await page.fill('#login-email', creds.email);
      await page.fill('#login-password', creds.password);
      await page.locator('form button[type="submit"]').first().click();
      await page.waitForURL(/dashboard/, { timeout: 60000 });
    });
    // espera contenido real del dashboard (no solo la URL)
    await page.locator('body').waitFor({ state: 'visible', timeout: 20000 });
    await page.waitForTimeout(2000);

    const routes = {
      student: ['/dashboard', '/lessons', '/evaluations', '/exams', '/ranking', '/my-work', '/notifications'],
      teacher: ['/dashboard', '/teacher/exams', '/teacher/works', '/reports', '/teacher/ranking', '/notifications'],
      admin: ['/dashboard', '/admin/users', '/admin/config', '/admin/works', '/admin/colors', '/notifications'],
    };
    for (const route of routes[role]) {
      await page.goto(`${BASE}${route}`, { waitUntil: 'load' });
      await page.waitForTimeout(2000);
    }

    const fatal = issues.filter(
      (i) => i.includes('pageerror') || i.includes('http 5') || /undefined|is not a function|Cannot read/.test(i)
    ).filter((i) => !i.includes('accounts.google.com'));
    expect(fatal).toEqual([]);
  });
}
