// main.js — Entry point & Master Story Orchestrator
// Unified camera controller driven by single source of truth: scrollFloat / storyProgress

import * as THREE from 'three';
import { initScroll, updateScroll, scrollFloat, storyProgress } from './src/scroll.js';
import { earthMesh, spaceSkyMesh, starFieldMesh, networkGroup, beamsGroup, updateChapter0 } from './src/chapters/chapter0-earth.js';
import { usaNodesGroup, updateChapter1 } from './src/chapters/chapter1-usa.js';
import { poleGroup, atmospherePlane, updateChapter2 } from './src/chapters/chapter2-pole.js';
import { signalParticles, updateChapter3 } from './src/chapters/chapter3-signal.js';
import { tunnel, fiberMaterial, updateChapter4 } from './src/chapters/chapter4-fiber.js';
import { updateChapter5 } from './src/chapters/chapter5-final.js';
import { networkChapterGroup, updateChapter6 } from './src/chapters/chapter6-network.js';
import { clamp, map } from './src/utils/math.js';
import { audioManager } from './src/utils/audio.js';
import { assetRegistry } from './src/utils/assets.js';
import { heroGateEngine } from './src/utils/hero-gate.js';

// ── Scene ─────────────────────────────────────────────────────────────────────

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x010307); // Pitch black deep space

// ── Camera ────────────────────────────────────────────────────────────────────

const initialFov = window.innerWidth < window.innerHeight ? 72 : 52;
const camera = new THREE.PerspectiveCamera(initialFov, window.innerWidth / window.innerHeight, 0.04, 1000);
camera.position.set(0.0, 1.45, 8.2);
camera.lookAt(0.0, 1.85, 0.0);

// ── Renderer ──────────────────────────────────────────────────────────────────

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
(document.getElementById('app') || document.body).appendChild(renderer.domElement);

// Initialize Centralized Asset Registry with WebGLRenderer for KTX2 support detection
assetRegistry.initRenderer(renderer);

// WebGL Context Loss & Mobile Fallback Handling
renderer.domElement.addEventListener('webglcontextlost', (e) => {
  e.preventDefault();
  console.warn('WebGL Context Lost. Displaying high-quality visual fallback.');
  document.body.style.background = '#050a14 url("/references/earth 3.jpg") center/cover no-repeat';
}, false);

// ── Lights ────────────────────────────────────────────────────────────────────

scene.add(new THREE.AmbientLight(0x050a14, 0.25)); // Deep space ambient
const sun = new THREE.DirectionalLight(0xfffaed, 2.5); // Physical Sun light
sun.position.set(12.0, 4.0, 10.0);
scene.add(sun);

// ── Scene Graph ───────────────────────────────────────────────────────────────

// 3D Space Skysphere Environment & Starfield (inside Three.js scene graph)
scene.add(spaceSkyMesh);
scene.add(starFieldMesh);

// USA nodes are children of earthMesh — rotate with Earth automatically
earthMesh.add(usaNodesGroup);
scene.add(earthMesh);

// Chapter 2 — pole and atmospheric depth plane
scene.add(poleGroup);
scene.add(atmospherePlane);

// Chapter 3 — signal particles
scene.add(signalParticles);

// Chapter 4 — fiber tunnel
scene.add(tunnel);

// Chapter 6 — optical termination & network infrastructure
scene.add(networkChapterGroup);

// ── Master Camera Choreography ────────────────────────────────────────────────
// The camera is the storyteller. A single coherent controller interpolates both
// camera position and lookAt target across all chapters.

const CAM = [
  // Beat 0: Earth Deep Space Orbit & Transatlantic Signal Entrance
  { at: 0.00, pos: new THREE.Vector3(0.0, 1.45, 8.2),    target: new THREE.Vector3(0.0, 1.85, 0.0) },
  // Beat 1: Regional Western USA Hub & Network Nodes Touchdown
  { at: 0.95, pos: new THREE.Vector3(0.18, 1.88, 4.65),  target: new THREE.Vector3(0.0, 1.84, 3.06) },
  // Beat 2: Telecom Lattice Tower & Infrastructure Framing
  { at: 1.80, pos: new THREE.Vector3(2.4, 3.8, 5.2),     target: new THREE.Vector3(0.4, 5.5, -0.6) },
  // Beat 3: Crown Optical Emitter & Signal Coupling
  { at: 2.80, pos: new THREE.Vector3(0.4, 10.8, 2.6),    target: new THREE.Vector3(0.4, 10.42, -1.5) },
  // Beat 4: Loose-Tube Fiber Cable Cutaway & Macro Assembly
  { at: 3.60, pos: new THREE.Vector3(2.2, 11.52, 7.5),   target: new THREE.Vector3(0.4, 10.22, 1.0) },
  // Beat 5: Optical Glass Fiber Core Waveguide Tunnel
  { at: 4.60, pos: new THREE.Vector3(0.4, 10.42, 4.2),   target: new THREE.Vector3(0.4, 10.42, -30.0) },
  // Beat 6: ODF Equipment Rack Bay & Optical Termination
  { at: 5.40, pos: new THREE.Vector3(0.75, 12.22, -68.0), target: new THREE.Vector3(0.40, 10.22, -82.0) },
  // Beat 7: Planetary Return & Global Engineering Culmination
  { at: 6.00, pos: new THREE.Vector3(0.0, 1.50, 11.2),   target: new THREE.Vector3(0.0, -0.30, 0.0) }
];

const camTargetPos  = new THREE.Vector3();
const camTargetLook = new THREE.Vector3();
const currentLookAt = new THREE.Vector3(0, 0, 0);

