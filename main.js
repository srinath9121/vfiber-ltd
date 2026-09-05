// main.js — Entry point & Master Story Orchestrator
// Enforces 8 camera beats, Electric Cyan color system (#00CFFF), and lock-to-camera starfield

import * as THREE from 'three';
import { initScroll, updateScroll, scrollFloat, storyProgress, setTargetScroll, setScrollLocked } from './src/scroll.js';
import { earthMesh, spaceSkyMesh, starFieldMesh, networkGroup, beamsGroup, updateChapter0 } from './src/chapters/chapter0-earth.js';
import { usaNodesGroup, updateChapter1 } from './src/chapters/chapter1-usa.js';
import { poleGroup, atmospherePlane, updateChapter2 } from './src/chapters/chapter2-pole.js';
import { signalParticles, updateChapter3 } from './src/chapters/chapter3-signal.js';
import { tunnel, fiberMaterial, updateChapter4 } from './src/chapters/chapter4-fiber.js';
import { updateChapter5 } from './src/chapters/chapter5-final.js';
import { networkChapterGroup, updateChapter6, handlePortRaycast, hidePortInspection } from './src/chapters/chapter6-network.js';
import { clamp, map } from './src/utils/math.js';
import { audioManager } from './src/utils/audio.js';
import { assetRegistry } from './src/utils/assets.js';

// ── Scene (Deep Space Cyan Navy Backdrop) ───────────────────────────────────

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02060d); // Enforced deep cyan space tone

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

// ── Lights (Enforced Electric Cyan Ambient Fill) ─────────────────────────────

scene.add(new THREE.AmbientLight(0x021524, 0.35)); // Deep space cyan ambient
const sun = new THREE.DirectionalLight(0xfffaed, 2.5); // Physical Sun light
sun.position.set(12.0, 4.0, 10.0);
scene.add(sun);

// ── Scene Graph & Starfield Fix ──────────────────────────────────────────────

spaceSkyMesh.renderOrder = -100;
starFieldMesh.renderOrder = -99;
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

// Chapter 4 — loose-tube fiber cable assembly
scene.add(tunnel);

// Chapter 6 — optical termination & network infrastructure
scene.add(networkChapterGroup);

// ── Master Camera Choreography (8 Precise Beats) ──────────────────────────────
// Single source of truth for narrative progression across scrollFloat [0.00 → 6.00]

const CAM = [
  // Beat 0: Earth Deep Space Orbit & Transatlantic Signal Entrance (sf = 0.00)
  { at: 0.00, pos: new THREE.Vector3(0.0, 1.20, 13.5),   target: new THREE.Vector3(0.0, 0.40, 0.0) },
  // Beat 1: Regional Western USA Hub & Network Nodes Touchdown (sf = 0.95)
  { at: 0.95, pos: new THREE.Vector3(0.18, 1.88, 4.65),  target: new THREE.Vector3(0.0, 1.84, 3.06) },
  // Beat 2: Telecom Lattice Tower & Infrastructure Framing (sf = 1.80)
  { at: 1.80, pos: new THREE.Vector3(2.4, 3.8, 5.2),     target: new THREE.Vector3(0.4, 5.5, -0.6) },
  // Beat 3: Crown Optical Emitter & Signal Coupling (sf = 2.80)
  { at: 2.80, pos: new THREE.Vector3(0.4, 10.8, 2.6),    target: new THREE.Vector3(0.4, 10.42, -1.5) },
  // Beat 4: Loose-Tube Fiber Cable Cutaway & Macro Assembly (sf = 3.60)
  { at: 3.60, pos: new THREE.Vector3(2.2, 11.52, 7.5),   target: new THREE.Vector3(0.4, 10.22, 1.0) },
  // Beat 5: Optical Glass Fiber Core Waveguide Tunnel (sf = 4.60)
  { at: 4.60, pos: new THREE.Vector3(0.4, 10.42, 4.2),   target: new THREE.Vector3(0.4, 10.42, -30.0) },
  // Beat 6: ODF Equipment Rack Bay & Optical Termination (sf = 5.40)
  { at: 5.40, pos: new THREE.Vector3(1.8, 0.3, 2.5), target: new THREE.Vector3(0.0, 0.0, 0.0) },
  // Beat 7: Planetary Return & Global Engineering Culmination (sf = 6.00)
  { at: 6.00, pos: new THREE.Vector3(0.0, 1.50, 11.2),   target: new THREE.Vector3(0.0, -0.30, 0.0) }
];

