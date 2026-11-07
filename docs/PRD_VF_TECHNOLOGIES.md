# Product Requirements Document (PRD)
## Project: Venkateswara Fiber Technologies Pvt. Ltd. (VF Technologies) — B2B Corporate & Multi-Page Engineering Platform

---

### 1. Executive Summary & Architectural Vision (Options B + C Hybrid)
Your current `vf-technologies.com` application locks `body, html { overflow: hidden; }` and forces B2B telecom buyers onto a single-page 3D camera rail (`scrollFloat` 0.00 to 8.50). While visually cinematic, enterprise telecom procurement managers, OSP Directors, and ISP Engineering VPs need immediate navigation, deep technical service specifications, downloadable/scannable deliverables, and direct RFQ conversion forms.

By combining **Option B (High-Conversion B2B Corporate Layout)** and **Option C (Multi-Page Route Architecture)**—and making **major design upgrades** over `intelli-networks.com`—we will transform VF Technologies into a **Multi-Route B2B Engineering Platform**:
1. **No Generic Light-Mode Clutter (Major Upgrade over Intelli-Networks):** Instead of Intelli-Networks' generic white/blue Bootstrap-style templates and broken *Lorem Ipsum* placeholders, VF Technologies retains its elite **Dark Telemetry & Liquid-Glass Identity** (`#050a14` Deep Space Navy, `#00CFFF` Electric Cyan, `#C41E3A` Carrier Ruby, `Space Grotesk` + `Playfair Display`).
2. **Natural Native Scrolling + Interactive 3D Hero Canvas:** Unlock `overflow-y: auto`. The Three.js Earth/Signal/Tower shader scene is scoped cleanly to the Hero & Interactive Telemetry Banner (with instant pause when off-screen for zero GPU drain), while the rest of the website scrolls naturally at 60fps.
3. **Multi-Page Service Architecture (Option C):** Dedicated, SEO-indexable routes for every core service (`/services/research-permitting`, `/services/design-drafting`, `/services/osp-fiber`, `/services/pole-loading-analysis`), plus `/technology`, `/gallery`, `/about`, and `/contact`.
4. **Single-File Editable Metrics Config (`src/config/siteMetrics.ts`):** All dynamic numbers (Structures Analyzed, Poles Managed, Years of Experience, Top-Bar Phone Number, Email, Office Address) live in one central config file so you can update them anytime without touching UI components.

---

### 2. Exact Framework, Languages, Libraries & Third-Party Tools

#### Core Languages
* **TypeScript (`^5.6.0`) / ES2022 Modules:** Strict type-safety for all service data, metrics configuration, and form payloads.
* **HTML5 (Semantic SEO Structure):** Proper `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, and `<footer>` hierarchy with JSON-LD `Organization` and `Service` schema.
* **CSS3 + Tailwind CSS (`^3.4.15`):** Configured with custom VF Technologies design tokens (`vf-navy: #050a14`, `vf-cyan: #00CFFF`, `vf-crimson: #C41E3A`) and bespoke `.liquid-glass` utilities.
* **GLSL (WebGL Shaders):** Retained ONLY for the scoped Hero Earth/Fiber visual backdrop (`three` `^0.160.0`).

#### Application Framework & Routing (Options B + C)
* **Next.js 14/15 (App Router with `output: 'export'` Static Site Generation) OR Vite Multi-Page Router:**
  * *Primary Recommendation:* **Next.js (App Router) + TypeScript + Tailwind CSS** with Static Export (`output: 'export'`). This deploys seamlessly on your existing static host (Render / Vercel / Netlify) while giving you true multi-page SEO routes (`/services/osp-fiber`, etc.) and shared layouts.
  * *Alternative (Zero-Migration Vite Option):* Keep **Vite (`^5.4.21`)** configured with multi-page rollup inputs (`index.html`, `services/osp-fiber.html`, etc.) + TypeScript. *(Prompts for both are included in the Antigravity Prompt Pack so you or the agent can run smoothly).*

