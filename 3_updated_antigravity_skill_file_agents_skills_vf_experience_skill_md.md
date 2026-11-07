---
name: vf-experience
description: Creative direction, B2B telecom conversion architecture, multi-page routing, Three.js hero integration, liquid-glass UI system, and visual QA workflow for Venkateswara Fiber Technologies Private Limited (VF Technologies).
---

# VF Technologies B2B Engineering & Experience Standard (v2.0 — Options B+C Hybrid)

Comprehensive engineering, creative direction, and conversion architecture rules for **Venkateswara Fiber Technologies Private Limited (`vf-technologies.com`)**.

---

## 1. Core Architectural Mandate (Hybrid Options B + C)

1. **B2B Telecom Conversion First, Powered by Liquid-Glass Telemetry**:
   - We are inspired by the structural completeness of `intelli-networks.com` (Top Utility Bar, Sticky Dropdown Navigation, Multi-Slide Hero, Audited Metrics Bar, Deep Service Breakdowns, Infrastructure Gallery, and RFQ Lead Form), **but we reject generic white/blue SaaS templates and placeholder text**.
   - Every section must use the authentic **VF Technologies Dark Precision Telemetry & Liquid-Glass Aesthetic** (`#050a14` Deep Space Navy, `#00CFFF` Electric Cyan, `#C41E3A` Carrier Ruby, `Space Grotesk` + `Playfair Display`).
2. **Native Document Scrolling + Scoped 3D Hero Canvas**:
   - **NEVER** lock `body, html` with `overflow: hidden`. The document must scroll naturally (`overflow-y: auto`) so enterprise buyers can skim sections, use anchor links, and navigate sub-pages effortlessly.
   - The Three.js scene (Earth / Carrier Signal / Telecom Tower) lives strictly inside `#hero-webgl-container` in the Hero section and automatically pauses rendering via `IntersectionObserver` when scrolled out of view.
3. **Single Source of Truth for Metrics & Contact Info (`src/config/siteMetrics.ts`)**:
   - Never hardcode phone numbers, structures analyzed, poles managed, or years of experience inside scattered HTML files. Always import from `src/config/siteMetrics.ts`.
4. **Zero "Lorem Ipsum" or Generic Copy**:
   - Every word must reflect authentic US Telecom & OSP Fiber backend engineering: **Research & Permitting**, **Design / Drafting**, **OSP Fiber**, **Pole Loading Analysis (O-Calc Pro)**, and the 4-tool ecosystem (**Frontier**, **Katapult Pro**, **AutoCAD**, **O-Calc Pro**).

---

## 2. Visual Language, Typography & Liquid-Glass Tokens

- **Backgrounds**:
  - Primary Canvas: `#050a14` (Deep Space Navy)
  - Elevated Section Surface: `#081022` (Midnight Telemetry Surface)
  - Liquid-Glass Card Surface: `rgba(4, 10, 24, 0.82)` with `backdrop-filter: blur(18px) saturate(1.4)`
- **Accents & Borders**:
  - Primary Optical Accent: `#00CFFF` (Electric Cyan — `border: 1px solid rgba(0, 207, 255, 0.24)`)
  - Primary Action / Carrier Signal Accent: `#C41E3A` (Ruby Red — used for primary CTAs, Pole counters, and active telemetry highlights)
- **Typography**:
  - Headings & Telemetry: `'Space Grotesk', sans-serif` (weights 500–800, uppercase tracking `0.12em–0.24em` for badges)
  - Editorial Statements & Quotes: `'Playfair Display', serif` (weights 600–700)

---

## 3. Mandatory Page & Component Hierarchy

1. **Top Telemetry Utility Bar**:
   - Left: Live status dot + `US TELECOM & OSP ENGINEERING PARTNER` + Location (`Madhapur, Hyderabad, Telangana, India`).
   - Right: Clickable Email (`services@vf-technologies.com`), Clickable Phone (`SITE_CONFIG.contact.phoneDisplay`), and LinkedIn link.
2. **Sticky Liquid-Glass Navbar**:
   - Brand Logo (`/logo.jpg`) + `VF TECHNOLOGIES` (`Powering a Better Tomorrow`).
   - Desktop Links: `Overview`, `Services ▾` (Dropdown to all 4 services), `Technology Stack`, `Infrastructure Gallery`, `About Us`, and CTA button `LET'S CONNECT`.
   - Mobile Drawer: Accessible hamburger button (`>= 44x44px`), slide-over glass drawer, expandable `Services` accordion, `Escape` key & backdrop close.
3. **Hero Section (Scoped 3D Canvas + 4-Slide Telemetry Carousel)**:
   - Interactive Three.js background (`#hero-webgl-container`) + 4 selectable slides (`01` Overview, `02` OSP Fiber, `03` O-Calc Pro Pole Loading, `04` Integrated Workflow) with dual CTAs (`Explore Services`, `Start a Conversation`).
4. **4-Metric Audited Counter Strip**:
   - Displays `Structures Analyzed`, `Poles Managed`, `Years of Experience`, and `US Footprint` using `SITE_CONFIG.metrics`. Never leaves DOM text at `0` without a `data-target` fallback.
5. **Services Matrix & Dedicated Service Detail Views**:
   - `01` Research & Permitting (`/services/research-permitting`)
   - `02` Design / Drafting (`/services/design-drafting`)
   - `03` OSP Fiber (`/services/osp-fiber`)
   - `04` Pole Loading Analysis (O-Calc Pro) (`/services/pole-loading-analysis`)
   - Features the split tower visual (`/references/tower night.jpg`) alongside expandable technical deliverables and NESC/CAD standards.
6. **Technology Stack ("The Tools Behind the Work")**:
   - Interactive 4-stage workflow grid featuring `01 FRONTIER` (`/services/frontier.jpg`), `02 KATAPULT PRO` (`/services/katapult.jpg`), `03 AUTOCAD` (`/services/autocad.jpg`), and `04 O-CALC PRO` (`/services/ocalc-pro.jpg`), concluding with *"Different tools. One engineering workflow."*
7. **7-Stage Physical Fiber Infrastructure Gallery**:
   - Filterable grid & lightbox showcasing the 7 asset folders (`Submarine Cable`, `Loose-Tube Construction`, `Optical Fiber Macro`, `Ocean Floor`, `Cable Landing Station`, `Fiber Splice Closure`, `ODF Distribution Panel`) with safe `encodeURI` path resolution.
8. **About Us ("Behind the Scenes") & B2B RFQ Contact Section**:
   - Full company narrative + 6-point capability checklist + validated B2B RFQ Contact Form + 4-column Corporate Footer.

---

## 4. Strict Verification Loop

```
Analyze ──► Implement ──► Screenshot (Desktop & Mobile) ──► Run Playwright Tests ──► Verify Zero Console/404 Errors
```