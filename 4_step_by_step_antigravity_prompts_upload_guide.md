# Antigravity Upload Checklist & Step-by-Step Execution Prompts

---

## Part 1: What You Need to Upload to Antigravity

When starting your session in **Antigravity**, make sure your workspace contains:

1. **Your Existing Project Folder (`vfiber-ltd-main`)**, specifically keeping your `public/` assets intact:
   - `public/logo.jpg`
   - `public/references/` (`tower night.jpg`, `earth 3.jpg`, etc.)
   - `public/services/` (`frontier.jpg`, `katapult.jpg`, `autocad.jpg`, `ocalc-pro.jpg`)
   - `public/1. Submarine cable/` through `public/7. ODF fiber distribution panel/`
   - `public/draco/` and `public/basis/`
2. **Replace `.agents/skills/vf-experience/SKILL.md`** with the updated **v2.0 `SKILL.md`** generated in File 3 above (keep `.agents/skills/liquid-glass/SKILL.md` and `.agents/skills/shader-gradient/SKILL.md`).
3. **Add `PRD_VF_TECHNOLOGIES.md` and `TESTING_AND_EDGE_CASES.md`** (from Files 1 & 2 above) into a `docs/` folder in the root of your repo so Antigravity has permanent context.

---

## Part 2: Sequential Prompts to Paste into Antigravity

Copy and paste these prompts **one phase at a time** into Antigravity. Wait for the agent to complete and verify each phase before pasting the next prompt.

---

