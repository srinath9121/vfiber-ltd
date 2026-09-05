// src/chapters/chapter6-network.js — ODF Patch Panel Rack
// Precision 3D Optical Distribution Frame (EIA-310 standard, 8x 1U patch panels, SC-UPC/APC ports, swaying OS2 yellow patch cords, status LEDs)

import * as THREE from 'three';
import { clamp, map } from '../utils/math.js';

// ── Master Group for Chapter 6 ────────────────────────────────────────────────
export const networkChapterGroup = new THREE.Group();
networkChapterGroup.visible = false;
networkChapterGroup.position.set(0, 0, 0);

// Interactive Ports Registry
export const interactivePorts = [];

// Laser Highlight Ring & Active Pulse Mesh
const highlightRingGeo = new THREE.RingGeometry(0.016, 0.024, 16);
const highlightRingMat = new THREE.MeshBasicMaterial({
  color: 0x00ffff,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.0,
  depthWrite: false
});
const portHighlightRing = new THREE.Mesh(highlightRingGeo, highlightRingMat);
portHighlightRing.visible = false;
networkChapterGroup.add(portHighlightRing);

// Traveling photon pulse on active cord
const laserPulseGeo = new THREE.SphereGeometry(0.018, 12, 12);
const laserPulseMat = new THREE.MeshBasicMaterial({
  color: 0x00ffff,
  transparent: true,
  opacity: 0.0,
  depthWrite: false
});
const laserPulseMesh = new THREE.Mesh(laserPulseGeo, laserPulseMat);
laserPulseMesh.visible = false;
networkChapterGroup.add(laserPulseMesh);

let activeInspectedPort = null;
let activePulseCord = null;
let activePulseT = 0.0;

// ── 1. Rack Frame (1.2m W x 2.0m H x 0.4m D) ─────────────────────────────────
// Dark steel #1a1a2e, metalness: 0.85, roughness: 0.3
const rackFrameMat = new THREE.MeshStandardMaterial({
  color: 0x1a1a2e,
  metalness: 0.85,
  roughness: 0.3
});

const rackFrameGroup = new THREE.Group();

// Outer frame dimensions: W=1.2, H=2.0, D=0.4 (constructed as realistic open cabinet)
const postWidth = 0.08;
const postDepth = 0.4;
const rackH = 2.0;
const rackW = 1.2;

// Left and Right structural posts
const leftPost = new THREE.Mesh(new THREE.BoxGeometry(postWidth, rackH, postDepth), rackFrameMat);
leftPost.position.set(-rackW * 0.5 + postWidth * 0.5, 0, 0);
rackFrameGroup.add(leftPost);

const rightPost = new THREE.Mesh(new THREE.BoxGeometry(postWidth, rackH, postDepth), rackFrameMat);
rightPost.position.set(rackW * 0.5 - postWidth * 0.5, 0, 0);
rackFrameGroup.add(rightPost);

// Top and Bottom crossmembers
const topCap = new THREE.Mesh(new THREE.BoxGeometry(rackW, postWidth, postDepth), rackFrameMat);
topCap.position.set(0, rackH * 0.5 - postWidth * 0.5, 0);
rackFrameGroup.add(topCap);

const bottomBase = new THREE.Mesh(new THREE.BoxGeometry(rackW, postWidth, postDepth), rackFrameMat);
bottomBase.position.set(0, -rackH * 0.5 + postWidth * 0.5, 0);
rackFrameGroup.add(bottomBase);

// Rear backplate
const backPlate = new THREE.Mesh(new THREE.BoxGeometry(rackW - 0.02, rackH - 0.02, 0.02), rackFrameMat);
backPlate.position.set(0, 0, -postDepth * 0.5 + 0.01);
rackFrameGroup.add(backPlate);

networkChapterGroup.add(rackFrameGroup);

// ── 2. Patch Panel Rows (1U Modules) ──────────────────────────────────────────
// 8 panels stacked vertically from y = -0.7 to +0.7
// BoxGeometry(1.0, 0.08, 0.3) — dark chassis #0d1117
const chassisMat = new THREE.MeshStandardMaterial({
  color: 0x0d1117,
  metalness: 0.6,
  roughness: 0.4
});

const scUpcBlueMat = new THREE.MeshStandardMaterial({
  color: 0x0066ff,
  metalness: 0.2,
  roughness: 0.35
});

const scApcGreenMat = new THREE.MeshStandardMaterial({
  color: 0x00aa44,
  metalness: 0.2,
  roughness: 0.35
});

const portCylinderGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.02, 8);
portCylinderGeo.rotateX(Math.PI / 2);

