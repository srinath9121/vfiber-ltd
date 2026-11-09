// src/site.js
// Shared B2B platform runtime: config sync, counters, gallery, form, mobile drawer, WebGL pause.

import { SITE_CONFIG } from './config/siteMetrics.js';
import { GALLERY_STAGES } from './config/galleryManifest.js';
import './config/embeddedAssets.js';

// ── 0. HERO 4-SLIDE SHOWCASE CONTROLS ──
function initHeroShowcase() {
  const slides = document.querySelectorAll('.vf-hero-slide');
  const buttons = document.querySelectorAll('.vf-hero-indicator-btn');
  const videos = document.querySelectorAll('.vf-hero-video-item');
  const prevBtn = document.getElementById('vf-hero-prev-btn');
  const nextBtn = document.getElementById('vf-hero-next-btn');
  const currLabel = document.getElementById('vf-arrow-curr');
  if (!slides.length) return;

  let currentIdx = 0;
  const slideTitles = ['Overview', 'OSP Fiber', 'O-Calc Pro', 'Workflow'];

  function updateStatus(idx) {
    currentIdx = idx;
    if (currLabel) {
      currLabel.textContent = String(idx + 1).padStart(2, '0');
    }
    if (prevBtn) {
      const prevIdx = (idx - 1 + slides.length) % slides.length;
      prevBtn.setAttribute('title', `Previous: 0${prevIdx + 1} ${slideTitles[prevIdx]}`);
      prevBtn.setAttribute('aria-label', `Previous Slide: ${slideTitles[prevIdx]}`);
    }
    if (nextBtn) {
      const nextIdx = (idx + 1) % slides.length;
      nextBtn.setAttribute('title', `Next: 0${nextIdx + 1} ${slideTitles[nextIdx]}`);
      nextBtn.setAttribute('aria-label', `Next Slide: ${slideTitles[nextIdx]}`);
    }
  }

  function setSlide(idx) {
    const targetIdx = (idx + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('active', i === targetIdx));
    buttons.forEach((b, i) => b.classList.toggle('active', i === targetIdx));

    // Synchronize video background with active slide
    if (videos.length) {
      videos.forEach((vid, i) => {
        const isCurrent = (i === targetIdx);
        vid.classList.toggle('active', isCurrent);
        if (isCurrent) {
          if (vid.paused) {
            vid.play().catch(() => {});
          }
        } else {
          // Pause background videos when inactive to optimize GPU and CPU performance
          setTimeout(() => {
            if (!vid.classList.contains('active')) {
              vid.pause();
            }
          }, 600);
        }
      });
    }

    updateStatus(targetIdx);
  }

  buttons.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      setSlide(idx);
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setSlide(currentIdx - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setSlide(currentIdx + 1);
    });
  }

  // Keyboard navigation when user presses Arrow keys while hero is in view
  window.addEventListener('keydown', (e) => {
    const hero = document.getElementById('hero-webgl-container');
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    if (rect.bottom > 100 && rect.top < window.innerHeight - 100) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        setSlide(currentIdx + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        setSlide(currentIdx - 1);
      }
    }
  });

  updateStatus(0);
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

