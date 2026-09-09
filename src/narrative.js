// narrative.js — VF Technologies Master Narrative Engine
// Restructured Single Continuous Engineering Story:
// 1. OPENING
// 2. MILESTONES (20,000+ Structures -> 50,000+ Poles)
// 3. WHAT WE OFFER (5 Progressive Services)
// 4. OUR TECHNOLOGY STACK (01 Frontier -> 02 Katapult Pro -> 03 AutoCAD -> 04 O-Calc Pro — APPEARS ONLY ONCE)
// 5. ABOUT US (Company mission & identity)
// 6. CONTACT US
// Fully deterministic, 100% bidirectional reversibility

import { clamp, lerp } from './utils/math.js';

let container = null;

export function initNarrative() {
  container = document.getElementById('story-narrative-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'story-narrative-container';
    document.body.appendChild(container);
  }
}

// Smooth bidirectional fade in/out calculation with subtle vertical glide
function getBeatState(sf, start, peakIn, peakOut, end) {
  if (sf < start || sf > end) {
    return { visible: false, opacity: 0, translateY: 20 };
  }
  let op = 1.0;
  let y = 0;
  if (sf < peakIn) {
    const t = (sf - start) / Math.max(0.001, peakIn - start);
    const ease = t * t * (3 - 2 * t);
    op = ease;
    y = (1 - ease) * 20;
  } else if (sf > peakOut) {
    const t = (end - sf) / Math.max(0.001, end - peakOut);
    const ease = t * t * (3 - 2 * t);
    op = ease;
    y = (1 - ease) * -16;
  } else {
    op = 1.0;
    y = 0;
  }
  return {
    visible: op > 0.005,
    opacity: clamp(op, 0, 1),
    translateY: y
  };
}

function applyState(id, state) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = state.visible ? 'flex' : 'none';
  el.style.opacity = state.opacity;
  el.style.transform = `translate(-50%, calc(-50% + ${state.translateY}px))`;
}

export function updateNarrative(sf) {
  if (!container) return;

  // ══════════════════════════════════════════════════════════════════════════
  // 1. OPENING (sf: 0.00 -> 0.70)
  // ══════════════════════════════════════════════════════════════════════════

  // 1.1 Hero Title: VF TECHNOLOGIES / Powering a Better Tomorrow
  const b1_1 = getBeatState(sf, -0.05, 0.00, 0.14, 0.25);
  applyState('narrative-s1-hero', b1_1);

  // 1.2 "Every connection begins with infrastructure."
  const b1_2 = getBeatState(sf, 0.23, 0.30, 0.42, 0.48);
  applyState('narrative-s1-infra', b1_2);

  // 1.3 "Behind every connection is engineering built to make it possible."
  const b1_3 = getBeatState(sf, 0.46, 0.52, 0.64, 0.70);
  applyState('narrative-s1-eng', b1_3);

  // ══════════════════════════════════════════════════════════════════════════
  // 2. MILESTONES (sf: 0.70 -> 1.75)
  // ══════════════════════════════════════════════════════════════════════════

  // 2.1 20,000+ STRUCTURES ANALYZED
  const b2_1 = getBeatState(sf, 0.70, 0.76, 1.14, 1.20);
  applyState('narrative-s2-structures', b2_1);
  if (b2_1.visible) {
    const structProgress = clamp((sf - 0.71) / 0.16, 0, 1);
    const structEase = structProgress * structProgress * (3 - 2 * structProgress);
    const structCount = Math.floor(lerp(0, 20000, structEase));
    const numEl = document.getElementById('s2-struct-count');
    if (numEl) numEl.textContent = structCount.toLocaleString() + '+';
  }

  // 2.2 50,000+ POLES MANAGED
  const b2_2 = getBeatState(sf, 1.20, 1.26, 1.68, 1.75);
  applyState('narrative-s2-poles', b2_2);
  if (b2_2.visible) {
    const poleProgress = clamp((sf - 1.21) / 0.16, 0, 1);
    const poleEase = poleProgress * poleProgress * (3 - 2 * poleProgress);
    const poleCount = Math.floor(lerp(0, 50000, poleEase));
    const numEl = document.getElementById('s2-poles-count');
    if (numEl) numEl.textContent = poleCount.toLocaleString() + '+';
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 3. WHAT WE OFFER (sf: 1.75 -> 4.30) — ALL SERVICES VISIBLE SIMULTANEOUSLY
  // ══════════════════════════════════════════════════════════════════════════

  // 3.0 Single unified services panel — all 5 services visible together with tower photo
  const b3_0 = getBeatState(sf, 1.75, 1.86, 4.18, 4.30);
  applyState('narrative-s3-services-panel', b3_0);

  // ══════════════════════════════════════════════════════════════════════════
  // 4. OUR TECHNOLOGY STACK (sf: 4.30 -> 7.00) — APPEARS EXACTLY ONCE
  // ══════════════════════════════════════════════════════════════════════════

  // 4.0 Tech Stack Intro: OUR TECHNOLOGY STACK / The tools behind the work.
  const b4_0 = getBeatState(sf, 4.30, 4.36, 4.70, 4.76);
  applyState('narrative-s4-tech-intro', b4_0);

  // 4.1 01 — FRONTIER
  const b4_1 = getBeatState(sf, 4.75, 4.81, 5.20, 5.26);
  applyState('narrative-s4-tech-frontier', b4_1);

  // 4.2 02 — KATAPULT PRO
  const b4_2 = getBeatState(sf, 5.25, 5.31, 5.70, 5.76);
  applyState('narrative-s4-tech-katapult', b4_2);

  // 4.3 03 — AUTOCAD
  const b4_3 = getBeatState(sf, 5.75, 5.81, 6.20, 6.26);
  applyState('narrative-s4-tech-autocad', b4_3);

  // 4.4 04 — O-CALC PRO
  const b4_4 = getBeatState(sf, 6.25, 6.31, 6.70, 6.76);
  applyState('narrative-s4-tech-ocalc', b4_4);

  // 4.5 Workflow Conclusion: Different tools. One engineering workflow.
  const b4_5 = getBeatState(sf, 6.75, 6.80, 7.00, 7.06);
  applyState('narrative-s4-tech-workflow', b4_5);

  // ══════════════════════════════════════════════════════════════════════════
  // 5. ABOUT US (sf: 7.05 -> 7.85) — ONLY AFTER TECH STACK
  // ══════════════════════════════════════════════════════════════════════════

  // 5.1 Company Description
  const b5_1 = getBeatState(sf, 7.05, 7.11, 7.42, 7.48);
  applyState('narrative-s5-about-intro', b5_1);

  // 5.2 Behind the Scenes & Mission
  const b5_2 = getBeatState(sf, 7.46, 7.52, 7.80, 7.86);
  applyState('narrative-s5-about-mission', b5_2);

  // ══════════════════════════════════════════════════════════════════════════
  // 6. CONTACT US (sf: 7.85 -> 8.50)
  // ══════════════════════════════════════════════════════════════════════════

  // 6.1 Prelude: Every project starts with a connection. Let's build the next one.
  const b6_1 = getBeatState(sf, 7.85, 7.91, 8.12, 8.18);
  applyState('narrative-s6-contact-prelude', b6_1);

  // 6.2 Contact Us Card
  const b6_2 = getBeatState(sf, 8.16, 8.22, 8.52, 8.55);
  applyState('narrative-s6-contact-card', b6_2);
  const contactCard = document.getElementById('narrative-s6-contact-card');
  if (contactCard) {
    contactCard.style.pointerEvents = b6_2.visible ? 'auto' : 'none';
  }
}
