// scroll.js — virtual scroll engine
// Exports scrollFloat (read-only), initScroll(), updateScroll()

export let scrollFloat = 0;
let targetFloat = 0;
const MAX_SCROLL = 5.0;

let touchStartY = 0;
let isPinching = false;

export function initScroll() {
  // Mouse wheel
  window.addEventListener('wheel', (e) => {
    targetFloat += e.deltaY * 0.001;
    targetFloat = Math.max(0, Math.min(MAX_SCROLL, targetFloat));
  }, { passive: true });

  // Touch — single finger drag
  window.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) { isPinching = true; return; }
    isPinching = false;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1 || isPinching) { isPinching = true; return; }
    const delta = touchStartY - e.touches[0].clientY;
    targetFloat += delta * 0.003;
    targetFloat = Math.max(0, Math.min(MAX_SCROLL, targetFloat));
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) isPinching = false;
  }, { passive: true });
}

// Called every frame inside animate()
export function updateScroll() {
  scrollFloat += (targetFloat - scrollFloat) * 0.05;
}