#### UI, Animation & Form Libraries
* **GSAP (`^3.12.5`) + ScrollTrigger:** For smooth section entrances, technical blueprint line-drawing animations, and hardware-accelerated counter tick-ups.
* **Swiper (`^11.1.14`):** Powers the 4-Slide Hero Engineering Showcase and the 4-Tool Technology Stack Carousel.
* **Lucide Icons (`lucide-react` or `lucide`):** Crisp technical vector icons for NESC compliance, CAD drafting, LiDAR/field recon, and fiber splicing.
* **Zod (`^3.23.8`) + Web3Forms API:** Client-side schema validation + serverless email delivery directly to `services@vf-technologies.com` with bot honeypot protection.

#### Testing & Quality Assurance Tools
* **Playwright (`@playwright/test` `^1.48.0`):** End-to-end browser testing across Desktop (`1440x900`), Tablet (`768x1024`), and Small Mobile (`320x568` & `375x812`).
* **Vitest (`^2.1.4`) + JSDOM:** Unit testing for the central `siteMetrics` config, counter formatters, and RFQ form validator.

---

### 3. Single-Source Configuration (`src/config/siteMetrics.ts`)
You mentioned you will update the exact numbers for **Structures Analyzed**, **Poles Managed**, **Years of Experience**, and **Phone Number**. Every component across the entire website will read from this single file:

```typescript
// src/config/siteMetrics.ts
export const SITE_CONFIG = {
  companyName: "Venkateswara Fiber Technologies Private Limited",
  shortName: "VF Technologies",
  tagline: "Powering a Better Tomorrow.",
  badge: "ENGINEERING & TELECOMMUNICATION INFRASTRUCTURE",

  // ── EDIT YOUR EXACT NUMBERS & CONTACT INFO HERE ──
  metrics: {
    structuresAnalyzed: {
      value: 25000,         // <-- Update exact number here
      suffix: "+",
      label: "STRUCTURES ANALYZED",
      subtext: "Thousands of structures. Thousands of engineering decisions."
    },
    polesManaged: {
      value: 18500,         // <-- Update exact number here
      suffix: "+",
      label: "POLES MANAGED",
      subtext: "Every pole is part of a network. Every network depends on precision. Across the United States."
    },
    yearsOfExperience: {
      value: 5,             // <-- Update exact years of experience here
      suffix: "+ Years",
      label: "ENGINEERING EXCELLENCE",
      subtext: "High-precision backend telecom engineering for US broadband providers."
    },
    usStatesCovered: {
      value: 14,            // <-- Optional 4th counter for the 4-metric B2B trust bar
      suffix: "+ States",
      label: "US FOOTPRINT",
      subtext: "Supporting fiber & utility deployments across the United States."
    }
  },

  contact: {
    phoneDisplay: "+91 (XXX) XXX-XXXX", // <-- Update exact phone number here
    phoneHref: "tel:+91XXXXXXXXXX",     // <-- Update exact dial string here
    email: "services@vf-technologies.com",
    address: "Madhapur, Hyderabad, Telangana, India.",
    linkedinUrl: "https://www.linkedin.com/company/venkateswara-fiber-technologies-pvt-ltd",
    operatingHours: "Mon – Sat | US & IST Overlapping Engineering Shifts"
  }
} as const;
```

---

### 4. Major Upgrades Over `intelli-networks.com` (Page & Section Blueprint)

