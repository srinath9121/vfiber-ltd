// src/site.js
// Shared B2B platform runtime: config sync, counters, gallery, form, mobile drawer, WebGL pause.

import { SITE_CONFIG } from './config/siteMetrics.js';
import { GALLERY_STAGES } from './config/galleryManifest.js';

// ── 0. HERO 4-SLIDE SHOWCASE CONTROLS ──
function initHeroShowcase() {
  const slides = document.querySelectorAll('.vf-hero-slide');
  const buttons = document.querySelectorAll('.vf-hero-indicator-btn');
  if (!slides.length || !buttons.length) return;

  function setSlide(idx) {
    slides.forEach((s, i) => s.classList.toggle('active', i === idx));
    buttons.forEach((b, i) => b.classList.toggle('active', i === idx));
  }

  buttons.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      setSlide(idx);
    });
  });
}

// ── 1. SYNC SITE_CONFIG TO DOM ──
function syncConfig() {
  // Utility bar
  const utilPhone = document.getElementById('vf-util-phone');
  if (utilPhone) {
    utilPhone.textContent = SITE_CONFIG.contact.phoneDisplay;
    utilPhone.href = SITE_CONFIG.contact.phoneHref;
  }

  // Contact section phone
  const contactPhone = document.getElementById('vf-contact-phone');
  if (contactPhone) {
    contactPhone.textContent = SITE_CONFIG.contact.phoneDisplay;
    contactPhone.href = SITE_CONFIG.contact.phoneHref;
  }

  // Footer phone
  const footerPhone = document.getElementById('vf-footer-phone');
  if (footerPhone) {
    footerPhone.textContent = SITE_CONFIG.contact.phoneDisplay;
    footerPhone.href = SITE_CONFIG.contact.phoneHref;
  }

  // Set counter initial values & data-targets from SITE_CONFIG (never frozen at 0)
  const structEl = document.getElementById('vf-metric-structures');
  if (structEl) {
    structEl.setAttribute('data-target', String(SITE_CONFIG.metrics.structuresAnalyzed.value));
    structEl.textContent = Number(SITE_CONFIG.metrics.structuresAnalyzed.value).toLocaleString() + SITE_CONFIG.metrics.structuresAnalyzed.suffix;
  }

  const polesEl = document.getElementById('vf-metric-poles');
  if (polesEl) {
    polesEl.setAttribute('data-target', String(SITE_CONFIG.metrics.polesManaged.value));
    polesEl.textContent = Number(SITE_CONFIG.metrics.polesManaged.value).toLocaleString() + SITE_CONFIG.metrics.polesManaged.suffix;
  }

  const expEl = document.getElementById('vf-metric-experience');
  if (expEl) {
    expEl.setAttribute('data-target', String(SITE_CONFIG.metrics.yearsOfExperience.value));
    expEl.textContent = SITE_CONFIG.metrics.yearsOfExperience.value + SITE_CONFIG.metrics.yearsOfExperience.suffix;
  }

  const fpEl = document.getElementById('vf-metric-footprint');
  if (fpEl) {
    fpEl.setAttribute('data-target', String(SITE_CONFIG.metrics.usStatesCovered.value));
    fpEl.textContent = SITE_CONFIG.metrics.usStatesCovered.value + SITE_CONFIG.metrics.usStatesCovered.suffix;
  }
}

// ── 2. METRICS COUNTER ANIMATION ──
function initCounters() {
  const counterEls = [
    { el: document.getElementById('vf-metric-structures'), val: SITE_CONFIG.metrics.structuresAnalyzed.value, suffix: SITE_CONFIG.metrics.structuresAnalyzed.suffix },
    { el: document.getElementById('vf-metric-poles'), val: SITE_CONFIG.metrics.polesManaged.value, suffix: SITE_CONFIG.metrics.polesManaged.suffix },
    { el: document.getElementById('vf-metric-experience'), val: SITE_CONFIG.metrics.yearsOfExperience.value, suffix: SITE_CONFIG.metrics.yearsOfExperience.suffix },
    { el: document.getElementById('vf-metric-footprint'), val: SITE_CONFIG.metrics.usStatesCovered.value, suffix: SITE_CONFIG.metrics.usStatesCovered.suffix }
  ].filter(c => c.el);

  let animated = false;
  const metricsSection = document.getElementById('metrics');
  if (!metricsSection) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        counterEls.forEach(({ el, val, suffix }) => {
          let start = 0;
          const duration = 1600;
          const stepTime = 20;
          const steps = duration / stepTime;
          const increment = val / steps;
          const timer = setInterval(() => {
            start += increment;
            if (start >= val) {
              start = val;
              clearInterval(timer);
            }
            el.textContent = Math.floor(start).toLocaleString() + suffix;
          }, stepTime);
        });
      }
    });
  }, { threshold: 0.2 });

  observer.observe(metricsSection);
}

