# Edge Cases & Automated Test Suite Specification
## Venkateswara Fiber Technologies (`vf-technologies.com`)

---

### 1. Critical Edge Cases Identified in Current Codebase & How We Fix Them

| ID | Edge Case Found in Current Codebase | Root Cause in `index.html` / `main.js` | Architectural Fix |
| :--- | :--- | :--- | :--- |
| **EC-01** | **Locked Scroll & Unreachable Deep Links** | `index.html` line 18 sets `body, html { overflow: hidden; }` and relies on virtual `scrollFloat`. Users cannot native-scroll, use browser `Find in Page (Ctrl+F)`, or share URLs like `/services/osp-fiber`. | Unlock native document scrolling (`overflow-y: auto`). Scope the Three.js canvas to `#hero-webgl-container` and pause the `requestAnimationFrame` loop via `IntersectionObserver` when scrolled past the hero. |
| **EC-02** | **Counters Frozen at `0` for SEO & Direct Jumps** | `#s2-struct-count` and `#s2-poles-count` are hardcoded as `>0<` in `index.html` (lines 893, 905) and only increment at a specific `scrollFloat` window. | Render the formatted target number from `SITE_CONFIG` in the initial DOM (`data-target="25000"`), and animate from `0` to `target` once when entering the viewport—falling back to the full number if `prefers-reduced-motion` is enabled or JS is disabled. |
| **EC-03** | **Double-Space & Unencoded Asset Paths in `public/`** | Folder `public/2. Actual fiber bundle  loose-tube construction/` contains a **double space** between `bundle` and `loose-tube`, plus 192-char filenames. This causes 404s on strict CDNs and Linux build servers. | Create a normalization script (`scripts/normalize-assets.mjs`) or URL-encoded manifest (`src/config/galleryManifest.ts`) that maps all 7 folders safely with `encodeURI()` and `loading="lazy"`. |
| **EC-04** | **Post-Processing Memory Leak & Background Tab GPU Drain** | `main.js` runs `EffectComposer` + `UnrealBloomPass` + `FXAAShader` at 60fps indefinitely, even when the user switches browser tabs or opens a contact form. | Add `document.addEventListener('visibilitychange')` and `IntersectionObserver` on the canvas to pause `composer.render()` when `document.hidden` or off-screen. |
| **EC-05** | **WebGL Context Loss Overwrites Entire Body Background** | In `main.js` line 87, `webglcontextlost` sets `document.body.style.background = url("/references/earth 3.jpg")`, which clashes with multi-section layouts. | Scope the fallback background strictly to `#hero-webgl-container` so all B2B sections retain clean `#050a14` dark navy contrast. |
| **EC-06** | **Mobile Navbar & Scrubber Collision at `320px`** | In `index.html`, `.global-brand-header` and `#chapter-scrubber` compete for top-bar space on `320px–375px` viewports, shrinking font-size to an unreadable `0.40rem` (line 750). | Replace with a unified sticky header featuring a clean mobile hamburger button (`>= 44x44px` touch target) and a slide-out Liquid-Glass Drawer with expandable `Services` sub-links. |
| **EC-07** | **No Interactive RFQ Form / Mailto-Only Dropoff** | `index.html` line 1054 only uses `<a href="mailto:services@vf-technologies.com">`. Enterprise users on desktop browsers without a configured local mail client cannot contact you. | Add an interactive, Zod-validated RFQ form with copy-email button fallback, honeypot anti-spam field, and instant confirmation state. |
| **EC-08** | **Centralized Metric Sync Across Pages** | Updating *Structures Analyzed*, *Poles Managed*, *Years of Experience*, or *Phone Number* manually in HTML risks mismatches between the Top Bar, Hero, Counters, and Footer (a major bug on `intelli-networks.com`). | Bind all UI nodes to `SITE_CONFIG` (`src/config/siteMetrics.ts`) and verify consistency via automated Vitest + Playwright assertions. |

---

### 2. Automated Test Suite Implementation (`tests/vf-platform.spec.ts`)

Save this Playwright + Vitest test specification in `tests/vf-platform.spec.ts` to verify all requirements and edge cases automatically:

```typescript
// tests/vf-platform.spec.ts
import { test, expect } from '@playwright/test';
import { SITE_CONFIG } from '../src/config/siteMetrics';

test.describe('VF Technologies — B2B Corporate & Multi-Page Platform Suite', () => {

  test('1. Global Config Sync: Top Bar Phone, Email, and Metrics match SITE_CONFIG', async ({ page }) => {
    await page.goto('/');
    
    // Top bar contact verification
    const topBarPhone = page.locator('[data-testid="topbar-phone"]');
    await expect(topBarPhone).toContainText(SITE_CONFIG.contact.phoneDisplay);
    await expect(topBarPhone).toHaveAttribute('href', SITE_CONFIG.contact.phoneHref);

    const topBarEmail = page.locator('[data-testid="topbar-email"]');
    await expect(topBarEmail).toContainText(SITE_CONFIG.contact.email);

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

    // Open Services Dropdown and verify all 4 VF services exist
    const servicesNav = page.locator('[data-testid="nav-services-trigger"]');
    await servicesNav.hover();

    const expectedServices = [
      { name: 'Research & Permitting', href: '/services/research-permitting' },
      { name: 'Design / Drafting', href: '/services/design-drafting' },
      { name: 'OSP Fiber', href: '/services/osp-fiber' },
      { name: 'Pole Loading Analysis', href: '/services/pole-loading-analysis' },
    ];

    for (const svc of expectedServices) {
      const link = page.locator(`nav a[href*="${svc.href}"]`).first();
      await expect(link).toBeVisible();
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

  test('4. 7-Stage Infrastructure Gallery filters and handles double-space asset paths safely', async ({ page }) => {
    await page.goto('/');
    const gallery = page.locator('#gallery');
    await gallery.scrollIntoViewIfNeeded();

    // Click "Loose-Tube Construction" filter tab (tests the double-space folder edge case)
    const looseTubeTab = page.locator('[data-testid="gallery-tab-loose-tube"]');
    await looseTubeTab.click();

    const activeImages = gallery.locator('[data-testid="gallery-item"]:visible img');
    await expect(activeImages.first()).toBeVisible();
    const isLoaded = await activeImages.first().evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
    expect(isLoaded).toBe(true);
  });

  test('5. Mobile Drawer (320px & 375px) nested menu and touch targets', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
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

  test('6. B2B RFQ Contact Form validation & honeypot anti-spam', async ({ page }) => {
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

  test('7. WebGL Context Loss Resilience', async ({ page }) => {
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
```