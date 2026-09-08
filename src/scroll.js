// scroll.js — virtual scroll engine
// Source of truth for story progress: scrollFloat (0 to MAX_SCROLL) and normalized storyProgress (0 to 1)

export const MAX_SCROLL = 6.0;
export let scrollFloat = 0;
export let storyProgress = 0;
export let isScrollLocked = false;

let targetFloat = 0;
let touchStartY = 0;
let isPinching = false;

export function setTargetScroll(val) {
  targetFloat = Math.max(0, Math.min(MAX_SCROLL, val));
}

if (typeof window !== 'undefined') {
  window.setTargetScroll = setTargetScroll;
  window.setScrollImmediate = (val) => {
    targetFloat = scrollFloat = Math.max(0, Math.min(MAX_SCROLL, val));
    storyProgress = scrollFloat / MAX_SCROLL;
  };
  window.getScrollFloat = () => scrollFloat;

  const readHashScroll = () => {
    const match = window.location.hash.match(/sf=([\d.]+)/);
    if (match) {
      const val = parseFloat(match[1]);
      if (!isNaN(val)) {
        isScrollLocked = false;
        window.setScrollImmediate(val);
      }
    }
  };
  window.addEventListener('hashchange', readHashScroll);
  readHashScroll();
}

export function setScrollLocked(locked) {
  isScrollLocked = locked;
  if (locked) {
    targetFloat = 0;
    scrollFloat = 0;
    storyProgress = 0;
  }
}

if (typeof window !== 'undefined') {
  window.setScrollLocked = setScrollLocked;
}

export function initScroll() {
  // Mouse wheel
  window.addEventListener('wheel', (e) => {
    if (isScrollLocked) return;
    targetFloat += e.deltaY * 0.001;
    targetFloat = Math.max(0, Math.min(MAX_SCROLL, targetFloat));
  }, { passive: true });

  // Keyboard navigation for accessibility and smooth testing
  window.addEventListener('keydown', (e) => {
    if (isScrollLocked) return;
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault();
      targetFloat = Math.min(MAX_SCROLL, targetFloat + (e.key === 'PageDown' ? 0.6 : 0.2));
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      targetFloat = Math.max(0, targetFloat - (e.key === 'PageUp' ? 0.6 : 0.2));
    } else if (e.key === 'Home') {
      e.preventDefault();
      targetFloat = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      targetFloat = MAX_SCROLL;
    }
  });

  // Touch — single finger drag
  window.addEventListener('touchstart', (e) => {
    if (isScrollLocked) return;
    if (e.touches.length > 1) { isPinching = true; return; }
    isPinching = false;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (isScrollLocked) return;
    if (e.touches.length > 1 || isPinching) { isPinching = true; return; }
    const dy = touchStartY - e.touches[0].clientY;
    touchStartY = e.touches[0].clientY;

    // Desktop wheel: 0.001 per pixel. Touch on mobile needs ~0.003 (3× more sensitive)
    // because finger swipe distance per "chapter" is shorter than a full scroll wheel
    const touchSensitivity = window.innerWidth < 768 ? 0.003 : 0.001;
    targetFloat += dy * touchSensitivity;
    targetFloat = Math.max(0, Math.min(MAX_SCROLL, targetFloat));
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    if (isScrollLocked) return;
    if (e.touches.length < 2) isPinching = false;
  }, { passive: true });
}

export let scrollVelocity = 0;
export let scrollDirection = 0; // +1 = forward, -1 = reverse, 0 = stationary

let prevFloat = 0;

// Called every frame inside animate()
export function updateScroll() {
  prevFloat = scrollFloat;
  scrollFloat += (targetFloat - scrollFloat) * 0.06;
  // Keep clamped between 0 and MAX_SCROLL
  if (scrollFloat < 0.0001) scrollFloat = 0;
  if (scrollFloat > MAX_SCROLL - 0.0001) scrollFloat = MAX_SCROLL;
  storyProgress = scrollFloat / MAX_SCROLL;

  scrollVelocity = scrollFloat - prevFloat;
  if (Math.abs(scrollVelocity) > 0.00001) {
    scrollDirection = scrollVelocity > 0 ? 1 : -1;
  } else {
    scrollDirection = 0;
  }
}