// ── 3. GALLERY & LIGHTBOX ──
function initGallery() {
  const grid = document.getElementById('vf-gallery-grid');
  const tabs = document.querySelectorAll('.vf-gallery-tab');
  const lightbox = document.getElementById('vf-lightbox');
  const lbImg = document.getElementById('vf-lightbox-img');
  const lbCap = document.getElementById('vf-lightbox-caption');
  const lbClose = document.getElementById('vf-lightbox-close');

  if (!grid) return;

  function renderStage(stageId) {
    grid.innerHTML = '';
    const stages = stageId === 'all'
      ? GALLERY_STAGES
      : GALLERY_STAGES.filter(s => s.id === stageId);

    stages.forEach(stage => {
      stage.images.forEach(imgUrl => {
        const item = document.createElement('div');
        item.className = 'vf-gallery-item';
        item.setAttribute('data-testid', 'gallery-item');
        item.setAttribute('data-stage', stage.id);
        item.innerHTML = `
          <img src="${imgUrl}" alt="${stage.label}" loading="lazy" />
          <div class="vf-gallery-item-overlay">
            <span class="vf-gallery-item-caption">${stage.label}</span>
          </div>
        `;
        item.addEventListener('click', () => {
          if (lightbox && lbImg && lbCap) {
            lbImg.src = imgUrl;
            lbImg.alt = stage.label;
            lbCap.textContent = stage.caption;
            lightbox.classList.add('open');
          }
        });
        grid.appendChild(item);
      });
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderStage(tab.getAttribute('data-stage'));
    });
  });

  if (lbClose && lightbox) {
    lbClose.addEventListener('click', () => lightbox.classList.remove('open'));
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) lightbox.classList.remove('open');
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') lightbox.classList.remove('open');
    });
  }

  // Initial render — all stages
  renderStage('all');
}

// ── 4. MOBILE DRAWER ──
function initMobileDrawer() {
  const toggle = document.getElementById('vf-hamburger');
  const drawer = document.getElementById('vf-mobile-drawer');
  const close = document.getElementById('vf-drawer-close');

  if (!toggle || !drawer) return;

  const openDrawer = () => {
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const closeDrawer = () => {
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', openDrawer);
  if (close) close.addEventListener('click', closeDrawer);

  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });
}

// ── 5. RFQ FORM VALIDATION ──
function initRfqForm() {
  const form = document.getElementById('vf-rfq-form-el');
  const errEl = document.getElementById('vf-form-error');
  const succEl = document.getElementById('vf-form-success');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Honeypot check
    const honeypot = form.querySelector('[name="_gotcha"]');
    if (honeypot && honeypot.value) return;

    const name = form.querySelector('[name="name"]')?.value.trim();
    const email = form.querySelector('[name="email"]')?.value.trim();
    const company = form.querySelector('[name="company"]')?.value.trim();
    const service = form.querySelector('[name="service"]')?.value;
    const message = form.querySelector('[name="message"]')?.value.trim();

    if (!name || !email || !company || !service || !message) {
      if (errEl) {
        errEl.style.display = 'block';
        errEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      return;
    }

    if (errEl) errEl.style.display = 'none';
    if (succEl) succEl.style.display = 'block';
    form.reset();
  });
}

// ── 6. WEBGL CANVAS PAUSE WHEN OFF-SCREEN (EC-04) ──
function initWebGLObserver() {
  const heroContainer = document.getElementById('hero-webgl-container');
  if (!heroContainer) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Expose to window so main.js render loop can read it
      window.__VF_HERO_VISIBLE__ = entry.isIntersecting;
    });
  }, { threshold: 0.05 });

  observer.observe(heroContainer);

  document.addEventListener('visibilitychange', () => {
    window.__VF_TAB_VISIBLE__ = !document.hidden;
  });
}

// ── INIT ALL ──
document.addEventListener('DOMContentLoaded', () => {
  initHeroShowcase();
  syncConfig();
  initCounters();
  initGallery();
  initMobileDrawer();
  initRfqForm();
  initWebGLObserver();
});

