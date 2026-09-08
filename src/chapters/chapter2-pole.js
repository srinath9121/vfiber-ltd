// chapter2-pole.js — Realistic Telecom Infrastructure Reconstruction (Phase 3)
// img2threejs procedural reconstruction based on primary reference: public/references/1000198366.jpg
// Features: 4-legged tapered steel lattice tower, 9-tier structural K/X-braces, multi-tier microwave drum dishes,
// 3-sector cellular panel antennas with mechanical tilt, central cable waveguide tray, aviation beacon,
// and physical signal coupling junction receiving the carrier signal protagonist.

import * as THREE from 'three';
import { clamp, map } from '../utils/math.js';
import { ImageTransformShader } from '../shaders/shaders.js';
import { assetRegistry } from '../utils/assets.js';

// ── Infrastructure Master Group ───────────────────────────────────────────────

export const poleGroup = new THREE.Group();
poleGroup.renderOrder = 2;

// ── PBR Engineering Materials (Phase 10 — Grounded in tower 1.jpg, tower 3.jpg, tower 4.jpg) ─
// Galvanized steel in real conditions shows a warm grey with slight blue-silver sheen,
// micro-roughness from hot-dip zinc crystallization, and non-uniform specular highlights.

const steelMat = new THREE.MeshStandardMaterial({
  color: 0xa8b0bc,       // Bright galvanized zinc silver (ref: tower 3.jpg close-up — steel is BRIGHT)
  roughness: 0.48,       // Hot-dip zinc spangle — slight texture but still reflective
  metalness: 0.88,
  envMapIntensity: 0.7   // Galvanized faces catch environmental light
});

const baseLegRedMat = new THREE.MeshStandardMaterial({
  color: 0xb52d12,       // Weathered safety-red aviation paint (ref: tower 1.jpg base tier)
  roughness: 0.62,       // Paint surface oxidation creates higher roughness than bare steel
  metalness: 0.35        // Paint over steel — mostly dielectric surface, low metalness
});

const darkCoaxMat = new THREE.MeshStandardMaterial({
  color: 0x1a1e24,       // UV-weathered black PVC jacket (ref: tower 4.jpg cable runs)
  roughness: 0.78,       // Matte rubberized PVC surface — high roughness, almost no specular
  metalness: 0.08        // Pure dielectric — rubber/PVC has near-zero metalness
});

const clampMat = new THREE.MeshStandardMaterial({
  color: 0x9ca3af,       // Bright stainless steel clamp faces (ref: tower 4.jpg)
  roughness: 0.30,       // Machine-stamped stainless — smoother than galvanized legs
  metalness: 0.94        // High metalness — clean stainless reflections
});

const darkHardwareMat = new THREE.MeshStandardMaterial({
  color: 0x222832,
  roughness: 0.65,
  metalness: 0.88
});

const radomeMat = new THREE.MeshStandardMaterial({
  color: 0xf0f3f6,       // Crisp bright off-white fiberglass composite (ref: tower 2.jpg & 5.jpg — dish faces are bright white)
  roughness: 0.38,       // Subtle fiberglass gel-coat texture
  metalness: 0.04        // Dielectric composite
});

const dishShroudMat = new THREE.MeshStandardMaterial({
  color: 0x333b45,       // Weathered industrial aluminium shroud with riveted rim
  roughness: 0.52,
  metalness: 0.72,
  side: THREE.DoubleSide
});

const panelMat = new THREE.MeshStandardMaterial({
  color: 0xb8c0ca,       // Weathered white/grey ABS radome housing (ref: tower 1.jpg sector panels)
  roughness: 0.48,       // Outdoor-aged ABS develops micro-texture
  metalness: 0.10        // Plastic radome — dielectric
});

const concreteFootingMat = new THREE.MeshStandardMaterial({
  color: 0x3d434a,       // Poured concrete pier — slightly warmer grey
  roughness: 0.92,       // Cast concrete has very high roughness
  metalness: 0.04        // Concrete is almost pure dielectric
});

// ── Dimensional Specifications (from reference 1000198366.jpg) ────────────────

