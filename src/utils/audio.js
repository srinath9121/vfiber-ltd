// audio.js — Procedural Web Audio Orchestrator
// Pure code-synthesized soundscapes & haptics for VF Technologies (0 KB external assets)

class AudioManager {
  constructor() {
    this.initialized = false;
    this.muted = false;
    this.ctx = null;
    this.masterGain = null;
    this.currentChapter = -1;

    // Ambient Drone Nodes
    this.droneGain = null;
    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.droneFilter = null;

    // Optical Fiber Shimmer Nodes
    this.fiberGain = null;
    this.fiberNoiseNode = null;
    this.fiberFilter = null;
  }

  init() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      this.ctx = new AudioContextClass();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // ── 1. Orbital Sub-Bass Drone Synth ──
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

      this.droneFilter = this.ctx.createBiquadFilter();
      this.droneFilter.type = 'lowpass';
      this.droneFilter.frequency.setValueAtTime(140, this.ctx.currentTime);
      this.droneFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = 'sine';
      this.droneOsc1.frequency.setValueAtTime(55.0, this.ctx.currentTime); // A1 note

      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = 'triangle';
      this.droneOsc2.frequency.setValueAtTime(55.4, this.ctx.currentTime); // Slight detune for warm beating

      this.droneOsc1.connect(this.droneFilter);
      this.droneOsc2.connect(this.droneFilter);
      this.droneFilter.connect(this.droneGain);
      this.droneGain.connect(this.masterGain);

      this.droneOsc1.start();
      this.droneOsc2.start();

      // ── 2. Optical Fiber Shimmer Synth (Pink Noise + Bandpass) ──
      this.setupFiberShimmer();

      // Unlock on user interaction
      const unlock = () => {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('scroll', unlock);
        window.removeEventListener('keydown', unlock);
      };

      window.addEventListener('pointerdown', unlock, { passive: true });
      window.addEventListener('scroll', unlock, { passive: true });
      window.addEventListener('keydown', unlock, { passive: true });
    } catch (err) {
      console.warn('Web Audio synthesis not supported or blocked:', err);
    }
  }

  setupFiberShimmer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2) * 0.15;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    this.fiberFilter = this.ctx.createBiquadFilter();
    this.fiberFilter.type = 'bandpass';
    this.fiberFilter.frequency.setValueAtTime(1800, this.ctx.currentTime);
    this.fiberFilter.Q.setValueAtTime(5.0, this.ctx.currentTime);

    this.fiberGain = this.ctx.createGain();
    this.fiberGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

    noise.connect(this.fiberFilter);
    this.fiberFilter.connect(this.fiberGain);
    this.fiberGain.connect(this.masterGain);

    noise.start();
  }

  // Update dynamic procedural soundscapes based on scroll position
  update(scrollFloat) {
    if (!this.initialized) this.init();
    if (!this.ctx || this.muted) return;

    const t = this.ctx.currentTime;

    // Ambient Drone: Active during Earth Orbit and Regional Network (0.0 to 2.2)
    if (this.droneGain) {
      const droneTarget = scrollFloat < 2.2 ? Math.max(0.001, (1.0 - scrollFloat / 2.2) * 0.25) : 0.001;
      this.droneGain.gain.setTargetAtTime(droneTarget, t, 0.2);
    }

    // Fiber Shimmer: Active inside Fiber Tunnel & Cable Macro (3.4 to 5.0)
    if (this.fiberGain && this.fiberFilter) {
      if (scrollFloat >= 3.4 && scrollFloat <= 5.0) {
        const fiberProgress = (scrollFloat - 3.4) / 1.6;
        const shimmerTarget = 0.02 + 0.08 * Math.sin(fiberProgress * Math.PI);
        this.fiberGain.gain.setTargetAtTime(shimmerTarget, t, 0.1);
        this.fiberFilter.frequency.setTargetAtTime(1200 + fiberProgress * 1600, t, 0.1);
      } else {
        this.fiberGain.gain.setTargetAtTime(0.001, t, 0.2);
      }
    }

    // Determine current chapter for cues
    let chapter = 0;
    if (scrollFloat >= 0.95 && scrollFloat < 1.70) chapter = 1;
    else if (scrollFloat >= 1.70 && scrollFloat < 3.05) chapter = 2;
    else if (scrollFloat >= 3.05 && scrollFloat < 3.55) chapter = 3;
    else if (scrollFloat >= 3.55 && scrollFloat < 5.15) chapter = 4;
    else if (scrollFloat >= 5.15 && scrollFloat < 5.85) chapter = 6;
    else if (scrollFloat >= 5.85) chapter = 5;

    if (chapter !== this.currentChapter) {
      this.currentChapter = chapter;
      this.playTransitionChime();
    }
  }

  // Tactical optical port click / relay sound
  playPortClick(freq = 880) {
    if (!this.ctx || this.muted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;

    // 1. Mechanical Relay Click
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'sine';
    clickOsc.frequency.setValueAtTime(1600, t);
    clickOsc.frequency.exponentialRampToValueAtTime(300, t + 0.04);
    clickGain.gain.setValueAtTime(0.3, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    clickOsc.connect(clickGain);
    clickGain.connect(this.masterGain);
    clickOsc.start(t);
    clickOsc.stop(t + 0.045);

    // 2. Pure Optical Tone
    const toneOsc = this.ctx.createOscillator();
    const toneGain = this.ctx.createGain();
    toneOsc.type = 'sine';
    toneOsc.frequency.setValueAtTime(freq, t + 0.01);
    toneGain.gain.setValueAtTime(0.18, t + 0.01);
    toneGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    toneOsc.connect(toneGain);
    toneGain.connect(this.masterGain);
    toneOsc.start(t + 0.01);
    toneOsc.stop(t + 0.3);
  }

  // Subtle chapter transition chime
  playTransitionChime() {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, t); // C5
    osc.frequency.exponentialRampToValueAtTime(659.25, t + 0.12); // E5
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.36);
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.muted ? 0 : 0.35, this.ctx.currentTime, 0.05);
    }
    return this.muted;
  }

  setMasterVolume(vol) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.05);
    }
  }
}

export const audioManager = new AudioManager();
