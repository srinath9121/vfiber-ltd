// main.js — entry point
// Clean orchestrator: scene, camera, renderer, animate loop only.

import * as THREE from 'three';
import { initScroll, updateScroll, scrollFloat } from './src/scroll.js';
import { earthMesh, networkGroup, beamsGroup, updateChapter0 } from './src/chapters/chapter0-earth.js';
import { usaNodesGroup, updateChapter1 } from './src/chapters/chapter1-usa.js';
import { poleGroup, atmospherePlane, updateChapter2 } from './src/chapters/chapter2-pole.js';
import { signalParticles, updateChapter3 } from './src/chapters/chapter3-signal.js';
import { tunnel, fiberMaterial, updateChapter4 } from './src/chapters/chapter4-fiber.js';
import { updateChapter5 } from './src/chapters/chapter5-final.js';
import { clamp, map } from './src/utils/math.js';

// ── Scene ─────────────────────────────────────────────────────────────────────

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050a14);

// ── Camera ────────────────────────────────────────────────────────────────────

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 9);

// ── Renderer ──────────────────────────────────────────────────────────────────

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
(document.getElementById('app') || document.body).appendChild(renderer.domElement);

// ── Lights ────────────────────────────────────────────────────────────────────

scene.add(new THREE.AmbientLight(0xffffff, 0.3));
const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(5, 5, 5);
scene.add(sun);

// ── Scene Graph ───────────────────────────────────────────────────────────────

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

// ── Camera Keyframes ──────────────────────────────────────────────────────────
// Full chapter map:
//  0.0 → [0, 0, 9]      Chapter 0: full Earth view
//  1.0 → [0, 0, 6]      Chapter 0→1: Earth fills screen
//  2.0 → [2, 0.5, 3]    Chapter 1→2: angle toward USA/pole
//  2.5 → [4, 2, 4]      Chapter 2: orbiting pole
//  3.0 → [1, 3, 6]      Chapter 2→3: pulling back
//  3.5 → [0, 0, 3]      Chapter 3: rushing into tunnel
//  4.5 → [0, 0, -10]    Chapter 4: deep inside fiber tunnel
//  5.0 → [0, 0, 18]     Chapter 5: pull back to Earth

const CAM = [
  { at: 0.0, pos: new THREE.Vector3(0, 0, 9)   },
  { at: 1.0, pos: new THREE.Vector3(0, 0, 6)   },
  { at: 2.0, pos: new THREE.Vector3(2, 0.5, 4) }, // Chapter 2 entry
  { at: 2.5, pos: new THREE.Vector3(3, 2, 5)   }, // orbiting pole
  { at: 3.0, pos: new THREE.Vector3(0, 4, 7)   }, // pulling back, looking up pole
  { at: 3.5, pos: new THREE.Vector3(0, 0, 4)   }, // rushing into particle stream
  { at: 4.5, pos: new THREE.Vector3(0, 0, -10) }, // inside fiber tunnel
  { at: 5.0, pos: new THREE.Vector3(0, 0, 18)  }, // pull back to Earth
];

const camTarget = new THREE.Vector3();

function updateCamera(sf) {
  // Find surrounding keyframes
  let fromKey = CAM[0], toKey = CAM[CAM.length - 1];
  for (let i = 0; i < CAM.length - 1; i++) {
    if (sf >= CAM[i].at && sf <= CAM[i + 1].at) {
      fromKey = CAM[i];
      toKey   = CAM[i + 1];
      break;
    }
  }
  const t = THREE.MathUtils.clamp(
    (sf - fromKey.at) / (toKey.at - fromKey.at), 0, 1
  );
  camTarget.lerpVectors(fromKey.pos, toKey.pos, t);
  camera.position.lerp(camTarget, 0.08);
  camera.lookAt(0, 0, 0);
}

// ── Animate Loop ──────────────────────────────────────────────────────────────

function animate() {
  requestAnimationFrame(animate);

  updateScroll();
  const sf = scrollFloat;
  const time = performance.now() * 0.001;

  // Earth fades out as Chapter 2 begins (sf 2.0 → 2.4)
  const earthOpacity = clamp(map(sf, 2.0, 2.4, 1, 0), 0, 1);
  earthMesh.material.transparent = true;
  // Only apply fade-out if not in chapter 5 return
  if (sf < 4.5) {
    earthMesh.material.opacity = earthOpacity;
    // Hide mesh/beam groups when Earth is gone
    earthMesh.children.forEach((child) => {
      if (child.isGroup) child.visible = sf < 2.5;
    });
  }

  // Chapter updates
  updateChapter0(sf, time);
  updateChapter1(sf, time);
  updateChapter2(sf);
  updateChapter3(sf, poleGroup);
  // Chapter 4 owns camera directly when sf > 3.3 and < 4.3
  updateChapter4(sf, camera, signalParticles);
  // Chapter 5 — tunnel exit, Earth return, GSAP counters, CTA
  // Passes fiberMaterial so ch5 can fade tunnel; owns camera when sf > 4.3
  updateChapter5(sf, camera, earthMesh, fiberMaterial, networkGroup, beamsGroup);

  // Keyframe camera — active only before ch4 and after ch5 takes over
  if (sf <= 3.3) updateCamera(sf);

  renderer.render(scene, camera);
}

// ── Init ──────────────────────────────────────────────────────────────────────

initScroll();
animate();

// ── Resize ────────────────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