// Reusable Status LED materials
const activeLedMat = new THREE.MeshStandardMaterial({
  color: 0x00ff44,
  emissive: 0x00ff44,
  emissiveIntensity: 0.9,
  roughness: 0.2,
  transparent: true,
  opacity: 1.0
});

const idleLedMat = new THREE.MeshStandardMaterial({
  color: 0xff8800,
  emissive: 0xff8800,
  emissiveIntensity: 0.4,
  roughness: 0.3,
  transparent: true,
  opacity: 0.75
});

const ledGeo = new THREE.SphereGeometry(0.006, 8, 8);

// Store port coordinates for patch cord attachment
const portLocations = [];
// Select 8 distinct ports across different panels for authentic cabling
const cordPortIndices = [4, 18, 32, 45, 58, 67, 82, 91];

const panelChassisGeo = new THREE.BoxGeometry(1.0, 0.08, 0.3);
const numPanels = 8;
const yMin = -0.7;
const yMax = 0.7;

for (let p = 0; p < numPanels; p++) {
  const panelY = yMin + (p / (numPanels - 1)) * (yMax - yMin);
  const panelMesh = new THREE.Mesh(panelChassisGeo, chassisMat);
  panelMesh.position.set(0, panelY, 0);
  networkChapterGroup.add(panelMesh);

  // 12 ports per panel arranged in a row
  const numPorts = 12;
  const xStart = -0.38;
  const xEnd = 0.38;

  for (let portIdx = 0; portIdx < numPorts; portIdx++) {
    const portX = xStart + (portIdx / (numPorts - 1)) * (xEnd - xStart);
    const isBlue = (portIdx % 2 === 0);
    const portMat = isBlue ? scUpcBlueMat : scApcGreenMat;

    const portMesh = new THREE.Mesh(portCylinderGeo, portMat);
    portMesh.position.set(portX, panelY, 0.15 + 0.01);
    const linearIdx = p * numPorts + portIdx;
    const isCordPort = cordPortIndices.includes(linearIdx);

    portMesh.userData = {
      panelIndex: p + 1,
      portIndex: portIdx + 1,
      type: isBlue ? 'SC-UPC' : 'SC-APC',
      colorName: isBlue ? 'Blue' : 'Green',
      wavelength: isBlue ? '1310 nm' : '1550 nm',
      loss: (0.11 + ((linearIdx * 7) % 9) * 0.01).toFixed(2),
      returnLoss: isBlue ? '> 55 dB' : '> 68 dB',
      circuitId: `DAL-FTTH-U${p + 1}-${String(portIdx + 1).padStart(2, '0')}`,
      status: (linearIdx % 3 !== 0) ? 'LIVE / TX-RX NOMINAL' : 'STANDBY / SPARE',
      hasCord: isCordPort,
      cordIndex: cordPortIndices.indexOf(linearIdx)
    };
    interactivePorts.push(portMesh);
    networkChapterGroup.add(portMesh);

    // Save port world positions for cords
    portLocations.push(new THREE.Vector3(portX, panelY, 0.16));

    // Status LED above port
    const isActive = ((p * 12 + portIdx) % 3 !== 0);
    const ledMesh = new THREE.Mesh(ledGeo, isActive ? activeLedMat : idleLedMat);
    ledMesh.position.set(portX, panelY + 0.024, 0.152);
    networkChapterGroup.add(ledMesh);
  }
}

// ── 3. Cable Management Tray (y = -0.85) ─────────────────────────────────────
// BoxGeometry(0.9, 0.06, 0.15) at y=-0.85, color #2a2a3e
const cableTrayMat = new THREE.MeshStandardMaterial({
  color: 0x2a2a3e,
  metalness: 0.75,
  roughness: 0.35
});

const cableTray = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.15), cableTrayMat);
cableTray.position.set(0, -0.85, 0.12);
networkChapterGroup.add(cableTray);

// ── 4. Patch Cords (8 Cords, Yellow #ffcc00, Swaying Animation) ──────────────
// TubeGeometry along CatmullRomCurve3, Radius 0.008
const patchCordMat = new THREE.MeshStandardMaterial({
  color: 0xffcc00,
  metalness: 0.08,
  roughness: 0.4
});

const patchCords = [];
const numCords = 8;