const towerHeight = 9.0;
const baseWidth   = 0.90; // half-width at ground plane
const topWidth    = 0.22; // half-width at crown platform
const tiers       = 9;    // structural tier levels

// 1. Concrete Foundation Footings (4 corner piers)
for (let c = 0; c < 4; c++) {
  const angle = (c / 4) * Math.PI * 2 + Math.PI / 4;
  const x = Math.cos(angle) * baseWidth;
  const z = Math.sin(angle) * baseWidth;

  const pier = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.25, 0.16),
    concreteFootingMat
  );
  pier.position.set(x, 0.125, z);
  poleGroup.add(pier);
}

// 2. Four Corner Tapered Structural Steel Legs (Safety-red ground tier transitioning to galvanized steel)
for (let corner = 0; corner < 4; corner++) {
  const angle = (corner / 4) * Math.PI * 2 + Math.PI / 4;
  const bx = Math.cos(angle) * baseWidth;
  const bz = Math.sin(angle) * baseWidth;
  const tx = Math.cos(angle) * topWidth;
  const tz = Math.sin(angle) * topWidth;

  const legSegments = 16;
  for (let s = 0; s < legSegments; s++) {
    const t0 = s / legSegments;
    const t1 = (s + 1) / legSegments;
    const y0 = t0 * towerHeight;
    const y1 = t1 * towerHeight;
    const x0 = bx + (tx - bx) * t0;
    const z0 = bz + (tz - bz) * t0;
    const x1 = bx + (tx - bx) * t1;
    const z1 = bz + (tz - bz) * t1;

    const segHeight = y1 - y0;
    const legRadius = 0.034 * (1.0 - t0 * 0.45); // Tapers from 0.034m to 0.019m

    // Bottom tier uses safety-red aviation/structural paint, upper tiers use galvanized steel
    const legMatToUse = (s < 2) ? baseLegRedMat : steelMat;

    const legMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(legRadius * 0.9, legRadius, segHeight, 6),
      legMatToUse
    );
    legMesh.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);

    // Orient along leg trajectory
    const dir = new THREE.Vector3(x1 - x0, y1 - y0, z1 - z0).normalize();
    legMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    poleGroup.add(legMesh);
  }
}

// 3. Multi-Tier Lattice Framework: Horizontal Chord Rings & Diagonal X-Braces
const braceLinePts = [];

for (let level = 0; level <= tiers; level++) {
  const t = level / tiers;
  const y = t * towerHeight;
  const w = baseWidth + (topWidth - baseWidth) * t;

  // 4 corner coordinates at this elevation
  const corners = [];
  for (let c = 0; c < 4; c++) {
    const angle = (c / 4) * Math.PI * 2 + Math.PI / 4;
    corners.push(new THREE.Vector3(Math.cos(angle) * w, y, Math.sin(angle) * w));
  }

  // Horizontal perimeter chords
  for (let c = 0; c < 4; c++) {
    const next = (c + 1) % 4;
    braceLinePts.push(corners[c].x, corners[c].y, corners[c].z);
    braceLinePts.push(corners[next].x, corners[next].y, corners[next].z);
  }

  // Diagonal X-Braces between this level and the next
  if (level < tiers) {
    const tNext = (level + 1) / tiers;
    const yNext = tNext * towerHeight;
    const wNext = baseWidth + (topWidth - baseWidth) * tNext;

    for (let c = 0; c < 4; c++) {
      const next = (c + 1) % 4;
      const angleA = (c / 4) * Math.PI * 2 + Math.PI / 4;
      const angleB = (next / 4) * Math.PI * 2 + Math.PI / 4;

      const pA  = new THREE.Vector3(Math.cos(angleA) * w,     y,     Math.sin(angleA) * w);
      const pB  = new THREE.Vector3(Math.cos(angleB) * w,     y,     Math.sin(angleB) * w);
      const pA1 = new THREE.Vector3(Math.cos(angleA) * wNext, yNext, Math.sin(angleA) * wNext);
      const pB1 = new THREE.Vector3(Math.cos(angleB) * wNext, yNext, Math.sin(angleB) * wNext);

      // Diagonal 1: pA -> pB1
      braceLinePts.push(pA.x, pA.y, pA.z, pB1.x, pB1.y, pB1.z);
      // Diagonal 2: pB -> pA1
      braceLinePts.push(pB.x, pB.y, pB.z, pA1.x, pA1.y, pA1.z);
    }
  }
}

