// main.js — Entry point & Master Story Orchestrator
// Unified camera controller driven by single source of truth: scrollFloat / storyProgress

import * as THREE from 'three';
import { initScroll, updateScroll, scrollFloat, storyProgress, setTargetScroll, setScrollLocked } from './src/scroll.js';
import { earthMesh, spaceSkyMesh, starFieldMesh, networkGroup, beamsGroup, updateChapter0 } from './src/chapters/chapter0-earth.js';
import { usaNodesGroup, updateChapter1 } from './src/chapters/chapter1-usa.js';
import { poleGroup, atmospherePlane, updateChapter2 } from './src/chapters/chapter2-pole.js';
import { signalParticles, updateChapter3 } from './src/chapters/chapter3-signal.js';
import { tunnel, fiberMaterial, updateChapter4 } from './src/chapters/chapter4-fiber.js';
import { updateChapter5 } from './src/chapters/chapter5-final.js';
import { networkChapterGroup, updateChapter6, handlePortRaycast, hidePortInspection } from './src/chapters/chapter6-network.js';
import { clamp, map, lerp } from './src/utils/math.js';
import { audioManager } from './src/utils/audio.js';
import { assetRegistry } from './src/utils/assets.js';
import { heroGateEngine } from './src/utils/hero-gate.js';
import {
  horizonQuad, groundPlane, hazePlane, dcFloor,
  envAmbient, envHemi,
  updateEnvironment, initEnvironment
} from './src/environment.js';

// ── Scene ─────────────────────────────────────────────────────────────────────

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x010307); // Pitch black deep space
scene.fog = new THREE.FogExp2(0x010307, 0.008); // Base atmospheric depth

// Environment system — horizon gradient, ground planes, narrative overlays
initEnvironment();
scene.add(horizonQuad);
scene.add(groundPlane);
scene.add(hazePlane);
scene.add(dcFloor);
scene.add(envAmbient);
scene.add(envHemi);

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

// Sun directional light — physical solar illumination
const sun = new THREE.DirectionalLight(0xfffaed, 2.5);
sun.position.set(12.0, 4.0, 10.0);
scene.add(sun);

// ── Scene Graph ───────────────────────────────────────────────────────────────