for (let c = 0; c < numCords; c++) {
  const startPos = portLocations[cordPortIndices[c] % portLocations.length].clone();
  const trayTargetX = -0.32 + (c / (numCords - 1)) * 0.64;
  const endPos = new THREE.Vector3(trayTargetX, -0.85 + 0.03, 0.14);

  // Natural catenary loop downwards
  const midX = (startPos.x + endPos.x) * 0.5 + ((c % 2 === 0 ? 0.04 : -0.04));
  const midY = Math.min(startPos.y, endPos.y) - (0.12 + (c % 4) * 0.05);
  const midZ = 0.22 + (c % 3) * 0.03;

  const initialMid = new THREE.Vector3(midX, midY, midZ);
  const baseMid = initialMid.clone();

  const curve = new THREE.CatmullRomCurve3([
    startPos,
    new THREE.Vector3(startPos.x, startPos.y - 0.04, startPos.z + 0.03),
    initialMid,
    new THREE.Vector3(endPos.x, endPos.y + 0.05, endPos.z + 0.03),
    endPos
  ]);

  const geo = new THREE.TubeGeometry(curve, 32, 0.008, 8, false);
  const mesh = new THREE.Mesh(geo, patchCordMat);
  networkChapterGroup.add(mesh);

  patchCords.push({
    mesh,
    startPos,
    endPos,
    baseMid,
    midPoint: initialMid,
    phaseOffset: c * 0.78,
    radius: 0.008
  });
}

// ── 5. Status LEDs & Rack Center PointLight ──────────────────────────────────
// Add PointLight at rack center: color #00cfff, intensity 0.4, distance 3
const rackCenterLight = new THREE.PointLight(0x00cfff, 0.4, 3.0);
rackCenterLight.position.set(0, 0, 0.35);
networkChapterGroup.add(rackCenterLight);

// Subtle ambient illumination for telecom equipment
const rackAmbient = new THREE.DirectionalLight(0xeef4fc, 1.2);
rackAmbient.position.set(2.0, 1.5, 3.0);
networkChapterGroup.add(rackAmbient);

