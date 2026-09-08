// main.js — Entry point & Master Story Orchestrator
// Unified camera controller driven by single source of truth: scrollFloat / storyProgress

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { initScroll, updateScroll, scrollFloat, storyProgress, setTargetScroll, setScrollLocked } from './src/scroll.js';
import { earthMesh, spaceSkyMesh, starFieldMesh, networkGroup, beamsGroup, updateChapter0 } from './src/chapters/chapter0-earth.js';
import { usaNodesGroup, updateChapter1 } from './src/chapters/chapter1-usa.js';
import { poleGroup, atmospherePlane, updateChapter2, disposeChapter2 } from './src/chapters/chapter2-pole.js';
import { signalParticles, updateChapter3 } from './src/chapters/chapter3-signal.js';
import { updateChapter5 } from './src/chapters/chapter5-final.js';
import { clamp, map, lerp } from './src/utils/math.js';
import { audioManager } from './src/utils/audio.js';
import { assetRegistry } from './src/utils/assets.js';
import {
  horizonQuad, groundPlane, hazePlane,
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
scene.add(envAmbient);
scene.add(envHemi);

// ── Camera ────────────────────────────────────────────────────────────────────

const initialFov = window.innerWidth < window.innerHeight ? 68 : 48;
const camera = new THREE.PerspectiveCamera(initialFov, window.innerWidth / window.innerHeight, 0.04, 1000);
camera.position.set(0.0, 0.80, 13.5);
camera.lookAt(0.0, 0.0, 0.0);

// ── Renderer ──────────────────────────────────────────────────────────────────

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
(document.getElementById('app') || document.body).appendChild(renderer.domElement);

// ── Post-Processing Pipeline (UnrealBloom + FXAA) ─────────────────────────────
const composer = new EffectComposer(renderer);
composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
composer.addPass(new RenderPass(scene, camera));

const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.45,   // strength — subtle, not Instagram
  0.6,    // radius
  0.88    // threshold — only emissive surfaces and the fiber core light up
);
composer.addPass(bloom);

const fxaa = new ShaderPass(FXAAShader);
const pr = Math.min(window.devicePixelRatio, 2);
fxaa.material.uniforms.resolution.value.set(
  1 / (window.innerWidth * pr), 1 / (window.innerHeight * pr)
);
composer.addPass(fxaa);

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

// ── Master Camera Choreography ────────────────────────────────────────────────
// The camera is the storyteller. A single coherent controller interpolates both
// camera position and lookAt target across all chapters.