const braceGeo = new THREE.BufferGeometry();
braceGeo.setAttribute('position', new THREE.Float32BufferAttribute(braceLinePts, 3));
export const braceMesh = new THREE.LineSegments(
  braceGeo,
  new THREE.LineBasicMaterial({ color: 0x5c636e, transparent: true, opacity: 0.88 }) // Warm zinc brace tone (ref: tower 1.jpg)
);
poleGroup.add(braceMesh);

// 4. Central Waveguide Ladder & Cable Conduit (runs from base to crown)
const cableTrayGeom = new THREE.BoxGeometry(0.08, towerHeight, 0.05);
const cableTrayMesh = new THREE.Mesh(cableTrayGeom, darkHardwareMat);
cableTrayMesh.position.set(0, towerHeight / 2, 0);
poleGroup.add(cableTrayMesh);

// Ladder rungs (every 0.35m)
const rungGeom = new THREE.CylinderGeometry(0.007, 0.007, 0.28, 6);
rungGeom.rotateZ(Math.PI / 2);
for (let ry = 0.4; ry < towerHeight - 0.2; ry += 0.35) {
  const rung = new THREE.Mesh(rungGeom, steelMat);
  rung.position.set(0, ry, 0.08);
  poleGroup.add(rung);
}

// Coaxial Cable Riser Array (8 black coaxial cables clamped along spine — Reference 1000198367.jpg)
const coaxRadius = 0.008;
const coaxCableGeom = new THREE.CylinderGeometry(coaxRadius, coaxRadius, towerHeight - 0.4, 8);
for (let i = 0; i < 8; i++) {
  const offsetX = -0.035 + (i % 4) * 0.024;
  const offsetZ = (i < 4) ? -0.03 : -0.015;
  const coaxMesh = new THREE.Mesh(coaxCableGeom, darkCoaxMat);
  coaxMesh.position.set(offsetX, towerHeight / 2, offsetZ);
  poleGroup.add(coaxMesh);
}

// Stainless Steel Coaxial Clamps (every 0.70m along the cable tray)
const clampGeom = new THREE.BoxGeometry(0.09, 0.018, 0.04);
for (let cy = 0.6; cy < towerHeight - 0.5; cy += 0.70) {
  const cableClamp = new THREE.Mesh(clampGeom, clampMat);
  cableClamp.position.set(0, cy, -0.022);
  poleGroup.add(cableClamp);
}

