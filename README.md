# Venkateswara Fiber Technologies (VF Technologies)

> **Powering a Better Tomorrow.**  
> High-precision backend telecom engineering, OSP fiber planning, and structural network deployment solutions for US broadband operators, utility cooperatives, and turnkey contractors.

[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r160-black?style=flat-square&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-014BAA?style=flat-square)](#)
[![Theme](https://img.shields.io/badge/Palette-Royal%20Blue%20%7C%20Light%20Cream-014BAA?style=flat-square)](#design-system--palette)

---

## Executive Overview

**Venkateswara Fiber Technologies Private Limited (VF Technologies)** delivers high-precision telecommunications engineering services behind the scenes of North American connectivity. Operating from Madhapur, Hyderabad, India with dedicated US time-zone operational overlap, VF Technologies converts complex field surveys and photogrammetry into construction-ready AutoCAD packages, verified joint-use permit submittals, and certified structural pole loading models.

This digital platform combines a high-performance **Three.js WebGL hero showcase** with a clean, high-conversion **B2B corporate engineering architecture**.

---

## Live Links & Contact

- **Official Repository**: [github.com/srinath9121/vfiber-ltd](https://github.com/srinath9121/vfiber-ltd)
- **LinkedIn Company Profile**: [VF Technologies on LinkedIn](https://www.linkedin.com/company/venkateswara-fiber-technologies-pvt-ltd)
- **Engineering Inquiries**: [services@vf-technologies.com](mailto:services@vf-technologies.com)
- **Corporate Office**: Madhapur, Hyderabad, Telangana, India

---

## Architectural Structure (The 7-Section Sequence)

The homepage conforms strictly to a high-conversion 7-section B2B procurement narrative:

```
[1. Hero Showcase] 
       │
[2. Know Our Company] 
       │
[3. Our Services Matrix] 
       │
[4. Metrics & Impact Strip] 
       │
[5. Technology Ecosystem] 
       │
[6. What People Say] 
       │
[7. Direct Contact & RFQ] 
       │
[Corporate Footer]
```

1. **Section 1: Hero Showcase (`#hero-webgl-container`)**  
   Scoped 3D Three.js WebGL canvas paired with a 4-slide interactive telemetry showcase:
   - `01 // Overview` — Brand philosophy & corporate identity
   - `02 // OSP Fiber` — High-capacity FTTH network architecture
   - `03 // O-Calc Pro` — NESC-compliant structural pole loading validation
   - `04 // Workflow` — Frontier, Katapult Pro, AutoCAD & O-Calc integration
2. **Section 2: Know Our Company (`#about`)**  
   Executive background, US time-zone overlap, 5+ years of engineering excellence, and backend execution capabilities.
3. **Section 3: Our Services (`#services`)**  
   Four specialized telecom disciplines linked to dedicated enterprise procurement sub-pages:
   - [01 Research & Permitting](file:///services/research-permitting.html) — Jurisdictional ROW, DOT, railroad, municipal permits & joint-use audits
   - [02 Design / Drafting](file:///services/design-drafting.html) — Construction Drawing (CD) packages, traffic control plans & as-built redlines
   - [03 OSP Fiber](file:///services/osp-fiber.html) — FTTH/FTTx architecture, optical loss budgets & splice closure schematics
   - [04 Pole Loading Analysis](file:///services/pole-loading-analysis.html) — O-Calc Pro 3D finite element structural digital twins & NESC certifications
4. **Section 4: Scale Milestones & Impact (`#metrics`)**  
   Animated real-world telemetry milestones:
   - **25,000+** Structures Analyzed
   - **18,500+** Poles Managed
   - **5+ Years** Engineering Excellence
   - **14+ States** US Deployment Footprint
5. **Section 5: Technology Ecosystem (`#technology`)**  
   Industry toolchain breakdown: **Frontier** (Reconnaissance) ➔ **Katapult Pro** (Photogrammetry) ➔ **AutoCAD** (Design Documentation) ➔ **O-Calc Pro** (Structural Validation).
6. **Section 6: Client Testimonials (`#testimonials`)**  
   Real-world feedback from Directors of OSP Engineering, VPs of Network Deployment, and Joint-Use Permitting Managers.
7. **Section 7: Direct Contact & RFQ Form (`#contact`)**  
   Validated inquiry form with anti-spam honeypot, volume estimation, and direct office contact details.

---

## Design System & Palette

The platform adheres to an executive dual-tone editorial palette:

| Token | Hex Code | Visual Application |
|:---|:---:|:---|
| **Royal Blue** | `#014BAA` | Primary branding, sticky navbar, section headers, active indicators, metrics backdrop, and primary CTAs |
| **Light Cream** | `#F8F3F0` | Primary content canvas, card surfaces, frosted glass panels, and high-contrast typography |
| **Navy-Slate** | `#1A2434` / `#3D4A5D` | Ultra-readable body typography across light canvas sections |
| **Elevated White** | `#FFFFFF` | Service cards, input fields, and contrast text highlights |

### UX Rules
- **Streamlined Navigation**: Strict three-item navbar (`Home`, `About Us`, and `LET'S CONNECT`) to focus procurement traffic directly on conversion.
- **Glassmorphic Cards**: Elevated frosted cards (`rgba(248, 243, 240, 0.08)` to `0.14`) with subtle borders and shadows.
- **Zero SaaS Templates**: Custom-crafted layout tailored specifically for telecommunications engineering procurement.

---

## Multi-Page Architecture

In addition to the unified 7-section single-page overview, the platform includes dedicated rollup-configured sub-pages for deep technical review:

```
dist/
├── index.html                           # Main 7-section B2B portal
└── services/
    ├── research-permitting.html         # Jurisdictional permitting & joint-use
    ├── design-drafting.html             # CDs, strand maps, and drafting standards
    ├── osp-fiber.html                   # FTTH architecture & loss calculations
    └── pole-loading-analysis.html       # O-Calc Pro structural engineering
```

---

## Tech Stack & Tooling

- **Frontend**: HTML5, Vanilla CSS3 (Custom Liquid Glass System), ES Modules
- **3D Graphics**: Three.js (r160+), Custom GLSL Shaders, Post-processing Bloom & ACESFilmic Tone Mapping
- **Motion & Scrollers**: GSAP (GreenSock Animation Platform)
- **Bundler & Dev Server**: Vite 5.4+ with Rollup multi-page inputs
- **Quality Assurance**: Automated Playwright / TypeScript E2E test suite (`tests/vf-platform.spec.ts`)

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation
```bash
git clone https://github.com/srinath9121/vfiber-ltd.git
cd vfiber-ltd
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
npm run build
```
Generates a fully optimized static build in `/dist`.

### Local Build Preview
```bash
npm run preview
```

---

## Testing & Quality Assurance

Run the automated platform test suite to verify navigation, metrics, responsive drawer behavior, and RFQ form validation:

```bash
npx playwright test
```

---

## License & Copyright

&copy; 2026 **Venkateswara Fiber Technologies Private Limited (VF Technologies)**. All rights reserved.  
*Powering a Better Tomorrow.*
