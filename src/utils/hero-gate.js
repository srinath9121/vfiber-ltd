// hero-gate.js — VF Zero Lock Precision Interaction Engine & Procedural Marble/Frost Reveal
// Part of Phase 20: Immersive Interaction & Cinematic Art Direction for VF Technologies

import * as THREE from 'three';
import gsap from 'gsap';
import { setScrollLocked } from '../scroll.js';
import { ZeroPortalShader } from '../shaders/shaders.js';

export const GATE_STATE = {
  LOCKED: 0,
  DRAWING: 1,
  VALIDATING: 2,
  ACCEPTED: 3,
  REVEALING: 4,
  OPEN: 5
};

export class HeroGateEngine {
  constructor() {
    this.state = GATE_STATE.LOCKED;
    this.unlocked = false;
    this.points = [];

    this.overlay = null;
    this.promptEl = null;

    // Canvases
    this.bgCanvas = null;
    this.bgCtx = null;

    this.frostCanvas = null;
    this.frostCtx = null;

    this.canvas = null; // gesture canvas
    this.ctx = null;

    this.W = typeof window !== 'undefined' ? window.innerWidth : 1920;
    this.H = typeof window !== 'undefined' ? window.innerHeight : 1080;

    // Hand inertia simulation
    this.pointer = {
      x: this.W * 0.5,
      y: this.H * 0.5,
      targetX: this.W * 0.5,
      targetY: this.H * 0.5,
      active: false
    };

    this.hand = {
      x: this.W * 0.5,
      y: this.H * 0.5,
      vx: 0,
      vy: 0
    };

    // Portal Shader mesh & material
    this.portalScene = null;
    this.portalCamera = null;
    this.portalMesh = null;
    this.portalMaterial = null;

    this.animFrameId = null;

    this.resizeGestureCanvas = this.resizeGestureCanvas.bind(this);
    this.beginZero = this.beginZero.bind(this);
    this.moveZero = this.moveZero.bind(this);
    this.finishZero = this.finishZero.bind(this);
    this.cancelZero = this.cancelZero.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.updateHand = this.updateHand.bind(this);
  }

  init(containerEl) {
    if (typeof window === 'undefined') return;

    // Developer testing override hash check
    if (window.location.hash && window.location.hash.includes('sf=')) {
      this.state = GATE_STATE.OPEN;
      this.unlocked = true;
      setScrollLocked(false);
      return;
    }

    this.overlay = containerEl || document.getElementById('hero-gate');
    if (!this.overlay) return;

    this.bgCanvas = document.getElementById('bg-layer');
    if (this.bgCanvas) this.bgCtx = this.bgCanvas.getContext('2d');

    this.frostCanvas = document.getElementById('frost-layer');
    if (this.frostCanvas) this.frostCtx = this.frostCanvas.getContext('2d');

    this.canvas = document.getElementById('gesture-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d', { alpha: true });

    this.promptEl = document.getElementById('hero-prompt') || document.getElementById('instruction');

    this.resizeGestureCanvas();
    window.addEventListener('resize', this.resizeGestureCanvas);

    // Register Pointer Events for gesture drawing
    this.canvas.addEventListener('pointerdown', this.beginZero, { passive: false });
    this.canvas.addEventListener('pointermove', this.moveZero, { passive: false });
    this.canvas.addEventListener('pointerup', this.finishZero, { passive: false });
    this.canvas.addEventListener('pointercancel', this.cancelZero, { passive: false });

    window.addEventListener('keydown', this.onKeyDown);

    // Initialize 2D Orthographic Portal Shader overlay inside WebGL context
    this.initPortalShader();

    // Start Hand Inertia Physics loop
    this.updateHand();

    // Lock scroll engine until portal opening
    setScrollLocked(true);
  }

