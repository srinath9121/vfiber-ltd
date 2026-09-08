// environment.js — Scene atmosphere, ground context, and per-chapter environment
// This file owns everything that makes objects feel PLACED rather than floating:
//   - Sky gradient planes (not skybox — gradient quads that shift color per chapter)
//   - Ground/horizon context planes
//   - Volumetric fog color per chapter
//   - Ambient light color per chapter
//   - Scene-wide mood: space cold → tower dusk → fiber dark → ODF warm

import * as THREE from 'three';
import { clamp, map, lerp } from './utils/math.js';

// ── Horizon gradient quad (always behind everything) ─────────────────────────
// A full-screen quad rendered at max depth. Its shader transitions between
// chapter-specific gradient pairs so the background is NEVER pure black void.

const horizonMat = new THREE.ShaderMaterial({
  depthWrite: false,
  depthTest: false,
  side: THREE.DoubleSide,
  uniforms: {
    uTop:    { value: new THREE.Color(0x010307) },
    uBottom: { value: new THREE.Color(0x010307) },
    uMix:    { value: 0.0 }  // blend toward next pair
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      // Always render at far clip — behind everything
      gl_Position = vec4(position.xy, 1.0, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uTop;
    uniform vec3 uBottom;
    varying vec2 vUv;
    void main() {
      gl_FragColor = vec4(mix(uBottom, uTop, vUv.y), 1.0);
    }
  `
});

const horizonGeo = new THREE.PlaneGeometry(2, 2);
export const horizonQuad = new THREE.Mesh(horizonGeo, horizonMat);
horizonQuad.renderOrder = -999;
horizonQuad.frustumCulled = false;

// ── Chapter sky palettes ──────────────────────────────────────────────────────
// Each entry: { sf, top (zenith), bottom (horizon) }
// Interpolated exactly like camera keyframes

const SKY = [
  // ch0 Earth orbit: deep space — near-black with subtle blue zenith
  { sf: 0.00, top: new THREE.Color(0x00050f), bot: new THREE.Color(0x010712) },
  // ch0→1 signal crosses Atlantic: slightly warmer at horizon
  { sf: 0.75, top: new THREE.Color(0x00060e), bot: new THREE.Color(0x010a14) },
  // ch1 Texas grid: city glow on horizon — very faint amber warmth
  { sf: 1.20, top: new THREE.Color(0x000508), bot: new THREE.Color(0x060a08) },
  // ch2 tower approach: pre-dusk sky — deep navy top, warm steel-blue horizon
  { sf: 1.80, top: new THREE.Color(0x06090f), bot: new THREE.Color(0x0e1420) },
  // ch2 tower mid: dusk — dark teal sky, orange amber glow at horizon
  { sf: 2.35, top: new THREE.Color(0x050c18), bot: new THREE.Color(0x1a100a) },
  // ch2 tower crown: blue-hour — rich prussian blue sky
  { sf: 2.80, top: new THREE.Color(0x040d1f), bot: new THREE.Color(0x0a0d18) },
  // ch3 signal coupling: deep electric — near black, cyan tint
  { sf: 3.20, top: new THREE.Color(0x000608), bot: new THREE.Color(0x000a0d) },
  // ch4 fiber tunnel: total darkness — the inside of a cable
  { sf: 3.60, top: new THREE.Color(0x000000), bot: new THREE.Color(0x000000) },
  { sf: 4.80, top: new THREE.Color(0x000000), bot: new THREE.Color(0x000000) },
  // ch6 ODF rack bay: data center warmth — very dark warm grey
  { sf: 5.14, top: new THREE.Color(0x060508), bot: new THREE.Color(0x080608) },
  { sf: 5.60, top: new THREE.Color(0x050508), bot: new THREE.Color(0x080508) },
  // ch5 planetary return: back to space
  { sf: 5.85, top: new THREE.Color(0x00050f), bot: new THREE.Color(0x010712) },
  { sf: 6.00, top: new THREE.Color(0x00050f), bot: new THREE.Color(0x010712) },
];

// ── Ground/context planes per chapter ────────────────────────────────────────
// ch2 tower: Texas scrubland ground plane — subtle warm ochre
// ch6 ODF: data center raised floor grid

const groundMat = new THREE.MeshStandardMaterial({
  color: 0x0e0c0a,
  roughness: 0.95,
  metalness: 0.02,
  transparent: true,
  opacity: 0.0
});
const groundGeo = new THREE.PlaneGeometry(120, 120, 1, 1);
export const groundPlane = new THREE.Mesh(groundGeo, groundMat);
groundPlane.rotation.x = -Math.PI / 2;
groundPlane.position.set(0.40, -0.05, -5.0);
groundPlane.renderOrder = 1;

// Horizon depth haze plane — a soft vertical gradient card at distance
// Gives a sense of atmosphere thickness between camera and tower
const hazeMat = new THREE.MeshBasicMaterial({
  color: 0x050d1a,
  transparent: true,
  opacity: 0.0,
  side: THREE.FrontSide,
  depthWrite: false
});
const hazeGeo = new THREE.PlaneGeometry(200, 40);
export const hazePlane = new THREE.Mesh(hazeGeo, hazeMat);
hazePlane.position.set(0, 8, -30);
hazePlane.renderOrder = 0;

// Data center floor grid for ch6
const gridMat = new THREE.MeshStandardMaterial({
  color: 0x0a0a10,
  roughness: 0.80,
  metalness: 0.35,
  transparent: true,
  opacity: 0.0
});
const gridGeo = new THREE.PlaneGeometry(20, 20, 12, 12);
// Make it a wireframe-like look by using EdgesGeometry
export const dcFloor = new THREE.Mesh(gridGeo, gridMat);
dcFloor.rotation.x = -Math.PI / 2;
dcFloor.position.set(0.40, 6.5, -80.0);

// ── Ambient light that changes per chapter ────────────────────────────────────
// Exported so main.js can add it to scene and we update it here
export const envAmbient = new THREE.AmbientLight(0x050a14, 0.3);
export const envHemi = new THREE.HemisphereLight(
  0x0a0e1a, // sky color — cold space blue
  0x0a0800, // ground color — very dark warm
  0.4
);

// ── Per-chapter ambient/hemi targets ─────────────────────────────────────────
const AMB = [
  // ch0 space
  { sf: 0.00, skyCol: new THREE.Color(0x060810), gndCol: new THREE.Color(0x040404), int: 0.35 },
  // ch1 Texas
  { sf: 1.00, skyCol: new THREE.Color(0x060c10), gndCol: new THREE.Color(0x080604), int: 0.40 },
  // ch2 tower dusk
  { sf: 1.80, skyCol: new THREE.Color(0x0a1020), gndCol: new THREE.Color(0x100a04), int: 0.55 },
  // ch2 tower crown — blue hour
  { sf: 2.80, skyCol: new THREE.Color(0x060d1c), gndCol: new THREE.Color(0x06080c), int: 0.45 },
  // ch3 signal
  { sf: 3.20, skyCol: new THREE.Color(0x020608), gndCol: new THREE.Color(0x020408), int: 0.25 },
  // ch4 fiber — almost total dark
  { sf: 3.60, skyCol: new THREE.Color(0x010204), gndCol: new THREE.Color(0x010204), int: 0.12 },
  { sf: 4.80, skyCol: new THREE.Color(0x010204), gndCol: new THREE.Color(0x010204), int: 0.12 },
  // ch6 ODF — warm data center
  { sf: 5.14, skyCol: new THREE.Color(0x080810), gndCol: new THREE.Color(0x100808), int: 0.50 },
  // ch5 final — space return
  { sf: 5.85, skyCol: new THREE.Color(0x060810), gndCol: new THREE.Color(0x040404), int: 0.35 },
  { sf: 6.00, skyCol: new THREE.Color(0x060810), gndCol: new THREE.Color(0x040404), int: 0.35 },
];

// ── Narrative overlay system ──────────────────────────────────────────────────
// Text that appears OVER specific camera beats to tell the story
// These are injected into a single #narrative-overlay div

const NARRATIVE = [
  // ch0: Earth orbit — transatlantic signal appears
  {
    sfIn: 0.30, sfPeak: 0.50, sfOut: 0.75,
    position: 'top-center',
    lines: [
      { text: 'A signal leaves London.', size: 'lg', color: '#ffffff' },
      { text: '8,000 kilometres of ocean floor.', size: 'sm', color: 'rgba(255,255,255,0.6)' },
    ]
  },
  {
    sfIn: 0.75, sfPeak: 0.88, sfOut: 1.00,
    position: 'mid-left',
    lines: [
      { text: 'It arrives in Texas.', size: 'lg', color: '#ffffff' },
      { text: 'Someone in Hyderabad decided exactly how.', size: 'sm', color: '#00CFFF' },
    ]
  },
  // ch1: USA grid lights up
  {
    sfIn: 1.05, sfPeak: 1.20, sfOut: 1.50,
    position: 'bottom-center',
    lines: [
      { text: 'The permits that build America\'s networks.', size: 'lg', color: '#ffffff' },
    ]
  },
  {
    sfIn: 1.38, sfPeak: 1.50, sfOut: 1.78,
    position: 'bottom-center',
    lines: [
      { text: '50,000+ poles.', size: 'xl', color: '#00CFFF' },
      { text: 'Structurally certified from Hyderabad.', size: 'sm', color: 'rgba(255,255,255,0.65)' },
    ]
  },
  // ch2: tower approach — ground level
  {
    sfIn: 1.85, sfPeak: 2.10, sfOut: 2.35,
    position: 'mid-left',
    lines: [
      { text: 'Before a crew touches anything —', size: 'lg', color: '#ffffff' },
      { text: 'the math is already done.', size: 'lg', color: '#ffffff' },
    ]
  },
  // ch2: mid tower — what PLA actually is
  {
    sfIn: 2.38, sfPeak: 2.55, sfOut: 2.78,
    position: 'mid-left',
    lines: [
      { text: 'Wind load. Weight distribution.', size: 'md', color: 'rgba(255,255,255,0.85)' },
      { text: 'Structural stress thresholds.', size: 'md', color: 'rgba(255,255,255,0.85)' },
      { text: 'O-Calc Pro · Katapult Pro', size: 'sm', color: '#00CFFF' },
    ]
  },
  // ch2: tower crown — camera looking up at crown & beacon: text sits at top-center
  {
    sfIn: 2.82, sfPeak: 2.95, sfOut: 3.18,
    position: 'top-center',
    lines: [
      { text: '20,000+ structures certified.', size: 'lg', color: '#ffffff' },
      { text: 'Zero field crews called back.', size: 'md', color: '#C41E3A' },
    ]
  },
  // ch3: signal transition — cinematic center moment
  {
    sfIn: 3.12, sfPeak: 3.22, sfOut: 3.44,
    position: 'bottom-center',
    lines: [
      { text: 'THIS IS THE MOMENT.', size: 'xl', color: '#ffffff' },
      { text: 'Ruby to cyan. Electrical to optical.', size: 'sm', color: 'rgba(255,255,255,0.7)' },
      { text: 'The signal enters the glass.', size: 'sm', color: '#00CFFF' },
    ]
  },
  // ch4: inside the glass
  {
    sfIn: 4.22, sfPeak: 4.38, sfOut: 4.58,
    position: 'bottom-center',
    lines: [
      { text: 'Single-mode. Loose-tube. Gel-filled.', size: 'md', color: 'rgba(255,255,255,0.85)' },
      { text: 'We design the route.', size: 'md', color: '#ffffff' },
      { text: 'We draft the permit.', size: 'md', color: '#ffffff' },
      { text: 'Crews build from our package.', size: 'sm', color: '#00CFFF' },
    ]
  },
  // ch4→ch6: waveguide travel
  {
    sfIn: 4.82, sfPeak: 5.00, sfOut: 5.12,
    position: 'bottom-center',
    lines: [
      { text: 'Light. Traveling at 200,000 km/s.', size: 'lg', color: '#ffffff' },
      { text: 'Through glass we designed.', size: 'sm', color: '#00CFFF' },
    ]
  },
  // ch6: ODF rack
  {
    sfIn: 5.20, sfPeak: 5.35, sfOut: 5.55,
    position: 'bottom-center',
    lines: [
      { text: 'From design file to live network.', size: 'lg', color: '#ffffff' },
    ]
  },
  {
    sfIn: 5.44, sfPeak: 5.58, sfOut: 5.75,
    position: 'bottom-center',
    lines: [
      { text: 'Permitting blueprints.', size: 'md', color: 'rgba(255,255,255,0.8)' },
      { text: 'Splice plans. Splicing documentation.', size: 'md', color: 'rgba(255,255,255,0.8)' },
      { text: 'Accurate enough that crews don\'t call back.', size: 'sm', color: '#C41E3A' },
    ]
  },
];

// Size map
const sizeMap = { xl: '3.2rem', lg: '2.0rem', md: '1.3rem', sm: '0.9rem' };

// Inject narrative overlay div into DOM
function injectNarrativeDOM() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('narrative-overlay')) return;
  const div = document.createElement('div');
  div.id = 'narrative-overlay';
  div.style.cssText = `
    position: fixed;
    bottom: 12vh;
    left: 50%;
    transform: translateX(-50%);
    z-index: 200;
    pointer-events: none;
    text-align: center;
    width: 80vw;
    max-width: 760px;
    opacity: 0;
    transition: opacity 0.35s ease;
    font-family: 'Space Grotesk', sans-serif;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  `;
  document.body.appendChild(div);
}

// ── Chapter Transition Flash ──────────────────────────────────────────────────
const CH_BOUNDARIES = [0.95, 1.70, 2.80, 3.30, 3.60, 5.14, 5.85];
let _lastSf = 0;

function fireChapterFlash() {
  if (typeof document === 'undefined') return;
  const flash = document.getElementById('chapter-flash');
  if (!flash) return;
  flash.style.opacity = '0.12';
  setTimeout(() => { flash.style.opacity = '0'; }, 120);
}

let _lastNarrativeIdx = -1;

function updateNarrative(sf) {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('narrative-overlay');
  if (!el) return;

  let found = null;
  let foundIdx = -1;
  for (let i = 0; i < NARRATIVE.length; i++) {
    const n = NARRATIVE[i];
    if (sf >= n.sfIn && sf <= n.sfOut) { found = n; foundIdx = i; break; }
  }

  if (!found) {
    el.style.opacity = '0';
    _lastNarrativeIdx = -1;
    return;
  }

  // Rebuild DOM only when switching to a new narrative beat
  if (foundIdx !== _lastNarrativeIdx) {
    const positions = {
      'bottom-center': 'bottom:12vh; left:50%; transform:translateX(-50%); top:auto; right:auto; text-align:center; align-items:center;',
      'top-center':    'top:12vh;    left:50%; transform:translateX(-50%); bottom:auto; right:auto; text-align:center; align-items:center;',
      'mid-left':      'top:50%;     left:6vw; transform:translateY(-50%); bottom:auto; right:auto; text-align:left; align-items:flex-start;',
      'mid-right':     'top:50%;     right:6vw; transform:translateY(-50%); bottom:auto; left:auto; text-align:right; align-items:flex-end;',
    };

    const baseStyles = `
      position: fixed;
      z-index: 200;
      pointer-events: none;
      width: auto;
      max-width: 680px;
      opacity: 0;
      transition: opacity 0.35s ease;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    `;
    const posKey = found.position || 'bottom-center';
    el.style.cssText = baseStyles + (positions[posKey] || positions['bottom-center']);

    el.innerHTML = found.lines.map(l => {
      const isHero = l.size === 'xl' || l.size === 'lg';
      const font = isHero ? "'Playfair Display', serif" : "'Space Grotesk', monospace";
      const spacing = l.size === 'xl' ? '0.04em' : isHero ? '0.02em' : '0.08em';
      return `
      <div style="
        font-family: ${font};
        font-size: ${sizeMap[l.size] || '1.2rem'};
        color: ${l.color};
        font-weight: ${isHero ? '700' : '400'};
        letter-spacing: ${spacing};
        text-shadow: 0 2px 24px rgba(0,0,0,0.95), 0 0 40px rgba(0,0,0,0.8);
        line-height: 1.25;
      ">${l.text}</div>
    `;
    }).join('');
    _lastNarrativeIdx = foundIdx;
  }

  // Fade in/out around sfPeak
  const { sfIn, sfPeak, sfOut } = found;
  const fadeIn  = clamp((sf - sfIn)   / Math.max(sfPeak - sfIn,  0.001), 0, 1);
  const fadeOut = clamp((sfOut - sf)  / Math.max(sfOut - sfPeak, 0.001), 0, 1);
  const op = Math.min(fadeIn, fadeOut);
  el.style.opacity = String(op);
}

// ── Main update called every frame from main.js ───────────────────────────────
export function updateEnvironment(sf, scene) {
  // Chapter transition white flash on boundary crossing
  const crossed = CH_BOUNDARIES.find(b =>
    (_lastSf < b && sf >= b) || (_lastSf > b && sf <= b)
  );
  if (crossed) fireChapterFlash();
  _lastSf = sf;
  // 1. Sky gradient
  let fromSky = SKY[0], toSky = SKY[SKY.length - 1];
  for (let i = 0; i < SKY.length - 1; i++) {
    if (sf >= SKY[i].sf && sf <= SKY[i + 1].sf) { fromSky = SKY[i]; toSky = SKY[i + 1]; break; }
  }
  const skyT = fromSky.sf === toSky.sf ? 0 :
    clamp((sf - fromSky.sf) / (toSky.sf - fromSky.sf), 0, 1);
  const eT = skyT * skyT * (3 - 2 * skyT);
  horizonMat.uniforms.uTop.value.lerpColors(fromSky.top, toSky.top, eT);
  horizonMat.uniforms.uBottom.value.lerpColors(fromSky.bot, toSky.bot, eT);

  // 2. Ambient/hemi light
  let fromA = AMB[0], toA = AMB[AMB.length - 1];
  for (let i = 0; i < AMB.length - 1; i++) {
    if (sf >= AMB[i].sf && sf <= AMB[i + 1].sf) { fromA = AMB[i]; toA = AMB[i + 1]; break; }
  }
  const ambT = fromA.sf === toA.sf ? 0 :
    clamp((sf - fromA.sf) / (toA.sf - fromA.sf), 0, 1);
  const eA = ambT * ambT * (3 - 2 * ambT);
  envHemi.color.lerpColors(fromA.skyCol, toA.skyCol, eA);
  envHemi.groundColor.lerpColors(fromA.gndCol, toA.gndCol, eA);
  envHemi.intensity = lerp(fromA.int, toA.int, eA);

  // 3. Ground plane — visible during tower chapter (sf 1.7 → 3.1)
  const gndOp = clamp(map(sf, 1.70, 2.10, 0, 1), 0, 1) *
                clamp(map(sf, 2.90, 3.15, 1, 0), 0, 1);
  groundMat.opacity = gndOp * 0.85;
  groundPlane.visible = gndOp > 0.001;

  // Ground color shifts from dark ochre (dusk) to deep navy (night)
  const gndHue = clamp(map(sf, 1.70, 2.80, 0, 1), 0, 1);
  groundMat.color.setHex(gndHue < 0.5 ? 0x0e0c08 : 0x080a10);

  // 4. Haze plane — gives tower a sense of depth/atmosphere
  const hazeOp = clamp(map(sf, 1.80, 2.20, 0, 1), 0, 1) *
                 clamp(map(sf, 2.85, 3.10, 1, 0), 0, 1);
  hazeMat.opacity = hazeOp * 0.45;
  hazePlane.visible = hazeOp > 0.001;

  // 5. DC floor — visible during ODF chapter
  const dcOp = clamp(map(sf, 5.14, 5.30, 0, 1), 0, 1) *
               clamp(map(sf, 5.76, 5.85, 1, 0), 0, 1);
  gridMat.opacity = dcOp * 0.70;
  dcFloor.visible = dcOp > 0.001;

  // 6. Narrative overlay
  updateNarrative(sf);
}

// ── Init — call once from main.js ─────────────────────────────────────────────
export function initEnvironment() {
  injectNarrativeDOM();
}