// 5. Microwave Parabolic Drum Antennas (Photographically reconstructed from tower 2.jpg & tower 5.jpg)
// Features: deep cylindrical weather shroud, projecting perimeter rim flange, flat planar radome face,
// central waveguide feed-horn cap, and tapered rear parabolic reflector bowl.
function createMicrowaveDrum(radius, depth, y, angleOffset) {
  const drumGroup = new THREE.Group();

  // Cylindrical protective aluminium shroud / cowl
  const shroud = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, depth, 24, 1, true),
    dishShroudMat
  );
  shroud.rotation.x = Math.PI / 2;
  drumGroup.add(shroud);

  // Outer shroud perimeter rim flange collar (ref: tower 5.jpg close-up rim)
  const rimFlange = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 1.01, radius * 0.035, 8, 24),
    clampMat
  );
  rimFlange.position.z = depth * 0.5;
  drumGroup.add(rimFlange);

  // Flat planar composite front radome face disc (ref: tower 2.jpg — flat bright white face)
  const radomeFace = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.98, radius * 0.98, 0.015, 24),
    radomeMat
  );
  radomeFace.rotation.x = Math.PI / 2;
  radomeFace.position.z = depth * 0.48;
  drumGroup.add(radomeFace);

  // Central feed-horn waveguide cap (ref: tower 2.jpg feedhorn protruding in center)
  const feedHorn = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.08, radius * 0.09, 0.04, 12),
    darkHardwareMat
  );
  feedHorn.rotation.x = Math.PI / 2;
  feedHorn.position.z = depth * 0.48 + 0.02;
  drumGroup.add(feedHorn);

  // Tapered rear parabolic reflector bowl (ref: tower 5.jpg rear bowl geometry)
  const rearBowl = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.98, radius * 0.32, depth * 0.6, 24, 1, false),
    dishShroudMat
  );
  rearBowl.rotation.x = -Math.PI / 2;
  rearBowl.position.z = -depth * 0.2;
  drumGroup.add(rearBowl);

  // Rear mounting bracket & standoff pipe arm
  const armWidth = baseWidth + (topWidth - baseWidth) * (y / towerHeight);
  const mountDist = armWidth + radius * 0.65;

  const bracket = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.12, 0.14),
    darkHardwareMat
  );
  bracket.position.z = -depth * 0.52;
  drumGroup.add(bracket);

  const arm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.016, 0.016, mountDist, 8),
    darkHardwareMat
  );
  arm.position.set(0, 0, -mountDist / 2);
  arm.rotation.x = Math.PI / 2;
  drumGroup.add(arm);

  drumGroup.position.set(
    Math.cos(angleOffset) * mountDist,
    y,
    Math.sin(angleOffset) * mountDist
  );
  drumGroup.rotation.y = -angleOffset;
  drumGroup.rotation.x = 0.05; // Slight realistic upward/downward elevation tilt

  return drumGroup;
}

// Tier 1 Microwave Dishes (Lower-mid, height 4.8m) — Dual Large Drums
poleGroup.add(createMicrowaveDrum(0.32, 0.22, towerHeight * 0.53, 0));
poleGroup.add(createMicrowaveDrum(0.32, 0.22, towerHeight * 0.53, Math.PI));

// Tier 2 Microwave Dishes (Upper-mid, height 6.2m) — Dual Medium Drums (90° cross azimuth)
poleGroup.add(createMicrowaveDrum(0.24, 0.18, towerHeight * 0.69, Math.PI / 2));
poleGroup.add(createMicrowaveDrum(0.24, 0.18, towerHeight * 0.69, -Math.PI / 2));

// Tier 3 Compact Microwave Dishes (Sub-top, height 7.4m)
poleGroup.add(createMicrowaveDrum(0.18, 0.14, towerHeight * 0.82, Math.PI / 4));
poleGroup.add(createMicrowaveDrum(0.18, 0.14, towerHeight * 0.82, -Math.PI * 0.75));

// 6. Cellular Sector Panel Antennas (Tier 4, height 8.2m, 3-Sector Triangular Array)
// Reference 1000198366.jpg & ngWR99...jpg: vertical rectangular radomes with mechanical down-tilt
function createSectorPanel(y, angleOffset) {
  const sectorGroup = new THREE.Group();

  // Rectangular antenna radome housing
  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, 0.72, 0.18),
    panelMat
  );
  panel.rotation.x = 0.10; // Realistic 6-degree mechanical down-tilt
  sectorGroup.add(panel);

  // Vertical pipe mount
  const mountPipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.85, 8),
    steelMat
  );
  mountPipe.position.z = -0.10;
  sectorGroup.add(mountPipe);

  // Horizontal standoff bracket to tower
  const armWidth = baseWidth + (topWidth - baseWidth) * (y / towerHeight);
  const mountDist = armWidth + 0.24;

  const standoff = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.05, mountDist),
    darkHardwareMat
  );
  standoff.position.z = -mountDist / 2;
  sectorGroup.add(standoff);

  sectorGroup.position.set(
    Math.cos(angleOffset) * mountDist,
    y,
    Math.sin(angleOffset) * mountDist
  );
  sectorGroup.rotation.y = -angleOffset;

  return sectorGroup;
}

