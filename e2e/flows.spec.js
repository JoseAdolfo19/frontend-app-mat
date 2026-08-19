const { test, expect } = require('@playwright/test');

const USERS = {
  admin: { email: 'admin@mathflow.com', pass: 'admin123456' },
  teacher: { email: 'profesor1@mathflow.com', pass: 'password123' },
  student: { email: 'alumno80100001@mathflow.com', pass: 'password123' },
  coordinador: { email: 'coordinador@mathflow.com', pass: 'password123' },
};

async function login(page, role) {
  const u = USERS[role];
  await page.goto('/login');
  await page.fill('#login-email', u.email);
  await page.fill('#login-password', u.pass);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard)/, { timeout: 25000 });
}

test.describe('F-012 Gestión de usuarios (Admin)', () => {
  test('Admin ve listado de usuarios', async ({ page }) => {
    await login(page, 'admin');
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/admin/users');
  });
});

test.describe('F-054/F-059 Reportes', () => {
  test('Docente carga reporte de rendimiento', async ({ page }) => {
    await login(page, 'teacher');
    await page.goto('/reports');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/reports');
  });
});

test.describe('F-021/F-022 Salones y cursos (Coordinador)', () => {
  test('Coordinador ve salones', async ({ page }) => {
    await login(page, 'coordinador');
    await page.goto('/coordinator/salones');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('salones');
  });
});

test.describe('F-029 Lecciones', () => {
  test('Estudiante ve lista de lecciones', async ({ page }) => {
    await login(page, 'student');
    await page.goto('/lessons');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/lessons');
  });
});

test.describe('F-036/F-037 Evaluaciones', () => {
  test('Estudiante ve lista de evaluaciones', async ({ page }) => {
    await login(page, 'student');
    await page.goto('/evaluations');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/evaluations');
  });
});

test.describe('F-042/F-044 Exámenes', () => {
  test('Estudiante ve lista de exámenes', async ({ page }) => {
    await login(page, 'student');
    await page.goto('/exams');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/exams');
  });
});

test.describe('F-067 Dashboard estudiante', () => {
  test('Estudiante ve su dashboard', async ({ page }) => {
    await login(page, 'student');
    expect(page.url()).toContain('/dashboard');
  });
});

test.describe('F-017 Backup (Admin)', () => {
  test('Admin ve configuración con backup', async ({ page }) => {
    await login(page, 'admin');
    await page.goto('/admin/config');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/admin/config');
  });
});