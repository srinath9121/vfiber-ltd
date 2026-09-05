// src/chapters/chapter6-network.js — Phase 12B: Hard Photorealistic Telecom Termination Infrastructure
// Completely replaces legacy Tron/PCB runway with authentic physical telecommunications equipment:
//   1. 19-Inch ODF Rack Bay (EIA-310 C-channel steel rails, mounting ears, 1RU/2RU patch chassis)
//   2. Blue Duplex LC Bulkhead Adapters (Single-Mode UPC Blue, ceramic alignment sleeves, connector boots)
//   3. Yellow Single-Mode Patch Cords (OS2 yellow, gravity-driven catenary sag, D-ring management loops)
//   4. Molded Splice Organizer Tray (White ABS polymer, racetrack fiber loops, fusion splice sleeves)
//   5. SFP28 Optical Demarcation Transceiver (Die-cast zinc cage, EMI spring fingers, optical LC port)
//
// PHYSICAL PBR RULES:
//   - Zero emissive glow on metal, plastic, or cable jacket.
//   - Only the traveling optical signal carries Ruby Red (#C41E3A) and Electric Cyan (#00CFFF).

import * as THREE from 'three';
import { clamp, map } from '../utils/math.js';
import { ImageTransformShader } from '../shaders/shaders.js';

// ── Master Group for Chapter 6 ────────────────────────────────────────────────
export const networkChapterGroup = new THREE.Group();
networkChapterGroup.visible = false;

// ── Physical Materials (PBR Telecom Palette, Zero Emission) ───────────────────

// Dark powder-coated sheet metal (19" ODF chassis and rack shelves)
const rackChassisMat = new THREE.MeshStandardMaterial({
  color: 0x181b20,
  roughness: 0.62,
  metalness: 0.65,
  side: THREE.DoubleSide
});

// Vertical EIA-310 rack rails (Cold-rolled structural steel)
const rackRailMat = new THREE.MeshStandardMaterial({
  color: 0x242830,
  roughness: 0.48,
  metalness: 0.82
});

// Rack mounting screws & washers (Black oxide steel pan-head screws)
const screwMat = new THREE.MeshStandardMaterial({
  color: 0x111317,
  roughness: 0.35,
  metalness: 0.90
});

// Telecom Blue LC Duplex Adapter Polymer (Single-Mode UPC standard: RAL 5015 / #0066b3)
const lcBlueMat = new THREE.MeshStandardMaterial({
  color: 0x005ea6,
  roughness: 0.36,
  metalness: 0.02
});

// White Zirconia Ceramic Alignment Sleeves (Inside LC adapter bores)
const ceramicMat = new THREE.MeshStandardMaterial({
  color: 0xedf0f5,
  roughness: 0.12,
  metalness: 0.04
});

// Yellow Single-Mode (OS2) Fiber Patch Cable Jacket (OFNR/LSZH polymer)
const patchCableMat = new THREE.MeshStandardMaterial({
  color: 0xe6a100,
  roughness: 0.42,
  metalness: 0.02
});

// Hero Active Patch Cable Material (Semi-translucent with internal light wave)
const heroCableMat = new THREE.MeshStandardMaterial({
  color: 0xffb81c,
  roughness: 0.32,
  metalness: 0.04
});

// Cable management D-rings and finger ducts (Matte black ABS polymer)
const cableDringMat = new THREE.MeshStandardMaterial({
  color: 0x121417,
  roughness: 0.72,
  metalness: 0.05
});

// Texture Loader for PBR Molded ABS Splice Tray
const textureLoader = new THREE.TextureLoader();
const absTrayTexture = textureLoader.load('/textures/abs_splice_tray_map.jpg');
absTrayTexture.wrapS = THREE.RepeatWrapping;
absTrayTexture.wrapT = THREE.RepeatWrapping;
absTrayTexture.repeat.set(2, 2);

// White ABS Splice Organizer Tray (Molded polymer with micro-roughness & ejector pin marks)
const spliceTrayMat = new THREE.MeshStandardMaterial({
  color: 0xf6f8fa,
  map: absTrayTexture,
  roughnessMap: absTrayTexture,
  roughness: 0.28,
  metalness: 0.02
});

