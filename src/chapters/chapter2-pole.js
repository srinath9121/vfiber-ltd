// chapter2-pole.js — Utility pole procedural geometry + structural data overlay
// Shader Gradient skill applied: subtle atmospheric depth gradient behind pole
// Liquid Glass skill applied: chapter2-text overlay uses glass surface styling

import * as THREE from 'three';
import { clamp, map } from '../utils/math.js';

// ── Pole Group ────────────────────────────────────────────────────────────────

export const poleGroup = new THREE.Group();
poleGroup.position.set(0, -4, 0); // starts below frame, rises on scroll

const woodMat = new THREE.MeshStandardMaterial({
  color: 0x3d2b1f,
  roughness: 0.85,
  metalness: 0.05
});

// Main shaft — tapered cylinder
const shaft = new THREE.Mesh(
  new THREE.CylinderGeometry(0.04, 0.06, 6, 12),
  woodMat
);
shaft.position.y = 3;
poleGroup.add(shaft);

// Top cross arm
const arm1 = new THREE.Mesh(
  new THREE.BoxGeometry(2.5, 0.07, 0.07),
  woodMat
);
arm1.position.y = 5.5;
poleGroup.add(arm1);

// Middle cross arm
const arm2 = new THREE.Mesh(
  new THREE.BoxGeometry(1.8, 0.07, 0.07),
  woodMat
);
arm2.position.y = 4.8;
poleGroup.add(arm2);

// ── Insulators (6 total) ──────────────────────────────────────────────────────

const insulatorMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.3,
  metalness: 0.1
});
const insulatorGeom = new THREE.SphereGeometry(0.08, 12, 12);

const insulatorPositions = [
  // arm1 (y=5.5): left, center, right
  new THREE.Vector3(-1.2, 5.5, 0),
  new THREE.Vector3(   0, 5.5, 0),
  new THREE.Vector3( 1.2, 5.5, 0),
  // arm2 (y=4.8): left, center, right
  new THREE.Vector3(-0.9, 4.8, 0),
  new THREE.Vector3(   0, 4.8, 0),
  new THREE.Vector3( 0.9, 4.8, 0),
];

insulatorPositions.forEach((pos) => {
  const ins = new THREE.Mesh(insulatorGeom, insulatorMat);
  ins.position.copy(pos);
  poleGroup.add(ins);
});

// ── Structural Data Overlay Lines (#00CFFF) ───────────────────────────────────
// 8 lines connecting insulator positions to shaft center — represents load paths

const shaftTop = new THREE.Vector3(0, 6, 0);
const shaftMid = new THREE.Vector3(0, 3, 0);
const shaftBase = new THREE.Vector3(0, 0, 0);

const dataLinePoints = [
  // Load lines from arm1 insulators → shaft center
  insulatorPositions[0], shaftTop,
  insulatorPositions[2], shaftTop,
  insulatorPositions[1], shaftMid,
  // Load lines from arm2 insulators → shaft mid
  insulatorPositions[3], shaftMid,
  insulatorPositions[5], shaftMid,
  // Vertical structural lines
  shaftTop, shaftMid,
  shaftMid, shaftBase,
  // Diagonal brace visualization
  insulatorPositions[0], insulatorPositions[5],
];

const dataLineGeo = new THREE.BufferGeometry();
const dataLineVerts = [];
dataLinePoints.forEach((pt) => dataLineVerts.push(pt.x, pt.y, pt.z));
dataLineGeo.setAttribute('position', new THREE.Float32BufferAttribute(dataLineVerts, 3));

export const dataLines = new THREE.LineSegments(
  dataLineGeo,
  new THREE.LineBasicMaterial({ color: 0x00CFFF, transparent: true, opacity: 0.0 })
);
poleGroup.add(dataLines);

// ── Atmospheric Depth Plane (Shader Gradient skill) ───────────────────────────
// Subtle dark-to-navy gradient plane behind pole — adds cinematic depth
// Uses ShaderMaterial: no external dependency, pure GLSL inline

const atmosphereMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  uniforms: {
    uOpacity: { value: 0.0 },
    uColor1:  { value: new THREE.Color(0x050a14) }, // deep space
    uColor2:  { value: new THREE.Color(0x0d1f3c) }, // navy depth
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uOpacity;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    varying vec2 vUv;
    void main() {
      // Radial vignette — brighter navy center, deep space edges
      float dist = length(vUv - vec2(0.5));
      vec3 col = mix(uColor2, uColor1, smoothstep(0.1, 0.7, dist));
      gl_FragColor = vec4(col, uOpacity * (1.0 - dist * 0.6));
    }
  `
});

export const atmospherePlane = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 20),
  atmosphereMat
);
atmospherePlane.position.set(0, 3, -3);

// ── Update (called every frame) ───────────────────────────────────────────────

export function updateChapter2(scrollFloat) {
  // Pole rises into frame between sf 2.0 and 2.5
  const poleProgress = clamp(map(scrollFloat, 2.0, 2.5, 0, 1), 0, 1);
  // Ease-out: smoother arrival
  const eased = 1 - Math.pow(1 - poleProgress, 3);
  poleGroup.position.y = -4 + eased * 4;

  // Pole overall opacity (pole fades in with rise)
  const poleOpacity = clamp(map(scrollFloat, 2.0, 2.4, 0, 1), 0, 1);
  poleGroup.traverse((child) => {
    if (child.isMesh && child.material) {
      child.material.transparent = true;
      child.material.opacity = child === dataLines ? child.material.opacity : poleOpacity;
    }
  });

  // Data lines fade in later (structural analysis reveal)
  dataLines.material.opacity = clamp(map(scrollFloat, 2.3, 2.7, 0, 0.65), 0, 0.65);

  // Atmospheric depth plane fade
  atmosphereMat.uniforms.uOpacity.value = clamp(map(scrollFloat, 2.0, 2.4, 0, 0.92), 0, 0.92);

  // Slow idle pole rotation (cinematic orbit effect)
  if (scrollFloat >= 2.0 && scrollFloat < 3.0) {
    poleGroup.rotation.y += 0.002;
  }

  // Chapter 2 text overlay (Liquid Glass — see index.html)
  const t2 = document.getElementById('chapter2-text');
  if (t2) t2.style.opacity = (scrollFloat > 2.3 && scrollFloat < 2.9) ? '1' : '0';
}