// 3-Sector array (120° spacing)
poleGroup.add(createSectorPanel(towerHeight * 0.91, 0));
poleGroup.add(createSectorPanel(towerHeight * 0.91, Math.PI * 2 / 3));
poleGroup.add(createSectorPanel(towerHeight * 0.91, Math.PI * 4 / 3));

// 7. Top Mast & Aviation Warning Obstacle Light
const mast = new THREE.Mesh(
  new THREE.CylinderGeometry(0.015, 0.022, 1.4, 8),
  darkHardwareMat
);
mast.position.y = towerHeight + 0.7;
poleGroup.add(mast);

// Electric Cyan Obstruction Beacon (#00CFFF)
const beaconMat = new THREE.MeshStandardMaterial({
  color: 0x00CFFF,
  emissive: 0x00CFFF,
  emissiveIntensity: 3.5,
  transparent: true,
  opacity: 0.9
});
const beaconMesh = new THREE.Mesh(
  new THREE.SphereGeometry(0.038, 12, 12),
  beaconMat
);
beaconMesh.position.y = towerHeight + 1.42;
poleGroup.add(beaconMesh);

// 8. PHYSICAL SIGNAL COUPLING JUNCTION BOX (Demarcation Interface)
// The physical hardware component where the Phase 2 carrier signal terminates/connects!
const junctionBox = new THREE.Mesh(
  new THREE.BoxGeometry(0.22, 0.32, 0.16),
  darkHardwareMat
);
junctionBox.position.set(0.28, 1.35, 0.28);
poleGroup.add(junctionBox);

// Conduit running into the cable tray
const conduit = new THREE.Mesh(
  new THREE.CylinderGeometry(0.016, 0.016, 0.8, 8),
  steelMat
);
conduit.position.set(0.14, 1.35, 0.14);
conduit.rotation.z = Math.PI / 4;
poleGroup.add(conduit);

// Connection Terminal Optical Port (Ignites upon carrier signal arrival)
const terminalMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  emissive: 0xC41E3A,
  emissiveIntensity: 1.0,
  roughness: 0.2,
  metalness: 0.6,
  transparent: true,
  opacity: 0.0
});
export const signalTerminalMesh = new THREE.Mesh(
  new THREE.SphereGeometry(0.045, 16, 16),
  terminalMat
);
signalTerminalMesh.position.set(0.38, 1.35, 0.34);
poleGroup.add(signalTerminalMesh);

// Subtle Cyan Coupling Aura (NO radar rings)
const terminalHalo = new THREE.Mesh(
  new THREE.SphereGeometry(0.075, 16, 16),
  new THREE.MeshBasicMaterial({
    color: 0x00CFFF,
    transparent: true,
    opacity: 0.0,
    depthWrite: false
  })
);
signalTerminalMesh.add(terminalHalo);

// 9. Vertical Waveguide Conduit Energy Pulse (Climbs spine to crown)
const waveguidePulseMat = new THREE.MeshBasicMaterial({
  color: 0xC41E3A,
  transparent: true,
  opacity: 0.0
});
const waveguidePulseMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(0.024, 0.024, 0.5, 8),
  waveguidePulseMat
);
waveguidePulseMesh.position.set(0, 1.4, 0);
poleGroup.add(waveguidePulseMesh);

// 10. Crown Optical Emitter at top mast (y = towerHeight + 1.42)
const crownEmitterMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  emissive: 0xC41E3A,
  emissiveIntensity: 0.0,
  transparent: true,
  opacity: 0.0
});
export const crownEmitterMesh = new THREE.Mesh(
  new THREE.SphereGeometry(0.065, 16, 16),
  crownEmitterMat
);
crownEmitterMesh.position.set(0, towerHeight + 1.42, 0);
poleGroup.add(crownEmitterMesh);