// Fusion Splice Protection Sleeves (Clear heat-shrink with stainless steel rod)
const spliceSleeveMat = new THREE.MeshStandardMaterial({
  color: 0xd8e0e8,
  roughness: 0.22,
  metalness: 0.85
});

// Brushed zinc/nickel die-cast SFP28 transceiver housing
const sfpMetalTexture = textureLoader.load('/textures/sfp28_metal_map.jpg');
sfpMetalTexture.wrapS = THREE.RepeatWrapping;
sfpMetalTexture.wrapT = THREE.RepeatWrapping;
sfpMetalTexture.repeat.set(1.5, 1.5);

const transceiverMat = new THREE.MeshStandardMaterial({
  color: 0x8a98a8,
  map: sfpMetalTexture,
  roughnessMap: sfpMetalTexture,
  roughness: 0.28,
  metalness: 0.92
});

// Stamped beryllium-copper / stainless EMI grounding spring fingers
const emiSpringMat = new THREE.MeshStandardMaterial({
  color: 0x96a4b2,
  roughness: 0.25,
  metalness: 0.94
});

// Identification Cable Labels (White vinyl wrap-around flags)
const labelMat = new THREE.MeshStandardMaterial({
  color: 0xefefef,
  roughness: 0.50,
  metalness: 0.01,
  side: THREE.DoubleSide
});

// ── Optical Signal Shader (Ruby Red #C41E3A / Electric Cyan #00CFFF) ──────────

const signalCoreShaderMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms: {
    uTime:     { value: 0 },
    uProgress: { value: 0 },
    uOpacity:  { value: 0 },
    uRuby:     { value: new THREE.Color(0xC41E3A) },
    uCyan:     { value: new THREE.Color(0x00CFFF) }
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vViewPosition;
    void main() {
      vUv = uv;
      vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPos.xyz;
      gl_Position = projectionMatrix * mvPos;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uProgress;
    uniform float uOpacity;
    uniform vec3 uRuby;
    uniform vec3 uCyan;
    varying vec2 vUv;
    varying vec3 vViewPosition;

    void main() {
      float speed = 8.0;
      float pulseZ = fract(vUv.x * 4.0 - uTime * speed);
      float env = exp(-pow((pulseZ - 0.5) * 6.0, 2.0));
      
      float cyanLead = smoothstep(0.48, 0.56, pulseZ) * env;
      float rubyCore = smoothstep(0.56, 0.38, pulseZ) * env;
      vec3 col = uRuby * rubyCore * 3.5 + uCyan * cyanLead * 2.8;
      
      gl_FragColor = vec4(col, uOpacity * env);
    }
  `
});

// ── Realistic Data-Center / Equipment Bay Lighting ────────────────────────────

const roomLightGroup = new THREE.Group();

// Overhead cool key light (angled at 50 degrees)
const odfKeyLight = new THREE.DirectionalLight(0xf2f6fc, 2.8);
odfKeyLight.position.set(0.40 + 3.5, 10.42 + 6.0, -68.0);
odfKeyLight.target.position.set(0.40, 10.42, -78.0);
roomLightGroup.add(odfKeyLight);
roomLightGroup.add(odfKeyLight.target);

// Soft fill light from front-left
const odfFillLight = new THREE.DirectionalLight(0xd4e2f0, 1.6);
odfFillLight.position.set(0.40 - 4.5, 10.42 + 2.0, -58.0);
odfFillLight.target.position.set(0.40, 10.42, -78.0);
roomLightGroup.add(odfFillLight);
roomLightGroup.add(odfFillLight.target);

// Subtle rack rim light
const odfRimLight = new THREE.DirectionalLight(0xaacae0, 1.2);
odfRimLight.position.set(0.40, 10.42 + 5.0, -96.0);
odfRimLight.target.position.set(0.40, 10.42, -80.0);
roomLightGroup.add(odfRimLight);
roomLightGroup.add(odfRimLight.target);

// Dedicated SFP28 transceiver key light (illuminates die-cast cage and LC boot at z = -50.0)
const sfpKeyLight = new THREE.DirectionalLight(0xf2f6fc, 2.0);
sfpKeyLight.position.set(0.40 + 2.2, 10.42 + 2.5, -44.0);
sfpKeyLight.target.position.set(0.40, 10.42, -50.0);
roomLightGroup.add(sfpKeyLight);
roomLightGroup.add(sfpKeyLight.target);

networkChapterGroup.add(roomLightGroup);

// ── 1. Optical Demarcation Transceiver Assembly (z = -48.0 to -52.0) ──────────

const demarcationGroup = new THREE.Group();
demarcationGroup.position.set(0.40, 10.42, -50.0);

// SFP28 Transceiver Cage Housing (Die-cast metal frame)
const sfpCageGeo = new THREE.BoxGeometry(1.4, 1.1, 4.2);
const sfpCageMesh = new THREE.Mesh(sfpCageGeo, transceiverMat);
demarcationGroup.add(sfpCageMesh);

// EMI Grounding Spring Fingers (Perforated perimeter collar at front face)
const emiCollarGeo = new THREE.BoxGeometry(1.48, 1.18, 0.25);
const emiCollarMesh = new THREE.Mesh(emiCollarGeo, emiSpringMat);
emiCollarMesh.position.set(0, 0, 2.1);
demarcationGroup.add(emiCollarMesh);

// Dual LC Optical Bores (Transmitter Tx and Receiver Rx)
const boreGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.8, 24);
boreGeo.rotateX(Math.PI / 2);

const boreLeft = new THREE.Mesh(boreGeo, ceramicMat);
boreLeft.position.set(-0.32, 0, 1.4);
demarcationGroup.add(boreLeft);

const boreRight = new THREE.Mesh(boreGeo, ceramicMat);
boreRight.position.set(0.32, 0, 1.4);
demarcationGroup.add(boreRight);

// Duplex LC Plugs engaged in SFP28 transceiver
const lcPlugGeo = new THREE.BoxGeometry(0.55, 0.52, 1.2);
const lcPlugMesh = new THREE.Mesh(lcPlugGeo, lcBlueMat);
lcPlugMesh.position.set(0, 0, 2.8);
demarcationGroup.add(lcPlugMesh);

// Molded flexible strain-relief boots
const bootGeo = new THREE.CylinderGeometry(0.12, 0.22, 0.9, 16);
bootGeo.rotateX(Math.PI / 2);
const bootLeft = new THREE.Mesh(bootGeo, lcBlueMat);
bootLeft.position.set(-0.18, 0, 3.8);
demarcationGroup.add(bootLeft);

const bootRight = new THREE.Mesh(bootGeo, lcBlueMat);
bootRight.position.set(0.18, 0, 3.8);
demarcationGroup.add(bootRight);

// Stamped Beryllium-Copper EMI Grounding Spring Finger Tabs (Perimeter array)
for (let sf = -5; sf <= 5; sf += 2) {
  const fingerTop = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.22), emiSpringMat);
  fingerTop.position.set(sf * 0.12, 0.60, 2.15);
  demarcationGroup.add(fingerTop);

  const fingerBot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.22), emiSpringMat);
  fingerBot.position.set(sf * 0.12, -0.60, 2.15);
  demarcationGroup.add(fingerBot);
}

// Pivoting Stainless Steel Release Bail Latch Handle (Signature SFP28 mechanical release)
const bailGeo = new THREE.TorusGeometry(0.42, 0.035, 8, 24, Math.PI);
const bailMesh = new THREE.Mesh(bailGeo, emiSpringMat);
bailMesh.rotation.x = Math.PI / 2;
bailMesh.position.set(0, -0.52, 2.35);
demarcationGroup.add(bailMesh);

// Laser-Etched Specification Metal Label Plate (Top housing)
const labelPlateGeo = new THREE.PlaneGeometry(1.0, 1.8);
const labelPlateMat = new THREE.MeshStandardMaterial({
  color: 0xd0d6dc,
  roughness: 0.35,
  metalness: 0.40,
  side: THREE.DoubleSide
});
const labelPlateMesh = new THREE.Mesh(labelPlateGeo, labelPlateMat);
labelPlateMesh.rotation.x = -Math.PI / 2;
labelPlateMesh.position.set(0, 0.56, 0.4);
demarcationGroup.add(labelPlateMesh);

// LC Duplex Push-Latch Release Clip (Blue polymer tab on top of plug)
const lcLatchGeo = new THREE.BoxGeometry(0.24, 0.14, 0.7);
const lcLatchMesh = new THREE.Mesh(lcLatchGeo, lcBlueMat);
lcLatchMesh.position.set(0, 0.32, 2.7);
demarcationGroup.add(lcLatchMesh);

networkChapterGroup.add(demarcationGroup);

// ── 2. 19-Inch Optical Distribution Frame (ODF) Equipment Rack Bay ─────────────
// Centered around x = 0.40, y = 10.42, z = -80.0

const odfBayGroup = new THREE.Group();
odfBayGroup.position.set(0.40, 10.42, -80.0);

// EIA-310 Standard 19" Rack Dimensions (Scale: 1 unit ~ 0.1m; 19" = 4.82 units)
const rackWidth = 4.82;
const rackHeight = 8.4;
const rackDepth = 3.6;

// [A] Left & Right Vertical EIA-310 Steel Upright Rails (C-channels with punch holes)
const railGeo = new THREE.BoxGeometry(0.32, rackHeight, 0.38);

const leftRail = new THREE.Mesh(railGeo, rackRailMat);
leftRail.position.set(-rackWidth * 0.5, 0, 0);
odfBayGroup.add(leftRail);

const rightRail = new THREE.Mesh(railGeo, rackRailMat);
rightRail.position.set(rackWidth * 0.5, 0, 0);
odfBayGroup.add(rightRail);

// Top & Bottom Crossmember Flanges
const crossmemberGeo = new THREE.BoxGeometry(rackWidth + 0.4, 0.35, rackDepth);
const topCrossmember = new THREE.Mesh(crossmemberGeo, rackRailMat);
topCrossmember.position.set(0, rackHeight * 0.5, -rackDepth * 0.4);
odfBayGroup.add(topCrossmember);

const bottomCrossmember = new THREE.Mesh(crossmemberGeo, rackRailMat);
bottomCrossmember.position.set(0, -rackHeight * 0.5, -rackDepth * 0.4);
odfBayGroup.add(bottomCrossmember);

// Punched EIA-310 Rack Mounting Holes (Simulated via regular bolt arrays along rails)
for (let y = -3.6; y <= 3.6; y += 0.44) {
  const screwGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.08, 12);
  screwGeo.rotateX(Math.PI / 2);

  const screwL = new THREE.Mesh(screwGeo, screwMat);
  screwL.position.set(-rackWidth * 0.5, y, 0.20);
  odfBayGroup.add(screwL);

  const screwR = new THREE.Mesh(screwGeo, screwMat);
  screwR.position.set(rackWidth * 0.5, y, 0.20);
  odfBayGroup.add(screwR);
}

// [B] 1RU / 2RU ODF Patch Panel Chassis (Enclosed sliding sheet-metal drawer)
const panelWidth = rackWidth - 0.52;
const panelHeight = 1.35;
const panelDepth = 2.4;

const chassisGeo = new THREE.BoxGeometry(panelWidth, panelHeight, panelDepth);
const chassisMesh = new THREE.Mesh(chassisGeo, rackChassisMat);
chassisMesh.position.set(0, 0.4, -panelDepth * 0.5);
odfBayGroup.add(chassisMesh);

// Rack Mounting Ears (Left & right sheet-metal brackets fastening panel to rails)
const earGeo = new THREE.BoxGeometry(0.24, panelHeight, 0.08);
const leftEar = new THREE.Mesh(earGeo, rackRailMat);
leftEar.position.set(-rackWidth * 0.5 + 0.14, 0.4, 0.04);
odfBayGroup.add(leftEar);

const rightEar = new THREE.Mesh(earGeo, rackRailMat);
rightEar.position.set(rackWidth * 0.5 - 0.14, 0.4, 0.04);
odfBayGroup.add(rightEar);

// Front Faceplate Bezel
const faceplateGeo = new THREE.BoxGeometry(panelWidth - 0.1, panelHeight - 0.1, 0.06);
const faceplateMesh = new THREE.Mesh(faceplateGeo, rackChassisMat);
faceplateMesh.position.set(0, 0.4, 0.02);
odfBayGroup.add(faceplateMesh);

// [C] Array of 24x Blue Duplex LC Bulkhead Adapters (2 Rows of 12)
const adaptersGroup = new THREE.Group();
adaptersGroup.position.set(0, 0.4, 0.08);

const adapterBodyGeo = new THREE.BoxGeometry(0.22, 0.32, 0.28);
const adapterPortHoleGeo = new THREE.BoxGeometry(0.08, 0.12, 0.30);

const adapterCols = 12;
const colSpacing = 0.28;
const rowSpacing = 0.42;

for (let row = 0; row < 2; row++) {
  const yPos = row === 0 ? rowSpacing * 0.5 : -rowSpacing * 0.5;
  for (let col = 0; col < adapterCols; col++) {
    const xPos = (col - (adapterCols - 1) * 0.5) * colSpacing;

    const adapterMesh = new THREE.Mesh(adapterBodyGeo, lcBlueMat);
    adapterMesh.position.set(xPos, yPos, 0);
    adaptersGroup.add(adapterMesh);

    // Two port openings per duplex adapter
    const sleeveL = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.32, 12), ceramicMat);
    sleeveL.rotateX(Math.PI / 2);
    sleeveL.position.set(xPos - 0.045, yPos, 0);
    adaptersGroup.add(sleeveL);

    const sleeveR = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.32, 12), ceramicMat);
    sleeveR.rotateX(Math.PI / 2);
    sleeveR.position.set(xPos + 0.045, yPos, 0);
    adaptersGroup.add(sleeveR);
  }
}
odfBayGroup.add(adaptersGroup);

// [D] Cable Management D-Rings & Horizontal Duct (Below patch panel)
const dRingGroup = new THREE.Group();
dRingGroup.position.set(0, -0.8, 0.25);

const dRingTorusGeo = new THREE.TorusGeometry(0.22, 0.04, 10, 24, Math.PI);
for (let d = -3; d <= 3; d++) {
  const dRing = new THREE.Mesh(dRingTorusGeo, cableDringMat);
  dRing.rotation.x = -Math.PI / 2;
  dRing.position.set(d * 0.58, 0, 0);
  dRingGroup.add(dRing);
}
odfBayGroup.add(dRingGroup);

// [E] Molded White ABS Splice Organizer Tray (Partially drawn sliding shelf at y = -1.8)
const spliceShelfGroup = new THREE.Group();
spliceShelfGroup.position.set(0, -1.8, 0.4);

// Tray Base (Rounded rectangular injection-molded tray)
const trayBaseGeo = new THREE.BoxGeometry(3.6, 0.12, 2.2);
const trayBaseMesh = new THREE.Mesh(trayBaseGeo, spliceTrayMat);
spliceShelfGroup.add(trayBaseMesh);

// Racetrack Fiber Guide Loop Walls (Left and right curves)
const loopCurveGeo = new THREE.TorusGeometry(0.65, 0.06, 8, 32, Math.PI);
const loopLeft = new THREE.Mesh(loopCurveGeo, spliceTrayMat);
loopLeft.rotation.x = -Math.PI / 2;
loopLeft.position.set(-1.0, 0.08, 0);
spliceShelfGroup.add(loopLeft);

const loopRight = new THREE.Mesh(loopCurveGeo, spliceTrayMat);
loopRight.rotation.x = Math.PI / 2;
loopRight.position.set(1.0, 0.08, 0);
spliceShelfGroup.add(loopRight);

// Fusion Splice Protection Sleeves (Array of 8 aluminum/stainless rods in center comb)
const sleeveCombGeo = new THREE.BoxGeometry(1.4, 0.16, 0.7);
const sleeveCombMesh = new THREE.Mesh(sleeveCombGeo, spliceTrayMat);
sleeveCombMesh.position.set(0, 0.08, 0);
spliceShelfGroup.add(sleeveCombMesh);

for (let s = -3; s <= 3; s++) {
  const slvGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.9, 12);
  slvGeo.rotateZ(Math.PI / 2);
  const slvMesh = new THREE.Mesh(slvGeo, spliceSleeveMat);
  slvMesh.position.set(0, 0.18, s * 0.08);
  spliceShelfGroup.add(slvMesh);
}

// Delicate colored 250µm primary fiber loops inside tray
const pigtailColors = [0x0058a8, 0xe65c00, 0x008a30, 0x6e4020, 0x722880, 0xdedede];
for (let p = 0; p < pigtailColors.length; p++) {
  const pCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.4, 0.09, -0.4 + p * 0.08),
    new THREE.Vector3(-1.0, 0.09, -0.7),
    new THREE.Vector3( 0.0, 0.16, -0.24 + p * 0.08),
    new THREE.Vector3( 1.0, 0.09, -0.7),
    new THREE.Vector3( 1.4, 0.09, -0.4 + p * 0.08)
  ]);
  const pGeo = new THREE.TubeGeometry(pCurve, 32, 0.008, 6, false);
  const pMat = new THREE.MeshStandardMaterial({
    color: pigtailColors[p],
    roughness: 0.35,
    metalness: 0.05
  });
  spliceShelfGroup.add(new THREE.Mesh(pGeo, pMat));
}

// 4 White ABS Retaining Finger Clips (Overhanging fiber racetrack loops as seen in reference photo 0QewIYKU...)
const clipGeo = new THREE.BoxGeometry(0.35, 0.04, 0.55);
const clipPositions = [
  { x: -1.05, z: -0.55, rotY: -0.35 },
  { x: -1.05, z:  0.55, rotY:  0.35 },
  { x:  1.05, z: -0.55, rotY:  0.35 },
  { x:  1.05, z:  0.55, rotY: -0.35 }
];
clipPositions.forEach((pos) => {
  const clipMesh = new THREE.Mesh(clipGeo, spliceTrayMat);
  clipMesh.position.set(pos.x, 0.16, pos.z);
  clipMesh.rotation.y = pos.rotY;
  spliceShelfGroup.add(clipMesh);
});

// Center Tray Fastening Screw (Pan-head stainless screw securing tray comb to base)
const trayScrewMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(0.06, 0.06, 0.08, 16),
  screwMat
);
trayScrewMesh.position.set(0, 0.18, 0);
spliceShelfGroup.add(trayScrewMesh);

odfBayGroup.add(spliceShelfGroup);
networkChapterGroup.add(odfBayGroup);

// ── 3. Yellow Single-Mode Patch Cords with Realistic Catenary Drape ───────────

const patchCordsGroup = new THREE.Group();

// Helper to generate natural catenary sag between two 3D anchor points
function createCatenaryCurve(p1, p2, sagY, pullForwardZ = 0.8) {
  const midX = (p1.x + p2.x) * 0.5;
  const midY = Math.min(p1.y, p2.y) - sagY;
  const midZ = (p1.z + p2.z) * 0.5 + pullForwardZ;
  return new THREE.CatmullRomCurve3([
    p1,
    new THREE.Vector3(p1.x, p1.y - 0.15, p1.z + 0.3),
    new THREE.Vector3(midX, midY, midZ),
    new THREE.Vector3(p2.x, p2.y - 0.25, p2.z + 0.3),
    p2
  ]);
}

// 10 Background/Passive Yellow OS2 Patch Cords hanging between ODF ports and D-rings
for (let i = 0; i < 10; i++) {
  const portCol = i + 1;
  const startX = 0.40 + (portCol - 5.5) * 0.28;
  const startY = 10.42 + 0.4 + (i % 2 === 0 ? 0.21 : -0.21);
  const startZ = -80.0 + 0.18;

  // D-ring target anchor at bottom
  const dRingIdx = (i % 7) - 3;
  const endX = 0.40 + dRingIdx * 0.58;
  const endY = 10.42 - 0.8;
  const endZ = -80.0 + 0.35;

  const p1 = new THREE.Vector3(startX, startY, startZ);
  const p2 = new THREE.Vector3(endX, endY, endZ);
  const sag = 0.45 + (i % 4) * 0.18;

  const curve = createCatenaryCurve(p1, p2, sag, 0.45 + (i % 3) * 0.12);
  const cordGeo = new THREE.TubeGeometry(curve, 32, 0.024, 8, false);
  const cordMesh = new THREE.Mesh(cordGeo, patchCableMat);
  patchCordsGroup.add(cordMesh);

  // Molded blue plug boot at ODF port
  const plugMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.35), lcBlueMat);
  plugMesh.position.set(startX, startY, startZ + 0.1);
  patchCordsGroup.add(plugMesh);

  // White identification flag label on cord
  const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.09), labelMat);
  labelMesh.position.set(startX, startY - 0.45, startZ + 0.38);
  labelMesh.rotation.y = 0.2;
  patchCordsGroup.add(labelMesh);
}

// [F] HERO Active Patch Cord: Connects ODF Port 01 directly to SFP28 Transceiver!
// Spans from ODF Port 01 (z = -79.9) forward to SFP28 Demarcation (z = -47.2)!
const heroStart = new THREE.Vector3(0.40 - 1.25, 10.42 + 0.61, -79.9);
const heroEnd   = new THREE.Vector3(0.40, 10.42, -47.2);

// Natural suspended catenary curve across the demarcation bay
const heroCurve = new THREE.CatmullRomCurve3([
  heroStart,
  new THREE.Vector3(0.40 - 1.25, 10.42 + 0.4, -77.0),
  new THREE.Vector3(0.40 - 0.95, 10.42 - 0.85, -70.0), // Lowest sag loop through D-ring
  new THREE.Vector3(0.40 - 0.45, 10.42 - 0.45, -60.0),
  new THREE.Vector3(0.40 - 0.12, 10.42 + 0.05, -52.0),
  heroEnd
]);

// Outer physical yellow jacket (semi-translucent to convey internal photonic wave)
const heroJacketGeo = new THREE.TubeGeometry(heroCurve, 64, 0.028, 10, false);
const heroJacketMesh = new THREE.Mesh(heroJacketGeo, heroCableMat);
patchCordsGroup.add(heroJacketMesh);

// Inner Photonic Signal Waveguide running through hero cord
const heroSignalGeo = new THREE.TubeGeometry(heroCurve, 64, 0.016, 8, false);
const heroSignalMesh = new THREE.Mesh(heroSignalGeo, signalCoreShaderMat);
patchCordsGroup.add(heroSignalMesh);

networkChapterGroup.add(patchCordsGroup);

// ── Photographic ODF Panel Transformation Plane (Ref: public/7. ODF fiber distribution panel/hFTHZ1J...) ──
const odfTexLoader = new THREE.TextureLoader();
const odfTexture = odfTexLoader.load('/references/7. ODF  fiber distribution panel/hFTHZ1JqSwKTYHAdHknVtzoZWQccqUfEK2RdT7QEAznc-p8I3OzdOY7XsVb-5WpnoMwOqZrOKzdpnf5xSNWtmczTm27VhwHu8Zgv1iHwWN-gYncMp45dcOHu3U6g-oxGngGR53dPF_A5WTfsVayIUaRpy_6sQ4ah8fSoQK_YfyKAEjlJuJXPV1meUnFXIWb-.jpg');
odfTexture.colorSpace = THREE.SRGBColorSpace;

const odfImageMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  uniforms: {
    uTexture:    { value: odfTexture },
    uProgress:   { value: 0.0 },
    uOpacity:    { value: 0.0 },
    uTime:       { value: 0.0 },
    uDistortion: { value: 0.05 }
  },
  vertexShader: ImageTransformShader.vertexShader,
  fragmentShader: ImageTransformShader.fragmentShader
});

const odfDepthPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(3.6, 2.5),
  odfImageMat
);
odfDepthPlane.position.set(0.40 - 0.25, 10.42 + 0.20, -51.5);
networkChapterGroup.add(odfDepthPlane);

// ── 4. Lifecycle & Scroll Update (SF 5.15 → 5.85) ─────────────────────────────

export function updateChapter6(scrollFloat) {
  const time = performance.now() * 0.001;
  signalCoreShaderMat.uniforms.uTime.value = time;

  const isVisible = (scrollFloat >= 5.14 && scrollFloat <= 5.86);
  networkChapterGroup.visible = isVisible;

  // Unconditional clamp for HUD overlay (#chapter6-text)
  const ch6Text = document.getElementById('chapter6-text');
  if (!isVisible) {
    if (ch6Text) {
      ch6Text.style.opacity = '0';
      ch6Text.style.display = 'none';
      ch6Text.style.pointerEvents = 'none';
    }
    return;
  }

  // Smooth fadeIn and fadeOut transitions
  const fadeIn  = clamp(map(scrollFloat, 5.14, 5.26, 0, 1), 0, 1);
  const fadeOut = clamp(map(scrollFloat, 5.80, 5.86, 1, 0), 0, 1);
  const masterOpacity = fadeIn * fadeOut;

  // Signal propagation along hero patch cord into SFP28 transceiver
  signalCoreShaderMat.uniforms.uOpacity.value = masterOpacity;
  signalCoreShaderMat.uniforms.uProgress.value = clamp(map(scrollFloat, 5.15, 5.65, 0, 1), 0, 1);

  // Update ODF Photographic Transformation Shader
  odfImageMat.uniforms.uTime.value = time;
  odfImageMat.uniforms.uProgress.value = clamp(map(scrollFloat, 5.15, 5.40, 0, 1), 0, 1);
  const odfImgFadeOut = clamp(map(scrollFloat, 5.35, 5.52, 1, 0), 0, 1);
  odfImageMat.uniforms.uOpacity.value = clamp(map(scrollFloat, 5.15, 5.30, 0, 1), 0, 1) * odfImgFadeOut * 0.65;

  // Manage physical material opacities
  rackChassisMat.opacity = masterOpacity;
  rackRailMat.opacity    = masterOpacity;
  lcBlueMat.opacity      = masterOpacity;
  patchCableMat.opacity  = masterOpacity;
  heroCableMat.opacity   = masterOpacity * 0.95;
  spliceTrayMat.opacity  = masterOpacity;
  transceiverMat.opacity = masterOpacity;

  // Telemetry HUD Content (#chapter6-text)
  if (ch6Text) {
    if (scrollFloat <= 5.39) {
      ch6Text.innerHTML = `
        <div class="fiber-label">OPTICAL DEMARCATION // LEVEL 04</div>
        <div class="fiber-heading">SFP28 TRANSCEIVER<br/>DEMARCATION</div>
        <div class="fiber-sub">100G Optical-to-Electrical Interface &bull; Dual LC Bulkhead</div>
        <div class="fiber-tagline">Physical Layer 0 Demarcation &bull; SFF-8431 Standard</div>
      `;
      const tIn  = clamp(map(scrollFloat, 5.16, 5.24, 0, 1), 0, 1);
      const tOut = clamp(map(scrollFloat, 5.34, 5.39, 1, 0), 0, 1);
      const op = tIn * tOut;
      ch6Text.style.opacity = String(op);
      ch6Text.style.display = op > 0.01 ? 'block' : 'none';
    } else if (scrollFloat <= 5.82) {
      ch6Text.innerHTML = `
        <div class="fiber-label">OPTICAL DISTRIBUTION FRAME // LEVEL 05</div>
        <div class="fiber-heading">19-INCH HIGH-DENSITY<br/>ODF BAY</div>
        <div class="fiber-sub">Single-Mode OS2 Patching &bull; Low-Loss Duplex LC Adapters</div>
        <div class="fiber-tagline">Engineered Catenary Routing &bull; EIA-310 Architecture</div>
      `;
      const tIn  = clamp(map(scrollFloat, 5.41, 5.47, 0, 1), 0, 1);
      const tOut = clamp(map(scrollFloat, 5.76, 5.82, 1, 0), 0, 1);
      const op = tIn * tOut;
      ch6Text.style.opacity = String(op);
      ch6Text.style.display = op > 0.01 ? 'block' : 'none';
    } else {
      ch6Text.style.opacity = '0';
      ch6Text.style.display = 'none';
    }
  }
}
