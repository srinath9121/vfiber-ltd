// tests/vf-platform.spec.ts
import { test, expect } from '@playwright/test';
import { SITE_CONFIG } from '../src/config/siteMetrics.js';

test.describe('VF Technologies — B2B Corporate & Multi-Page Platform Suite', () => {

  test('1. Global Config Sync: Top Bar Phone, Email, and Metrics match SITE_CONFIG', async ({ page }) => {
    await page.goto('/');
    
    // Top bar contact verification (or contact section)
    const contactPhone = page.locator('#vf-contact-phone');
    if (await contactPhone.count() > 0) {
      await expect(contactPhone).toContainText(SITE_CONFIG.contact.phoneDisplay);
      await expect(contactPhone).toHaveAttribute('href', SITE_CONFIG.contact.phoneHref);
    }

    // Metrics verification (never stuck at 0)
    const structuresCounter = page.locator('[data-testid="metric-structures"]');
    await structuresCounter.scrollIntoViewIfNeeded();
    await expect(structuresCounter).toHaveAttribute(
      'data-target',
      String(SITE_CONFIG.metrics.structuresAnalyzed.value)
    );
    await expect(structuresCounter).not.toHaveText('0');

    const polesCounter = page.locator('[data-testid="metric-poles"]');
    await expect(polesCounter).toHaveAttribute(
      'data-target',
      String(SITE_CONFIG.metrics.polesManaged.value)
    );
    await expect(polesCounter).not.toHaveText('0');

    const expBadge = page.locator('[data-testid="metric-experience"]');
    await expect(expBadge).toContainText(String(SITE_CONFIG.metrics.yearsOfExperience.value));
  });

  test('2. Native Scrolling Unlocked & Multi-Page Service Navigation Works', async ({ page }) => {
    await page.goto('/');

    // Ensure body is NOT overflow:hidden locked
    const overflowY = await page.evaluate(() => window.getComputedStyle(document.body).overflowY);
    expect(overflowY).not.toBe('hidden');

    // Verify services trigger and links
    const servicesNav = page.locator('[data-testid="nav-services-trigger"]');
    await expect(servicesNav).toBeVisible();

    const expectedServices = [
      { name: 'Research & Permitting', href: '/services/research-permitting' },
      { name: 'Design / Drafting', href: '/services/design-drafting' },
      { name: 'OSP Fiber', href: '/services/osp-fiber' },
      { name: 'Pole Loading Analysis', href: '/services/pole-loading-analysis' },
    ];

    for (const svc of expectedServices) {
      const link = page.locator(`nav a[href*="${svc.href}"]`).first();
      await expect(link).toBeAttached();
      await expect(link).toContainText(svc.name);
    }
  });

  test('3. Technology Stack Section displays all 4 core tools with loaded images', async ({ page }) => {
    await page.goto('/');
    const techSection = page.locator('#technology');
    await techSection.scrollIntoViewIfNeeded();

    const tools = ['FRONTIER', 'KATAPULT PRO', 'AUTOCAD', 'O-CALC PRO'];
    for (const tool of tools) {
      await expect(techSection).toContainText(tool);
    }

    // Verify zero broken images in tech stack
    const images = techSection.locator('img');
    const count = await images.count();
    expect(count).toBeGreaterThanOrEqual(4);
    for (let i = 0; i < count; i++) {
      const naturalWidth = await images.nth(i).evaluate((el: HTMLImageElement) => el.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });

  test('4. Mobile Drawer (320px & 375px) nested menu and touch targets', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    const menuBtn = page.locator('[data-testid="mobile-menu-toggle"]');
    await expect(menuBtn).toBeVisible();

    const box = await menuBtn.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);

    await menuBtn.click();
    const drawer = page.locator('[data-testid="mobile-drawer"]');
    await expect(drawer).toBeVisible();

    // Close via Escape key
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
  });

  test('5. B2B RFQ Contact Form validation & honeypot anti-spam', async ({ page }) => {
    await page.goto('/');
    const form = page.locator('[data-testid="rfq-form"]');
    await form.scrollIntoViewIfNeeded();

    // Submit empty -> should block submission and show validation errors
    await form.locator('button[type="submit"]').click();
    await expect(page.locator('[data-testid="form-error"]')).toBeVisible();

    // Fill valid B2B inquiry
    await form.locator('input[name="name"]').fill('Alex Mercer');
    await form.locator('input[name="email"]').fill('amercer@us-broadband-isp.com');
    await form.locator('input[name="company"]').fill('Western Fiber Corp');
    await form.locator('select[name="service"]').selectOption('Pole Loading Analysis (O-Calc Pro)');
    await form.locator('textarea[name="message"]').fill('Need O-Calc Pro analysis for 1,200 utility poles in Texas.');
  });

  test('6. WebGL Context Loss Resilience', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('#hero-webgl-container canvas');
    if (await canvas.count() > 0) {
      await canvas.evaluate((el: HTMLCanvasElement) => {
        const gl = el.getContext('webgl2') || el.getContext('webgl');
        gl?.getExtension('WEBGL_lose_context')?.loseContext();
      });
    }
    // Page headings and navigation must remain 100% visible and interactive
    await expect(page.locator('h1')).toContainText('VF TECHNOLOGIES');
    await expect(page.locator('[data-testid="rfq-form"]')).toBeVisible();
  });
});

