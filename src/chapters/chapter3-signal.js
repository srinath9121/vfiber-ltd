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

  // Start color: electric cyan #00CFFF (0.0, 0.812, 1.0)
  colors[i * 3]     = 0.0;
  colors[i * 3 + 1] = 0.812;
  colors[i * 3 + 2] = 1.0;
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
    uOpacity:        { value: 0.0 },
    uSize:           { value: 0.26 },
    uCameraDistance: { value: 10.0 }
  },
  vertexShader: `
    uniform float uSize;
    uniform float uCameraDistance;
    attribute vec3 color;
    attribute float isHero;
    varying vec3 vColor;
    varying float vIsHero;
    varying float vDist;
    void main() {
      vColor = color;
      vIsHero = isHero;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      float dist = max(-mvPosition.z, 0.4);
      vDist = -mvPosition.z;
      // Perspective-correct point size tied to camera distance (Weakness 7)
      float sizeMult = mix(1.0, 1.8, isHero);
      gl_PointSize = clamp(uSize * (300.0 / dist) * sizeMult, 2.0, mix(24.0, 42.0, isHero));
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float uOpacity;
    varying vec3 vColor;
    varying float vIsHero;
    varying float vDist;
    void main() {
      // Directional velocity energy streaking along travel axis
      vec2 coord = gl_PointCoord - vec2(0.5);
      
      // Elongated Gaussian photonic velocity streak profile (streaked along Y velocity vector)
      float streakX = exp(-pow(coord.x * 5.2, 2.0));
      float streakY = exp(-pow(coord.y * 2.1, 2.0));
      float streak = streakX * streakY;

      float d = length(coord);
      if (d > 0.5) discard;

      // Soft near-plane attenuation so particles don't explode into giant blobs right on the camera lens
      float nearFade = smoothstep(0.5, 1.6, vDist);

      // Photonic energy core with high velocity head and soft tail
      float intensity = streak * smoothstep(0.5, 0.0, d) * nearFade;
      intensity = pow(intensity, mix(1.3, 0.7, vIsHero));

      vec3 finalCol = mix(vColor, vec3(1.0, 1.0, 1.0), vIsHero * (1.0 - d * 2.0) * 0.75);
      gl_FragColor = vec4(finalCol * (1.1 + 0.5 * vIsHero), intensity * uOpacity * mix(0.75, 1.0, vIsHero));
    }
  `
});

export const signalParticles = new THREE.Points(geometry, signalMaterial);

// ── Update (called every frame) ───────────────────────────────────────────────

export function updateChapter3(scrollFloat, camera) {
  // Totally removed per user request — no particle effect, no flash
  signalMaterial.uniforms.uOpacity.value = 0.0;
  signalParticles.visible = false;
}
