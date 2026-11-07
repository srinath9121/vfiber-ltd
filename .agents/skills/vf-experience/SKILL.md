---
name: vf-experience
description: Creative direction, B2B telecom conversion architecture, multi-page routing, Three.js hero integration, liquid-glass UI system, and visual QA workflow for Venkateswara Fiber Technologies Private Limited (VF Technologies).
---

# VF Technologies B2B Engineering & Experience Standard (v2.0 — Options B+C Hybrid)

Comprehensive engineering, creative direction, and conversion architecture rules for **Venkateswara Fiber Technologies Private Limited (`vf-technologies.com`)**.

---

## 1. Core Architectural Mandate (Hybrid Options B + C)

1. **B2B Telecom Conversion First, Powered by Liquid-Glass Telemetry**:
   - Inspired by `intelli-networks.com` structure but rejects generic white/blue SaaS templates.
   - Every section uses the authentic **VF Technologies Dark Precision Telemetry & Liquid-Glass Aesthetic** (`#050a14`, `#00CFFF`, `#C41E3A`, `Space Grotesk` + `Playfair Display`).
2. **Native Document Scrolling + Scoped 3D Hero Canvas**:
   - **NEVER** lock `body, html` with `overflow: hidden`. Enable `overflow-y: auto`.
   - Three.js scene lives strictly inside `#hero-webgl-container` and pauses via `IntersectionObserver` when off-screen.
3. **Single Source of Truth (`src/config/siteMetrics.js`)**: Never hardcode metrics or contact info in HTML.
4. **Zero Lorem Ipsum**: Every word must reflect authentic US Telecom & OSP Fiber backend engineering.

---

## 2. Visual Language & Liquid-Glass Tokens

- **Backgrounds**: `#050a14` (Deep Space Navy), `#081022` (Midnight Telemetry Surface)
- **Liquid-Glass Card**: `rgba(4, 10, 24, 0.82)` + `backdrop-filter: blur(18px) saturate(1.4)`
- **Accents**: `#00CFFF` (Electric Cyan), `#C41E3A` (Ruby Red)
- **Typography**: `Space Grotesk` (headings, badges), `Playfair Display` (editorial)

---

## 3. Mandatory Page & Component Hierarchy

1. **Top Telemetry Utility Bar** — status dot, email, phone, LinkedIn (all from SITE_CONFIG)
2. **Sticky Liquid-Glass Navbar** — logo, desktop nav + services dropdown, mobile drawer
3. **Hero Section (100vh scoped canvas)** — 4-slide telemetry carousel over WebGL background
4. **4-Metric Counter Strip** — from SITE_CONFIG.metrics, never shows `0` in DOM
5. **Services Matrix** — 4 liquid-glass cards → dedicated sub-pages
6. **Technology Stack Pipeline** — Frontier → Katapult Pro → AutoCAD → O-Calc Pro
7. **7-Stage Gallery** — filter tabs + lightbox, safe encodeURI paths
8. **About + RFQ Contact Form** — validated form + 4-column footer

---

## 4. Critical Edge Cases to Always Fix

- **EC-01**: Remove `overflow:hidden` from body — scope canvas to `#hero-webgl-container`
- **EC-02**: Never show `0` in counter DOM — set `data-target` + initial value from SITE_CONFIG
- **EC-03**: Use `encodeURI()` for all gallery paths — double-space folders cause 404s
- **EC-04**: Pause `composer.render()` on `visibilitychange` + `IntersectionObserver`
- **EC-05**: Scope WebGL context-loss fallback to `#hero-webgl-container` only
- **EC-06**: Mobile hamburger ≥ 44×44px, slide-over drawer, Escape key close
- **EC-07**: Full RFQ form — not just mailto link
- **EC-08**: All UI reads from `SITE_CONFIG` — never duplicated in HTML

---

## 5. Strict Verification Loop

```
Analyze ──► Implement ──► Screenshot (Desktop & Mobile) ──► Run Playwright Tests ──► Verify Zero Console/404 Errors
```
