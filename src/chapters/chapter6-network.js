// chapter6-network.js — ODF Rack Bay: real telecom equipment, no abstract geometry
// Replaces broken cone/sphere scene with a proper 19" optical distribution frame
// PBR materials only. Signal shader on hero patch cord only.

import * as THREE from 'three';
import { clamp, map } from '../utils/math.js';

export const networkChapterGroup = new THREE.Group();
networkChapterGroup.visible = false;

// Interactive Ports Registry for Raycasting & Telemetry HUD
export const interactivePorts = [];

// ── Materials ──────────────────────────────────────────────────────────────────

const rackRailMat = new THREE.MeshStandardMaterial({
  color: 0x1e2228, roughness: 0.45, metalness: 0.85
});
const rackBodyMat = new THREE.MeshStandardMaterial({
  color: 0x141820, roughness: 0.60, metalness: 0.55
});
const lcBlueMat = new THREE.MeshStandardMaterial({
  color: 0x005ea6, roughness: 0.38, metalness: 0.04
});
const ceramicMat = new THREE.MeshStandardMaterial({
  color: 0xe8ecf0, roughness: 0.12, metalness: 0.02
});
const patchCordMat = new THREE.MeshStandardMaterial({
  color: 0xe6a100, roughness: 0.40, metalness: 0.02
});
const spliceTrayMat = new THREE.MeshStandardMaterial({
  color: 0xf0f4f8, roughness: 0.30, metalness: 0.02
});
const screwMat = new THREE.MeshStandardMaterial({
  color: 0x0d1015, roughness: 0.30, metalness: 0.92
});
const ledActiveMat = new THREE.MeshStandardMaterial({
  color: 0x00ff55, emissive: new THREE.Color(0x00ff55), emissiveIntensity: 1.2,
  roughness: 0.2, metalness: 0.0
});
const ledIdleMat = new THREE.MeshStandardMaterial({
  color: 0xff8800, emissive: new THREE.Color(0xff8800), emissiveIntensity: 0.5,
  roughness: 0.2, metalness: 0.0
});

