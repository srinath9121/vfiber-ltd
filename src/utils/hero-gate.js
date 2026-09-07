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

    // Approach animation — 0=apart, 1=touching
    this.approach = 0;
    this.approachVelocity = 0;
    this.sparkParticles = [];
    this.lastIdleTime = Date.now();

    // Legacy pointer/hand kept for triggerZeroUnlock signature compatibility
    this.pointer = { x: this.W * 0.5, y: this.H * 0.5, targetX: this.W * 0.5, targetY: this.H * 0.5, active: false };
    this.hand = { x: this.W * 0.5, y: this.H * 0.5, vx: 0, vy: 0 };

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

    // Scroll / touch drive approach animation
    this._onWheel = (e) => {
      if (this.unlocked) return;
      e.preventDefault();
      const delta = Math.sign(e.deltaY);
      if (delta > 0) {
        this.approach = Math.min(1, this.approach + 0.04);
        this.lastIdleTime = Date.now() + 9999; // suppress decay while scrolling
      } else {
        this.approach = Math.max(0, this.approach - 0.03);
        this.lastIdleTime = Date.now();
      }
    };
    this._touchStartY = 0;
    this._onTouchStart = (e) => { this._touchStartY = e.touches[0].clientY; };
    this._onTouchMove = (e) => {
      if (this.unlocked) return;
      e.preventDefault();
      const dy = this._touchStartY - e.touches[0].clientY;
      this._touchStartY = e.touches[0].clientY;
      if (dy > 0) {
        this.approach = Math.min(1, this.approach + 0.05);
        this.lastIdleTime = Date.now() + 9999;
      }
    };

    window.addEventListener('wheel', this._onWheel, { passive: false });
    window.addEventListener('touchstart', this._onTouchStart, { passive: true });
    window.addEventListener('touchmove', this._onTouchMove, { passive: false });

    // Keep pointer capture on canvas for Enter/Space bypass only
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

    // Parchment / aged vellum palette — Da Vinci sketch aesthetic
    const palette = [
      [185, 165, 130],  // aged parchment
      [160, 140, 108],  // warm sepia shadow
      [205, 188, 155],  // light vellum
      [140, 118, 88],   // dark umber
      [175, 155, 120],  // mid parchment
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

    // Warm vignette — umber not cold black
    const vg = this.bgCtx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.85);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(30,20,10,0.65)');
    this.bgCtx.fillStyle = vg;
    this.bgCtx.fillRect(0, 0, W, H);

    // Da Vinci construction lines — golden ratio circles + crosshairs
    this._drawConstructionLines(W, H);

    // Cache marble + construction lines pixel data (no hands yet)
    // So updateHand() can restore this cheaply each frame
    this._marbleCache = this.bgCtx.getImageData(0, 0, W, H);

    // Draw both hands at initial approach=0 positions
    this._drawBothHands(0);
  }

  _drawConstructionLines(W, H) {
    const ctx = this.bgCtx;
    const lx = W * 0.28; // left hand center
    const rx = W * 0.72; // right hand center
    const cy = H * 0.5;

    ctx.save();
    ctx.strokeStyle = 'rgba(160,130,70,0.07)';
    ctx.lineWidth = 0.6;

    // Concentric circles around each hand
    [80, 140, 210, 300].forEach(r => {
      ctx.beginPath(); ctx.arc(lx, cy, r, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(rx, cy, r, 0, Math.PI * 2); ctx.stroke();
    });

    // Crosshairs
    ctx.strokeStyle = 'rgba(160,130,70,0.05)';
    // Horizontal
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
    // Verticals at hand centers
    ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(rx, 0); ctx.lineTo(rx, H); ctx.stroke();
    // Diagonal construction lines
    ctx.strokeStyle = 'rgba(160,130,70,0.03)';
    ctx.beginPath(); ctx.moveTo(lx - 300, cy - 300); ctx.lineTo(lx + 300, cy + 300); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(rx - 300, cy + 300); ctx.lineTo(rx + 300, cy - 300); ctx.stroke();

    ctx.restore();
  }

  _drawBothHands(approach) {
    if (!this.bgCtx) return;
    const W = this.W, H = this.H;
    const ctx = this.bgCtx;

    // Hand positions: move toward center as approach → 1
    // At approach=0: fingertips are W*0.42 and W*0.58 apart (gap = 16% of screen)
    // At approach=1: fingertips meet at W*0.5
    const fingerLength = Math.min(W * 0.22, 200);
    const handW = fingerLength * 0.55;

    const lTipX = W * 0.42 + approach * (W * 0.08);  // left index fingertip X
    const rTipX = W * 0.58 - approach * (W * 0.08);  // right index fingertip X
    const midY = H * 0.5;

    // Draw left hand (pointing right) — wrist at left, tip at lTipX
    this._drawHandSide(ctx, lTipX - fingerLength * 1.6, midY, fingerLength, handW, false, approach);

    // Draw right hand (pointing left, mirrored) — wrist at right, tip at rTipX
    this._drawHandSide(ctx, rTipX + fingerLength * 1.6, midY, fingerLength, handW, true, approach);
  }

  // side: false=left hand (points right), true=right hand (points left, mirrored)
  _drawHandSide(ctx, wristX, wristY, fingerLen, handW, mirror, approach) {
    ctx.save();
    ctx.translate(wristX, wristY);
    if (mirror) ctx.scale(-1, 1);

    const dir = 1; // always draw pointing right, mirror handles flip
    const palmW = handW * 0.9;
    const palmH = handW * 0.7;

    // Radial glow behind hand — large, soft
    const glow = ctx.createRadialGradient(fingerLen * 0.5, 0, 10, fingerLen * 0.5, 0, fingerLen * 1.1);
    glow.addColorStop(0, `rgba(0,207,255,${0.12 + approach * 0.18})`);
    glow.addColorStop(0.5, `rgba(196,30,58,${0.05 + approach * 0.08})`);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(-palmW * 0.5, -fingerLen * 0.8, fingerLen * 2, fingerLen * 1.6);

    // Palm body
    ctx.beginPath();
    ctx.moveTo(0, -palmH * 0.5);
    ctx.bezierCurveTo(palmW * 0.1, -palmH * 0.6, palmW * 0.4, -palmH * 0.55, palmW * 0.5, -palmH * 0.3);
    ctx.bezierCurveTo(palmW * 0.55, 0, palmW * 0.5, palmH * 0.3, palmW * 0.35, palmH * 0.5);
    ctx.bezierCurveTo(palmW * 0.1, palmH * 0.65, -palmW * 0.1, palmH * 0.6, -palmW * 0.2, palmH * 0.4);
    ctx.bezierCurveTo(-palmW * 0.3, palmH * 0.1, -palmW * 0.25, -palmH * 0.3, 0, -palmH * 0.5);
    ctx.closePath();

    const palmGrad = ctx.createLinearGradient(-palmW * 0.3, -palmH * 0.5, palmW * 0.5, palmH * 0.5);
    palmGrad.addColorStop(0, 'rgba(75,52,28,0.95)');
    palmGrad.addColorStop(0.5, 'rgba(55,36,18,0.97)');
    palmGrad.addColorStop(1, 'rgba(35,22,10,0.95)');
    ctx.fillStyle = palmGrad;
    ctx.shadowColor = `rgba(0,207,255,${0.3 + approach * 0.4})`;
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = `rgba(180,140,80,${0.4 + approach * 0.3})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Four fingers — index is lead (pointing most right), others fanned
    const fingers = [
      { dy: -palmH * 0.35, spread: -0.06, len: fingerLen,        w: palmW * 0.28, lead: true  }, // index
      { dy: -palmH * 0.12, spread:  0.04, len: fingerLen * 0.95, w: palmW * 0.30, lead: false }, // middle
      { dy:  palmH * 0.12, spread:  0.14, len: fingerLen * 0.85, w: palmW * 0.27, lead: false }, // ring
      { dy:  palmH * 0.32, spread:  0.28, len: fingerLen * 0.68, w: palmW * 0.22, lead: false }, // pinky
    ];

    fingers.forEach(f => {
      this._drawFinger(ctx, palmW * 0.45, f.dy, f.len, f.w, f.spread, f.lead, approach);
    });

    // Thumb — angled downward from palm
    this._drawThumb(ctx, palmW * 0.1, palmH * 0.45, palmW * 0.22, palmH * 0.55, approach);

    // Wrist tendons
    ctx.save();
    [
      { y: -palmH * 0.35, color: `rgba(0,207,255,${0.7 + approach * 0.25})` },
      { y: -palmH * 0.10, color: `rgba(180,140,80,${0.4 + approach * 0.2})` },
      { y:  palmH * 0.12, color: `rgba(180,140,80,0.35)` },
      { y:  palmH * 0.32, color: `rgba(180,140,80,0.28)` },
    ].forEach(t => {
      ctx.beginPath();
      ctx.moveTo(-palmW * 0.15, t.y);
      ctx.quadraticCurveTo(palmW * 0.2, t.y * 0.4, palmW * 0.45, t.y);
      ctx.strokeStyle = t.color;
      ctx.lineWidth = 1.0;
      ctx.shadowColor = t.color; ctx.shadowBlur = 4;
      ctx.stroke(); ctx.shadowBlur = 0;
    });
    ctx.restore();

    ctx.restore();
  }

  _drawFinger(ctx, ox, oy, len, w, angle, isLead, approach) {
    ctx.save();
    ctx.translate(ox, oy);
    ctx.rotate(angle);

    const p1 = len * 0.38, p2 = len * 0.70, p3 = len;
    const hw = w * 0.5;

    ctx.beginPath();
    ctx.moveTo(-hw, 0);
    ctx.bezierCurveTo(-hw * 1.05, -p1 * 0.5, -hw * 0.9, -p1, -hw * 0.82, -p1);
    ctx.bezierCurveTo(-hw * 0.78, -p2 * 0.55, -hw * 0.72, -p2, -hw * 0.65, -p2);
    ctx.bezierCurveTo(-hw * 0.55, -p2 - (p3-p2)*0.4, -hw * 0.2, -p3 + hw*0.6, 0, -p3);
    ctx.bezierCurveTo( hw * 0.2, -p3 + hw*0.6,  hw * 0.55, -p2 - (p3-p2)*0.4,  hw * 0.65, -p2);
    ctx.bezierCurveTo( hw * 0.72, -p2,           hw * 0.78, -p2 * 0.55,          hw * 0.82, -p1);
    ctx.bezierCurveTo( hw * 0.9, -p1,            hw * 1.05, -p1 * 0.5,           hw, 0);
    ctx.closePath();

    const fg = ctx.createLinearGradient(-hw, -len, hw, 0);
    if (isLead) {
      fg.addColorStop(0, `rgba(0,207,255,${0.85 + approach * 0.12})`);
      fg.addColorStop(0.3, 'rgba(20,60,85,0.97)');
      fg.addColorStop(1, 'rgba(45,30,15,0.95)');
    } else {
      fg.addColorStop(0, 'rgba(90,65,35,0.94)');
      fg.addColorStop(0.5, 'rgba(60,42,20,0.96)');
      fg.addColorStop(1, 'rgba(38,25,12,0.94)');
    }
    ctx.fillStyle = fg;
    ctx.shadowColor = isLead ? `rgba(0,207,255,${0.5 + approach*0.4})` : 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = isLead ? 16 : 6;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = isLead ? `rgba(0,207,255,${0.7 + approach*0.25})` : 'rgba(180,140,80,0.35)';
    ctx.lineWidth = isLead ? 1.4 : 0.9;
    ctx.stroke();

    // Knuckle lines
    [p1, p2].forEach(kp => {
      ctx.beginPath();
      ctx.ellipse(0, -kp, hw * 0.75, 2, 0, 0, Math.PI * 2);
      ctx.strokeStyle = isLead ? 'rgba(0,207,255,0.55)' : 'rgba(180,140,80,0.22)';
      ctx.lineWidth = 0.8; ctx.stroke();
    });

    // Tendon line
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -p3 + 5);
    ctx.strokeStyle = isLead ? `rgba(255,255,255,${0.7 + approach*0.28})` : 'rgba(180,140,80,0.38)';
    ctx.lineWidth = isLead ? 1.5 : 0.9;
    ctx.shadowColor = isLead ? 'rgba(0,207,255,0.9)' : 'transparent';
    ctx.shadowBlur = isLead ? 8 : 0;
    ctx.stroke(); ctx.shadowBlur = 0;

    // Fingertip emitter
    const tipR = isLead ? 4 + approach * 3 : 2.5;
    ctx.beginPath(); ctx.arc(0, -p3 + 4, tipR, 0, Math.PI * 2);
    ctx.fillStyle = isLead ? '#ffffff' : 'rgba(180,140,80,0.7)';
    ctx.shadowColor = isLead ? `rgba(0,207,255,${0.9 + approach*0.1})` : 'rgba(180,140,80,0.4)';
    ctx.shadowBlur = isLead ? 20 + approach * 15 : 4;
    ctx.fill(); ctx.shadowBlur = 0;

    ctx.restore();
  }

  _drawThumb(ctx, ox, oy, w, len, approach) {
    ctx.save();
    ctx.translate(ox, oy); ctx.rotate(-0.5);
    ctx.beginPath();
    ctx.moveTo(-w*0.5, 0);
    ctx.bezierCurveTo(-w*0.55, -len*0.4, -w*0.4, -len, 0, -len);
    ctx.bezierCurveTo( w*0.4, -len,  w*0.55, -len*0.4, w*0.5, 0);
    ctx.closePath();
    const tg = ctx.createLinearGradient(-w*0.5, -len, w*0.5, 0);
    tg.addColorStop(0, 'rgba(80,56,28,0.93)');
    tg.addColorStop(1, 'rgba(40,26,12,0.92)');
    ctx.fillStyle = tg; ctx.fill();
    ctx.strokeStyle = 'rgba(180,140,80,0.3)'; ctx.lineWidth = 0.9; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0, -len+5);
    ctx.strokeStyle = 'rgba(180,140,80,0.35)'; ctx.lineWidth = 0.9; ctx.stroke();
    ctx.restore();
  }

  drawFrost(revealX, revealY, revealR) {
    if (!this.frostCtx || !this.bgCanvas) return;
    const W = this.W;
    const H = this.H;

    this.frostCtx.clearRect(0, 0, W, H);

    // Draw base marble background into frost layer
    this.frostCtx.drawImage(this.bgCanvas, 0, 0);

    // Warm cream frost overlay — parchment tone not cold teal
    const frostGrad = this.frostCtx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
    frostGrad.addColorStop(0, 'rgba(220,210,190,0.50)');
    frostGrad.addColorStop(0.5, 'rgba(225,215,195,0.55)');
    frostGrad.addColorStop(1, 'rgba(215,205,185,0.48)');
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
    if (this.state === GATE_STATE.OPEN) return;

    // Decay approach back to 0 if idle > 1.8s
    const now = Date.now();
    if (now - this.lastIdleTime > 1800 && !this.pointer.active) {
      this.approach = Math.max(0, this.approach - 0.006);
    }

    // Clamp
    this.approach = Math.min(1, Math.max(0, this.approach));

    // Redraw bg with current approach (both hands repositioned)
    if (this.bgCtx) {
      // Clear and redraw marble + construction lines + hands every frame
      // Only redraw hands area to avoid full marble regen cost
      const W = this.W, H = this.H;
      // Restore marble from frost canvas as base (frost is drawn on top anyway)
      // Just redraw hands on top of static marble — use separate sparks canvas
      this._redrawHandsOnly();
    }

    // Gap spark particles when approach > 0.55
    this._drawSparks();

    // Trigger unlock when fingertips meet
    if (this.approach >= 0.96 && !this.unlocked) {
      this.triggerZeroUnlock(this.W * 0.5, this.H * 0.5, 120);
      return;
    }

    this.animFrameId = requestAnimationFrame(this.updateHand);
  }

  _redrawHandsOnly() {
    if (!this.bgCtx || !this._marbleCache) return;
    const W = this.W, H = this.H;
    const ctx = this.bgCtx;
    // Restore cached marble+construction lines
    ctx.putImageData(this._marbleCache, 0, 0);
    // Draw both hands at current approach
    this._drawBothHands(this.approach);
  }

  _drawSparks() {
    if (!this.ctx) return;
    const W = this.W, H = this.H;
    const ctx = this.ctx;
    if (this.approach < 0.55) { ctx.clearRect(0, 0, W, H); return; }

    ctx.clearRect(0, 0, W, H);
    const t = Date.now() * 0.001;
    const gapX = W * 0.5;
    const gapY = H * 0.5;
    const intensity = (this.approach - 0.55) / 0.45; // 0→1 as approach goes 0.55→1.0
    const count = Math.floor(intensity * 18);

    for (let i = 0; i < count; i++) {
      const px = gapX + (Math.sin(t * 3.1 + i * 1.7) * 0.5) * 40 * intensity;
      const py = gapY + (Math.cos(t * 2.3 + i * 2.4) * 0.5) * 30 * intensity;
      const r = 1.5 + Math.sin(t * 5 + i) * 1.2;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,207,255,${0.4 + intensity * 0.55})`;
      ctx.shadowColor = 'rgba(0,207,255,0.9)';
      ctx.shadowBlur = 8 + intensity * 12;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Connection arc between fingertips when almost touching
    if (intensity > 0.7) {
      const arcIntensity = (intensity - 0.7) / 0.3;
      const fingerLen = Math.min(W * 0.22, 200);
      const lTipX = W * 0.42 + this.approach * W * 0.08;
      const rTipX = W * 0.58 - this.approach * W * 0.08;

      ctx.beginPath();
      ctx.moveTo(lTipX, gapY);
      const wobble = Math.sin(t * 12) * 8 * (1 - arcIntensity);
      ctx.quadraticCurveTo(gapX, gapY + wobble, rTipX, gapY);
      ctx.strokeStyle = `rgba(0,207,255,${arcIntensity * 0.8})`;
      ctx.lineWidth = 1.5 + arcIntensity * 2;
      ctx.shadowColor = 'rgba(0,207,255,1)';
      ctx.shadowBlur = 15 + arcIntensity * 20;
      ctx.stroke();
      ctx.shadowBlur = 0;
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

    // 3. Loop Closure Check
    const start = filtered[0];
    const end = filtered[filtered.length - 1];
    const closed = Math.hypot(end.x - start.x, end.y - start.y) < 120;

    // 4. Radius Coefficient of Variation Check
    const radii = filtered.map(p => Math.hypot(p.x - cx, p.y - cy));
    const meanR = radii.reduce((a, b) => a + b, 0) / radii.length;
    const stdR = Math.sqrt(radii.map(r => Math.pow(r - meanR, 2)).reduce((a, b) => a + b, 0) / radii.length);
    const cv = stdR / Math.max(meanR, 1);

    const isLoop = Math.abs(totalAngle) > Math.PI * 1.4;
    const isRound = cv < 0.45;

    if (isLoop && isRound && closed) {
      this.triggerZeroUnlock(cx, cy, meanR);
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
        // Remove gate listeners
        window.removeEventListener('wheel', this._onWheel);
        window.removeEventListener('touchstart', this._onTouchStart);
        window.removeEventListener('touchmove', this._onTouchMove);
        window.removeEventListener('keydown', this.onKeyDown);
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