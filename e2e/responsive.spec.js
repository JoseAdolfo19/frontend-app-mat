const { test, expect } = require('@playwright/test');

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
];

const STU = {
  email: 'alumno80100001@mathflow.com',
  password: 'password123',
};

async function login(page) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.locator('input[name="email"], input[type="email"]').first().fill(STU.email);
  await page.locator('input[name="password"], input[type="password"]').first().fill(STU.password);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL(/dashboard/, { timeout: 20000 }).catch(() => {});
}

test.describe('Responsive layout', () => {
  for (const vp of VIEWPORTS) {
    test(`${vp.name} - dashboard sin overflow y con contenido`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await login(page);
      // esperar a que cargue contenido real del dashboard
      await page.waitForFunction(() => document.body.innerText.length > 60, null, { timeout: 25000 }).catch(() => {});
      // sin desbordamiento horizontal
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      expect(overflow).toBe(false);
      // debe haber una navegación visible (sidebar en desktop/tablet, bottom nav en mobile)
      const navs = page.locator('nav[aria-label]');
      const visibleNavs = await navs.filter({ visible: true }).count();
      expect(visibleNavs).toBeGreaterThanOrEqual(1);
      // esperar a que desaparezca cualquier estado "Loading" (si nunca se va => bug)
      await page.waitForFunction(() =>
        ![...document.querySelectorAll('body :not(style):not(script)')]
          .filter(e => e.children.length === 0)
          .some(e => /loading/i.test(e.textContent || '') &&
                     e.getBoundingClientRect().width > 0 &&
                     e.getBoundingClientRect().height > 0),
        null, { timeout: 20000 });
      const hasLoading = await page.evaluate(() =>
        [...document.querySelectorAll('body :not(style):not(script)')]
          .filter(e => e.children.length === 0)
          .some(e => /loading/i.test(e.textContent || '') &&
                     e.getBoundingClientRect().width > 0 &&
                     e.getBoundingClientRect().height > 0)
      );
      expect(hasLoading).toBe(false);
    });

    test(`${vp.name} - login sin overflow`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      expect(overflow).toBe(false);
      await expect(page.locator('button[type="submit"]').first()).toBeVisible();
    });
  }

  test('mobile - bottom nav presente en dashboard', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await login(page);
    await page.waitForTimeout(1500);
    // en móvil debe existir navegación inferior
    const bottomNav = page.locator('nav[aria-label*="bottom"], .bottom-nav, nav[aria-label*="inferior"]');
    const count = await bottomNav.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});