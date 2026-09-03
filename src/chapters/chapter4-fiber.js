// chapter4-fiber.js — Fiber tunnel with custom GLSL shaders
// Shader Gradient skill: GPU-side light streaks — 3 layers at different speeds
// All animation runs on GPU per-pixel. Zero CPU animation overhead.

import * as THREE from 'three';
import { clamp, map } from '../utils/math.js';

// ── Shader Material ───────────────────────────────────────────────────────────

export const fiberMaterial = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  transparent: true,
  uniforms: {
    uTime:     { value: 0 },
    uProgress: { value: 0 },
    uOpacity:  { value: 0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uProgress;
    uniform float uOpacity;
    varying vec2 vUv;

    void main() {
      // Base deep blue — space of the tunnel interior
      vec3 color = vec3(0.01, 0.05, 0.15);

      // Primary streaks — fast, sharp (#00CFFF dominant)
      float speed1 = 3.0 + uProgress * 12.0;
      float streak1 = fract(vUv.y * 30.0 - uTime * speed1);
      streak1 = pow(streak1, 10.0);

      // Secondary streaks — medium density, softer blue
      float speed2 = 2.0 + uProgress * 8.0;
      float streak2 = fract(vUv.y * 50.0 - uTime * speed2 + 0.3);
      streak2 = pow(streak2, 14.0);

      // Tertiary streaks — slow ambient glow layer
      float streak3 = fract(vUv.y * 15.0 - uTime * 1.5 + 0.7);
      streak3 = pow(streak3, 6.0) * 0.3;

      // Edge glow — tunnel wall rim light
      float edge = abs(vUv.x - 0.5) * 2.0;
      float glow = pow(edge, 4.0);

      // Horizontal ring pulses — depth cue rings
      float ring = sin(vUv.y * 80.0 - uTime * 5.0);
      ring = pow(max(ring, 0.0), 8.0) * 0.2;

      // Compose all layers
      color += streak1 * vec3(0.0, 0.85, 1.0) * 2.5;
      color += streak2 * vec3(0.2, 0.6,  1.0) * 1.8;
      color += streak3 * vec3(0.0, 0.5,  0.9);
      color += glow    * vec3(0.0, 0.4,  0.8) * 0.8;
      color += ring    * vec3(0.1, 0.7,  1.0);

      gl_FragColor = vec4(color, uOpacity);
    }
  `
});

// ── Tunnel Geometry ───────────────────────────────────────────────────────────

export const tunnel = new THREE.Mesh(
  new THREE.CylinderGeometry(2.5, 2.5, 40, 32, 1, true),
  fiberMaterial
);
tunnel.rotation.x = Math.PI / 2; // align with Z axis
tunnel.position.z = -15;         // tunnel starts ahead of camera
tunnel.visible = false;

// ── Update (called every frame) ───────────────────────────────────────────────

export function updateChapter4(scrollFloat, camera, signalParticles) {
  // Always tick time so streaks animate continuously
  fiberMaterial.uniforms.uTime.value = performance.now() / 1000;

  if (scrollFloat > 3.3) {
    tunnel.visible = true;

    // Fade tunnel in (sf 3.3 → 3.7)
    fiberMaterial.uniforms.uOpacity.value =
      clamp(map(scrollFloat, 3.3, 3.7, 0, 0.85), 0, 0.85);

    // Speed ramps up as user scrolls deeper (sf 3.5 → 4.5)
    fiberMaterial.uniforms.uProgress.value =
      clamp(map(scrollFloat, 3.5, 4.5, 0, 1), 0, 1);

    // Camera flies through tunnel along Z axis
    const tunnelCamZ = map(scrollFloat, 3.5, 4.5, 4, -10);
    camera.position.set(0, 0, tunnelCamZ);
    camera.lookAt(0, 0, tunnelCamZ - 5);

    // Fade signal particles out as tunnel takes over (sf 3.6 → 3.9)
    if (signalParticles && scrollFloat > 3.6) {
      signalParticles.material.opacity =
        clamp(map(scrollFloat, 3.6, 3.9, 1, 0), 0, 1);
    }
  } else {
    tunnel.visible = false;
  }

  // Chapter 4 text overlay (bottom-left, sf 3.8 → 4.5)
  const t4 = document.getElementById('chapter4-text');
  if (t4) t4.style.opacity = (scrollFloat > 3.8 && scrollFloat < 4.5) ? '1' : '0';
}