// Subtle pointer parallax response for orbital depth
let pointerX = 0, pointerY = 0;
let targetPointerX = 0, targetPointerY = 0;

if (typeof window !== 'undefined') {
  window.addEventListener('pointermove', (e) => {
    targetPointerX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetPointerY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });
}

function updateCamera(sf) {
  let fromKey = CAM[0], toKey = CAM[CAM.length - 1];
  for (let i = 0; i < CAM.length - 1; i++) {
    if (sf >= CAM[i].at && sf <= CAM[i + 1].at) {
      fromKey = CAM[i];
      toKey   = CAM[i + 1];
      break;
    }
  }

  const range = toKey.at - fromKey.at;
  const t = range === 0 ? 0 : clamp((sf - fromKey.at) / range, 0, 1);
  // Smooth cubic ease between keyframes for cinematic glide
  const easeT = t * t * (3 - 2 * t);

  camTargetPos.lerpVectors(fromKey.pos, toKey.pos, easeT);
  camTargetLook.lerpVectors(fromKey.target, toKey.target, easeT);

  // Subtle pointer parallax response during Earth orbital views
  pointerX += (targetPointerX - pointerX) * 0.05;
  pointerY += (targetPointerY - pointerY) * 0.05;
  if (sf < 1.70 || sf > 5.80) {
    camTargetPos.x += pointerX * 0.18;
    camTargetPos.y += pointerY * 0.12;
  }

  // Responsive camera framing adjustment for narrow portrait screens (mobile)
  if (camera.aspect < 1.0) {
    // Macro cable transition (sf 3.60 -> 4.80): adapt camera distance along view vector to preserve framing
    if (sf >= 3.50 && sf <= 4.85) {
      const portraitDistFactor = (1.0 / camera.aspect) * 0.35;
      const viewDir = camTargetPos.clone().sub(camTargetLook).normalize();
      camTargetPos.add(viewDir.multiplyScalar(portraitDistFactor));
    } else if (sf >= 5.15 && sf <= 5.40) {
      const mobileXShift = (camTargetPos.x - 0.40) * 0.55;
      camTargetPos.x -= mobileXShift;
    }
  }

  if (Math.abs(sf - lastCameraSf) > 0.25) {
    camera.position.copy(camTargetPos);
    currentLookAt.copy(camTargetLook);
  } else {
    camera.position.lerp(camTargetPos, 0.08);
    currentLookAt.lerp(camTargetLook, 0.08);
  }
  lastCameraSf = sf;
  camera.lookAt(currentLookAt);
}

let lastCameraSf = 0;

// ── Animate Loop ──────────────────────────────────────────────────────────────

function animate() {
  requestAnimationFrame(animate);

  updateScroll();
  const sf = scrollFloat;
  const time = performance.now() * 0.001;

  // Master camera update across all chapters — eliminates conflicts
  updateCamera(sf);

  // Earth visual dominance & opacity choreography
  let earthOpacity = 1.0;
  if (sf < 1.70) {
    earthOpacity = 1.0;
  } else if (sf <= 2.10) {
    earthOpacity = clamp(map(sf, 1.70, 2.10, 1.0, 0.22), 0.22, 1.0);
  } else if (sf < 3.2) {
    earthOpacity = 0.22; // Preserves dark atmospheric horizon throughout Phase 3
  } else if (sf < 4.3) {
    earthOpacity = clamp(map(sf, 3.2, 3.6, 0.22, 0), 0, 0.22);
  } else if (sf < 5.85) {
    earthOpacity = 0.0;
  } else {
    earthOpacity = clamp(map(sf, 5.85, 6.0, 0, 0.88), 0, 0.88);
  }

  if (earthMesh.material.uniforms && earthMesh.material.uniforms.uOpacity) {
    earthMesh.material.uniforms.uOpacity.value = earthOpacity;
  }
  earthMesh.renderOrder = 0;

  // Network, beams, and USA nodes group visibility: active during initial Earth arrival (sf < 2.10) and Phase 7 planetary culmination (sf > 5.82)
  usaNodesGroup.visible = sf < 2.10 || sf > 5.82;
  networkGroup.visible  = sf < 2.10 || sf > 5.82;
  beamsGroup.visible    = sf < 2.10 || sf > 5.82;

  // Chapter lifecycle updates
  updateChapter0(sf, time);
  updateChapter1(sf, time);
  updateChapter2(sf);
  updateChapter3(sf);
  updateChapter4(sf, camera, signalParticles);
  updateChapter6(sf);
  updateChapter5(sf, camera, earthMesh, fiberMaterial, networkGroup, beamsGroup);

  // Environmental audio orchestrator update
  audioManager.update(sf);

  // Safety HUD lifecycle clamp: guarantees Chapter 4 & 6 HUDs never overlap the finale
  const ch4Hud = document.getElementById('chapter4-text');
  if (ch4Hud && (sf < 3.60 || sf >= 4.50)) {
    ch4Hud.style.opacity = '0';
    ch4Hud.style.pointerEvents = 'none';
    ch4Hud.style.display = 'none';
  }
  const ch6Hud = document.getElementById('chapter6-text');
  if (ch6Hud && (sf < 5.15 || sf >= 5.82)) {
    ch6Hud.style.opacity = '0';
    ch6Hud.style.pointerEvents = 'none';
    ch6Hud.style.display = 'none';
  }

  renderer.render(scene, camera);

  // Update Draw-0 Frosted Glass Portal Overlay
  heroGateEngine.update(time, renderer);
}
// ── Init ──────────────────────────────────────────────────────────────────────

initScroll();
heroGateEngine.init(document.getElementById('hero-gate'));
animate();

// ── Resize ────────────────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.fov = window.innerWidth < window.innerHeight ? 78 : 70;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
