// chapter5-final.js — Final scene: tunnel exit, Earth return, GSAP stat counters, CTA
// Uses GSAP for smooth power2.out counter animation as specified

import gsap from 'gsap';
import { clamp, map } from '../utils/math.js';

// ── State ─────────────────────────────────────────────────────────────────────

let statsAnimated = false;

// ── Update (called every frame) ───────────────────────────────────────────────

export function updateChapter5(scrollFloat, camera, earthMesh, fiberMaterial, networkGroup, beamsGroup) {

  if (scrollFloat > 5.85) {
    // Earth returns (sf 5.85 → 6.00)
    if (earthMesh) {
      earthMesh.material.transparent = true;
      earthMesh.material.opacity =
        clamp(map(scrollFloat, 5.85, 6.00, 0, 1), 0, 1);
    }

    // Show network + beam groups
    if (networkGroup) networkGroup.visible = true;
    if (beamsGroup)   beamsGroup.visible   = true;

    // GSAP stat counters — trigger once
    if (scrollFloat > 5.92 && !statsAnimated) {
      statsAnimated = true;

      gsap.to({ val: 0 }, {
        val: 20000,
        duration: 2,
        ease: 'power2.out',
        onUpdate: function () {
          const el = document.getElementById('stat1');
          if (el) el.textContent = Math.floor(this.targets()[0].val).toLocaleString() + '+';
        }
      });

      gsap.to({ val: 0 }, {
        val: 50000,
        duration: 2,
        ease: 'power2.out',
        onUpdate: function () {
          const el = document.getElementById('stat2');
          if (el) el.textContent = Math.floor(this.targets()[0].val).toLocaleString() + '+';
        }
      });
    }
  }

  // Reset counters if user scrolls back
  if (scrollFloat < 5.80 && statsAnimated) {
    statsAnimated = false;
    const s1 = document.getElementById('stat1');
    const s2 = document.getElementById('stat2');
    if (s1) s1.textContent = '0';
    if (s2) s2.textContent = '0';
  }

  // Chapter 5 text overlay
  const t5 = document.getElementById('chapter5-text');
  if (t5) {
    if (scrollFloat > 5.90) {
      t5.style.opacity       = '1';
      t5.style.pointerEvents = 'all';
    } else {
      t5.style.opacity       = '0';
      t5.style.pointerEvents = 'none';
    }
  }
}
