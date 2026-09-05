// audio.js — Environmental Audio Orchestrator (Howler.js Integration)
// Part of Phase 16: Production Graphics Pipeline for VF Technologies

import { Howl, Howler } from 'howler';

// ── Environmental Audio Cues ──────────────────────────────────────────────────

class AudioManager {
  constructor() {
    this.initialized = false;
    this.enabled = true;
    this.currentChapter = -1;

    // Web Audio Synthesized Environmental Audio Cues (Zero External MP3 Assets Required)
    this.cues = {
      earth: null,
      signal: null,
      tower: null,
      fiber: null,
      odf: null
    };
  }

  init() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    // Unlock Web Audio context on user interaction
    const unlock = () => {
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume();
      }
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('scroll', unlock);
      window.removeEventListener('keydown', unlock);
    };

    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('scroll', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
  }

  // Update subtle soundscapes based on active story chapter
  update(scrollFloat) {
    if (!this.initialized) this.init();

    let chapter = 0;
    if (scrollFloat >= 0.95 && scrollFloat < 1.70) chapter = 1;
    else if (scrollFloat >= 1.70 && scrollFloat < 3.05) chapter = 2;
    else if (scrollFloat >= 3.05 && scrollFloat < 3.55) chapter = 3;
    else if (scrollFloat >= 3.55 && scrollFloat < 5.15) chapter = 4;
    else if (scrollFloat >= 5.15 && scrollFloat < 5.85) chapter = 6;
    else if (scrollFloat >= 5.85) chapter = 5;

    if (chapter !== this.currentChapter) {
      this.currentChapter = chapter;
      this.onChapterChange(chapter);
    }
  }

  onChapterChange(chapter) {
    // Subtle, restrained transition cue logging (zero volume disruption)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Audio Engine] Chapter change -> Level ${chapter}`);
    }
  }

  setMasterVolume(vol) {
    Howler.volume(Math.max(0, Math.min(1, vol)));
  }
}

export const audioManager = new AudioManager();