### PROMPT 1: Architecture Setup & Central Metrics Config (`siteMetrics.ts`)
> **Copy & Paste into Antigravity:**
> ```text
> Read `.agents/skills/vf-experience/SKILL.md`, `docs/PRD_VF_TECHNOLOGIES.md`, and `docs/TESTING_AND_EDGE_CASES.md`.
>
> We are upgrading VF Technologies (`vf-technologies.com`) from a scroll-locked (`overflow: hidden`) single-page 3D rail into a high-converting B2B Corporate & Multi-Section/Multi-Page Engineering Platform (combining Options B & C from the PRD) while preserving our signature Dark Telemetry & Liquid-Glass aesthetic (`#050a14`, `#00CFFF`, `#C41E3A`, `Space Grotesk`, `Playfair Display`).
>
> Execute Phase 1 now:
> 1. Create `src/config/siteMetrics.ts` (or `.js` with JSDoc types if keeping Vite ES modules) as the single source of truth for:
>    - Company Identity: "Venkateswara Fiber Technologies Private Limited" / "VF Technologies" / "Powering a Better Tomorrow."
>    - Editable Metrics: `structuresAnalyzed` (default 25000, suffix "+"), `polesManaged` (default 18500, suffix "+"), `yearsOfExperience` (default 5, suffix "+ Years"), and `usStatesCovered` (default 14, suffix "+ States").
>    - Editable Contact Details: `phoneDisplay` ("+91 (XXX) XXX-XXXX"), `phoneHref` ("tel:+91XXXXXXXXXX"), `email` ("services@vf-technologies.com"), `address` ("Madhapur, Hyderabad, Telangana, India."), and `linkedinUrl` ("https://www.linkedin.com/company/venkateswara-fiber-technologies-pvt-ltd").
> 2. Create `src/config/servicesData.js` containing the full B2B technical breakdown, sub-deliverables, NESC/CAD standards, and URL slugs for all 4 services:
>    - `01` Research & Permitting (`research-permitting`)
>    - `02` Design / Drafting (`design-drafting`)
>    - `03` OSP Fiber (`osp-fiber`)
>    - `04` Pole Loading Analysis (O-Calc Pro) (`pole-loading-analysis`)
>    And the 4 Technology Stack tools (`FRONTIER`, `KATAPULT PRO`, `AUTOCAD`, `O-CALC PRO`).
> 3. Create `src/config/galleryManifest.js` that maps our 7 physical fiber infrastructure folders in `public/` (`1. Submarine cable` through `7. ODF fiber distribution panel`) using `encodeURI()` so folders with double spaces (`public/2. Actual fiber bundle  loose-tube construction/`) load with zero 404 errors.
> ```

---

### PROMPT 2: Unlock Native Scroll, Scope 3D Hero Canvas & Build Sticky Liquid-Glass Navigation
> **Copy & Paste into Antigravity:**
> ```text
> Execute Phase 2: Unlock Native Scrolling, Scope the Three.js Scene to the Hero Section, and Build the B2B Navigation Header & 4-Slide Telemetry Hero.
>
> 1. In `index.html` and CSS, remove `overflow: hidden` from `body, html` and enable smooth native vertical scrolling (`overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth;`). Remove the obsolete `#scroll-nav-guide` ("SCROLL IN & SCROLL OUT") and `#chapter-scrubber`.
> 2. Scope the Three.js WebGL renderer (`main.js`) inside `#hero-webgl-container` (100% width, `min-height: 92vh`).
>    - Add an `IntersectionObserver` on `#hero-webgl-container` and a `visibilitychange` listener on `document` so `composer.render()` pauses automatically when the user scrolls down into the B2B content sections or switches tabs.
>    - Scope the `webglcontextlost` fallback background strictly to `#hero-webgl-container`.
> 3. Build the **Top Telemetry Utility Bar** (`[data-testid="topbar"]`):
>    - Left: Live pulsing cyan status dot + `ENGINEERING & TELECOMMUNICATION INFRASTRUCTURE` + `Madhapur, Hyderabad, Telangana, India`.
>    - Right: Clickable email (`[data-testid="topbar-email"]`), clickable phone number (`[data-testid="topbar-phone"]`) bound dynamically to `SITE_CONFIG`, and LinkedIn link.
> 4. Build the **Sticky Liquid-Glass Navbar**:
>    - Left: `/logo.jpg` + `VF TECHNOLOGIES` + `Powering a Better Tomorrow`.
>    - Center Desktop Nav: `Overview`, `Services ▾` (`[data-testid="nav-services-trigger"]` opening a Liquid-Glass Mega-Dropdown listing `01 Research & Permitting`, `02 Design / Drafting`, `03 OSP Fiber`, `04 Pole Loading Analysis (O-Calc Pro)` with deep links), `Technology Stack`, `Infrastructure Gallery`, `About Us`.
>    - Right: Crimson-accented CTA button `LET'S CONNECT` scrolling to `#contact`.
>    - Mobile (`< 768px`): Accessible Hamburger Toggle (`[data-testid="mobile-menu-toggle"]`, `>= 44x44px`) opening a slide-over Liquid-Glass Drawer (`[data-testid="mobile-drawer"]`) with a collapsible `Services` accordion, body-scroll lock, and `Escape` key dismissal.
> 5. Build the **4-Slide Telemetry Hero Overlay** inside `#hero-webgl-container`:
>    - Slide `01`: "VF TECHNOLOGIES — Powering a Better Tomorrow." / "Every connection begins with infrastructure. Behind every connection is engineering built to make it possible."
>    - Slide `02`: "OSP FIBER & FTTH ARCHITECTURE" / "Every pole is part of a network. Every network depends on precision. Across the United States."
>    - Slide `03`: "POLE LOADING ANALYSIS (O-CALC PRO)" / "Thousands of structures. Thousands of engineering decisions. NESC-compliant structural validation."
>    - Slide `04`: "INTEGRATED ENGINEERING ECOSYSTEM" / "Frontier • Katapult Pro • AutoCAD • O-Calc Pro — Different tools. One engineering workflow."
>    - Include numbered slide controls (`01`, `02`, `03`, `04`) that also smoothly transition the Three.js camera between orbital Earth (`sf: 0.25`), USA Network Grid (`sf: 1.35`), Telecom Tower (`sf: 2.50`), and Fiber Core (`sf: 3.40`)!
> ```

---

### PROMPT 3: Build the 4-Metric Audited Counter Strip, "Behind the Scenes" About Section, and Deep Services Matrix
> **Copy & Paste into Antigravity:**
> ```text
> Execute Phase 3: Build the B2B Content Sections (4-Metric Trust Strip, Company Identity Split Block, and Deep 4-Service Matrix + Interactive Service Detail Modal/Pages).
>
> 1. **4-Metric Audited Counter Strip (`#metrics`)**:
>    - Render 4 Liquid-Glass milestone cards bound to `SITE_CONFIG.metrics`:
>      - `STRUCTURES ANALYZED` (`[data-testid="metric-structures"]`, Cyan glow `#00CFFF`, subtext: "Thousands of structures. Thousands of engineering decisions.")
>      - `POLES MANAGED` (`[data-testid="metric-poles"]`, Crimson glow `#C41E3A`, subtext: "Every pole is part of a network. Every network depends on precision. Across the United States.")
>      - `ENGINEERING EXCELLENCE` (`[data-testid="metric-experience"]`, Cyan glow, displaying `yearsOfExperience`)
>      - `US FOOTPRINT` (`[data-testid="metric-footprint"]`, displaying `usStatesCovered`)
>    - CRITICAL EDGE CASE: Populate the initial DOM text and `data-target` with the real numbers from `SITE_CONFIG` so crawlers and no-JS users never see `0`, and use `IntersectionObserver` to animate the count-up smoothly when scrolled into view.
> 2. **Company Identity & "Behind the Scenes" Split Section (`#about`)**:
>    - Left Column: High-resolution framed visual of `/references/tower night.jpg` with an overlaid Liquid-Glass Experience Badge (`SITE_CONFIG.metrics.yearsOfExperience`) and live telemetry coordinates.
>    - Right Column:
>      - Badge: `COMPANY IDENTITY // BEHIND THE SCENES`
>      - Heading: `ABOUT VENKATESWARA FIBER TECHNOLOGIES`
>      - Copy: "Venkateswara Fiber Technologies Private Limited (VF Technologies) provides high-precision backend engineering, planning, and deployment design services for telecom operators and broadband providers. We work behind the scenes of modern connectivity — turning field information into engineering decisions, construction-ready designs, and deployable network solutions. Our work is built around precision, accountability, and the infrastructure that keeps communities connected."
>      - 6-Point Engineering Capability Checklist (FTTH/OSP Routing, O-Calc Pro Structural Validation, Katapult Pro Photogrammetry, AutoCAD Construction Plansets, ROW & Municipal Permitting, US Time-Zone Execution).
> 3. **Services We Offer — Deep B2B Matrix & Dedicated Sub-Routes (`#services`)**:
>    - Render all 4 services (`01 RESEARCH & PERMITTING`, `02 DESIGN / DRAFTING`, `03 OSP FIBER`, `04 POLE LOADING ANALYSIS (O-CALC PRO)`) as detailed Liquid-Glass cards showing:
>      - Service Number & Title
>      - Technical overview paragraph
>      - 5 bulleted engineering deliverables per service
>      - Tools utilized badge (`Frontier`, `Katapult Pro`, `AutoCAD`, `O-Calc Pro`)
>      - Interactive "Inspect Deliverables & Specs →" button that opens the dedicated service view (`/services/research-permitting`, `/services/design-drafting`, `/services/osp-fiber`, `/services/pole-loading-analysis` via History API route + deep-linkable URL hash/pathname so both direct navigation and SPA transitions work seamlessly).
> ```

---

### PROMPT 4: Build the 4-Tool Technology Stack Pipeline, 7-Stage Infrastructure Gallery, and B2B RFQ Contact Form
> **Copy & Paste into Antigravity:**
> ```text
> Execute Phase 4: Build the Technology Stack Section, 7-Stage Physical Fiber Infrastructure Gallery, B2B RFQ Contact Form, and Corporate Footer.
>
> 1. **Our Technology Stack (`#technology`)**:
>    - Badge: `ENGINEERING ECOSYSTEM`
>    - Heading: `OUR TECHNOLOGY STACK`
>    - Sub-quote: `“The tools behind the work.”`
>    - Connected 4-stage horizontal workflow grid featuring:
>      - `01 — FIELD RECONNAISSANCE`: **FRONTIER** (`/services/frontier.jpg`) — Field asset capture, pole reconnaissance, and route verification.
>      - `02 — WORKFLOW ENGINE`: **KATAPULT PRO** (`/services/katapult.jpg`) — Photogrammetry processing, mid-span clearance auditing, and make-ready engineering.
>      - `03 — DESIGN DOCUMENTATION`: **AUTOCAD** (`/services/autocad.jpg`) — High-precision construction drawings (CDs), strand maps, and permit packages.
>      - `04 — STRUCTURAL VALIDATION`: **O-CALC PRO** (`/services/ocalc-pro.jpg`) — 3D structural pole loading analysis, wind/ice vector modeling, and NESC certification.
>    - Footer Banner: `INTEGRATED WORKFLOW — Different tools. One engineering workflow.`
> 2. **7-Stage Physical Fiber Infrastructure Gallery (`#gallery`)**:
>    - Badge: `INFRASTRUCTURE PORTFOLIO`
>    - Heading: `FROM SUBSEA BACKBONE TO OPTICAL DEMARCATION`
>    - Filter Tabs: `All Stages`, `01. Submarine Cable`, `02. Loose-Tube Bundle` (`[data-testid="gallery-tab-loose-tube"]`), `03. Optical Fiber Macro`, `04. Ocean Floor`, `05. Cable Landing Station`, `06. Splice Closure`, `07. ODF Distribution Panel`.
>    - Render responsive Liquid-Glass image cards (`[data-testid="gallery-item"]`) using `src/config/galleryManifest.js` (`loading="lazy"`, safe URL encoding) + a click-to-zoom Lightbox modal with stage descriptions.
> 3. **Start a Conversation — B2B RFQ Contact Form & Direct Details (`#contact`)**:
>    - Prelude Quote: `“Every project starts with a connection.”` / `Let's build the next one.`
>    - Left Column: VF Technologies Contact Glass Card displaying Email (`services@vf-technologies.com`), Phone (`SITE_CONFIG.contact.phoneDisplay`), Region (`Madhapur, Hyderabad, Telangana, India.`), Services summary, and LinkedIn button.
>    - Right Column: Validated B2B RFQ Form (`[data-testid="rfq-form"]`) with:
>      - `name` (Full Name *), `email` (Work Email *), `company` (Company / ISP *), `phone` (Phone Number), `service` (Dropdown: `Research & Permitting`, `Design / Drafting`, `OSP Fiber`, `Pole Loading Analysis (O-Calc Pro)`, `Full Turnkey Engineering`), `message` (Project Scope / Pole & Mileage Volume *), and hidden honeypot `_gotcha`.
>      - Client-side validation showing `[data-testid="form-error"]` on invalid submit, and a clean confirmation state (`[data-testid="form-success"]`) with fallback `mailto:` dispatch.
> 4. **4-Column Corporate Footer**:
>    - Column 1: VF Technologies Logo, tagline, and brief description.
>    - Column 2: Quick Links (`Overview`, `About Us`, `Technology Stack`, `Infrastructure Gallery`, `Contact Us`).
>    - Column 3: Core Engineering Services (`01 Research & Permitting`, `02 Design / Drafting`, `03 OSP Fiber`, `04 Pole Loading (O-Calc Pro)`).
>    - Column 4: Corporate Office (`Madhapur, Hyderabad, Telangana, India`), Email, Phone, LinkedIn, and Copyright.
> ```

---

### PROMPT 5: Automated Playwright E2E Verification & Visual QA
> **Copy & Paste into Antigravity:**
> ```text
> Execute Phase 5: Automated Testing & Visual QA Verification.
>
> 1. Install `@playwright/test` as a devDependency and configure `playwright.config.ts` to run against `npm run dev` (or `npm run preview`).
> 2. Create `tests/vf-platform.spec.ts` using the exact test specification in `docs/TESTING_AND_EDGE_CASES.md`.
> 3. Run the Playwright test suite and inspect live browser screenshots at `1440x900` (Desktop) and `375x812` / `320x568` (Mobile).
> 4. Verify and fix any issues until 100% of tests pass:
>    - Zero broken images (`naturalWidth > 0` across all tech stack and gallery folders, including folder 2 with double spaces).
>    - `SITE_CONFIG` values match across the Top Bar, Metrics Counter Strip, About Experience Badge, and Footer.
>    - Native scrolling works smoothly and the 3D Hero canvas pauses when scrolled off-screen.
>    - Mobile drawer opens, locks background scroll, and closes cleanly on `Escape`.
> ```