  // ─── 1. BACKGROUND: Procedural Marble & Hand Texture ────────────────────────
  generateMarble() {
    if (!this.bgCtx) return;
    const W = this.W;
    const H = this.H;
    const imgData = this.bgCtx.createImageData(W, H);
    const d = imgData.data;

    // Base jade/teal-green palette
    const palette = [
      [95, 155, 130],   // muted teal
      [70, 120, 105],   // deep jade
      [130, 175, 155],  // light sage
      [50, 95, 85],     // dark forest
      [110, 160, 140],  // mid jade
    ];

    for (let y = 0; y < H; y += 2) {
      for (let x = 0; x < W; x += 2) {
        // Layered sine marble
        const n1 = Math.sin((x * 0.004 + y * 0.006) * 2.1 + Math.sin(x * 0.01) * 1.5) * 0.5 + 0.5;
        const n2 = Math.sin((x * 0.007 - y * 0.003) * 3.3 + Math.cos(y * 0.008) * 2.0) * 0.5 + 0.5;
        const n3 = Math.sin(Math.sqrt(x * x * 0.00002 + y * y * 0.00002) * 8.0) * 0.5 + 0.5;
        const t = (n1 * 0.45 + n2 * 0.35 + n3 * 0.2);
        const ci = Math.floor(t * (palette.length - 1));
        const frac = t * (palette.length - 1) - ci;
        const c1 = palette[Math.min(ci, palette.length - 1)];
        const c2 = palette[Math.min(ci + 1, palette.length - 1)];

        const r = c1[0] * (1 - frac) + c2[0] * frac;
        const g = c1[1] * (1 - frac) + c2[1] * frac;
        const b = c1[2] * (1 - frac) + c2[2] * frac;

        for (let dy = 0; dy < 2 && (y + dy) < H; dy++) {
          for (let dx = 0; dx < 2 && (x + dx) < W; dx++) {
            const i = ((y + dy) * W + (x + dx)) * 4;
            d[i] = r;
            d[i + 1] = g;
            d[i + 2] = b;
            d[i + 3] = 255;
          }
        }
      }
    }
    this.bgCtx.putImageData(imgData, 0, 0);

    // Vignette
    const vg = this.bgCtx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.8);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.55)');
    this.bgCtx.fillStyle = vg;
    this.bgCtx.fillRect(0, 0, W, H);

    this.drawHand();
  }

  drawHand() {
    if (!this.bgCtx) return;
    const cx = this.W / 2;
    const cy = this.H / 2 + 115; // Positioned gracefully below center target ring
    const ctx = this.bgCtx;
    ctx.save();

    // 1. Photonic radial aura behind hand
    const hg = ctx.createRadialGradient(cx, cy - 30, 20, cx, cy - 30, 260);
    hg.addColorStop(0, 'rgba(0, 207, 255, 0.28)');
    hg.addColorStop(0.4, 'rgba(196, 30, 58, 0.15)');
    hg.addColorStop(1, 'rgba(5, 10, 20, 0)');
    ctx.fillStyle = hg;
    ctx.fillRect(cx - 300, cy - 300, 600, 600);

    // 2. Articulated Palm with Thenar Eminence & Deep-Space Teal/Navy Shading
    ctx.beginPath();
    // Thenar (thumb pad) curve -> Wrist -> Hypothenar -> Finger base webbing
    ctx.moveTo(cx - 55, cy + 20);
    ctx.bezierCurveTo(cx - 85, cy + 45, cx - 80, cy + 110, cx - 35, cy + 125);
    ctx.bezierCurveTo(cx, cy + 130, cx + 45, cy + 125, cx + 70, cy + 95);
    ctx.bezierCurveTo(cx + 85, cy + 50, cx + 80, cy + 20, cx + 62, cy + 10);
    ctx.bezierCurveTo(cx + 45, cy + 5, cx + 25, cy + 5, cx, cy + 2);
    ctx.bezierCurveTo(cx - 25, cy + 2, cx - 45, cy + 8, cx - 55, cy + 20);
    ctx.closePath();

    const palmGrad = ctx.createLinearGradient(cx - 70, cy - 40, cx + 70, cy + 130);
    palmGrad.addColorStop(0, 'rgba(12, 38, 56, 0.96)');
    palmGrad.addColorStop(0.4, 'rgba(8, 28, 44, 0.98)');
    palmGrad.addColorStop(1, 'rgba(4, 16, 28, 0.95)');
    ctx.fillStyle = palmGrad;
    ctx.shadowColor = 'rgba(0, 207, 255, 0.35)';
    ctx.shadowBlur = 20;
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(0, 207, 255, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 3. Articulated 3-Phalange Finger Generator
    const drawPhalangeFinger = (ox, oy, baseW, length, angle, isLeading = false) => {
      ctx.save();
      ctx.translate(ox, oy);
      ctx.rotate(angle);

      const p1 = length * 0.40; // Proximal joint
      const p2 = length * 0.72; // Middle joint
      const p3 = length;        // Distal tip

      const wBase = baseW;
      const wJ1   = baseW * 0.88;
      const wMid  = baseW * 0.80;
      const wJ2   = baseW * 0.74;
      const wTip  = baseW * 0.58;

      ctx.beginPath();
      // Right contour (ascending)
      ctx.moveTo(wBase / 2, 0);
      ctx.bezierCurveTo(wBase / 2 + 1, -p1 * 0.5, wJ1 / 2 + 1.5, -p1, wJ1 / 2, -p1);
      ctx.bezierCurveTo(wJ1 / 2 - 0.5, -p1 - (p2 - p1) * 0.5, wMid / 2, -p2, wJ2 / 2, -p2);
      ctx.bezierCurveTo(wJ2 / 2 - 0.5, -p2 - (p3 - p2) * 0.5, wTip / 2 + 1, -p3 + wTip / 2, 0, -p3);

      // Left contour (descending)
      ctx.bezierCurveTo(-wTip / 2 - 1, -p3 + wTip / 2, -wJ2 / 2 + 0.5, -p2 - (p3 - p2) * 0.5, -wJ2 / 2, -p2);
      ctx.bezierCurveTo(-wMid / 2, -p2, -wJ1 / 2 + 0.5, -p1 - (p2 - p1) * 0.5, -wJ1 / 2, -p1);
      ctx.bezierCurveTo(-wJ1 / 2 - 1.5, -p1, -wBase / 2 - 1, -p1 * 0.5, -wBase / 2, 0);
      ctx.closePath();

      const fg = ctx.createLinearGradient(-baseW / 2, -length, baseW / 2, 0);
      if (isLeading) {
        fg.addColorStop(0, 'rgba(0, 207, 255, 0.95)');
        fg.addColorStop(0.35, 'rgba(16, 55, 80, 0.98)');
        fg.addColorStop(1, 'rgba(6, 24, 40, 0.95)');
      } else {
        fg.addColorStop(0, 'rgba(15, 60, 85, 0.95)');
        fg.addColorStop(0.5, 'rgba(8, 32, 50, 0.98)');
        fg.addColorStop(1, 'rgba(4, 18, 30, 0.94)');
      }
      ctx.fillStyle = fg;
      ctx.shadowColor = isLeading ? 'rgba(0, 207, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = isLeading ? 18 : 10;
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = isLeading ? 'rgba(0, 207, 255, 0.85)' : 'rgba(0, 207, 255, 0.35)';
      ctx.lineWidth = isLeading ? 1.5 : 1.0;
      ctx.stroke();

      // Knuckle Joint Accent Rings
      const drawKnuckleRing = (yPos, width) => {
        ctx.beginPath();
        ctx.ellipse(0, -yPos, width * 0.42, 2.2, 0, 0, Math.PI * 2);
        ctx.strokeStyle = isLeading ? 'rgba(0, 207, 255, 0.7)' : 'rgba(0, 207, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
      };
      drawKnuckleRing(p1, wJ1);
      drawKnuckleRing(p2, wJ2);

      // Optical Core Tendon Trace
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -p3 + 6);
      ctx.strokeStyle = isLeading ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 207, 255, 0.4)';
      ctx.lineWidth = isLeading ? 1.6 : 1.0;
      ctx.shadowColor = isLeading ? 'rgba(0, 207, 255, 0.9)' : 'transparent';
      ctx.shadowBlur = 8;
      ctx.stroke();

      // Fingertip Optical Emitter Node
      ctx.beginPath();
      ctx.arc(0, -p3 + 4, isLeading ? 3.5 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = isLeading ? '#ffffff' : 'rgba(0, 207, 255, 0.85)';
      ctx.shadowColor = isLeading ? 'rgba(0, 207, 255, 1)' : 'rgba(0, 207, 255, 0.5)';
      ctx.shadowBlur = isLeading ? 16 : 6;
      ctx.fill();

      ctx.restore();
    };

    // Draw Fingers in Anatomical Positions (Index, Middle, Ring, Pinky)
    drawPhalangeFinger(cx - 32, cy - 10, 28, 125, -0.06, true);  // Index finger (Pointing up, leading)
    drawPhalangeFinger(cx + 4, cy - 15, 30, 138, 0.02, false);   // Middle finger (Tallest)
    drawPhalangeFinger(cx + 38, cy - 8, 28, 118, 0.12, false);   // Ring finger
    drawPhalangeFinger(cx + 68, cy + 12, 24, 90, 0.28, false);   // Pinky finger

    // Articulated Thumb (Left Side)
    const drawThumb = (ox, oy, baseW, length, angle) => {
      ctx.save();
      ctx.translate(ox, oy);
      ctx.rotate(angle);

      ctx.beginPath();
      ctx.moveTo(baseW / 2, 0);
      ctx.bezierCurveTo(baseW / 2, -length * 0.4, baseW * 0.4, -length, 0, -length);
      ctx.bezierCurveTo(-baseW * 0.4, -length, -baseW / 2, -length * 0.4, -baseW / 2, 0);
      ctx.closePath();

      const tg = ctx.createLinearGradient(-baseW / 2, -length, baseW / 2, 0);
      tg.addColorStop(0, 'rgba(12, 50, 75, 0.95)');
      tg.addColorStop(1, 'rgba(4, 18, 30, 0.92)');
      ctx.fillStyle = tg;
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 207, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Photonic line
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -length + 6);
      ctx.strokeStyle = 'rgba(0, 207, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    };

    drawThumb(cx - 62, cy + 32, 30, 78, -0.58);

    // 4. Optical Photonic Tendons across Palm
    ctx.save();
    const palmTendons = [
      { fromX: cx - 50, fromY: cy + 110, toX: cx - 32, toY: cy - 10, color: 'rgba(0, 207, 255, 0.85)' },
      { fromX: cx - 20, fromY: cy + 115, toX: cx + 4, toY: cy - 15, color: 'rgba(0, 207, 255, 0.45)' },
      { fromX: cx + 15, fromY: cy + 115, toX: cx + 38, toY: cy - 8, color: 'rgba(0, 207, 255, 0.45)' },
      { fromX: cx + 40, fromY: cy + 105, toX: cx + 68, toY: cy + 12, color: 'rgba(0, 207, 255, 0.35)' },
      { fromX: cx - 45, fromY: cy + 100, toX: cx - 62, toY: cy + 32, color: 'rgba(196, 30, 58, 0.65)' }
    ];

    palmTendons.forEach(t => {
      ctx.beginPath();
      ctx.moveTo(t.fromX, t.fromY);
      ctx.quadraticCurveTo((t.fromX + t.toX) / 2 + 4, (t.fromY + t.toY) / 2, t.toX, t.toY);
      ctx.strokeStyle = t.color;
      ctx.lineWidth = 1.2;
      ctx.shadowColor = t.color;
      ctx.shadowBlur = 6;
      ctx.stroke();
    });

    ctx.restore();
    ctx.restore();
  }

  // ─── 2. FROST LAYER: Blurred overlay with crystal lines & radial reveal ───
  drawFrost(revealX, revealY, revealR) {
    if (!this.frostCtx || !this.bgCanvas) return;
    const W = this.W;
    const H = this.H;

    this.frostCtx.clearRect(0, 0, W, H);

    // Draw base marble background into frost layer
    this.frostCtx.drawImage(this.bgCanvas, 0, 0);

    // White frost translucent overlay
    const frostGrad = this.frostCtx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
    frostGrad.addColorStop(0, 'rgba(200,220,215,0.55)');
    frostGrad.addColorStop(0.5, 'rgba(210,225,220,0.60)');
    frostGrad.addColorStop(1, 'rgba(190,215,208,0.50)');
    this.frostCtx.fillStyle = frostGrad;
    this.frostCtx.fillRect(0, 0, W, H);

    // Frost crystal texture (random short lines)
    this.frostCtx.save();
    const seed = 42;
    for (let i = 0; i < 400; i++) {
      const fx = ((Math.sin(i * seed * 0.1) * 0.5 + 0.5)) * W;
      const fy = ((Math.cos(i * seed * 0.07) * 0.5 + 0.5)) * H;
      const len = 5 + ((Math.sin(i * 3.1)) * 0.5 + 0.5) * 20;
      const angle = (Math.sin(i * 1.7)) * Math.PI;
      this.frostCtx.beginPath();
      this.frostCtx.moveTo(fx, fy);
      this.frostCtx.lineTo(fx + Math.cos(angle) * len, fy + Math.sin(angle) * len);
      this.frostCtx.strokeStyle = `rgba(255,255,255,${0.05 + ((Math.sin(i * 2.3)) * 0.5 + 0.5) * 0.12})`;
      this.frostCtx.lineWidth = 0.8;
      this.frostCtx.stroke();
    }
    this.frostCtx.restore();

    // Cut out reveal circle using destination-out mode
    if (revealR > 0) {
      this.frostCtx.save();
      this.frostCtx.globalCompositeOperation = 'destination-out';
      const revGrad = this.frostCtx.createRadialGradient(revealX, revealY, revealR * 0.6, revealX, revealY, revealR);
      revGrad.addColorStop(0, 'rgba(0,0,0,1)');
      revGrad.addColorStop(0.7, 'rgba(0,0,0,0.9)');
      revGrad.addColorStop(1, 'rgba(0,0,0,0)');
      this.frostCtx.fillStyle = revGrad;
      this.frostCtx.beginPath();
      this.frostCtx.arc(revealX, revealY, revealR, 0, Math.PI * 2);
      this.frostCtx.fill();
      this.frostCtx.restore();
    }
  }

  initPortalShader() {
    this.portalMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: THREE.UniformsUtils.clone(ZeroPortalShader.uniforms),
      vertexShader: ZeroPortalShader.vertexShader,
      fragmentShader: ZeroPortalShader.fragmentShader
    });

    this.portalMaterial.uniforms.uAspect.value = this.W / this.H;
    this.portalMaterial.uniforms.uResolution.value.set(this.W, this.H);

    this.portalScene = new THREE.Scene();
    this.portalCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const planeGeo = new THREE.PlaneGeometry(2, 2);
    this.portalMesh = new THREE.Mesh(planeGeo, this.portalMaterial);
    this.portalScene.add(this.portalMesh);
  }

  resizeGestureCanvas() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.W = window.innerWidth;
    this.H = window.innerHeight;

    if (this.bgCanvas) {
      this.bgCanvas.width = this.W;
      this.bgCanvas.height = this.H;
      this.generateMarble();
    }

    if (this.frostCanvas) {
      this.frostCanvas.width = this.W;
      this.frostCanvas.height = this.H;
      this.drawFrost(0, 0, 0);
    }

    this.canvas.width = this.W * dpr;
    this.canvas.height = this.H * dpr;
    this.canvas.style.width = `${this.W}px`;
    this.canvas.style.height = `${this.H}px`;

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (this.portalMaterial) {
      this.portalMaterial.uniforms.uAspect.value = this.W / this.H;
      this.portalMaterial.uniforms.uResolution.value.set(this.W, this.H);
    }
  }

  getPointerPosition(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  updateHand() {
    const dx = this.pointer.targetX - this.hand.x;
    const dy = this.pointer.targetY - this.hand.y;

    this.hand.vx += dx * 0.18;
    this.hand.vy += dy * 0.18;

    this.hand.vx *= 0.72;
    this.hand.vy *= 0.72;

    this.hand.x += this.hand.vx;
    this.hand.y += this.hand.vy;

    if (this.state !== GATE_STATE.OPEN) {
      this.animFrameId = requestAnimationFrame(this.updateHand);
    }
  }

  beginZero(e) {
    if (this.unlocked) return;
    e.preventDefault();

    const p = this.getPointerPosition(e);

    this.state = GATE_STATE.DRAWING;
    this.pointer.active = true;

    this.pointer.targetX = p.x;
    this.pointer.targetY = p.y;

    this.points = [p];

    this.ctx.clearRect(0, 0, this.W, this.H);
    this.ctx.beginPath();
    this.ctx.moveTo(p.x, p.y);

    try {
      this.canvas.setPointerCapture?.(e.pointerId);
    } catch (err) {}
  }

  moveZero(e) {
    if (this.state !== GATE_STATE.DRAWING || this.unlocked) return;
    e.preventDefault();

    const p = this.getPointerPosition(e);

    this.pointer.targetX = p.x;
    this.pointer.targetY = p.y;

    this.points.push(p);

    this.drawZeroStroke(p);
  }

  finishZero(e) {
    if (this.state !== GATE_STATE.DRAWING || this.unlocked) return;
    e.preventDefault();

    this.state = GATE_STATE.VALIDATING;
    this.pointer.active = false;

    this.ctx.beginPath();
    this.validateZero();
  }

  cancelZero(e) {
    if (this.state !== GATE_STATE.DRAWING || this.unlocked) return;
    e.preventDefault();

    this.state = GATE_STATE.LOCKED;
    this.pointer.active = false;
    this.points = [];

    this.fadeZeroStroke();
  }

  onKeyDown(e) {
    if (this.unlocked) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.triggerZeroUnlock(this.W * 0.5, this.H * 0.5, 120);
    }
  }

  drawZeroStroke(p) {
    if (!this.ctx) return;

    this.ctx.save();
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // 1. Glowing white & cyan stroke
    this.ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
    this.ctx.shadowBlur = 18;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    this.ctx.lineWidth = 3;

    this.ctx.lineTo(p.x, p.y);
    this.ctx.stroke();

    // 2. Bright leading contact dot
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    this.ctx.shadowBlur = 30;
    this.ctx.fill();

    this.ctx.restore();

    this.ctx.beginPath();
    this.ctx.moveTo(p.x, p.y);
  }

  // ── Zero Loop Recognition Algorithm ────────────────────────────────────────
  validateZero() {
    if (this.points.length < 15) {
      this.fadeZeroStroke();
      return;
    }

    // Filter tiny jitter movements (< 12px)
    const filtered = [this.points[0]];
    for (let i = 1; i < this.points.length; i++) {
      const last = filtered[filtered.length - 1];
      if (Math.hypot(this.points[i].x - last.x, this.points[i].y - last.y) > 12) {
        filtered.push(this.points[i]);
      }
    }

    if (filtered.length < 6) {
      this.fadeZeroStroke();
      return;
    }

    // 1. Centroid calculation (cx, cy)
    let cx = 0, cy = 0;
    filtered.forEach(p => { cx += p.x; cy += p.y; });
    cx /= filtered.length;
    cy /= filtered.length;

    // 2. Winding Angle (total rotation around centroid)
    let totalAngle = 0;
    for (let i = 1; i < filtered.length; i++) {
      const a1 = Math.atan2(filtered[i - 1].y - cy, filtered[i - 1].x - cx);
      const a2 = Math.atan2(filtered[i].y - cy, filtered[i].x - cx);
      let d = a2 - a1;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      totalAngle += d;
    }

    // 3. Strand path length calculation
    let strandLength = 0;
    for (let i = 1; i < filtered.length; i++) {
      strandLength += Math.hypot(filtered[i].x - filtered[i - 1].x, filtered[i].y - filtered[i - 1].y);
    }

    // 4. Loop Closure Check
    const start = filtered[0];
    const end = filtered[filtered.length - 1];
    const closed = Math.hypot(end.x - start.x, end.y - start.y) < 120;

    // 5. Radius Coefficient of Variation Check
    const radii = filtered.map(p => Math.hypot(p.x - cx, p.y - cy));
    const meanR = radii.reduce((a, b) => a + b, 0) / radii.length;
    const stdR = Math.sqrt(radii.map(r => Math.pow(r - meanR, 2)).reduce((a, b) => a + b, 0) / radii.length);
    const cv = stdR / Math.max(meanR, 1);

    const isLoop = Math.abs(totalAngle) > Math.PI * 1.4 && cv < 0.45 && closed;
    const isStrand = strandLength > 120; // Fiber strand gesture

    if (isLoop || isStrand) {
      this.triggerZeroUnlock(cx, cy, Math.max(meanR, 120));
    } else {
      this.fadeZeroStroke();
    }
  }

  fadeZeroStroke() {
    gsap.to(this.canvas, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
      onComplete: () => {
        if (this.ctx) this.ctx.clearRect(0, 0, this.W, this.H);
        gsap.set(this.canvas, { opacity: 1 });
        this.state = GATE_STATE.LOCKED;
      }
    });
  }

  // ── Centroid-Driven Reveal Animation ────────────────────────────────────────
  triggerZeroUnlock(cx, cy, radius) {
    if (this.unlocked) return;
    this.unlocked = true;
    this.state = GATE_STATE.ACCEPTED;
    this.pointer.active = false;

    if (this.promptEl) {
      gsap.to(this.promptEl, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
      });
    }

    // Flash white then fade stroke canvas
    gsap.to(this.canvas, {
      opacity: 0,
      delay: 0.15,
      duration: 0.4,
      ease: 'power2.inOut'
    });

    const obj = {
      r: radius * 0.5,
      x: cx,
      y: cy
    };

    const maxRadius = Math.max(this.W, this.H) * 1.25;

    this.state = GATE_STATE.REVEALING;

    // Set portal shader center to normalized zero centroid coordinates
    if (this.portalMaterial) {
      this.portalMaterial.uniforms.uCenter.value.set(
        cx / this.W,
        1.0 - (cy / this.H)
      );
    }

    // Animate frost layer destination-out radial reveal outward
    gsap.to(obj, {
      r: maxRadius,
      duration: 2.0,
      ease: 'power2.inOut',
      onUpdate: () => {
        this.drawFrost(obj.x, obj.y, obj.r);
        if (this.portalMaterial) {
          this.portalMaterial.uniforms.uRadius.value = obj.r / maxRadius;
          this.portalMaterial.uniforms.uProgress.value = obj.r / maxRadius;
        }
      },
      onComplete: () => {
        this.state = GATE_STATE.OPEN;
        if (this.overlay) {
          gsap.to(this.overlay, {
            opacity: 0,
            duration: 0.6,
            onComplete: () => {
              this.overlay.style.display = 'none';
              this.overlay.style.pointerEvents = 'none';
            }
          });
        }
        // Remove event listeners after opening
        if (this.canvas) {
          this.canvas.removeEventListener('pointerdown', this.beginZero);
          this.canvas.removeEventListener('pointermove', this.moveZero);
          this.canvas.removeEventListener('pointerup', this.finishZero);
          this.canvas.removeEventListener('pointercancel', this.cancelZero);
        }
        // Unlock virtual scroll engine
        setScrollLocked(false);
      }
    });
  }

  update(time, renderer) {
    if (this.state === GATE_STATE.OPEN) return;

    if (this.portalMaterial) {
      this.portalMaterial.uniforms.uTime.value = time;

      if (renderer && this.portalScene && this.portalCamera) {
        renderer.clearDepth();
        renderer.render(this.portalScene, this.portalCamera);
      }
    }
  }
}

export const heroGateEngine = new HeroGateEngine();
