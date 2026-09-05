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

const isHeroArr = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
  if (i === 0) {
    // Hero Photon Leader: strictly aligned at center axis
    positions[0]     = 0.40;
    positions[1]     = 10.42;
    positions[2]     = -0.60;
    speeds[0]        = 0.045;
    isHeroArr[0]     = 1.0;
  } else {
    // Supporting optical cladding mode dispersion
    positions[i * 3]     = 0.40 + (Math.random() - 0.5) * 0.28;
    positions[i * 3 + 1] = 10.42 + (Math.random() - 0.5) * 0.28;
    positions[i * 3 + 2] = -0.60 + (Math.random() - 0.5) * 0.40;
    speeds[i]            = 0.03 + Math.random() * 0.05;
    isHeroArr[i]         = 0.0;
  }
  offsets[i] = Math.random() * 10;

  // Start color: ruby red #C41E3A (0.769, 0.118, 0.227)
  colors[i * 3]     = 0.769;
  colors[i * 3 + 1] = 0.118;
  colors[i * 3 + 2] = 0.227;
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
geometry.setAttribute('isHero',   new THREE.BufferAttribute(isHeroArr, 1));

// Custom GLSL ShaderMaterial guarantees 100% round glowing photon spheres with zero square artifacts
const signalMaterial = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms: {
    uOpacity: { value: 0.0 }
  },
  vertexShader: `
    attribute vec3 color;
    attribute float isHero;
    varying vec3 vColor;
    varying float vIsHero;
    void main() {
      vColor = color;
      vIsHero = isHero;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      float dist = -mvPosition.z;
      // Controlled size scaling: Hero photon leader is 2x larger (max 24px) for clear protagonist dominance
      float baseSize = mix(32.0, 72.0, isHero);
      float maxSize  = mix(11.0, 24.0, isHero);
      gl_PointSize = clamp(baseSize / max(dist, 0.5), 2.0, maxSize);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float uOpacity;
    varying vec3 vColor;
    varying float vIsHero;
    void main() {
      // Directional velocity energy streaking along travel axis
      vec2 coord = gl_PointCoord - vec2(0.5);
      
      // Elongated Gaussian photonic velocity streak profile (streaked along Y velocity vector)
      float streakX = exp(-pow(coord.x * 5.2, 2.0));
      float streakY = exp(-pow(coord.y * 2.1, 2.0));
      float streak = streakX * streakY;

      float d = length(coord);
      if (d > 0.5) discard;

      // Photonic energy core with high velocity head and soft tail
      float intensity = streak * smoothstep(0.5, 0.0, d);
      intensity = pow(intensity, mix(1.3, 0.7, vIsHero));

      vec3 finalCol = mix(vColor, vec3(1.0, 1.0, 1.0), vIsHero * (1.0 - d * 2.0) * 0.75);
      gl_FragColor = vec4(finalCol * (1.2 + 0.8 * vIsHero), intensity * uOpacity * mix(0.75, 1.0, vIsHero));
    }
  `
});

export const signalParticles = new THREE.Points(geometry, signalMaterial);

// ── Update (called every frame) ───────────────────────────────────────────────

export function updateChapter3(scrollFloat) {
  // Fade particles in at crown ignition (sf 3.05 -> 3.25), fade out as fiber tunnel engages (sf 3.55 -> 3.80)
  const pFadeIn  = clamp(map(scrollFloat, 3.05, 3.25, 0, 1), 0, 1);
  const pFadeOut = clamp(map(scrollFloat, 3.55, 3.80, 1, 0), 0, 1);
  signalMaterial.uniforms.uOpacity.value = pFadeIn * pFadeOut;

  if (scrollFloat > 3.05) {
    // Speed ramps from 1× to 4× as camera aligns with stream axis
    const chapterSpeed = map(scrollFloat, 3.05, 3.50, 1.0, 4.0);

    const pos = geometry.attributes.position.array;
    const col = geometry.attributes.color.array;

    for (let i = 0; i < particleCount; i++) {
      // Move forward toward camera (+Z)
      pos[i * 3 + 2] += speeds[i] * chapterSpeed;

      // Reset when too far
      if (pos[i * 3 + 2] > 8.0) {
        if (i === 0) {
          pos[0] = 0.40;
          pos[1] = 10.42;
          pos[2] = -0.60;
        } else {
          pos[i * 3]     = 0.40 + (Math.random() - 0.5) * 0.28;
          pos[i * 3 + 1] = 10.42 + (Math.random() - 0.5) * 0.28;
          pos[i * 3 + 2] = -0.60;
        }
      }

      // Physical color lerp red → cyan based on Z travel distance
      const t = clamp((pos[i * 3 + 2] - (-0.60)) / 8.6, 0, 1);
      col[i * 3]     = 0.769 * (1 - t) + 0.0   * t; // R: ruby red → 0
      col[i * 3 + 1] = 0.118 * (1 - t) + 0.812 * t; // G: → electric cyan
      col[i * 3 + 2] = 0.227 * (1 - t) + 1.0   * t; // B: → bright blue
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate    = true;
  }

  // Overlay: centered "EVERY CONNECTION STARTS HERE" (sf 3.12 → 3.48)
  const t3 = document.getElementById('chapter3-text');
  if (t3) {
    const fIn  = clamp(map(scrollFloat, 3.12, 3.24, 0, 1), 0, 1);
    const fOut = clamp(map(scrollFloat, 3.38, 3.48, 1, 0), 0, 1);
    const op   = fIn * fOut;
    t3.style.opacity = String(op);
    t3.style.display = op > 0.01 ? 'block' : 'none';
    t3.style.pointerEvents = op > 0.01 ? 'auto' : 'none';
  }
}