// ── Atmospheric Depth Plane (Shader Gradient skill) ───────────────────────────
const atmosphereMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  uniforms: {
    uOpacity: { value: 0.0 },
    uColor1:  { value: new THREE.Color(0x050a14) },
    uColor2:  { value: new THREE.Color(0x0d1f3c) }
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
      float dist = length(vUv - vec2(0.5));
      vec3 col = mix(uColor2, uColor1, smoothstep(0.1, 0.75, dist));
      gl_FragColor = vec4(col, uOpacity * (1.0 - dist * 0.6));
    }
  `
});

export const atmospherePlane = new THREE.Mesh(
  new THREE.SphereGeometry(45, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
  atmosphereMat
);
atmospherePlane.rotation.x = Math.PI / 2;
atmospherePlane.position.set(0, 4, -10);
atmospherePlane.renderOrder = -1;

// ── Photographic Depth Transformation Plane (Ref: public/references/tower 1.jpg) ──
const towerTexLoader = new THREE.TextureLoader();
const towerTexture = towerTexLoader.load('/references/tower 1.jpg');
towerTexture.colorSpace = THREE.SRGBColorSpace;

const towerImageMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  uniforms: {
    uTexture:    { value: towerTexture },
    uProgress:   { value: 0.0 },
    uOpacity:    { value: 0.0 },
    uTime:       { value: 0.0 },
    uDistortion: { value: 0.04 }
  },
  vertexShader: ImageTransformShader.vertexShader,
  fragmentShader: ImageTransformShader.fragmentShader
});

const towerDepthPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(12, 18),
  towerImageMat
);
towerDepthPlane.position.set(0.4, 6.0, -2.8);
towerDepthPlane.renderOrder = -1;
poleGroup.add(towerDepthPlane);

// ── O-Calc Pro & Katapult Pro Structural Analysis Vectors ────────────────────
const analysisGroup = new THREE.Group();

// Vector Arrow Material (Neon Cyan / Emerald)
const tensionVectorMat = new THREE.MeshBasicMaterial({
  color: 0x00ffaa,
  transparent: true,
  opacity: 0.85
});

const loadVectorMat = new THREE.MeshBasicMaterial({
  color: 0x00cfff,
  transparent: true,
  opacity: 0.85
});

// 1. Guy Wire Tension Lines (High-strength steel guy lines anchored to ground)
const guyLineMat = new THREE.LineDashedMaterial({
  color: 0x00cfff,
  dashSize: 0.15,
  gapSize: 0.08,
  transparent: true,
  opacity: 0.7
});

const guyPoints = [
  new THREE.Vector3(-1.8, 0.0, 1.8),
  new THREE.Vector3(0.0, 6.2, 0.0),
  new THREE.Vector3(1.8, 0.0, 1.8),
  new THREE.Vector3(0.0, 6.2, 0.0),
  new THREE.Vector3(0.0, 0.0, -2.2),
  new THREE.Vector3(0.0, 6.2, 0.0)
];
const guyGeo = new THREE.BufferGeometry().setFromPoints(guyPoints);
const guyLines = new THREE.LineSegments(guyGeo, guyLineMat);
guyLines.computeLineDistances();
analysisGroup.add(guyLines);

// 2. NESC Ground Clearance Datum Ring & Indicator (18.5 ft / y = 1.85)
const clearanceRingGeo = new THREE.RingGeometry(1.2, 1.25, 32);
clearanceRingGeo.rotateX(Math.PI / 2);
const clearanceRingMat = new THREE.MeshBasicMaterial({
  color: 0x00ffaa,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.6
});
const clearanceRing = new THREE.Mesh(clearanceRingGeo, clearanceRingMat);
clearanceRing.position.set(0, 1.85, 0);
analysisGroup.add(clearanceRing);

// 3. Lateral Wind Load Force Vectors (Tapered arrows at key tiers)
const arrowGeo = new THREE.ConeGeometry(0.08, 0.25, 8);
arrowGeo.rotateZ(-Math.PI / 2);
const arrowCylinderGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.6, 8);
arrowCylinderGeo.rotateZ(-Math.PI / 2);

[3.2, 5.8, 8.2].forEach((tierY, idx) => {
  const arrowStem = new THREE.Mesh(arrowCylinderGeo, idx === 1 ? tensionVectorMat : loadVectorMat);
  arrowStem.position.set(0.65, tierY, 0);
  const arrowHead = new THREE.Mesh(arrowGeo, idx === 1 ? tensionVectorMat : loadVectorMat);
  arrowHead.position.set(1.05, tierY, 0);
  analysisGroup.add(arrowStem);
  analysisGroup.add(arrowHead);
});

poleGroup.add(analysisGroup);

// ── Update Lifecycle (Controlled by master scrollFloat) ────────────────────────

export function updateChapter2(scrollFloat) {
  const isVisible = (scrollFloat >= 1.65 && scrollFloat <= 3.45);
  poleGroup.visible = isVisible;
  atmospherePlane.visible = isVisible;
  if (!isVisible) {
    const ch2Text = document.getElementById('chapter2-text');
    if (ch2Text) {
      ch2Text.style.opacity = '0';
      ch2Text.style.display = 'none';
      ch2Text.style.pointerEvents = 'none';
    }
    return;
  }

  const time = performance.now() * 0.001;

  // 1. Grounded Infrastructure Anchor (statically anchored at y = 0.0)
  poleGroup.position.set(0.4, 0.0, -0.6);

  // 2. Physical Spatial Occlusion Progression:
  // tower photograph (sf 1.65->1.85) -> structural silhouette (sf 1.85->2.05) -> physical steel lattice (sf 2.00->2.30)
  const towerFadeIn  = clamp(map(scrollFloat, 1.80, 2.15, 0, 1), 0, 1);
  const towerFadeOut = clamp(map(scrollFloat, 3.20, 3.40, 1, 0), 0, 1);
  const towerOpacity = towerFadeIn * towerFadeOut;

  // Photo appears in background first (sf 1.65->1.85), then smoothly hands over to 3D physical lattice
  const photoFadeIn  = clamp(map(scrollFloat, 1.65, 1.82, 0, 0.70), 0, 0.70);
  const photoHandover = clamp(map(scrollFloat, 1.88, 2.18, 1, 0), 0, 1);
  const photoOpacity = photoFadeIn * photoHandover * towerFadeOut;

  poleGroup.traverse((child) => {
    if (child.isMesh && child.material && !child.material.isShaderMaterial &&
        child !== signalTerminalMesh && child !== beaconMesh &&
        child !== crownEmitterMesh && child !== waveguidePulseMesh) {
      child.material.transparent = true;
      child.material.opacity = towerOpacity;
    }
  });
  braceMesh.material.opacity = towerOpacity * 0.85;

  // 3. Red Aviation Beacon Pulse (1 Hz aviation warning standard)
  const beaconPulse = 2.5 + 2.0 * Math.pow(Math.sin(time * 3.14), 4.0);
  beaconMat.emissiveIntensity = beaconPulse * towerOpacity;

  // 4. Physical Carrier Signal Coupling (Terminal at junction box)
  const connectionProgress = clamp(map(scrollFloat, 2.10, 2.45, 0, 1), 0, 1) * towerFadeOut;
  terminalMat.opacity = connectionProgress;
  terminalHalo.material.opacity = connectionProgress * 0.40;

  if (connectionProgress > 0) {
    terminalMat.emissiveIntensity = 3.0 + 2.0 * Math.sin(time * 4.5);
    terminalHalo.scale.setScalar(1.0 + 0.18 * Math.sin(time * 3.8));
  }

  // 5. Vertical Waveguide Energy Surge (Signal climbs interior conduit from y = 1.4 to y = 10.42, sf 2.70 -> 3.05)
  const surgeProgress = clamp(map(scrollFloat, 2.70, 3.05, 0, 1), 0, 1);
  if (surgeProgress > 0.01 && surgeProgress < 0.99) {
    waveguidePulseMesh.position.y = 1.4 + surgeProgress * 9.0;
    waveguidePulseMat.opacity = Math.sin(surgeProgress * Math.PI) * 0.95;
  } else {
    waveguidePulseMat.opacity = 0.0;
  }

  // 6. Crown Optical Emitter (Totally disabled per user request — no effect, no flash)
  crownEmitterMesh.visible = false;
  crownEmitterMat.opacity = 0.0;
  crownEmitterMat.emissiveIntensity = 0.0;

  // Update Tower Photographic Depth Shader
  towerImageMat.uniforms.uTime.value = time;
  towerImageMat.uniforms.uProgress.value = clamp(map(scrollFloat, 1.65, 2.15, 0, 1), 0, 1);
  towerImageMat.uniforms.uOpacity.value = photoOpacity;

  // 7. Analysis Group & Telemetry HUD Overlay (#chapter2-text, sf 2.20 -> 3.10)
  analysisGroup.visible = (scrollFloat >= 1.85 && scrollFloat <= 3.20);
  const analysisAlpha = towerOpacity * (0.6 + 0.4 * Math.sin(time * 3.0));
  tensionVectorMat.opacity = towerOpacity * 0.85;
  loadVectorMat.opacity = towerOpacity * 0.85;
  guyLineMat.opacity = towerOpacity * 0.65;
  clearanceRingMat.opacity = towerOpacity * 0.55;

  const ch2Text = document.getElementById('chapter2-text');
  if (ch2Text) {
    if (scrollFloat >= 2.15 && scrollFloat <= 3.05) {
      const tFadeIn  = clamp(map(scrollFloat, 2.15, 2.35, 0, 1), 0, 1);
      const tFadeOut = clamp(map(scrollFloat, 2.85, 3.05, 1, 0), 0, 1);
      const op = tFadeIn * tFadeOut;
      ch2Text.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div class="fiber-label" style="margin-bottom:0; color:#00ffaa;">O-CALC PRO // NESC C2-2023 AUDIT</div>
          <span style="font-size:0.75rem; color:#00ffaa; border:1px solid rgba(0,255,170,0.4); padding:2px 8px; border-radius:2px; font-weight:600;">PASS 68.4%</span>
        </div>
        <div class="fiber-heading" style="font-size:1.3rem; margin-bottom:6px;">POLE LOADING & STRUCTURAL CAPACITY</div>
        <div class="fiber-sub" style="font-size:0.85rem; line-height:1.5; color:rgba(255,255,255,0.85);">
          <div>• Bending Moment: <strong style="color:#00cfff;">14,820 ft-lbs</strong> @ Groundline</div>
          <div>• NESC Loading: <strong style="color:#ffffff;">Grade B Heavy</strong> (40 psf wind + 0.5" radial ice)</div>
          <div>• Vertical Clearance: <strong style="color:#00ffaa;">18.5 ft AGL</strong> (Compliant)</div>
          <div>• Guy Wire Tension: <strong style="color:#00cfff;">1,420 lbf</strong> [1/4" EHS Steel]</div>
        </div>
        <div class="fiber-tagline" style="margin-top:8px; font-size:0.78rem; color:rgba(0,207,255,0.8);">Katapult Pro field verification · Joint-use makeready engineering</div>
      `;
      ch2Text.style.opacity = String(op);
      ch2Text.style.display = op > 0.01 ? 'block' : 'none';
      ch2Text.style.pointerEvents = op > 0.01 ? 'auto' : 'none';
    } else {
      ch2Text.style.opacity = '0';
      ch2Text.style.display = 'none';
      ch2Text.style.pointerEvents = 'none';
    }
  }

  // 8. Atmospheric Depth Plane
  atmosphereMat.uniforms.uOpacity.value = clamp(map(scrollFloat, 1.75, 2.35, 0, 0.88), 0, 0.88) * towerFadeOut;

  // 9. Restrained Architectural Rotation (subtle orientation to reveal 3D depth)
  if (scrollFloat >= 1.75) {
    poleGroup.rotation.y = (scrollFloat - 1.75) * 0.20;
  } else {
    poleGroup.rotation.y = 0;
  }
}

// Memory lifecycle disposal (Weakness 3)
export function disposeChapter2() {
  poleGroup.traverse((child) => {
    if (child.isMesh) {
      child.geometry?.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach(m => m?.dispose());
      } else {
        child.material?.dispose();
      }
    }
  });
  atmospherePlane.geometry?.dispose();
  atmospherePlane.material?.dispose();
  towerTexture?.dispose();
}