#### Section 1: Persistent Top Telemetry Utility Bar & Sticky Liquid-Glass Navbar
* **Top Utility Bar:** Displays live engineering status indicator (`● US TELECOM BACKEND OPS ACTIVE`), clickable `services@vf-technologies.com`, clickable `phoneDisplay` from `SITE_CONFIG`, Madhapur Hyderabad HQ badge, and LinkedIn icon.
* **Sticky Main Navbar:**
  * Left: VF Technologies Logo (`/logo.jpg`) + `VF TECHNOLOGIES` / `Powering a Better Tomorrow`.
  * Center Links:
    * `Home` (`/`)
    * `Services ▾` (Mega-Dropdown with telemetry numbers `01` to `04`, descriptions, and direct links to `/services/research-permitting`, `/services/design-drafting`, `/services/osp-fiber`, `/services/pole-loading-analysis`)
    * `Technology Stack` (`#technology` / `/technology`)
    * `Infrastructure Gallery` (`#gallery` / `/gallery`)
    * `About Us` (`#about` / `/about`)
  * Right CTA: Crimson-bordered Liquid-Glass button `LET'S CONNECT` -> scrolls to `#contact-rfq` or opens RFQ modal.

#### Section 2: 4-Slide Interactive Hero Showcase + Scoped 3D WebGL Backdrop
* **Major Change from Intelli-Networks:** Instead of flat stock photos with broken slide numbers, VF Technologies uses your **3D Earth-to-Fiber WebGL canvas as an interactive ambient background** behind a **4-Slide Telemetry Hero Carousel (`01` – `04`)**:
  * **Slide `01` — Corporate Identity:** *"VF TECHNOLOGIES — Powering a Better Tomorrow."* Subtitle: *"Every connection begins with infrastructure. Behind every connection is engineering built to make it possible."* Dual CTAs: `Explore Services` & `Request Engineering Proposal`.
  * **Slide `02` — OSP Fiber & FTTH Engineering:** *"Precision Outside Plant (OSP) Fiber Architecture Across the United States."*
  * **Slide `03` — Structural Pole Loading (O-Calc Pro):** *"NESC-Compliant Structural Validation & Make-Ready Engineering."*
  * **Slide `04` — Integrated Telecom Workflow:** *"Frontier • Katapult Pro • AutoCAD • O-Calc Pro — Different tools. One engineering workflow."*

#### Section 3: 4-Metric Audited Engineering Trust Strip
* **Major Change from Intelli-Networks:** Replaces generic counters with your high-contrast **Liquid-Glass Telemetry Cards** (`border-top: 3px solid #00CFFF` and `#C41E3A`).
* Renders non-zero initial HTML values from `SITE_CONFIG.metrics` (preventing the `0` SEO bug) and animates smoothly on scroll:
  1. **Structures Analyzed** (`#00CFFF` Cyan Glow)
  2. **Poles Managed** (`#C41E3A` Crimson Glow)
  3. **Years of Experience** (`#00CFFF` Cyan Glow)
  4. **US Footprint / Integrated Workflow** (`#ffffff` Crisp White)

#### Section 4: "Behind the Scenes" Company Identity & Capability Checklist
* **Left Column:** Experience Badge (`X+ Years of Precision Telecom Engineering`) + Night Tower visual (`/references/tower night.jpg`) with live CAD telemetry overlay.
* **Right Column:**
  * Badge: `COMPANY IDENTITY // BEHIND THE SCENES`
  * Narrative: *"Venkateswara Fiber Technologies Private Limited (VF Technologies) provides high-precision backend engineering, planning, and deployment design services for telecom operators and broadband providers. We work behind the scenes of modern connectivity — turning field information into engineering decisions, construction-ready designs, and deployable network solutions."*
  * **6-Point Engineering Accountability Grid:**
    * `✓` High-Precision Make-Ready & Pole Loading
    * `✓` Construction-Ready AutoCAD Plansets
    * `✓` Katapult Pro Photogrammetry Processing
    * `✓` Right-of-Way (ROW) & Municipal Permitting
    * `✓` Aerial & Underground OSP Fiber Routing
    * `✓` Dedicated US Time-Zone Alignment

#### Section 5: Deep B2B Services Matrix (With Dedicated Sub-Pages)
Each of the 4 VF Technologies services is presented as an interactive **Split Telemetry Card** on the homepage AND links to its own dedicated sub-page (`/services/[slug]`):

