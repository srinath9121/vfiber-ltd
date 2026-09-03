// chapter0-earth.js — Earth sphere, blue network mesh, red signal beams

import * as THREE from 'three';
import { clamp } from '../utils/math.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getRandomSpherePoint(radius) {
  const u = Math.random();
  const v = Math.random();
  const theta = u * 2.0 * Math.PI;
  const phi = Math.acos(2.0 * v - 1.0);
  const sinPhi = Math.sin(phi);
  return new THREE.Vector3(
    radius * sinPhi * Math.cos(theta),
    radius * sinPhi * Math.sin(theta),
    radius * Math.cos(phi)
  );
}

// ── Earth Sphere ──────────────────────────────────────────────────────────────

const isMobile = window.innerWidth < 768;
const sphereSegments = isMobile ? 32 : 64;

const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load(
  'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
);

const earthGeometry = new THREE.SphereGeometry(3.5, sphereSegments, sphereSegments);
const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });

export const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
earthMesh.rotation.y = -1.5; // North America faces camera

// ── Blue Network Mesh (140 pts, radius 3.58) ──────────────────────────────────

export const networkGroup = new THREE.Group();
const networkPointCount = isMobile ? 60 : 140;
const networkPoints = [];

for (let i = 0; i < networkPointCount; i++) {
  networkPoints.push(getRandomSpherePoint(3.58));
}

// LineSegments — connect points within distance 1.4
const linePositions = [];
for (let i = 0; i < networkPointCount; i++) {
  for (let j = i + 1; j < networkPointCount; j++) {
    if (networkPoints[i].distanceTo(networkPoints[j]) < 1.4) {
      linePositions.push(
        networkPoints[i].x, networkPoints[i].y, networkPoints[i].z,
        networkPoints[j].x, networkPoints[j].y, networkPoints[j].z
      );
    }
  }
}

const lineGeometry = new THREE.BufferGeometry();
lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00CFFF, transparent: true, opacity: 0.5 });
networkGroup.add(new THREE.LineSegments(lineGeometry, lineMaterial));

// Node dots
const nodeGeom = new THREE.SphereGeometry(0.015, 8, 8);
const nodeMat = new THREE.MeshBasicMaterial({ color: 0x00CFFF });
networkPoints.forEach((pt) => {
  const n = new THREE.Mesh(nodeGeom, nodeMat);
  n.position.copy(pt);
  networkGroup.add(n);
});

earthMesh.add(networkGroup);

// ── Red Signal Beams (20, radially outward) ───────────────────────────────────

export const beamsGroup = new THREE.Group();
const beamCount = isMobile ? 10 : 20;
export const beams = [];
const axisY = new THREE.Vector3(0, 1, 0);

for (let i = 0; i < beamCount; i++) {
  const height = 0.3 + Math.random() * 0.5;
  const geom = new THREE.CylinderGeometry(0.008, 0.008, height, 8);
  geom.translate(0, height / 2, 0);

  const mat = new THREE.MeshStandardMaterial({
    color: 0xC41E3A,
    emissive: 0xC41E3A,
    emissiveIntensity: 2.0,
    transparent: true,
    opacity: 1.0
  });

  const beamMesh = new THREE.Mesh(geom, mat);
  const dir = getRandomSpherePoint(1.0).normalize();
  beamMesh.quaternion.setFromUnitVectors(axisY, dir);
  beamMesh.position.copy(dir.clone().multiplyScalar(3.55));

  beamsGroup.add(beamMesh);
  beams.push({ material: mat, phase: Math.random() * Math.PI * 2, pulseSpeed: 1.5 + Math.random() * 2.0 });
}

earthMesh.add(beamsGroup);

// ── Update (called every frame) ───────────────────────────────────────────────

export function updateChapter0(scrollFloat, time) {
  // Earth idle rotation: only below scrollFloat 0.8
  if (scrollFloat < 0.8) {
    earthMesh.rotation.y += 0.001;
  } else {
    earthMesh.rotation.y = -1.5;
  }

  // Beam pulse
  beams.forEach((b) => {
    b.material.opacity = 0.2 + 0.8 * Math.abs(Math.sin(time * b.pulseSpeed + b.phase));
  });

  // Chapter 0 overlay: fade out after scrollFloat 0.5
  const ch0 = document.getElementById('chapter0-text');
  if (ch0) ch0.style.opacity = String(clamp(1.0 - (scrollFloat / 0.5), 0, 1));
}
