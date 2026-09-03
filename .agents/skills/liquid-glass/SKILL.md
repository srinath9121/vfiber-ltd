---
name: liquid-glass
description: Use Liquid Glass effects in web interfaces. Apply glass distortion, refraction, blur, transparency, lighting, and interactive glass surfaces with restraint and performance in mind.
---

# Liquid Glass

Use Liquid Glass effects for premium interface surfaces and transitions.

## Rules

- Prefer subtle, realistic glass over excessive blur or glow.
- Use Liquid Glass for navigation, overlays, buttons, panels, and selected UI surfaces.
- Do not apply glass to everything.
- Preserve readable typography and strong contrast.
- Avoid generic glassmorphism.
- Keep the VF Technologies visual language architectural, premium, restrained, and technical.
- Test performance on mobile.

## Implementation

When Liquid Glass functionality is needed:

1. Inspect the existing project structure.
2. Check whether Liquid Glass is already installed.
3. If not installed, install the required package from its official repository/package source.
4. Integrate it into the existing React application rather than rebuilding the application.
5. Keep existing GSAP, ScrollTrigger, Lenis, Three.js and R3F architecture intact.
6. Do not replace working animation systems unnecessarily.

## VF Technologies

Liquid Glass should support the existing VF Technologies story-mode experience.

Good uses:
- navigation
- chapter indicators
- CTA surfaces
- small information overlays
- transition surfaces
- selected UI elements around the 3D environment

Bad uses:
- entire screen covered in glass
- every text block inside glass cards
- excessive blur
- neon cyberpunk styling
- generic SaaS glassmorphism

The goal is premium physical material, not decoration.
