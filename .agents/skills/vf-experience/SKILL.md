---
name: vf-experience
description: Creative direction, experience architecture, Three.js engineering, shader development, motion design, and visual QA workflow specifically tailored for VF Technologies (Venkateswara Fiber Technologies).
---

# VF Technologies Experience Standard

Comprehensive engineering, creative direction, and visual quality methodology for the VF Technologies interactive 3D web experience.

---

## 1. Operating Personas & Disciplines

When developing for VF Technologies, operate across six unified disciplines:

- **Creative Director**: Enforces the technical, architectural, and restrained brand identity of Venkateswara Fiber Technologies. Rejects generic SaaS tropes, frivolous decorations, and unmotivated motion.
- **Experience Architect**: Protects the narrative continuum. Ensures the storytelling moves logically and smoothly through each chapter (Earth → Texas Hub → Infrastructure Discovery → Signal Transition → Fiber Core → Network Scale).
- **Three.js / WebGL Engineer**: Crafts deterministic, performant 3D scenes. Manages camera choreography, depth sorting (`renderOrder`, `depthWrite`), scene graphs, memory lifecycles, and PBR engineering materials.
- **GSAP / Motion Engineer**: Calibrates easing curves, keyframe transitions, and physical damping. Guarantees 100% bidirectional reversibility across every interaction.
- **Shader Engineer**: Authors bespoke GPU-side GLSL shaders (Fresnel atmospheres, position-based color transitions, GPU streak propagation) for zero-CPU rendering overhead.
- **Visual QA Engineer**: Validates real browser rendering through actual high-resolution screenshots. Refuses to declare work complete based purely on code assumptions.

---

## 2. Core Operational Rules

1. **No Generic SaaS Layouts**: VF Technologies is a high-precision telecom and utility infrastructure engineering firm (O-Calc Pro, Katapult Pro, fiber design, pole loading). UI elements must feel like engineered telemetry overlays and liquid glass panels.
2. **No Unnecessary Libraries**: Rely on Vanilla Three.js, lightweight math utilities, and Vanilla CSS. Do not introduce heavy dependencies unless strictly justified.
3. **No Arbitrary Animations**: Every motion must represent a physical reality: a traveling photon pulse, a camera tracking trajectory, or structural illumination.
4. **No Scene Overlap**: Every chapter has strict visual boundaries and distinct visual ownership. Elements from previous chapters must retract or subdue before the next chapter claims ownership.
5. **Every Transition Has an Owner**: There must never be ambiguity over which chapter or object owns the frame at any given `scrollFloat`.
6. **Forward AND Backward Reversibility**: Every effect, material opacity ramp, camera path, and particle stream must behave symmetrically when scrolled backward (e.g. `2.50 → 0.00`).
7. **Visual Quality Before Feature Quantity**: A single immaculate, physically grounded telecom scene is infinitely better than five rough chapters.
8. **Verify with Actual Screenshots**: Always inspect actual rendered screenshots in the browser at critical scroll positions before concluding work.
9. **Change Only Required Code**: Apply minimal, surgical edits. Do not rewrite working camera choreographies, shaders, or scroll engines unnecessarily.

---

## 3. Strict Development Workflow

```
Analyze ──► Plan ──► Implement ──► Screenshot ──► Inspect ──► Fix ──► Verify ──► Continue
```

1. **Analyze**: Inspect the active scene graph, materials, current `scrollFloat` ranges, and console state.
2. **Plan**: Define the exact mathematical ranges (`fromSf → toSf`), ownership boundaries, and camera coordinates.
3. **Implement**: Make surgical, deterministic code changes.
4. **Screenshot**: Capture browser captures at key milestones (e.g. entry, midpoint, handoff, reverse).
5. **Inspect**: Visually audit contrast, framing, depth clipping, typography readability, and background competition.
6. **Fix**: Address any visual competition, premature triggers, or overlapping UI layers immediately.
7. **Verify**: Test full backward scroll (`5.0 → 0.0`) to confirm zero residual state or visual leaks.
8. **Continue**: Advance only after visual approval is satisfied.

---

## 4. VF Technologies Visual Language & Palette

- **Deep Space / Earth Backdrop**: `#050a14` (Deep Space Navy), `#0d1f3c` (Atmospheric Navy).
- **Protagonist Carrier Signal**: `#C41E3A` (Ruby Red core, high emissive intensity, thin and sharp).
- **Broadband / Optical Network**: `#00CFFF` (Electric Cyan aura, high-speed fiber glow).
- **Structural Telecom Infrastructure**: `#485260` (Galvanized Steel, roughness: 0.55, metalness: 0.82), `#222832` (Hardware Dark Iron), `#d8e0ea` (Radome White), `#c8d2dc` (Antenna Panels).
- **Aviation Warning**: `#ff0033` (Pulsing 1 Hz safety beacon).
- **Typography**: `Space Grotesk`, monospace telemetry accents, uppercase tracking (`letter-spacing: 0.15em+`).

---

## 5. Story Chapters Architecture

| Chapter | `scrollFloat` | Visual Focus | Ownership Rules |
|---|---|---|---|
| **0: Earth Deep Space** | `0.00 → 0.95` | Global Earth, Fresnel rim, transatlantic signal | Full Earth prominence. Signal travels from East Atlantic to Texas. |
| **1: Regional Network** | `0.95 → 1.70` | Texas hub ignition, Western USA grid nodes | USA network nodes & route arcs active. Earth subtly dims (`0.35`). |
| **2: Telecom Infrastructure** | `1.70 → 2.50` | Authentic steel lattice tower, dishes, antennas, signal terminal coupling | USA nodes retract by `2.10`. Earth subdues to dark distant nocturnal horizon (`opacity: 0.22, color: 0.10, depthWrite: false`). Tower dominates. |
| **3: Signal Transition** | `2.80 → 3.30` | Luminous particle transition at tower crown | Signal particles lerp physically from Ruby (`#C41E3A`) to Cyan (`#00CFFF`). Tower fades out. |
| **4: Fiber Tunnel Core** | `3.30 → 4.50` | High-speed GPU cylindrical fiber tunnel | GPU-side procedural streak shaders. Edge glow and depth pulses. |
| **5: Global Return & CTA** | `4.50 → 5.00` | Earth return, audited engineering stats, CTA button | Clean final perspective, company metrics reveal (`stat1`, `stat2`), contact form trigger. |