// ── Signal shader on hero patch cord ──────────────────────────────────────────
const signalMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms: {
    uTime:    { value: 0 },
    uOpacity: { value: 0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uOpacity;
    varying vec2 vUv;
    void main() {
      float pulse = fract(vUv.x * 3.0 - uTime * 6.0);
      float env = exp(-pow((pulse - 0.5) * 5.0, 2.0));
      vec3 cyan = vec3(0.0, 0.81, 1.0);
      vec3 ruby = vec3(0.769, 0.118, 0.227);
      vec3 col = mix(ruby, cyan, smoothstep(0.3, 0.7, pulse)) * 3.0;
      gl_FragColor = vec4(col, uOpacity * env * 0.9);
    }
  `
});

// ── Rack Frame ────────────────────────────────────────────────────────────────
const rackGroup = new THREE.Group();
// Position rack to match camera beat at sf 5.14–5.85
// Camera at ch5/ch6 is close-up — place rack at origin of this group
rackGroup.position.set(0, 0, 0);

const rackW = 2.8, rackH = 4.2, rackD = 1.6;

// Left & right vertical rails
const railGeo = new THREE.BoxGeometry(0.18, rackH, 0.22);
[-rackW * 0.5, rackW * 0.5].forEach(x => {
  const rail = new THREE.Mesh(railGeo, rackRailMat);
  rail.position.set(x, 0, 0);
  rackGroup.add(rail);
});

// Top & bottom crossmembers
const crossGeo = new THREE.BoxGeometry(rackW + 0.22, 0.20, rackD * 0.85);
[rackH * 0.5, -rackH * 0.5].forEach(y => {
  const cross = new THREE.Mesh(crossGeo, rackRailMat);
  cross.position.set(0, y, -rackD * 0.3);
  rackGroup.add(cross);
});

// Rack screw holes (simulated as small cylinders on rails)
const screwGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.06, 10);
screwGeo.rotateX(Math.PI / 2);
for (let y = -rackH * 0.45; y <= rackH * 0.45; y += 0.28) {
  [-rackW * 0.5, rackW * 0.5].forEach(x => {
    const s = new THREE.Mesh(screwGeo, screwMat);
    s.position.set(x, y, 0.12);
    rackGroup.add(s);
  });
}

// ── Patch Panel Rows (6 rows of 1U chassis) ───────────────────────────────────
const panelW = rackW - 0.28;
const panelH = 0.50;
const panelD = 1.1;
const panelStartY = rackH * 0.38;
const panelSpacing = 0.56;
const PORTS_PER_ROW = 12;
const portSpacing = (panelW - 0.3) / (PORTS_PER_ROW - 1);

// Store LED meshes for animation
const ledMeshes = [];

for (let row = 0; row < 6; row++) {
  const py = panelStartY - row * panelSpacing;

  // Chassis body
  const chassisGeo = new THREE.BoxGeometry(panelW, panelH, panelD);
  const chassis = new THREE.Mesh(chassisGeo, rackBodyMat);
  chassis.position.set(0, py, -panelD * 0.5);
  rackGroup.add(chassis);

  // Faceplate
  const faceGeo = new THREE.BoxGeometry(panelW - 0.04, panelH - 0.06, 0.04);
  const face = new THREE.Mesh(faceGeo, rackBodyMat);
  face.position.set(0, py, 0.02);
  rackGroup.add(face);

  // Mounting ears
  const earGeo = new THREE.BoxGeometry(0.16, panelH, 0.06);
  [-rackW * 0.5 + 0.1, rackW * 0.5 - 0.1].forEach(x => {
    const ear = new THREE.Mesh(earGeo, rackRailMat);
    ear.position.set(x, py, 0.02);
    rackGroup.add(ear);
  });

  // LC adapter ports
  const adapterGeo = new THREE.BoxGeometry(0.14, 0.20, 0.18);
  const portHoleGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.20, 10);
  portHoleGeo.rotateX(Math.PI / 2);

  for (let p = 0; p < PORTS_PER_ROW; p++) {
    const px = -panelW * 0.5 + 0.15 + p * portSpacing;

    const adapter = new THREE.Mesh(adapterGeo, lcBlueMat);
    adapter.position.set(px, py, 0.06);
    adapter.userData = { panelIndex: row + 1, portIndex: p + 1 };
    rackGroup.add(adapter);
    interactivePorts.push(adapter);

    const sleeve = new THREE.Mesh(portHoleGeo, ceramicMat);
    sleeve.position.set(px, py, 0.06);
    rackGroup.add(sleeve);

    // Status LED per port
    const ledGeo = new THREE.SphereGeometry(0.012, 8, 8);
    const isActive = (row + p) % 3 !== 0;
    const led = new THREE.Mesh(ledGeo, isActive ? ledActiveMat.clone() : ledIdleMat.clone());
    led.position.set(px, py + 0.12, 0.06);
    rackGroup.add(led);
    ledMeshes.push({ mesh: led, isActive, phase: (row * PORTS_PER_ROW + p) * 0.37 });
  }
}

// ── Cable Management Tray ─────────────────────────────────────────────────────
const trayGeo = new THREE.BoxGeometry(rackW - 0.1, 0.12, 0.55);
const tray = new THREE.Mesh(trayGeo, rackBodyMat);
tray.position.set(0, -rackH * 0.5 + 0.38, -0.22);
rackGroup.add(tray);

// D-rings on tray
const torusGeo = new THREE.TorusGeometry(0.12, 0.022, 8, 20, Math.PI);
for (let d = -3; d <= 3; d++) {
  const dring = new THREE.Mesh(torusGeo, rackRailMat);
  dring.rotation.x = -Math.PI / 2;
  dring.position.set(d * 0.36, -rackH * 0.5 + 0.5, -0.05);
  rackGroup.add(dring);
}

// ── Splice Organizer Tray ─────────────────────────────────────────────────────
const spliceGroup = new THREE.Group();
spliceGroup.position.set(0, -rackH * 0.5 + 0.80, -panelD * 0.5);

const spliceBaseGeo = new THREE.BoxGeometry(rackW - 0.4, 0.08, 1.2);
spliceGroup.add(new THREE.Mesh(spliceBaseGeo, spliceTrayMat));

// Racetrack guide walls
const loopGeo = new THREE.TorusGeometry(0.32, 0.035, 8, 28, Math.PI);
[-0.52, 0.52].forEach((x, i) => {
  const loop = new THREE.Mesh(loopGeo, spliceTrayMat);
  loop.rotation.x = i === 0 ? -Math.PI / 2 : Math.PI / 2;
  loop.position.set(x, 0.06, 0);
  spliceGroup.add(loop);
});

// Fusion splice sleeves
for (let s = -3; s <= 3; s++) {
  const slvGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.55, 10);
  slvGeo.rotateZ(Math.PI / 2);
  const slv = new THREE.Mesh(slvGeo, ceramicMat);
  slv.position.set(0, 0.10, s * 0.052);
  spliceGroup.add(slv);
}

// Colored pigtails inside tray
const pigtailColors = [0x0058a8, 0xe65c00, 0x008a30, 0x6e4020, 0x722880, 0xdedede];
pigtailColors.forEach((col, p) => {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.85, 0.06, -0.22 + p * 0.05),
    new THREE.Vector3(-0.52, 0.06, -0.38),
    new THREE.Vector3(0, 0.12, -0.14 + p * 0.05),
    new THREE.Vector3(0.52, 0.06, -0.38),
    new THREE.Vector3(0.85, 0.06, -0.22 + p * 0.05)
  ]);
  const geo = new THREE.TubeGeometry(curve, 24, 0.006, 6, false);
  spliceGroup.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    color: col, roughness: 0.35, metalness: 0.04
  })));
});

rackGroup.add(spliceGroup);

// ── Yellow Patch Cords with Catenary Drape ────────────────────────────────────
function catenary(p1, p2, sag) {
  const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
  mid.y -= sag;
  mid.z += 0.4;
  return new THREE.CatmullRomCurve3([
    p1,
    new THREE.Vector3(p1.x, p1.y - 0.08, p1.z + 0.18),
    mid,
    new THREE.Vector3(p2.x, p2.y - 0.12, p2.z + 0.18),
    p2
  ]);
}

for (let i = 0; i < 8; i++) {
  const col = (i % PORTS_PER_ROW);
  const row = Math.floor(i / 2);
  const px = -panelW * 0.5 + 0.15 + col * portSpacing;
  const py = panelStartY - row * panelSpacing;

  const start = new THREE.Vector3(px, py, 0.16);
  const end = new THREE.Vector3(px * 0.7 + (i % 3 - 1) * 0.24, -rackH * 0.5 + 0.55, -0.12);
  const curve = catenary(start, end, 0.28 + (i % 4) * 0.12);
  const cordGeo = new THREE.TubeGeometry(curve, 28, 0.016, 7, false);
  rackGroup.add(new THREE.Mesh(cordGeo, patchCordMat));

  // Blue LC plug at port
  const plug = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.20), lcBlueMat);
  plug.position.set(px, py, 0.12);
  rackGroup.add(plug);
}

// ── Hero Patch Cord (signal shader) ──────────────────────────────────────────
const heroStart = new THREE.Vector3(-panelW * 0.5 + 0.15, panelStartY, 0.18);
const heroEnd   = new THREE.Vector3(0.0, -rackH * 0.5 + 0.55, 0.8);
const heroCurve = new THREE.CatmullRomCurve3([
  heroStart,
  new THREE.Vector3(heroStart.x, heroStart.y - 0.22, heroStart.z + 0.3),
  new THREE.Vector3(-0.15, -0.4, 0.55),
  heroEnd
]);
const heroCordGeo = new THREE.TubeGeometry(heroCurve, 48, 0.018, 8, false);
rackGroup.add(new THREE.Mesh(heroCordGeo, patchCordMat));

const heroSignalGeo = new THREE.TubeGeometry(heroCurve, 48, 0.010, 6, false);
const heroSignalMesh = new THREE.Mesh(heroSignalGeo, signalMat);
rackGroup.add(heroSignalMesh);

// ── Rack lighting ──────────────────────────────────────────────────────────────
const keyLight = new THREE.DirectionalLight(0xf0f6ff, 2.4);
keyLight.position.set(3, 5, 6);
keyLight.target.position.set(0, 0, 0);
rackGroup.add(keyLight);
rackGroup.add(keyLight.target);

const fillLight = new THREE.DirectionalLight(0xd0e4f0, 1.2);
fillLight.position.set(-4, 2, 4);
rackGroup.add(fillLight);

const rackAccent = new THREE.PointLight(0x00CFFF, 0.6, 8);
rackAccent.position.set(0, 0, 1.5);
rackGroup.add(rackAccent);

// Position the whole rack group in world space matching ch6 camera beat
// main.js camera at sf~5.4 is close-up — rack sits at world position near ch5/ch6 range
rackGroup.position.set(0.40, 10.42, -80.0);
networkChapterGroup.add(rackGroup);

// ── Port Inspection & Raycast Helpers ─────────────────────────────────────────
export function hidePortInspection() {
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
    if (isClick) {
      const portMesh = hits[0].object;
      const card = document.getElementById('odf-port-card');
      if (card) {
        card.innerHTML = `
          <button id="odf-card-close" aria-label="Close Inspection" style="position:absolute;top:10px;right:12px;background:transparent;border:none;color:rgba(255,255,255,0.6);cursor:pointer;font-size:14px;">&times;</button>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="font-size:0.75rem; color:#00CFFF; font-weight:700; letter-spacing:0.12em;">CIRCUIT TX-${portMesh.userData.panelIndex || 1}${portMesh.userData.portIndex || 1}</span>
            <span style="font-size:0.7rem; background:rgba(0,102,255,0.3); color:#ffffff; border:1px solid #0066ff; padding:2px 6px; border-radius:2px;">LC-UPC</span>
          </div>
          <div style="font-size:1.05rem; font-weight:700; color:#ffffff; margin-bottom:6px;">PORT ${portMesh.userData.portIndex || 1} // 1U PANEL ${portMesh.userData.panelIndex || 1}</div>
          <div style="font-size:0.82rem; color:rgba(255,255,255,0.85); line-height:1.6;">
            <div>• Insertion Loss: <strong style="color:#00ffaa;">0.14 dB</strong> (GR-326 Pass)</div>
            <div>• Optical Return Loss: <strong style="color:#00cfff;">> 55 dB</strong></div>
            <div>• Wavelength: <strong style="color:#ffffff;">1310 / 1550nm OS2</strong></div>
            <div>• Status: <strong style="color:#00ffaa;">PATCHED // LIVE TRAFFIC</strong></div>
          </div>
        `;
        card.style.opacity = '1';
        card.style.display = 'block';
        const closeBtn = document.getElementById('odf-card-close');
        if (closeBtn) closeBtn.onclick = hidePortInspection;
      }
    }
  } else {
    document.body.style.cursor = 'default';
    if (isClick) hidePortInspection();
  }
}

// ── Update ────────────────────────────────────────────────────────────────────
export function updateChapter6(scrollFloat) {
  const time = performance.now() * 0.001;
  const isVisible = scrollFloat >= 5.14 && scrollFloat <= 5.86;
  networkChapterGroup.visible = isVisible;

  const ch6Text = document.getElementById('chapter6-text');

  if (!isVisible) {
    if (ch6Text) { ch6Text.style.opacity = '0'; ch6Text.style.display = 'none'; }
    hidePortInspection();
    return;
  }

  const fadeIn  = clamp(map(scrollFloat, 5.14, 5.26, 0, 1), 0, 1);
  const fadeOut = clamp(map(scrollFloat, 5.78, 5.86, 1, 0), 0, 1);
  const master  = fadeIn * fadeOut;

  // Signal pulse along hero cord
  signalMat.uniforms.uTime.value    = time;
  signalMat.uniforms.uOpacity.value = master;

  // LED pulse animation
  ledMeshes.forEach(({ mesh, isActive, phase }) => {
    const pulse = 0.6 + 0.4 * Math.sin(time * (isActive ? 2.1 : 0.8) + phase);
    mesh.material.emissiveIntensity = isActive ? 1.0 * pulse : 0.4 * pulse;
    mesh.material.opacity = master;
    mesh.material.transparent = true;
  });

  // Rack accent light breathe
  rackAccent.intensity = 0.4 + 0.25 * Math.sin(time * 1.4) * master;

  // HUD overlay
  if (ch6Text) {
    const op = master;
    ch6Text.style.opacity = String(op);
    ch6Text.style.display = op > 0.01 ? 'block' : 'none';
    ch6Text.style.pointerEvents = 'none';
  }
}