const CAM = [
  // 0.00: Cinematic orbital perspective — complete Earth sphere framed with surrounding deep space
  { at: 0.00, pos: new THREE.Vector3(0.0, 0.80, 13.5), target: new THREE.Vector3(0.0, 0.0, 0.0) },
  // 0.25: Intermediate orbital descent towards Atlantic corridor, transatlantic fiber awakening
  { at: 0.25, pos: new THREE.Vector3(0.1, 1.20, 10.4), target: new THREE.Vector3(0.05, 0.9, 0.0) },
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
  // 3.40: Ascending above the tower into the empty gap (tower fades out)
  { at: 3.40, pos: new THREE.Vector3(0.4, 13.0, 4.8),   target: new THREE.Vector3(0.2, 9.0, -1.5) },
  // 4.00: Empty space gap — quiet clean cosmos ready for custom info
  { at: 4.00, pos: new THREE.Vector3(0.0, 15.0, 6.5),   target: new THREE.Vector3(0.0, 9.0, -2.0) },
  // 4.60: Empty space gap — gentle drift through pure stars
  { at: 4.60, pos: new THREE.Vector3(0.0, 15.0, 8.0),   target: new THREE.Vector3(0.0, 9.0, -2.0) },
  // 5.20: Transition from gap into finale
  { at: 5.20, pos: new THREE.Vector3(0.0, 14.5, 9.0),   target: new THREE.Vector3(0.0, 9.0, -2.0) },
  // 6.00: Final culmination: Contact Us card framed in pristine deep space
  { at: 6.00, pos: new THREE.Vector3(0.0, 14.0, 9.5),   target: new THREE.Vector3(0.0, 9.0, -2.0) }
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
    if (sf >= 2.0 && sf <= 3.2) {
      const portraitDistFactor = (1.0 / camera.aspect) * 0.35;
      const viewDir = camTargetPos.clone().sub(camTargetLook).normalize();
      camTargetPos.add(viewDir.multiplyScalar(portraitDistFactor));
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
  const isMobileDevice = window.innerWidth < 768;
  const breatheScale = isMobileDevice ? 0.3 : 1.0;

  const breatheT = performance.now() * 0.001;
  const breatheX = (Math.sin(breatheT * 0.31) * 0.008 + Math.sin(breatheT * 0.47) * 0.004) * breatheScale;
  const breatheY = (Math.cos(breatheT * 0.29) * 0.006 + Math.cos(breatheT * 0.53) * 0.003) * breatheScale;
  camera.position.x += breatheX;
  camera.position.y += breatheY;

  camera.lookAt(currentLookAt);
}

// ── Animate Loop ──────────────────────────────────────────────────────────────

let _ch2Disposed = false;

function animate() {
  requestAnimationFrame(animate);

  updateScroll();
  const sf = scrollFloat;
  const time = performance.now() * 0.001;

  // Master camera update across all chapters
  updateCamera(sf);

  // Earth visual dominance & opacity choreography
  // Earth is only visible during initial arrival (sf < 2.10); after the tower it is completely hidden
  let earthOpacity = 0.0;
  if (sf < 1.70) {
    earthOpacity = 1.0;
  } else if (sf <= 2.10) {
    earthOpacity = clamp(map(sf, 1.70, 2.10, 1.0, 0.0), 0.0, 1.0);
  } else {
    earthOpacity = 0.0;
  }

  if (earthMesh.material.uniforms && earthMesh.material.uniforms.uOpacity) {
    earthMesh.material.uniforms.uOpacity.value = earthOpacity;
  }
  earthMesh.renderOrder = 0;

  // After the tower, Earth and orbital nodes are never shown again
  earthMesh.visible     = sf < 2.10;
  usaNodesGroup.visible = sf < 2.10;
  networkGroup.visible  = sf < 2.10;

  // Tower Chapter Sun Dynamic Orbit & Color Shift (sf 1.70–3.20)
  if (sf >= 1.70 && sf <= 3.20) {
    const towerProgress = clamp(map(sf, 1.70, 3.20, 0, 1), 0, 1);
    const sunAngle = lerp(Math.PI * 0.15, Math.PI * 0.48, towerProgress);
    sun.position.set(
      Math.cos(sunAngle) * 12,
      Math.sin(sunAngle) * 8 + 2,
      10.0
    );
    sun.color.setRGB(
      lerp(1.0, 0.95, towerProgress),
      lerp(0.96, 0.98, towerProgress),
      lerp(0.88, 1.0,  towerProgress)
    );
  } else if (sf < 1.70 || sf > 3.20) {
    sun.position.set(12.0, 4.0, 10.0);
    sun.color.setRGB(1.0, 0.98, 0.93);
  }

  // Environment: sky gradient, ground, haze, narrative overlays
  updateEnvironment(sf, scene);

  // Per-chapter atmospheric fog density
  let targetFogDensity = 0.006;
  if (sf < 0.95)       targetFogDensity = 0.006;  // space, wide open
  else if (sf < 1.70)  targetFogDensity = 0.007;  // USA grid
  else if (sf < 2.80)  targetFogDensity = 0.018;  // tower, atmospheric haze
  else                 targetFogDensity = 0.006;  // clean cosmic space
  if (scene.fog) {
    scene.fog.density += (targetFogDensity - scene.fog.density) * 0.04;
  }

  // Chapter lifecycle updates
  updateChapter0(sf, time, camera);
  updateChapter1(sf, time);
  updateChapter2(sf);
  updateChapter3(sf, camera);
  updateChapter5(sf, camera, earthMesh, null, networkGroup, beamsGroup);

  // Environmental audio orchestrator update
  audioManager.update(sf);

  // Dispose chapter 2 assets when well past them
  if (sf > 4.50 && !_ch2Disposed) {
    disposeChapter2();
    _ch2Disposed = true;
  }

  // Scrubber update
  const scrubber = document.getElementById('chapter-scrubber');
  if (scrubber) {
    scrubber.style.opacity = '1';
    scrubber.style.pointerEvents = 'auto';
  }

  // Mobile read-only HUD protection
  if (window.innerWidth < 768) {
    const el = document.getElementById('chapter2-text');
    if (el) el.style.pointerEvents = 'none';
  }

  // Sync scrubber active node (About us, Services, Contact us)
  document.querySelectorAll('.scrub-node').forEach((btn) => {
    const section = btn.getAttribute('data-section');
    let isActive = false;
    if (section === 'about') {
      isActive = (sf < 1.65);
    } else if (section === 'services') {
      isActive = (sf >= 1.65 && sf < 4.80);
    } else if (section === 'contact') {
      isActive = (sf >= 4.80);
    }
    if (isActive) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Early dismiss scroll navigation guide if user begins scrolling
  const navGuide = document.getElementById('scroll-nav-guide');
  if (navGuide && !navGuide.classList.contains('dismissed') && sf > 0.08) {
    navGuide.classList.add('dismissed');
    setTimeout(() => { navGuide.style.display = 'none'; }, 900);
  }

  composer.render();
}

// ── UI Controls & Chapter Quick-Jump Navigation ───────────────────────────────

document.querySelectorAll('.scrub-node').forEach((btn) => {
  btn.addEventListener('click', () => {
    const targetSf = parseFloat(btn.getAttribute('data-sf'));
    if (!isNaN(targetSf)) {
      setTargetScroll(targetSf);
    }
  });
});

const globalHeader = document.getElementById('global-header');
if (globalHeader) {
  globalHeader.addEventListener('click', () => {
    setTargetScroll(0);
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────

initScroll();
animate();

// Auto-dismiss the scroll navigation guide after 6 seconds (5-7 seconds)
const navGuide = document.getElementById('scroll-nav-guide');
if (navGuide) {
  setTimeout(() => {
    navGuide.classList.add('dismissed');
    setTimeout(() => { navGuide.style.display = 'none'; }, 900);
  }, 6000);
}

// ── Resize ────────────────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.fov = window.innerWidth < window.innerHeight ? 74 : 65;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  composer.setSize(window.innerWidth, window.innerHeight);
  composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const newPr = Math.min(window.devicePixelRatio, 2);
  fxaa.material.uniforms.resolution.value.set(
    1 / (window.innerWidth * newPr),
    1 / (window.innerHeight * newPr)
  );
});
