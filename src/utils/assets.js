// assets.js — Production Draco & KTX2 Asset Pipeline & Centralized Registry
// Part of Phase 16.5: Actual Draco + KTX2 GPU Asset Pipeline for VF Technologies

import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';

// ── Asset State Enums ─────────────────────────────────────────────────────────

export const ASSET_STATE = {
  UNLOADED: 'UNLOADED',
  LOADING:  'LOADING',
  READY:    'READY',
  ACTIVE:   'ACTIVE',
  INACTIVE: 'INACTIVE',
  DISPOSED: 'DISPOSED'
};

// ── Centralized Asset Registry Manifest ───────────────────────────────────────

export const ASSETS_MANIFEST = {
  earth: {
    dayMap:      { type: 'texture', url: '/textures/abs_splice_tray_map.jpg' },
    castIronMap: { type: 'texture', url: '/textures/cast_iron_landing_map.jpg' },
    sfp28Metal:  { type: 'texture', url: '/textures/sfp28_metal_map.jpg' }
  },
  tower: {
    reference1:  { type: 'image',   url: '/references/tower 1.jpg' },
    reference2:  { type: 'image',   url: '/references/tower 3.jpg' }
  },
  fiber: {
    reference1:  { type: 'image',   url: '/references/1. Submarine cable/1000198357.jpg' },
    reference2:  { type: 'image',   url: '/references/2. Actual fiber bundle loose-tube construction/YZhsiXd5_1000198363.jpg' }
  },
  odf: {
    reference1:  { type: 'image',   url: '/references/7. ODF fiber distribution panel/1000198368.jpg' }
  }
};

// ── Asset Registry Manager Class ──────────────────────────────────────────────

export class AssetRegistry {
  constructor() {
    this.cache = new Map();
    this.states = new Map();
    this.loadingCount = 0;

    // Standard Texture Loader
    this.textureLoader = new THREE.TextureLoader();

    // 1. Official Three.js DRACOLoader setup with local WASM decoder path
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('/draco/gltf/');

    // 2. Official Three.js KTX2Loader setup with local Basis transcoder path
    this.ktx2Loader = new KTX2Loader();
    this.ktx2Loader.setTranscoderPath('/basis/');
    this.ktx2Supported = false;
  }

  // Bind WebGLRenderer & initialize GPU compression capability detection
  initRenderer(renderer) {
    if (renderer && !this.ktx2Supported) {
      try {
        this.ktx2Loader.detectSupport(renderer);
        this.ktx2Supported = true;
        console.log('[AssetPipeline] KTX2Loader & Basis transcoder initialized with WebGL support detection.');
      } catch (err) {
        console.warn('[AssetPipeline] KTX2Loader support detection warning:', err);
      }
    }
  }

  // Load single texture with color-space awareness & caching
  loadTexture(key, url, isColorData = true) {
    if (this.cache.has(key)) {
      this.states.set(key, ASSET_STATE.READY);
      return Promise.resolve(this.cache.get(key));
    }

    this.states.set(key, ASSET_STATE.LOADING);
    this.loadingCount++;

    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => {
          texture.colorSpace = isColorData ? THREE.SRGBColorSpace : THREE.NoColorSpace;
          this.cache.set(key, texture);
          this.states.set(key, ASSET_STATE.READY);
          this.loadingCount = Math.max(0, this.loadingCount - 1);
          resolve(texture);
        },
        undefined,
        (err) => {
          console.warn(`[AssetPipeline] Failed to load texture '${key}' at '${url}'`, err);
          this.states.set(key, ASSET_STATE.UNLOADED);
          this.loadingCount = Math.max(0, this.loadingCount - 1);
          reject(err);
        }
      );
    });
  }

  // Load KTX2 compressed texture with automatic fallback to standard texture
  loadKTX2Texture(key, ktx2Url, fallbackUrl, isColorData = true) {
    if (this.cache.has(key)) {
      this.states.set(key, ASSET_STATE.READY);
      return Promise.resolve(this.cache.get(key));
    }

    if (!this.ktx2Supported) {
      return this.loadTexture(key, fallbackUrl, isColorData);
    }

    this.states.set(key, ASSET_STATE.LOADING);
    this.loadingCount++;

    return new Promise((resolve) => {
      this.ktx2Loader.load(
        ktx2Url,
        (texture) => {
          texture.colorSpace = isColorData ? THREE.SRGBColorSpace : THREE.NoColorSpace;
          this.cache.set(key, texture);
          this.states.set(key, ASSET_STATE.READY);
          this.loadingCount = Math.max(0, this.loadingCount - 1);
          resolve(texture);
        },
        undefined,
        (err) => {
          console.warn(`[AssetPipeline] KTX2 load failed for '${key}'. Falling back to '${fallbackUrl}'`, err);
          this.loadTexture(key, fallbackUrl, isColorData).then(resolve);
        }
      );
    });
  }

  // Get cached asset synchronously
  get(key) {
    return this.cache.get(key) || null;
  }

  // Mark asset state
  setState(key, state) {
    if (this.states.has(key)) {
      this.states.set(key, state);
    }
  }

  // Safe disposal
  dispose(key) {
    const asset = this.cache.get(key);
    if (asset && typeof asset.dispose === 'function') {
      asset.dispose();
      this.cache.delete(key);
      this.states.set(key, ASSET_STATE.DISPOSED);
    }
  }
}

export const assetRegistry = new AssetRegistry();