// 3D Space Skysphere Environment & Starfield (inside Three.js scene graph)
spaceSkyMesh.visible = false; // Retired in favor of dynamic per-chapter horizonQuad gradient
scene.add(spaceSkyMesh);
starFieldMesh.renderOrder = -99;
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
  // 0.00: Cinematic orbital perspective — curved Earth horizon framing lower frame, deep space starry expanse above
  { at: 0.00, pos: new THREE.Vector3(0.0, 1.45, 8.2),   target: new THREE.Vector3(0.0, 1.85, 0.0) },
  // 0.25: Orbital descent towards Atlantic corridor, transatlantic fiber awakening
  { at: 0.25, pos: new THREE.Vector3(0.2, 1.65, 7.2),   target: new THREE.Vector3(0.1, 1.95, 0.0) },
  // 0.50: ONE SIGNAL emerges in Eastern Atlantic, camera tracks across transatlantic corridor
  { at: 0.50, pos: new THREE.Vector3(0.7, 1.65, 5.8),   target: new THREE.Vector3(0.3, 1.85, 0.8) },
  // 0.75: Signal crosses into North America, camera tracking incoming photon
  { at: 0.75, pos: new THREE.Vector3(0.35, 1.6, 5.4),   target: new THREE.Vector3(0.08, 1.6, 2.3) },
  // 0.95: Touchdown at Texas destination hub (heroic close-up)
  { at: 0.95, pos: new THREE.Vector3(0.18, 1.88, 4.65), target: new THREE.Vector3(0.0, 1.84, 3.06) },
  // 1.35: Regional Western USA grid in focus (Texas, Dallas, Phoenix, Nevada, California)
  { at: 1.35, pos: new THREE.Vector3(0.25, 1.88, 4.35), target: new THREE.Vector3(0.0, 1.84, 2.9) },
  // 1.70: Signal leaves Texas, camera glides downward/forward into infrastructure scale
  { at: 1.70, pos: new THREE.Vector3(0.38, 2.80, 5.2),  target: new THREE.Vector3(0.20, 1.60, 1.8) },
  // 2.05: Camera tracks incoming signal toward ground infrastructure discovery horizon
  { at: 2.05, pos: new THREE.Vector3(0.95, 2.20, 4.4),  target: new THREE.Vector3(0.35, 1.80, 0.4) },
  // 2.35: Signal connects to optical junction box; camera frames tower in dramatic 3/4 low-angle
  { at: 2.35, pos: new THREE.Vector3(1.6, 2.4, 4.8),    target: new THREE.Vector3(0.4, 4.5, -0.6) },
  // 2.50: Signal connected; architectural inspection view of lattice, microwave drums, and cellular arrays
  { at: 2.50, pos: new THREE.Vector3(2.4, 3.8, 5.2),    target: new THREE.Vector3(0.4, 5.5, -0.6) },
  // 2.75: Structural ascent & orbit (microwave dishes, waveguide conduit surge)
  { at: 2.75, pos: new THREE.Vector3(1.6, 5.8, 4.0),    target: new THREE.Vector3(0.4, 6.8, -0.6) },
  // 3.00: Cellular sector array & crown framing
  { at: 3.00, pos: new THREE.Vector3(0.9, 8.4, 3.0),    target: new THREE.Vector3(0.4, 9.2, -0.6) },
  // 3.20: Crown optical emitter burst & top-down alignment
  { at: 3.20, pos: new THREE.Vector3(0.4, 10.8, 2.6),   target: new THREE.Vector3(0.4, 10.42, -1.5) },
  // 3.40: Alignment with particle stream / fiber entry axis
  { at: 3.40, pos: new THREE.Vector3(0.4, 10.42, 4.0),  target: new THREE.Vector3(0.4, 10.42, -10.0) },
  // 3.60: Milestone 1 — 3/4 Perspective Reveal of Loose-Tube Cable Cutaway (Jacket, Kevlar, FRP, 6 PBT Tubes)
  { at: 3.60, pos: new THREE.Vector3(0.4 + 1.8, 10.42 + 1.1, 7.5),  target: new THREE.Vector3(0.4, 10.42 - 0.2, 1.0) },
  // 3.90: Transition approach gliding towards the helical buffer tube bundle
  { at: 3.90, pos: new THREE.Vector3(0.4 + 1.1, 10.42 + 0.65, 4.8), target: new THREE.Vector3(0.4, 10.42 - 0.15, 1.2) },
  // 4.20: Milestone 2 — Macro Framing of Loose-Tube Assembly (6 colored PBT tubes, FRP rod, gel, fibers)
  { at: 4.20, pos: new THREE.Vector3(0.4 + 0.72, 10.42 + 0.42, 2.6), target: new THREE.Vector3(0.4, 10.42 - 0.1, 1.0) },
  // 4.40: Approaching the hero blue buffer tube stripped breakout
  { at: 4.40, pos: new THREE.Vector3(0.4 + 0.35, 10.42 + 0.20, 4.2), target: new THREE.Vector3(0.4, 10.42, 3.2) },
  // 4.60: Milestone 3 — Extreme Macro of Individual Glass Fiber (matching _9LM94eo...jpg: 250µm stripped coating & 125µm bare silica glass)
  { at: 4.60, pos: new THREE.Vector3(0.4 + 0.36, 10.42 + 0.18, 5.4), target: new THREE.Vector3(0.4, 10.42, 4.3) },
  // 4.80: Axial alignment with glass fiber core aperture
  { at: 4.80, pos: new THREE.Vector3(0.4, 10.42, 4.2), target: new THREE.Vector3(0.4, 10.42, -10.0) },
  // 5.00: Milestone 4 — Inside Optical Core Waveguide (Traveling Ruby Red #C41E3A / Electric Cyan pulse)
  { at: 5.00, pos: new THREE.Vector3(0.4, 10.42, -5.0), target: new THREE.Vector3(0.4, 10.42, -30.0) },
  // 5.15: Waveguide exit approaching demarcation
  { at: 5.15, pos: new THREE.Vector3(0.40, 10.42, -22.0), target: new THREE.Vector3(0.40, 10.42, -45.0) },
  // 5.25: 3/4 Macro framing of SFP28 die-cast transceiver cage & blue LC duplex port
  { at: 5.25, pos: new THREE.Vector3(0.40 + 0.55, 10.42 + 0.35, -45.0), target: new THREE.Vector3(0.40, 10.42, -50.5) },
  // 5.38: Tracing the yellow OS2 patch cord departing the transceiver boot
  { at: 5.38, pos: new THREE.Vector3(0.40 + 0.95, 10.42 + 0.10, -55.0), target: new THREE.Vector3(0.40 - 0.15, 10.42 - 0.30, -64.0) },
  // 5.50: Gliding past drooping catenary cable loops and black cable-management D-rings
  { at: 5.50, pos: new THREE.Vector3(0.40 + 1.25, 10.42 - 0.35, -67.0), target: new THREE.Vector3(0.40 - 0.10, 10.42 - 0.70, -78.0) },
  // 5.62: Inspection of white ABS splice organizer tray, racetrack loops, and fusion sleeves
  { at: 5.62, pos: new THREE.Vector3(0.40 + 0.95, 10.42 - 0.70, -74.0), target: new THREE.Vector3(0.40, 10.42 - 1.50, -80.0) },
  // 5.72: Ascending to frame 24x blue duplex LC bulkhead adapters and rack mounting ears
  { at: 5.72, pos: new THREE.Vector3(0.40 + 0.65, 10.42 + 0.45, -72.0), target: new THREE.Vector3(0.40, 10.42 + 0.20, -80.5) },
  // 5.80: Wide 3/4 architectural perspective of the complete 19-inch ODF equipment rack bay
  { at: 5.80, pos: new THREE.Vector3(0.40 + 0.35, 10.42 + 1.80, -68.0), target: new THREE.Vector3(0.40, 10.42 - 0.20, -82.0) },
  // 5.84: Phase 6D Stage 4 — Continuous Macro Pull revealing Regional Backbone Corridor
  { at: 5.84, pos: new THREE.Vector3(0.15, 3.80, -20.0), target: new THREE.Vector3(0.00, 1.20, -5.0) },
  // 5.88: Phase 7 Stage 1 — Natural Earth Curvature Re-entry & Orbital Node Ingress
  { at: 5.88, pos: new THREE.Vector3(0.00, 1.80, 5.0), target: new THREE.Vector3(0.00, 0.00, 0.0) },
  // 5.92: Phase 7 Stage 2 — Causal Radial Propagation across Global Network Mesh
  { at: 5.92, pos: new THREE.Vector3(0.00, 1.35, 9.2), target: new THREE.Vector3(0.00, 0.00, 0.0) },
  // 5.95: Phase 7 Stage 3 — Planetary Mesh Stabilization & Atmospheric Glow Peak
  { at: 5.95, pos: new THREE.Vector3(0.00, 1.35, 10.4), target: new THREE.Vector3(0.00, -0.25, 0.0) },
  // 6.00: Phase 7 Stage 4 — Final Planetary Culmination & Subordinate Engineering Metrics
  { at: 6.00, pos: new THREE.Vector3(0.00, 1.50, 11.2), target: new THREE.Vector3(0.00, -0.30, 0.0) }
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

  // Organic micro-breathe — removes robotic interpolation feel
  // Two overlapping sine waves at non-harmonic frequencies ensure the camera
  // never repeats the exact same position — it feels hand-held, not CG.
  const breatheT = performance.now() * 0.001;
  const breatheX = Math.sin(breatheT * 0.31) * 0.008 + Math.sin(breatheT * 0.47) * 0.004;
  const breatheY = Math.cos(breatheT * 0.29) * 0.006 + Math.cos(breatheT * 0.53) * 0.003;
  // Skip during macro fiber/cable shots where sub-pixel framing matters
  if (sf < 3.50 || sf > 4.90) {
    camera.position.x += breatheX;
    camera.position.y += breatheY;
  }

  camera.lookAt(currentLookAt);
}

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
  earthMesh.visible     = sf < 2.10 || sf > 5.82;
  usaNodesGroup.visible = sf < 2.10 || sf > 5.82;
  networkGroup.visible  = sf < 2.10 || sf > 5.82;
  // Tower Chapter Sun Dynamic Orbit & Color Shift (sf 1.70–3.20)
  // Sun moves from warm low angle (ground) to cold overhead (crown)
  if (sf >= 1.70 && sf <= 3.20) {
    const towerProgress = clamp(map(sf, 1.70, 3.20, 0, 1), 0, 1);
    const sunAngle = lerp(Math.PI * 0.15, Math.PI * 0.48, towerProgress);
    sun.position.set(
      Math.cos(sunAngle) * 12,
      Math.sin(sunAngle) * 8 + 2,
      10.0
    );
    // Color shifts from warm amber (ground) to cold blue-white (crown)
    sun.color.setRGB(
      lerp(1.0, 0.95, towerProgress),
      lerp(0.96, 0.98, towerProgress),
      lerp(0.88, 1.0,  towerProgress)
    );
  } else if (sf < 1.70) {
    sun.position.set(12.0, 4.0, 10.0);
    sun.color.setRGB(1.0, 0.98, 0.93);
  }

  // Environment: sky gradient, ground, haze, narrative overlays
  updateEnvironment(sf, scene);

  // Per-chapter atmospheric fog density
  // Target densities: space=0.006, tower=0.018, fiber=0.000, final=0.008
  let targetFogDensity = 0.006;
  if (sf < 0.95)       targetFogDensity = 0.006;  // ch0: space, wide open
  else if (sf < 1.70)  targetFogDensity = 0.007;  // ch1: USA grid
  else if (sf < 2.80)  targetFogDensity = 0.018;  // ch2: tower, atmospheric haze
  else if (sf < 3.30)  targetFogDensity = 0.010;  // ch3: signal coupling
  else if (sf < 4.50)  targetFogDensity = 0.000;  // ch4: fiber tunnel, self-lit
  else if (sf < 5.40)  targetFogDensity = 0.012;  // ch6: ODF rack bay
  else                 targetFogDensity = 0.008;  // ch5: planetary return
  // Lerp fog density each frame for smooth transitions
  if (scene.fog) {
    scene.fog.density += (targetFogDensity - scene.fog.density) * 0.04;
  }

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

  // Scrubber update
  const scrubber = document.getElementById('chapter-scrubber');
  if (scrubber) {
    scrubber.style.opacity = '1';
    scrubber.style.pointerEvents = 'auto';
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

  renderer.render(scene, camera);

  // Update Draw-0 Frosted Glass Portal Overlay
  heroGateEngine.update(time, renderer);
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
  if (e.target.closest('#chapter-scrubber') || e.target.closest('#odf-port-card')) {
    return;
  }
  if (scrollFloat >= 5.14 && scrollFloat <= 5.86) {
    raycaster.setFromCamera(mouseNdc, camera);
    handlePortRaycast(raycaster, true);
  }
});

// ── UI Controls & Chapter Quick-Jump Navigation ───────────────────────────────

document.querySelectorAll('.scrub-node').forEach((btn) => {
  btn.addEventListener('click', () => {
    const targetSf = parseFloat(btn.getAttribute('data-sf'));
    if (!isNaN(targetSf)) {
      setTargetScroll(targetSf);
    }
  });
});

const odfCloseBtn = document.getElementById('odf-card-close');
if (odfCloseBtn) {
  odfCloseBtn.addEventListener('click', () => {
    hidePortInspection();
  });
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