// ── 6. Lifecycle & Animation Update ──────────────────────────────────────────
export function updateChapter6(scrollFloat) {
  const time = performance.now() * 0.001;

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

  // ANIMATION 1: Patch cords sway gently (amplitude 0.02, frequency 0.8Hz, offset per cord)
  patchCords.forEach((cord) => {
    const sway = Math.sin(time * 0.8 * Math.PI * 2 + cord.phaseOffset) * 0.02;
    const swayZ = Math.cos(time * 0.8 * Math.PI * 2 + cord.phaseOffset) * 0.012;

    cord.midPoint.x = cord.baseMid.x + sway;
    cord.midPoint.z = cord.baseMid.z + swayZ;

    const newCurve = new THREE.CatmullRomCurve3([
      cord.startPos,
      new THREE.Vector3(cord.startPos.x, cord.startPos.y - 0.04, cord.startPos.z + 0.03),
      cord.midPoint,
      new THREE.Vector3(cord.endPos.x, cord.endPos.y + 0.05, cord.endPos.z + 0.03),
      cord.endPos
    ]);
    cord.currentCurve = newCurve;

    cord.mesh.geometry.dispose();
    cord.mesh.geometry = new THREE.TubeGeometry(newCurve, 32, cord.radius, 8, false);
  });

  // ANIMATION 2: Traveling Laser Pulse along selected cord
  if (activePulseCord && activePulseCord.currentCurve) {
    activePulseT += 0.018;
    if (activePulseT > 1.0) activePulseT = 0.0;
    const pulsePt = activePulseCord.currentCurve.getPoint(activePulseT);
    laserPulseMesh.position.copy(pulsePt);
    laserPulseMat.opacity = Math.sin(activePulseT * Math.PI) * 0.95;
    laserPulseMesh.visible = true;
  } else {
    laserPulseMesh.visible = false;
  }

  // ANIMATION 3: Status LEDs pulse (opacity oscillates 0.6-1.0 at different rates)
  const pulseFast = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(time * 6.0));
  const pulseSlow = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(time * 3.2));
  activeLedMat.opacity = pulseFast;
  activeLedMat.emissiveIntensity = 0.6 + 0.5 * pulseFast;
  idleLedMat.opacity = pulseSlow;
  idleLedMat.emissiveIntensity = 0.2 + 0.3 * pulseSlow;

  // HUD Content update
  if (ch6Text) {
    if (scrollFloat <= 5.39) {
      ch6Text.innerHTML = `
        <div class="fiber-label">End-to-end delivery</div>
        <div class="fiber-heading">FROM DESIGN FILE<br/>TO LIVE NETWORK</div>
        <div class="fiber-sub">Permitting blueprints · Splice plans · Splicing documentation</div>
        <div class="fiber-tagline">Accurate enough that crews don't call back.</div>
      `;
      const tIn  = clamp(map(scrollFloat, 5.16, 5.24, 0, 1), 0, 1);
      const tOut = clamp(map(scrollFloat, 5.34, 5.39, 1, 0), 0, 1);
      const op = tIn * tOut;
      ch6Text.style.opacity = String(op);
      ch6Text.style.display = op > 0.01 ? 'block' : 'none';
    } else if (scrollFloat <= 5.82) {
      ch6Text.innerHTML = `
        <div class="fiber-label">Why operators choose us</div>
        <div class="fiber-heading">SENIOR ENGINEERS<br/>WITHOUT THE OVERHEAD</div>
        <div class="fiber-sub">AutoCAD · ArcGIS Pro · Katapult · QGIS · SpatialNet · Bentley</div>
        <div class="fiber-tagline">Hyderabad delivery. Global-standard output.</div>
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

// ── 7. Interactive Port Inspection & Raycasting ──────────────────────────────

export function inspectPort(portMesh) {
  if (!portMesh || !portMesh.userData) return;
  activeInspectedPort = portMesh;

  // Position highlight ring around port
  portHighlightRing.position.copy(portMesh.position);
  portHighlightRing.position.z += 0.012;
  portHighlightRing.visible = true;
  highlightRingMat.opacity = 0.95;
  highlightRingMat.color.set(portMesh.userData.type === 'SC-UPC' ? 0x00cfff : 0x00ffaa);

  // Trace active photon pulse along cord if connected
  if (portMesh.userData.hasCord && patchCords[portMesh.userData.cordIndex]) {
    activePulseCord = patchCords[portMesh.userData.cordIndex];
    activePulseT = 0.0;
    laserPulseMesh.visible = true;
    laserPulseMat.color.set(portMesh.userData.type === 'SC-UPC' ? 0x00cfff : 0x00ffaa);
  } else {
    activePulseCord = null;
    laserPulseMesh.visible = false;
  }

  // Update holographic liquid-glass port card
  const card = document.getElementById('odf-port-card');
  if (card) {
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <span style="font-size:0.75rem; color:#00CFFF; font-weight:700; letter-spacing:0.12em;">CIRCUIT ${portMesh.userData.circuitId}</span>
        <span style="font-size:0.7rem; background:${portMesh.userData.type === 'SC-UPC' ? 'rgba(0,102,255,0.3)' : 'rgba(0,170,68,0.3)'}; color:#ffffff; border:1px solid ${portMesh.userData.type === 'SC-UPC' ? '#0066ff' : '#00aa44'}; padding:2px 6px; border-radius:2px;">${portMesh.userData.type}</span>
      </div>
      <div style="font-size:1.05rem; font-weight:700; color:#ffffff; margin-bottom:6px;">PORT ${portMesh.userData.portIndex} // 1U PANEL ${portMesh.userData.panelIndex}</div>
      <div style="font-size:0.82rem; color:rgba(255,255,255,0.85); line-height:1.6;">
        <div>• Insertion Loss: <strong style="color:#00ffaa;">${portMesh.userData.loss} dB</strong> (GR-326 Pass)</div>
        <div>• Optical Return Loss: <strong style="color:#00cfff;">${portMesh.userData.returnLoss}</strong></div>
        <div>• Wavelength: <strong style="color:#ffffff;">${portMesh.userData.wavelength} OS2 Single-Mode</strong></div>
        <div>• Status: <strong style="color:${portMesh.userData.hasCord ? '#00ffaa' : '#ffaa00'};">${portMesh.userData.hasCord ? 'PATCHED // LIVE TRAFFIC' : portMesh.userData.status}</strong></div>
      </div>
      <div style="margin-top:8px; font-size:0.72rem; color:rgba(0,207,255,0.8);">Click port to inspect telemetry · Laser trace active on cord</div>
    `;
    card.style.opacity = '1';
    card.style.display = 'block';
  }
}

export function hidePortInspection() {
  activeInspectedPort = null;
  activePulseCord = null;
  if (portHighlightRing) portHighlightRing.visible = false;
  if (laserPulseMesh) laserPulseMesh.visible = false;
  const card = document.getElementById('odf-port-card');
  if (card) {
    card.style.opacity = '0';
    card.style.display = 'none';
  }
}

export function handlePortRaycast(raycaster, isClick = false) {
  if (!networkChapterGroup.visible) {
    hidePortInspection();
    return;
  }
  const hits = raycaster.intersectObjects(interactivePorts, false);
  if (hits.length > 0) {
    document.body.style.cursor = 'pointer';
    inspectPort(hits[0].object);
  } else {
    document.body.style.cursor = 'default';
    if (isClick) hidePortInspection();
  }
}
