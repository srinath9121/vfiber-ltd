---
name: shader-gradient
description: Use Shader Gradient techniques for premium WebGL and React visual backgrounds, animated gradients, lighting, color transitions, and shader-based visual effects.
---

# Shader Gradient

Use shader-based gradients to create refined, cinematic visual backgrounds and transitions.

## Rules

- Use shader effects intentionally, not everywhere.
- Prefer subtle depth, lighting, and color movement.
- Avoid excessive neon, glow, particles, or cyberpunk styling.
- Keep typography readable above shader backgrounds.
- Preserve the existing React, Three.js, React Three Fiber, GSAP, ScrollTrigger, and Lenis architecture.
- Do not replace working systems unnecessarily.
- Keep performance in mind, especially on mobile.

## VF Technologies

Use Shader Gradient primarily for:
- hero atmosphere
- large background surfaces
- transitions between story chapters
- subtle environmental lighting
- depth behind 3D infrastructure
- visual transitions into fiber/network sequences

Avoid:
- generic gradient blobs
- full-screen psychedelic effects
- excessive animation
- competing with the 3D infrastructure
- making the website look like a gaming or crypto site

The visual direction should remain:
premium, architectural, technical, calm, cinematic, precise.

## Implementation

Before adding an effect:

1. Inspect the existing project.
2. Check whether Shader Gradient or its dependencies are already installed.
3. Reuse existing Three.js/R3F infrastructure where possible.
4. Integrate without breaking GSAP/ScrollTrigger/Lenis.
5. Keep shader animation lightweight.
6. Test desktop and mobile performance.
