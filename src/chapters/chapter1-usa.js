// chapter1-usa.js — USA focus nodes, text overlay

import * as THREE from 'three';
import { clamp } from '../utils/math.js';

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

// ── USA Nodes (5 cities, radius 3.58) ────────────────────────────────────────

const locations = [
  { name: 'Texas',      lat: 31.0, lon: -100.0 },
  { name: 'Dallas',     lat: 32.7, lon: -96.8  },
  { name: 'California', lat: 36.7, lon: -119.4 },
  { name: 'Phoenix',    lat: 33.4, lon: -112.0 },
  { name: 'Nevada',     lat: 38.8, lon: -116.4 }
];

export const usaNodesGroup = new THREE.Group();
const usaNodes = [];

const nodeGeom = new THREE.SphereGeometry(0.05, 16, 16);

locations.forEach((loc, i) => {
  const mat = new THREE.MeshStandardMaterial({
    color: 0xC41E3A,
    emissive: 0xC41E3A,
    emissiveIntensity: 3.0,
    transparent: true,
    opacity: 0
  });
  const mesh = new THREE.Mesh(nodeGeom, mat);
  mesh.position.copy(latLonToVec3(loc.lat, loc.lon, 3.58));
  usaNodesGroup.add(mesh);
  usaNodes.push({ mesh, material: mat, offset: i * 1.2 });
});

// ── Update (called every frame) ───────────────────────────────────────────────

export function updateChapter1(scrollFloat, time) {
  // Nodes: fade in 1.0 → 1.3, pulse scale
  const opacity = clamp((scrollFloat - 1.0) / 0.3, 0, 1);
  usaNodes.forEach((n) => {
    n.material.opacity = opacity;
    const scale = 1.0 + 0.8 * Math.abs(Math.sin(time * 2.5 + n.offset));
    n.mesh.scale.setScalar(scale);
  });

  // Chapter 1 text: visible 1.2 → 1.8
  const t1 = document.getElementById('chapter1-text');
  if (t1) t1.style.opacity = (scrollFloat > 1.2 && scrollFloat < 1.8) ? '1' : '0';
}