| # | Service Name | Dedicated URL Slug | Sub-Deliverables & Technical Scope | Primary Tools Used |
| :--- | :--- | :--- | :--- | :--- |
| **01** | **Research & Permitting** | `/services/research-permitting` | Right-of-Way (ROW) verification, jurisdictional research, utility pole ownership audits, DOT/Railroad/Municipal permit package preparation, joint-use attachment applications. | GIS Portals, AutoCAD, Municipal Databases |
| **02** | **Design / Drafting** | `/services/design-drafting` | Construction Drawing (CD) packages, traffic control plans (TCP), base map drafting, strand maps, as-built redline reconciliation, BOM generation. | AutoCAD, Spatial GIS |
| **03** | **OSP Fiber** | `/services/osp-fiber` | End-to-end FTTH/FTTx network architecture, aerial & buried route optimization, splice closure diagrams, optical link loss budgets, ODF distribution panel mapping, make-ready engineering. | Katapult Pro, Frontier, AutoCAD |
| **04** | **Pole Loading Analysis (O-Calc Pro)** | `/services/pole-loading-analysis` | 3D structural digital twin modeling, NESC Grade B/C & GO-95 wind/ice load calculations, guying & anchor sizing, pass/fail structural certification reports, make-ready remediation design. | O-Calc Pro, Katapult Pro |

#### Section 6: "Our Technology Stack — The Tools Behind the Work" (4-Stage Pipeline)
* Interactive horizontal pipeline connecting your 4 core platforms with visual cards (`/services/frontier.jpg`, `/services/katapult.jpg`, `/services/autocad.jpg`, `/services/ocalc-pro.jpg`):
  * `01 — FIELD RECONNAISSANCE`: **FRONTIER** (Field data capture & asset verification)
  * `02 — WORKFLOW ENGINE`: **KATAPULT PRO** (Photogrammetry, pole attachment & make-ready modeling)
  * `03 — DESIGN DOCUMENTATION`: **AUTOCAD** (Precision construction drawings & permitting schematics)
  * `04 — STRUCTURAL VALIDATION`: **O-CALC PRO** (NESC structural pole loading analysis & certification)
* Culminates in the signature statement: *"Different tools. One engineering workflow."*

#### Section 7: 7-Stage Physical Fiber Infrastructure Gallery (Lightbox + Filter Tabs)
* Surfaces all 30 high-resolution engineering photographs currently hidden inside your `public/1. Submarine cable/` through `public/7. ODF fiber distribution panel/` folders:
  * Filter Tabs: `All Stages` | `01. Submarine Backbone` | `02. Loose-Tube Construction` | `03. Optical Fiber Macro` | `04. Subsea Deployment` | `05. Cable Landing Station` | `06. Fiber Splice Closure` | `07. ODF Distribution Panel`.
  * Includes a keyboard-accessible Lightbox modal with technical captions explaining how each physical layer connects to VF Technologies' engineering workflow.

#### Section 8: B2B "Start a Conversation" RFQ Form & Corporate Footer
* **Left Column:** Direct Contact Glass Card (`services@vf-technologies.com`, Phone Number from `SITE_CONFIG`, `Madhapur, Hyderabad, Telangana, India`, LinkedIn link).
* **Right Column:** Validated B2B Engineering Inquiry Form:
  * Fields: `Full Name *`, `Work Email *`, `Company / ISP / Contractor *`, `Phone Number`, `Required Service (Checkboxes: Research & Permitting, Design/Drafting, OSP Fiber, Pole Loading O-Calc Pro)`, `Estimated Pole / Mileage Volume`, `Project Details *`, plus hidden `_gotcha` honeypot.
* **4-Column Corporate Footer:** Brand Summary, Core Services Links, Engineering Tech Stack Links, and Corporate Office Details.