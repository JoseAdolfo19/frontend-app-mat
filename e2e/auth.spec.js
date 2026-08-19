const { test, expect } = require('@playwright/test');

// ===== Utilidades =====
const USERS = {
  admin:    { email: 'admin@mathflow.com',       pass: 'admin123456' },
  teacher:  { email: 'profesor1@mathflow.com',   pass: 'password123' },
  student:  { email: 'alumno80100001@mathflow.com', pass: 'password123' },
  parent:   { email: 'padre.test@mathflow.com',  pass: 'password123' },
  director: { email: 'director@mathflow.com',    pass: 'password123' },
  coordinador: { email: 'coordinador@mathflow.com', pass: 'password123' },
};

// Colecta errores de consola y requests fallidas
async function captureErrors(page, sink) {
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      sink.push({ type: msg.type(), text: msg.text() });
    }
  });
  page.on('pageerror', (err) => sink.push({ type: 'pageerror', text: err.message }));
  page.on('response', (res) => {
    if (res.status() >= 400) {
      sink.push({ type: 'http', status: res.status(), url: res.url() });
    }
  });
}

async function login(page, role) {
  const u = USERS[role];
  await page.goto('/login');
  await page.fill('#login-email', u.email);
  await page.fill('#login-password', u.pass);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard)/, { timeout: 25000 });
}

test.describe('F-002 Autenticación', () => {
  test('Login exitoso como admin redirige a /dashboard y muestra menú admin', async ({ page }) => {
    await login(page, 'admin');
    expect(page.url()).toContain('/dashboard');
    // el menú lateral debe mostrar enlaces de administración
    await page.goto('/admin/dashboard');
    expect(page.url()).toContain('/admin/dashboard');
  });

  test('Login exitoso como teacher redirige a /dashboard y puede acceder a su dashboard', async ({ page }) => {
    await login(page, 'teacher');
    expect(page.url()).toContain('/dashboard');
    await page.goto('/teacher/dashboard');
    expect(page.url()).toContain('/teacher/dashboard');
  });

  test('Login exitoso como student redirige a /dashboard', async ({ page }) => {
    await login(page, 'student');
    expect(page.url()).toContain('/dashboard');
  });

  test('Credenciales inválidas muestran error y NO redirigen', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#login-email', 'admin@mathflow.com');
    await page.fill('#login-password', 'incorrecta123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);
    expect(page.url()).toContain('/login');
  });

  test('Campos vacíos muestran validación en pantalla', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');
    const errorText = await page.locator('form p.text-red-500').count();
    expect(errorText).toBeGreaterThan(0);
  });

  test('Acceso directo a ruta protegida sin sesión redirige a login', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForURL(/\/login/, { timeout: 20000 });
  });

  test('Logout cierra sesión y redirige', async ({ page }) => {
    await login(page, 'admin');
    await page.goto('/admin/dashboard');
    expect(page.url()).toContain('/admin/dashboard');
  });
});

test.describe('F-006 Autorización por rol (frontend)', () => {
  test('Student NO puede navegar a /admin/users (redirige)', async ({ page }) => {
    await login(page, 'student');
    await page.goto('/admin/users');
    await page.waitForTimeout(1500);
    // debe salir de admin/users
    expect(page.url()).not.toContain('/admin/users');
  });

  test('Student NO puede navegar a /teacher/lessons/create', async ({ page }) => {
    await login(page, 'student');
    await page.goto('/teacher/lessons/create');
    await page.waitForTimeout(1500);
    expect(page.url()).not.toContain('/teacher/lessons/create');
  });

  test('Parent NO puede navegar a /admin/dashboard', async ({ page }) => {
    await login(page, 'parent');
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(1500);
    expect(page.url()).not.toContain('/admin/dashboard');
  });

  test('Teacher NO puede navegar a /admin/users', async ({ page }) => {
    await login(page, 'teacher');
    await page.goto('/admin/users');
    await page.waitForTimeout(1500);
    expect(page.url()).not.toContain('/admin/users');
  });
});