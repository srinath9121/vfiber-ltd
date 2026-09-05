// hero-gate.js — VF Hero Gate Engine
// High-Resolution Da Vinci Anatomical Hands & Procedural Frost / Optical Portal Reveal

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

    // Approach animation: 0 = separated, 1 = touching
    this.approach = 0.0;
    this.lastIdleTime = typeof Date !== 'undefined' ? Date.now() : 0;

    // Reference image
    this.handImg = null;
    this.handImgLoaded = false;

    // Pointer parallax tracking
    this.pointer = {
      targetX: this.W * 0.5,
      targetY: this.H * 0.5,
      active: false
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
      this.overlay = containerEl || document.getElementById('hero-gate');
      if (this.overlay) {
        this.overlay.style.display = 'none';
        this.overlay.style.pointerEvents = 'none';
        this.overlay.style.opacity = '0';
      }
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

    // Load authentic Da Vinci hands reference artwork
    this.handImg = new Image();
    this.handImg.onload = () => {
      this.handImgLoaded = true;
      this._renderBackground(this.approach);
    };
    this.handImg.src = '/hero-hands.png';

    this.resizeGestureCanvas();
    window.addEventListener('resize', this.resizeGestureCanvas);

    // Scroll & touch drive approach animation
    this._onWheel = (e) => {
      if (this.unlocked) return;
      e.preventDefault();
      const delta = Math.sign(e.deltaY);
      if (delta > 0) {
        this.approach = Math.min(1.0, this.approach + 0.05);
        this.lastIdleTime = Date.now() + 9999; // suppress decay while scrolling
      } else {
        this.approach = Math.max(0.0, this.approach - 0.04);
        this.lastIdleTime = Date.now();
      }
    };

    this._touchStartY = 0;
    this._onTouchStart = (e) => {
      if (e.touches && e.touches[0]) {
        this._touchStartY = e.touches[0].clientY;
      }
    };
    this._onTouchMove = (e) => {
      if (this.unlocked) return;
      if (!e.touches || !e.touches[0]) return;
      const dy = this._touchStartY - e.touches[0].clientY;
      this._touchStartY = e.touches[0].clientY;
      if (dy > 0) {
        this.approach = Math.min(1.0, this.approach + 0.06);
        this.lastIdleTime = Date.now() + 9999;
      }
    };

    window.addEventListener('wheel', this._onWheel, { passive: false });
    window.addEventListener('touchstart', this._onTouchStart, { passive: true });
    window.addEventListener('touchmove', this._onTouchMove, { passive: false });

    // Gesture canvas drawing events for zero recognition
    this.canvas.addEventListener('mousedown', this.beginZero);
    this.canvas.addEventListener('mousemove', this.moveZero);
    this.canvas.addEventListener('mouseup', this.finishZero);
    this.canvas.addEventListener('mouseleave', this.cancelZero);

    this.canvas.addEventListener('touchstart', this.beginZero, { passive: false });
    this.canvas.addEventListener('touchmove', this.moveZero, { passive: false });
    this.canvas.addEventListener('touchend', this.finishZero);
    this.canvas.addEventListener('touchcancel', this.cancelZero);

    // Keyboard Enter / Space bypass
    window.addEventListener('keydown', this.onKeyDown);

    // Initialize 2D Orthographic Portal Shader overlay inside WebGL context
    this.initPortalShader();

    // Start Hand Inertia Physics loop
    this.updateHand();

    // Lock scroll engine until portal opening
    setScrollLocked(true);
  }

  // ─── BACKGROUND RENDERER: Authentic Masterpiece with Approach Physics ────────
  _renderBackground(approach) {
    if (!this.bgCtx) return;
    const ctx = this.bgCtx;
    const W = this.W;
    const H = this.H;

    // Fill background with warm parchment base tone
    ctx.fillStyle = '#dfd2b5';
    ctx.fillRect(0, 0, W, H);

    if (!this.handImgLoaded || !this.handImg) {
      return;
    }

    const imgW = 1500;
    const imgH = 1049;
    const scale = Math.max(W / imgW, H / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const originX = (W - drawW) * 0.5;
    const originY = (H - drawH) * 0.5;

    // Separation offset between hands: max at approach=0, 0 at approach=1
    const maxOffset = Math.min(W * 0.05, 80);
    const offset = (1.0 - approach) * maxOffset;

    // Continuous center parchment filler between the halves
    if (offset > 0.5) {
      const gapLeft = originX - offset + drawW * 0.5;
      const gapWidth = offset * 2 + 2;
      // Sample central vertical slice of parchment (width 12px at x=744)
      ctx.drawImage(
        this.handImg,
        744, 0, 12, imgH,
        gapLeft, originY, gapWidth, drawH
      );
    }

    // Left hand half (source 0 to 750)
    ctx.drawImage(
      this.handImg,
      0, 0, 750, imgH,
      originX - offset, originY, drawW * 0.5, drawH
    );

    // Right hand half (source 750 to 1500)
    ctx.drawImage(
      this.handImg,
      750, 0, 750, imgH,
      originX + drawW * 0.5 + offset, originY, drawW * 0.5, drawH
    );

    // Subtle edge vignette
    const vg = ctx.createRadialGradient(W * 0.5, H * 0.5, H * 0.3, W * 0.5, H * 0.5, Math.max(W, H) * 0.7);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(40,24,10,0.4)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
  }

  // ─── SPARKS & OPTICAL LIGHTNING ARCS ─────────────────────────────────────────
  _drawSparks() {
    if (!this.ctx) return;
    if (this.state === GATE_STATE.DRAWING) return;
    const W = this.W;
    const H = this.H;
    const ctx = this.ctx;

    if (this.approach < 0.5) {
      if (this.state === GATE_STATE.LOCKED) {
        ctx.clearRect(0, 0, W, H);
      }
      return;
    }

    ctx.clearRect(0, 0, W, H);

    const imgW = 1500;
    const imgH = 1049;
    const scale = Math.max(W / imgW, H / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const originX = (W - drawW) * 0.5;
    const originY = (H - drawH) * 0.5;

    const maxOffset = Math.min(W * 0.05, 80);
    const offset = (1.0 - this.approach) * maxOffset;

    // Fingertips position in scaled canvas coordinates
    const leftTipX = originX - offset + 735 * scale;
    const rightTipX = originX + offset + 765 * scale;
    const tipY = originY + 462 * scale;

    const t = Date.now() * 0.001;
    const intensity = (this.approach - 0.5) / 0.5; // 0 to 1
    const count = Math.floor(intensity * 20);

    ctx.save();

    // 1. Electric spark particles dancing across the gap
    for (let i = 0; i < count; i++) {
      const alpha = Math.random();
      const px = leftTipX + (rightTipX - leftTipX) * alpha + (Math.sin(t * 7 + i * 2) * 16 * intensity);
      const py = tipY + (Math.cos(t * 5 + i * 3) * 16 * intensity);
      const r = 1.5 + Math.random() * 2.5 * intensity;

      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = (i % 2 === 0)
        ? `rgba(0, 207, 255, ${0.5 + intensity * 0.45})`
        : `rgba(255, 255, 255, ${0.75 + intensity * 0.25})`;
      ctx.shadowColor = '#00CFFF';
      ctx.shadowBlur = 10 + intensity * 14;
      ctx.fill();
    }

    // 2. High-energy optical lightning arc between fingertips
    if (intensity > 0.2) {
      ctx.beginPath();
      ctx.moveTo(leftTipX, tipY);
      const segments = 7;
      for (let s = 1; s < segments; s++) {
        const segX = leftTipX + (rightTipX - leftTipX) * (s / segments);
        const jitter = Math.sin(t * 22 + s * 1.8) * 10 * intensity;
        ctx.lineTo(segX, tipY + jitter);
      }
      ctx.lineTo(rightTipX, tipY);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 + intensity * 0.4})`;
      ctx.lineWidth = 1.5 + intensity * 2.0;
      ctx.shadowColor = '#00CFFF';
      ctx.shadowBlur = 14 + intensity * 10;
      ctx.stroke();

      // Cyan outer aura
      ctx.strokeStyle = `rgba(0, 207, 255, ${0.35 + intensity * 0.45})`;
      ctx.lineWidth = 4 + intensity * 4.0;
      ctx.stroke();
    }

    ctx.restore();
  }

  updateHand() {
    if (this.state === GATE_STATE.OPEN || this.unlocked) return;

    // Decay approach back to 0 if idle > 1.8s
    const now = Date.now();
    if (now - this.lastIdleTime > 1800 && !this.pointer.active) {
      this.approach = Math.max(0.0, this.approach - 0.006);
    }

    this.approach = Math.min(1.0, Math.max(0.0, this.approach));

    // Re-render authentic background with current approach
    this._renderBackground(this.approach);

    // Sparks at fingertips
    this._drawSparks();

    // Trigger unlock when fingertips meet
    if (this.approach >= 0.96 && !this.unlocked) {
      const imgW = 1500;
      const imgH = 1049;
      const scale = Math.max(this.W / imgW, this.H / imgH);
      const originY = (this.H - imgH * scale) * 0.5;
      const tipY = originY + 462 * scale;
      this.triggerZeroUnlock(this.W * 0.5, tipY, 130);
      return;
    }

    this.animFrameId = requestAnimationFrame(this.updateHand);
  }

  // ─── FROST & REVEAL SYSTEM ──────────────────────────────────────────────────
  drawFrost(revealX, revealY, revealR) {
    if (!this.frostCtx || !this.bgCanvas) return;
    const W = this.W;
    const H = this.H;

    this.frostCtx.clearRect(0, 0, W, H);

    // Draw base background into frost layer
    this.frostCtx.drawImage(this.bgCanvas, 0, 0);

    // Cut out reveal circle using destination-out mode
    if (revealR > 0) {
      this.frostCtx.save();
      this.frostCtx.globalCompositeOperation = 'destination-out';
      const revGrad = this.frostCtx.createRadialGradient(
        revealX, revealY, Math.max(0, revealR * 0.75),
        revealX, revealY, revealR
      );
      revGrad.addColorStop(0, 'rgba(0,0,0,1)');
      revGrad.addColorStop(0.85, 'rgba(0,0,0,0.95)');
      revGrad.addColorStop(1, 'rgba(0,0,0,0)');
      this.frostCtx.fillStyle = revGrad;
      this.frostCtx.beginPath();
      this.frostCtx.arc(revealX, revealY, revealR, 0, Math.PI * 2);
      this.frostCtx.fill();
      this.frostCtx.restore();

      // Glowing optical cyan edge on reveal boundary
      this.frostCtx.save();
      this.frostCtx.beginPath();
      this.frostCtx.arc(revealX, revealY, revealR, 0, Math.PI * 2);
      this.frostCtx.strokeStyle = 'rgba(0, 207, 255, 0.85)';
      this.frostCtx.lineWidth = 3.5;
      this.frostCtx.shadowColor = '#00CFFF';
      this.frostCtx.shadowBlur = 24;
      this.frostCtx.stroke();
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
      this._renderBackground(this.approach);
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

  // ─── GESTURE DRAWING SYSTEM ─────────────────────────────────────────────────
  beginZero(e) {
    if (this.unlocked) return;
    this.state = GATE_STATE.DRAWING;
    this.points = [];

    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    this.points.push({ x, y });
    this.pointer.active = true;
    this.pointer.targetX = x;
    this.pointer.targetY = y;

    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.W, this.H);
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
    }
  }

  moveZero(e) {
    if (this.state !== GATE_STATE.DRAWING || this.unlocked) return;
    e.preventDefault();

    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const p = { x, y };
    this.points.push(p);

    this.pointer.targetX = x;
    this.pointer.targetY = y;

    this.drawZeroStroke(p);
  }

  finishZero(e) {
    if (this.state !== GATE_STATE.DRAWING || this.unlocked) return;
    if (e && e.cancelable) e.preventDefault();

    this.state = GATE_STATE.VALIDATING;
    this.pointer.active = false;

    this.validateZero();
  }

  cancelZero(e) {
    if (this.state !== GATE_STATE.DRAWING || this.unlocked) return;
    if (e && e.cancelable) e.preventDefault();

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

    // Glowing white & cyan stroke
    this.ctx.shadowColor = 'rgba(0, 207, 255, 0.9)';
    this.ctx.shadowBlur = 18;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    this.ctx.lineWidth = 3.5;

    this.ctx.lineTo(p.x, p.y);
    this.ctx.stroke();

    // Bright leading contact dot
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.shadowBlur = 24;
    this.ctx.fill();

    this.ctx.restore();

    this.ctx.beginPath();
    this.ctx.moveTo(p.x, p.y);
  }

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
    const closed = Math.hypot(end.x - start.x, end.y - start.y) < 130;

    // 4. Radius Coefficient of Variation Check
    const radii = filtered.map(p => Math.hypot(p.x - cx, p.y - cy));
    const meanR = radii.reduce((a, b) => a + b, 0) / radii.length;
    const stdR = Math.sqrt(radii.map(r => Math.pow(r - meanR, 2)).reduce((a, b) => a + b, 0) / radii.length);
    const cv = stdR / Math.max(meanR, 1);

    const isLoop = Math.abs(totalAngle) > Math.PI * 1.3;
    const isRound = cv < 0.48;

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

  // ─── CENTROID-DRIVEN REVEAL ANIMATION ────────────────────────────────────────
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

    const maxRadius = Math.max(this.W, this.H) * 1.35;
    this.state = GATE_STATE.REVEALING;

    // Hide bgCanvas so the punch hole in frostCanvas reveals the Three.js scene beneath!
    if (this.bgCanvas) {
      this.bgCanvas.style.opacity = '0';
    }

    // Set portal shader center
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

        // Clean up listeners
        window.removeEventListener('wheel', this._onWheel);
        window.removeEventListener('touchstart', this._onTouchStart);
        window.removeEventListener('touchmove', this._onTouchMove);
        window.removeEventListener('keydown', this.onKeyDown);

        if (this.canvas) {
          this.canvas.removeEventListener('mousedown', this.beginZero);
          this.canvas.removeEventListener('mousemove', this.moveZero);
          this.canvas.removeEventListener('mouseup', this.finishZero);
          this.canvas.removeEventListener('mouseleave', this.cancelZero);
          this.canvas.removeEventListener('touchstart', this.beginZero);
          this.canvas.removeEventListener('touchmove', this.moveZero);
          this.canvas.removeEventListener('touchend', this.finishZero);
          this.canvas.removeEventListener('touchcancel', this.cancelZero);
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