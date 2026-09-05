// engine.js — Foundational Three.js Experience Engine & Performance Monitor
// Part of Phase 10: Performance & Memory Engine for VF Technologies

import * as THREE from 'three';
import { MAX_SCROLL, scrollFloat, storyProgress } from '../scroll.js';

// ── 1. Stage Detection System ────────────────────────────────────────────────

export const STAGES = [
  { id: 'entry', minSf: 0.00, maxSf: 0.20, label: 'Entry Identity' },
  { id: 'earth', minSf: 0.20, maxSf: 0.95, label: 'Planetary Earth & Subsea Landing' },
  { id: 'earth_content', minSf: 0.95, maxSf: 1.70, label: 'Regional Grid & Texas Hub' },
  { id: 'tower', minSf: 1.70, maxSf: 2.50, label: 'Steel Lattice Infrastructure' },
  { id: 'tower_content', minSf: 2.50, maxSf: 3.30, label: 'Make-Ready Engineering Specs' },
  { id: 'fiber', minSf: 3.30, maxSf: 5.30, label: 'Loose-Tube Fiber & 9µm Core Waveguide' },
  { id: 'fiber_content', minSf: 5.30, maxSf: 5.82, label: 'SFP28 Demarcation & ODF Rack Bay' },
  { id: 'ending', minSf: 5.82, maxSf: 6.00, label: 'Planetary Return & Metrics CTA' }
];

export function getCurrentStage(sf = scrollFloat) {
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (sf >= STAGES[i].minSf) {
      return STAGES[i];
    }
  }
  return STAGES[0];
}

// ── 2. Quality Presets & Performance Monitor ──────────────────────────────────

export const QUALITY_PRESETS = {
  HIGH: {
    maxPixelRatio: 2.0,
    starCount: 5200,
    sphereSegments: 64,
    shadows: true
  },
  MEDIUM: {
    maxPixelRatio: 1.5,
    starCount: 3200,
    sphereSegments: 48,
    shadows: false
  },
  LOW: {
    maxPixelRatio: 1.0,
    starCount: 1800,
    sphereSegments: 32,
    shadows: false
  }
};

export class PerformanceMonitor {
  constructor(engine) {
    this.engine = engine;
    this.frameCount = 0;
    this.lastTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    this.fps = 60;
    this.currentQuality = typeof window !== 'undefined' && window.innerWidth < 768 ? 'MEDIUM' : 'HIGH';
  }

  update() {
    this.frameCount++;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const delta = now - this.lastTime;

    if (delta >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / delta);
      this.frameCount = 0;
      this.lastTime = now;

      // Dynamic quality scaling down if sustained FPS drops for low-end devices
      if (this.fps < 30 && this.currentQuality === 'HIGH') {
        this.currentQuality = 'MEDIUM';
        if (this.engine && this.engine.renderer) {
          this.engine.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        }
      } else if (this.fps < 20 && this.currentQuality === 'MEDIUM') {
        this.currentQuality = 'LOW';
        if (this.engine && this.engine.renderer) {
          this.engine.renderer.setPixelRatio(1.0);
        }
      }
    }
  }
}

// ── 3. Memory & Asset Disposal Utilities ─────────────────────────────────────

export function disposeGeometry(geometry) {
  if (geometry && typeof geometry.dispose === 'function') {
    geometry.dispose();
  }
}

export function disposeMaterial(material) {
  if (!material) return;
  if (Array.isArray(material)) {
    material.forEach(disposeMaterial);
    return;
  }
  const textureSlots = ['map', 'lightMap', 'bumpMap', 'normalMap', 'roughnessMap', 'metalnessMap', 'alphaMap', 'envMap'];
  textureSlots.forEach((slot) => {
    if (material[slot] && typeof material[slot].dispose === 'function') {
      material[slot].dispose();
    }
  });
  if (typeof material.dispose === 'function') {
    material.dispose();
  }
}

export function disposeMesh(mesh) {
  if (!mesh) return;
  if (mesh.geometry) disposeGeometry(mesh.geometry);
  if (mesh.material) disposeMaterial(mesh.material);
}

export function disposeGroup(group) {
  if (!group) return;
  group.traverse((child) => {
    if (child.isMesh || child.isPoints || child.isLine) {
      disposeMesh(child);
    }
  });
}

// ── 4. Experience Engine & Pointer / Touch Tracking ───────────────────────────

export class ExperienceEngine {
  constructor(canvas, scene, camera, renderer) {
    this.canvas = canvas;
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.pointer = { x: 0, y: 0 };
    this.touch = { startX: 0, startY: 0, isDragging: false };
    this.monitor = new PerformanceMonitor(this);
    this.initEventListeners();
  }

  initEventListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('pointermove', (e) => {
      this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });

    window.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.touch.startX = e.touches[0].clientX;
        this.touch.startY = e.touches[0].clientY;
        this.touch.isDragging = true;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.touch.isDragging = false;
    }, { passive: true });
  }

  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isPortrait = width < height;

    this.camera.aspect = width / height;
    this.camera.fov = isPortrait ? 78 : 70;
    this.camera.updateProjectionMatrix();

    const maxRatio = QUALITY_PRESETS[this.monitor.currentQuality].maxPixelRatio;
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxRatio));
  }
}
