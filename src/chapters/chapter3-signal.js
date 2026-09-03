// chapter3-signal.js — Signal particle transition: pole tip → fiber tunnel
// Position-based color lerp: red (#C41E3A) → blue (#00CFFF) across particle Z travel
// Shader Gradient skill: color transition is physical (position-based, not time-based)

import * as THREE from 'three';
import { clamp, map } from '../utils/math.js';

// ── Particle System ───────────────────────────────────────────────────────────

const particleCount = 200;
const positions = new Float32Array(particleCount * 3);
const colors    = new Float32Array(particleCount * 3);
const speeds    = new Float32Array(particleCount);
const offsets   = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
  // Start at pole tip with small random spread
  positions[i * 3]     = (Math.random() - 0.5) * 0.3; // x spread
  positions[i * 3 + 1] = 6.0;                          // pole tip Y (local to poleGroup at y=0)
  positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3; // z spread

  speeds[i]  = 0.02 + Math.random() * 0.04;
  offsets[i] = Math.random() * 10;

  // Start color: red #C41E3A (0.769, 0.118, 0.227)
  colors[i * 3]     = 0.769;
  colors[i * 3 + 1] = 0.118;
  colors[i * 3 + 2] = 0.227;
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({
  size: 0.06,
  vertexColors: true,
  transparent: true,
  opacity: 0,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  sizeAttenuation: true
});

export const signalParticles = new THREE.Points(geometry, material);

// ── Update (called every frame) ───────────────────────────────────────────────

export function updateChapter3(scrollFloat, poleGroup) {
  // Fade particles in from sf 2.8
  material.opacity = clamp(map(scrollFloat, 2.8, 3.2, 0, 1), 0, 1);

  // Fade pole OUT as particles take over (sf 2.8 → 3.2)
  if (poleGroup) {
    const poleOpacity = clamp(map(scrollFloat, 2.8, 3.2, 1, 0), 0, 1);
    poleGroup.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.transparent = true;
        child.material.opacity = poleOpacity;
      }
    });
  }

  if (scrollFloat > 2.8) {
    // Speed ramps from 1× to 4× as camera rushes into stream
    const chapterSpeed = map(scrollFloat, 3.0, 3.5, 1, 4);

    const pos = geometry.attributes.position.array;
    const col = geometry.attributes.color.array;

    for (let i = 0; i < particleCount; i++) {
      // Move forward toward camera (+Z)
      pos[i * 3 + 2] += speeds[i] * chapterSpeed;

      // Reset when too far
      if (pos[i * 3 + 2] > 8) {
        pos[i * 3]     = (Math.random() - 0.5) * 0.3;
        pos[i * 3 + 1] = 5.5 + (Math.random() - 0.5) * 0.5;
        pos[i * 3 + 2] = 0;
      }

      // Color lerp red → blue based on Z position (physical, not time-based)
      const t = clamp(pos[i * 3 + 2] / 8, 0, 1);
      col[i * 3]     = 0.769 * (1 - t) + 0.0   * t; // R: red → 0
      col[i * 3 + 1] = 0.118 * (1 - t) + 0.812 * t; // G: → fiber green-blue
      col[i * 3 + 2] = 0.227 * (1 - t) + 1.0   * t; // B: → full blue
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate    = true;
  }

  // Overlay: centered "EVERY CONNECTION STARTS HERE" (sf 3.1 → 3.6)
  const t3 = document.getElementById('chapter3-text');
  if (t3) t3.style.opacity = (scrollFloat > 3.1 && scrollFloat < 3.6) ? '1' : '0';
}
