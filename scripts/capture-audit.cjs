// scripts/capture-audit.cjs
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  const outDir = path.join(process.cwd(), 'artifacts', 'screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 1. Full page screenshot
  await page.screenshot({ path: path.join(outDir, '00_full_page.png'), fullPage: true });
  console.log('Saved 00_full_page.png');

  // 2. Navbar & Hero
  const navbar = await page.$('#vf-navbar');
  if (navbar) await navbar.screenshot({ path: path.join(outDir, '01_navbar.png') });

  const hero = await page.$('#hero-webgl-container');
  if (hero) await hero.screenshot({ path: path.join(outDir, '02_hero.png') });

  // 3. Section 2: About
  const about = await page.$('#about');
  if (about) await about.screenshot({ path: path.join(outDir, '03_about.png') });

  // 4. Section 3: Services
  const services = await page.$('#services');
  if (services) await services.screenshot({ path: path.join(outDir, '04_services.png') });

  // 5. Section 4: Metrics
  const metrics = await page.$('#metrics');
  if (metrics) await metrics.screenshot({ path: path.join(outDir, '05_metrics.png') });

  // 6. Section 5: Technology
  const tech = await page.$('#technology');
  if (tech) await tech.screenshot({ path: path.join(outDir, '06_technology.png') });

  // 7. Section 6: Testimonials
  const testimonials = await page.$('#testimonials');
  if (testimonials) await testimonials.screenshot({ path: path.join(outDir, '07_testimonials.png') });

  // 8. Section 7: Contact & Footer
  const contact = await page.$('#contact');
  if (contact) await contact.screenshot({ path: path.join(outDir, '08_contact.png') });

  const footer = await page.$('#vf-footer');
  if (footer) await footer.screenshot({ path: path.join(outDir, '09_footer.png') });

  console.log('All screenshots captured successfully in artifacts/screenshots/');
  await browser.close();
}

run().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});

