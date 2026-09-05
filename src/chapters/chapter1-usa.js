// chapter1-usa.js — Gradual geographic reveal: North America → Texas → Regional Western USA network
// Phase 2 Refinement: Restrained ruby red core, subtle cyan atmospheric glow, NO radar/target rings.
// Texas is the primary destination node; Dallas, Phoenix, Nevada, California are supporting nodes.

import * as THREE from 'three';
import { clamp, map } from '../utils/math.js';

// ── lat/lon → sphere XYZ ──────────────────────────────────────────────────────

function latLonToVec3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta)
  );
}

// ── Regional Node Hierarchy ───────────────────────────────────────────────────

const locations = [
  { name: 'Texas',      lat: 31.0, lon: -100.0, startSf: 0.95, isHub: true,  radius: 0.018, glowRadius: 0.028 },
  { name: 'Dallas',     lat: 32.7, lon: -96.8,  startSf: 1.06, isHub: false, radius: 0.011, glowRadius: 0.017 },
  { name: 'Phoenix',    lat: 33.4, lon: -112.0, startSf: 1.18, isHub: false, radius: 0.011, glowRadius: 0.017 },
  { name: 'Nevada',     lat: 38.8, lon: -116.4, startSf: 1.28, isHub: false, radius: 0.011, glowRadius: 0.017 },
  { name: 'California', lat: 36.7, lon: -119.4, startSf: 1.38, isHub: false, radius: 0.011, glowRadius: 0.017 }
];

export const usaNodesGroup = new THREE.Group();
const usaNodes = [];

locations.forEach((loc, i) => {
  const pos = latLonToVec3(loc.lat, loc.lon, 3.502);
  const normal = pos.clone().normalize();

  const nodeGroup = new THREE.Group();
  nodeGroup.position.copy(pos);
  nodeGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

  // 1. Surface-conformal thin outer telemetry ring
  const ringInner = loc.isHub ? 0.024 : 0.014;
  const ringOuter = loc.isHub ? 0.032 : 0.018;
  const ringGeom = new THREE.RingGeometry(ringInner, ringOuter, 32);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x00CFFF,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0,
    depthWrite: false
  });
  const ringMesh = new THREE.Mesh(ringGeom, ringMat);
  nodeGroup.add(ringMesh);

  // 2. Central high-intensity ruby red signal point
  const coreRadius = loc.isHub ? 0.012 : 0.007;
  const coreGeom = new THREE.CircleGeometry(coreRadius, 16);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xC41E3A,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0,
    depthWrite: false
  });
  const coreMesh = new THREE.Mesh(coreGeom, coreMat);
  nodeGroup.add(coreMesh);

  usaNodesGroup.add(nodeGroup);
  usaNodes.push({
    mesh: nodeGroup,
    material: coreMat,
    glowMaterial: ringMat,
    loc,
    offset: i * 0.8
  });
});

// ── Regional Interconnect Lines (Texas Hub → Western Grid) ────────────────────
// Structural connection paths representing fiber backbone routes

const routes = [
  [0, 1], // Texas → Dallas
  [0, 2], // Texas → Phoenix
  [2, 3], // Phoenix → Nevada
  [2, 4], // Phoenix → California
  [3, 4]  // Nevada → California
];

const routeLines = [];

routes.forEach(([fromIdx, toIdx]) => {
  const p1 = latLonToVec3(locations[fromIdx].lat, locations[fromIdx].lon, 3.583);
  const p2 = latLonToVec3(locations[toIdx].lat, locations[toIdx].lon, 3.583);
  const mid = p1.clone().add(p2).multiplyScalar(0.5).normalize().multiplyScalar(3.605);

  const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
  const pts = curve.getPoints(24);
  const geo = new THREE.BufferGeometry().setFromPoints(pts);

  const mat = new THREE.LineBasicMaterial({
    color: 0x00CFFF,
    transparent: true,
    opacity: 0
  });

  const line = new THREE.Line(geo, mat);
  usaNodesGroup.add(line);
  routeLines.push({ line, mat, startSf: locations[toIdx].startSf });
});

// ── Update (Called every frame) ───────────────────────────────────────────────

export function updateChapter1(scrollFloat, time) {
  // Deterministic fade-out: USA network retracts as story transitions to infrastructure (sf 1.85 → 2.10)
  const chapterFadeOut = clamp(map(scrollFloat, 1.85, 2.10, 1, 0), 0, 1);

  // Gradual reveal: Nodes ignite in sequence strictly after Texas arrival (sf >= 0.95)
  usaNodes.forEach((n) => {
    // Progressive opacity ramp starting from each node's startSf
    const nodeProgress = clamp((scrollFloat - n.loc.startSf) / 0.18, 0, 1);
    const finalOpacity = nodeProgress * chapterFadeOut;
    n.material.opacity = finalOpacity;
    // Subtle glow opacity: higher on Texas primary hub
    n.glowMaterial.opacity = finalOpacity * (n.loc.isHub ? 0.35 : 0.18);

    // Active breathing pulse when visible
    if (finalOpacity > 0.01) {
      const pulseSpeed = n.loc.isHub ? 2.5 : 3.2;
      const pulseScale = n.loc.isHub ? 0.15 : 0.08;
      const pulse = 1.0 + pulseScale * Math.sin(time * pulseSpeed + n.offset);
      n.mesh.scale.setScalar(pulse);

      const baseEmissive = n.loc.isHub ? 3.5 : 1.8;
      n.material.emissiveIntensity = baseEmissive + 1.2 * Math.sin(time * 3.0 + n.offset);
    } else {
      n.mesh.scale.setScalar(1);
    }
  });

  // Regional fiber lines illuminate as connection branches outward from Texas
  routeLines.forEach((r) => {
    const lineOpacity = clamp((scrollFloat - r.startSf) / 0.20, 0, 0.55) * chapterFadeOut;
    r.mat.opacity = lineOpacity;
  });

  // Chapter 1 overlay text: visible 1.15 → 1.55, fades out 1.55 → 1.80
  const t1 = document.getElementById('chapter1-text');
  if (t1) {
    if (scrollFloat > 1.15 && scrollFloat < 1.80) {
      const fadeIn = clamp(map(scrollFloat, 1.15, 1.35, 0, 1), 0, 1);
      const fadeOut = clamp(map(scrollFloat, 1.55, 1.80, 1, 0), 0, 1);
      const op = fadeIn * fadeOut;
      t1.style.opacity = String(op);
      t1.style.display = op > 0.01 ? 'block' : 'none';
      t1.style.pointerEvents = op > 0.01 ? 'auto' : 'none';
    } else {
      t1.style.opacity = '0';
      t1.style.display = 'none';
      t1.style.pointerEvents = 'none';
    }
  }
}