// ── 5. RFQ FORM VALIDATION & SECURITY SANITIZATION ──
function initRfqForm() {
  const form = document.getElementById('vf-rfq-form-el');
  const errEl = document.getElementById('vf-form-error');
  const succEl = document.getElementById('vf-form-success');

  if (!form) return;

  // Strict Sanitization function to prevent XSS injection
  function sanitizeInput(str) {
    if (!str || typeof str !== 'string') return '';
    return str
      .replace(/[<>]/g, '') // Strip angle brackets
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }

  // Rate Limiting guard (max 3 submissions per 2 minutes)
  const SUBMIT_KEY = 'vf_rfq_submits';
  function isRateLimited() {
    try {
      const now = Date.now();
      const raw = sessionStorage.getItem(SUBMIT_KEY);
      const history = raw ? JSON.parse(raw) : [];
      const valid = history.filter(ts => (now - ts) < 120000);
      if (valid.length >= 3) {
        return true;
      }
      valid.push(now);
      sessionStorage.setItem(SUBMIT_KEY, JSON.stringify(valid));
      return false;
    } catch {
      return false;
    }
  }

  // Form submit timing protection against bots (human usually takes > 3s)
  const formMountTime = Date.now();

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // 1. Anti-Bot Honeypot check
    const honeypot = form.querySelector('[name="_gotcha"]');
    if (honeypot && honeypot.value.trim() !== '') {
      console.warn('Bot submission blocked via honeypot');
      return;
    }

    // 2. Speed bot trap (< 1.5 seconds from page render)
    if (Date.now() - formMountTime < 1500) {
      console.warn('Automated fast-submission detected');
      return;
    }

    // 3. Rate limiting check
    if (isRateLimited()) {
      if (errEl) {
        errEl.textContent = 'Too many requests. Please wait a minute before submitting again.';
        errEl.style.display = 'block';
        errEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      return;
    }

    // 4. Retrieve & sanitize inputs
    const name = sanitizeInput(form.querySelector('[name="name"]')?.value);
    const email = sanitizeInput(form.querySelector('[name="email"]')?.value);
    const company = sanitizeInput(form.querySelector('[name="company"]')?.value);
    const phone = sanitizeInput(form.querySelector('[name="phone"]')?.value);
    const service = sanitizeInput(form.querySelector('[name="service"]')?.value);
    const volume = sanitizeInput(form.querySelector('[name="volume"]')?.value);
    const message = sanitizeInput(form.querySelector('[name="message"]')?.value);

    // 5. Strict Email Regex validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

    if (!name || !email || !company || !service || !message) {
      if (errEl) {
        errEl.textContent = 'Please fill in all required fields.';
        errEl.style.display = 'block';
        errEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      return;
    }

    if (!emailRegex.test(email)) {
      if (errEl) {
        errEl.textContent = 'Please enter a valid work email address.';
        errEl.style.display = 'block';
        errEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      return;
    }

    // Safe execution
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

// ── 7. MAGNETIC BUTTON INTERACTION ENGINE ──
// Gives interactive controls a natural magnetic pull towards the cursor,
// with elastic physics relaxation and subtle tilt feedback.
function initMagneticButtons() {
  // Select buttons and interactive pills across the platform
  const magneticSelectors = [
    '.vf-nav-cta',
    '.vf-nav-link',
    '.vf-hero-btn-primary',
    '.vf-hero-btn-secondary',
    '.vf-hero-indicator-btn',
    '.vf-submit',
    '.vf-svc-cta'
  ];

  const targets = document.querySelectorAll(magneticSelectors.join(', '));
  if (!targets.length) return;

  // Check if touch device - keep magnetic interaction active for pointer mouse devices
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (isTouch) return;

  targets.forEach((el) => {
    // Add magnetic class for styling hook
    el.classList.add('vf-magnetic');

    let isHovered = false;
    let boundRect = null;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = null;

    // Pull intensity factor based on element size
    const pullFactor = el.classList.contains('.vf-submit') ? 0.18 : 0.28;

    function renderSpring() {
      if (!isHovered && Math.abs(currentX) < 0.1 && Math.abs(currentY) < 0.1) {
        currentX = 0;
        currentY = 0;
        el.style.transform = '';
        cancelAnimationFrame(rafId);
        rafId = null;
        return;
      }

      // Smooth lerp easing for physics weight
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;

      const tiltRotX = -(currentY * 0.25).toFixed(2);
      const tiltRotY = (currentX * 0.25).toFixed(2);

      el.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0px) rotateX(${tiltRotX}deg) rotateY(${tiltRotY}deg) scale3d(1.025, 1.025, 1)`;

      rafId = requestAnimationFrame(renderSpring);
    }

    el.addEventListener('mouseenter', () => {
      isHovered = true;
      boundRect = el.getBoundingClientRect();
      if (!rafId) {
        rafId = requestAnimationFrame(renderSpring);
      }
    });

    el.addEventListener('mousemove', (e) => {
      if (!boundRect) boundRect = el.getBoundingClientRect();
      const centerX = boundRect.left + boundRect.width / 2;
      const centerY = boundRect.top + boundRect.height / 2;

      // Distance from center
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      targetX = deltaX * pullFactor;
      targetY = deltaY * pullFactor;

      if (!rafId) {
        rafId = requestAnimationFrame(renderSpring);
      }
    });

    el.addEventListener('mouseleave', () => {
      isHovered = false;
      boundRect = null;
      targetX = 0;
      targetY = 0;
    });

    // Handle scroll or resize refreshing bounding box
    window.addEventListener('scroll', () => {
      if (isHovered) boundRect = el.getBoundingClientRect();
    }, { passive: true });
  });
}

// ── 8. HYDRATE ASSETS GUARANTEED ──
function hydrateAssets() {
  if (typeof window === 'undefined') return;

  if (window.__PARTNER_IMGS__) {
    const p = window.__PARTNER_IMGS__;
    const fImg = document.querySelector('.vf-tech-card:nth-child(1) .vf-tech-img-wrap img');
    if (fImg && p.frontier) fImg.src = p.frontier;

    const kImg = document.querySelector('.vf-tech-card:nth-child(2) .vf-tech-img-wrap img');
    if (kImg && p.katapult) kImg.src = p.katapult;

    const aImg = document.querySelector('.vf-tech-card:nth-child(3) .vf-tech-img-wrap img');
    if (aImg && p.acad) aImg.src = p.acad;

    const oImg = document.querySelector('.vf-tech-card:nth-child(4) .vf-tech-img-wrap img');
    if (oImg && p.ocalc) oImg.src = p.ocalc;
  }

  if (window.__TESTIMONIAL_AVATARS__) {
    const a = window.__TESTIMONIAL_AVATARS__;
    const p1 = document.querySelector('.vf-testimonials-grid .vf-testimonial-card:nth-child(1) .vf-testimonial-avatar');
    if (p1 && a.p1) p1.src = a.p1;

    const p2 = document.querySelector('.vf-testimonials-grid .vf-testimonial-card:nth-child(2) .vf-testimonial-avatar');
    if (p2 && a.p2) p2.src = a.p2;

    const p3 = document.querySelector('.vf-testimonials-grid .vf-testimonial-card:nth-child(3) .vf-testimonial-avatar');
    if (p3 && a.p3) p3.src = a.p3;
  }
}

// ── INIT ALL ──
document.addEventListener('DOMContentLoaded', () => {
  hydrateAssets();
  initHeroShowcase();
  syncConfig();
  initCounters();
  initGallery();
  initMobileDrawer();
  initRfqForm();
  initWebGLObserver();
  initMagneticButtons();
});