const camTargetPos  = new THREE.Vector3();
const camTargetLook = new THREE.Vector3();
const currentLookAt = new THREE.Vector3(0, 0, 0);

// Pointer parallax response for depth perception
let pointerX = 0, pointerY = 0;
let targetPointerX = 0, targetPointerY = 0;

if (typeof window !== 'undefined') {
  window.addEventListener('pointermove', (e) => {
    targetPointerX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetPointerY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });
}

let lastCameraSf = 0;

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

  // Responsive camera framing adjustment for narrow mobile screens
  if (camera.aspect < 1.0) {
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

// ── Animate Loop ──────────────────────────────────────────────────────────────

function animate() {
  requestAnimationFrame(animate);

  updateScroll();
  const sf = scrollFloat;
  const time = performance.now() * 0.001;

  // Master camera update across all 8 beats
  updateCamera(sf);

  // STARFIELD & SKY ENVIRONMENT FIX: Lock to camera position so stars never clip
  spaceSkyMesh.position.copy(camera.position);
  starFieldMesh.position.copy(camera.position);

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

  // Earth, network, beams, and USA nodes group visibility: active during initial Earth arrival (sf < 2.10) and Phase 7 planetary culmination (sf > 5.82)
  earthMesh.visible     = sf < 2.10 || sf > 5.82;
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

  // Telemetry HUD top bar readout, progress line, and scrubber update
  const hud = document.getElementById('telemetry-hud');
  const readout = document.getElementById('telemetry-readout');
  const line = document.getElementById('telemetry-progress-line');
  const scrubber = document.getElementById('chapter-scrubber');

  if (hud) {
    hud.style.opacity = '1';
    hud.style.pointerEvents = 'auto';
    if (scrubber) {
      scrubber.style.opacity = '1';
      scrubber.style.pointerEvents = 'auto';
    }
    if (line) line.style.width = `${(sf / 6.0) * 100}%`;
    if (readout) {
      let ch = 'CH.00 // EARTH ORBIT';
      if (sf >= 0.95 && sf < 1.80) ch = 'CH.01 // REGIONAL NETWORK';
      else if (sf >= 1.80 && sf < 2.80) ch = 'CH.02 // POLE STRUCTURAL';
      else if (sf >= 2.80 && sf < 3.60) ch = 'CH.03 // SIGNAL COUPLING';
      else if (sf >= 3.60 && sf < 4.60) ch = 'CH.04 // LOOSE-TUBE FIBER CORE';
      else if (sf >= 4.60 && sf < 5.40) ch = 'CH.05 // ODF EQUIPMENT BAY';
      else if (sf >= 5.40) ch = 'CH.06 // PLANETARY CULMINATION';
      readout.textContent = `${ch} [SF ${sf.toFixed(2)}]`;
    }

    // Sync scrubber active node
    document.querySelectorAll('.scrub-node').forEach((btn) => {
      const bSf = parseFloat(btn.getAttribute('data-sf'));
      const dist = Math.abs(sf - bSf);
      if (dist < 0.45) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Sync Spatial Depth Navigator Box
    const navTrackBar = document.getElementById('nav-track-bar');
    const navScaleReadout = document.getElementById('nav-scale-readout');
    if (navTrackBar) navTrackBar.style.width = `${(sf / 6.0) * 100}%`;
    if (navScaleReadout) {
      let metric = '13,000 KM';
      if (sf >= 0.95 && sf < 1.80) metric = '1,200 KM';
      else if (sf >= 1.80 && sf < 2.80) metric = '45 METERS';
      else if (sf >= 2.80 && sf < 3.60) metric = '10 METERS';
      else if (sf >= 3.60 && sf < 4.60) metric = '12 MM';
      else if (sf >= 4.60 && sf < 5.40) metric = '19 INCH';
      else if (sf >= 5.40) metric = 'GLOBAL';
      navScaleReadout.textContent = metric;
    }
  }

  renderer.render(scene, camera);
}

// ── Raycasting & Port Interactivity ───────────────────────────────────────────

const raycaster = new THREE.Raycaster();
const mouseNdc = new THREE.Vector2();

window.addEventListener('pointermove', (e) => {
  mouseNdc.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouseNdc.y = -(e.clientY / window.innerHeight) * 2 + 1;

  if (scrollFloat >= 5.14 && scrollFloat <= 5.86) {
    raycaster.setFromCamera(mouseNdc, camera);
    handlePortRaycast(raycaster, false);
  }
}, { passive: true });

window.addEventListener('click', (e) => {
  if (e.target.closest('#chapter-scrubber') || e.target.closest('#telemetry-hud') || e.target.closest('#odf-port-card') || e.target.closest('#spatial-nav-box')) {
    return;
  }
  if (scrollFloat >= 5.14 && scrollFloat <= 5.86) {
    raycaster.setFromCamera(mouseNdc, camera);
    handlePortRaycast(raycaster, true);
  }
});

// ── UI Controls & Chapter Quick-Jump Navigation ───────────────────────────────

const CHAPTER_STOPS = [0.00, 0.95, 1.80, 2.80, 3.60, 5.20, 6.00];

document.querySelectorAll('.scrub-node').forEach((btn) => {
  btn.addEventListener('click', () => {
    const targetSf = parseFloat(btn.getAttribute('data-sf'));
    if (!isNaN(targetSf)) {
      setTargetScroll(targetSf);
      audioManager.playTransitionChime();
    }
  });
});

// Spatial Depth Navigator Box Controls (Scroll In / Out at every page)
const btnIn = document.getElementById('nav-btn-in');
if (btnIn) {
  btnIn.addEventListener('click', () => {
    const nextStop = CHAPTER_STOPS.find((s) => s > scrollFloat + 0.12);
    const target = nextStop !== undefined ? nextStop : 6.00;
    setTargetScroll(target);
    audioManager.playPortClick(1100);
  });
}

const btnOut = document.getElementById('nav-btn-out');
if (btnOut) {
  btnOut.addEventListener('click', () => {
    const prevStops = CHAPTER_STOPS.filter((s) => s < scrollFloat - 0.12);
    const target = prevStops.length > 0 ? prevStops[prevStops.length - 1] : 0.00;
    setTargetScroll(target);
    audioManager.playPortClick(850);
  });
}

const navTrack = document.getElementById('nav-track');
if (navTrack) {
  navTrack.addEventListener('click', (e) => {
    const rect = navTrack.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setTargetScroll(ratio * 6.0);
    audioManager.playTransitionChime();
  });
}

const spatialBox = document.getElementById('spatial-nav-box');
if (spatialBox) {
  spatialBox.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY * 0.0018;
    setTargetScroll(Math.max(0, Math.min(6.0, scrollFloat + delta)));
  }, { passive: false });
}

const audioBtn = document.getElementById('audio-toggle-btn');
const audioLabel = document.getElementById('audio-label');
const audioDot = document.getElementById('audio-status-dot');

if (audioBtn) {
  audioBtn.addEventListener('click', () => {
    const isMuted = audioManager.toggleMute();
    if (audioLabel) audioLabel.textContent = isMuted ? 'AUDIO: OFF' : 'AUDIO: ON';
    if (audioDot) audioDot.style.background = isMuted ? '#666' : '#00CFFF';
  });
}

const odfCloseBtn = document.getElementById('odf-card-close');
if (odfCloseBtn) {
  odfCloseBtn.addEventListener('click', () => {
    hidePortInspection();
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────

initScroll();
animate();

// ── Resize ────────────────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.fov = window.innerWidth < window.innerHeight ? 78 : 70;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
