# VF Technologies — Powering a Better Tomorrow

An interactive, high-performance 3D WebGL digital experience and engineering narrative showcasing the backend engineering, network design, and telecommunications infrastructure services of **VF Technologies (Venkateswara Fiber Technologies Pvt Ltd.)**.

Built with **Three.js**, **GLSL Shaders**, **GSAP**, and **Vite**, this application transforms physical telecom engineering—from planetary orbital routes and structural utility pole analysis to optical waveguide physics and high-density distribution frames—into an immersive, continuous scroll-driven story.

---

## Live Links & Socials

- **Official Website / Deployment**: Hosted on [Vercel](https://vercel.com/)
- **LinkedIn**: [VF Technologies Company Profile](https://www.linkedin.com/company/venkateswara-fiber-technologies-pvt-ltd)
- **Repository**: [github.com/srinath9121/vfiber-ltd](https://github.com/srinath9121/vfiber-ltd)
- **Contact Email**: [services@vf-technologies.com](mailto:services@vf-technologies.com)

---

## Continuous Narrative Journey

The experience flows seamlessly through a unified 6-stage storytelling journey tied deterministically to user scroll (`scrollFloat: 0.00 → 8.50`):

```
[01: Opening] ──► [02: Milestones] ──► [03: Services] ──► [04: Tech Stack] ──► [05: About Us] ──► [06: Contact]
```

| Scene | Narrative Stage | Scroll Range (`sf`) | Key Highlights & Engineering Content |
|:---|:---|:---:|:---|
| **Scene 01** | **Opening Hero** | `0.00 – 0.70` | Deep space orbital Earth perspective with atmospheric scattering. Brand philosophy: *“Every connection begins with infrastructure.”* |
| **Scene 02** | **Scale Milestones** | `0.70 – 1.75` | Deterministic count-up metrics for North American infrastructure:<br>• **20,000+** Structures Analyzed<br>• **50,000+** Poles Managed |
| **Scene 03** | **Services We Offer** | `1.75 – 4.30` | High-impact split-panel showcase paired with structural lattice tower visual:<br>• `01` **Research & Permitting**<br>• `02` **Design / Drafting**<br>• `03` **OSP Fiber**<br>• `04` **Pole Loading Analysis (O-Calc Pro)** |
| **Scene 04** | **Our Technology Stack** | `4.30 – 7.00` | Focused sequential spotlights for the core industry software ecosystem:<br>• **Frontier** — Spatial data & field planning<br>• **Katapult Pro** — High-precision photogrammetry & pole audits<br>• **AutoCAD** — Construction-grade telecommunication drafting<br>• **O-Calc Pro** — Non-linear finite element structural pole loading |
| **Scene 05** | **About Us** | `7.05 – 7.85` | Company origin and backend engineering mission statement: delivering precision, accountability, and deployable telecom solutions for operators across the USA. |
| **Scene 06** | **Contact Us** | `7.85 – 8.50` | Glassmorphic contact card with direct email, regional coverage (Western USA, Texas, California), services breakdown, official LinkedIn link, and interactive CTA. |

---

## 3D Graphics & Physics Architecture

### 1. Planetary Earth & Transatlantic Trunk (`Chapter 0`)
- **Multi-Layer Earth Shader**: Rayleigh limb scattering, dynamic day/night terminator transitions, specular ocean reflections, and nocturnal city light illumination.
- **Dynamic 3-Tier LOD**: Geometric Level of Detail (`THREE.LOD`) dynamically scales polygon density according to camera distance, reducing vertex overhead by over 75%.
- **Transoceanic Subsea Cables**: Accurately mapped subsea fiber routes with instanced landing hubs.

### 2. Regional Topology & Network Routing (`Chapter 1`)
- **North American Backbone Mapping**: High-precision geographical vectors and telemetry rings connecting major data centers.
- **Instanced Landing Hubs**: GPU-instanced nodes for maximum performance and minimal draw calls.

### 3. NESC Structural Tower Analysis (`Chapter 2`)
- **4-Leg Tapered Lattice Mast**: Modeled to telecommunications engineering specifications (NESC C2-2023 Grade B Heavy loading).
- **Physical Equipment Assemblies**: Sector antennas, microwave dish radomes, coaxial feeder line bundles, and climbing ladders.

### 4. Waveguide Coupling & Photonic Mode Conversion (`Chapter 3`)
- **Deterministic Particle Field**: Custom GLSL `ShaderMaterial` illustrating RF-to-optical signal conversion.
- **Perspective Size Attenuation & Spectral Shifts**: Smooth chromatic ramp transitions from electric cyan (`#00CFFF`) to high-energy ruby core pulses (`#C41E3A`).

### 5. Multi-Fiber Cable Cutaway & Internal Waveguide (`Chapter 4`)
- **Precision Mechanical Cable Cross-Section**: HDPE outer jacket, dielectric aramid/Kevlar yarn, central FRP strength rod, and color-coded loose-buffer tubes (TIA-598-C).
- **Physical Optical Transmission**: Real-time refraction and dispersion (`MeshPhysicalMaterial` with IOR 1.45).

### 6. Optical Distribution Frame (ODF) Bay (`Chapter 5`)
- **19-Inch Equipment Rack**: High-density patch panels housing 72 LC-UPC duplex adapter ports with ceramic alignment sleeves rendered via `THREE.InstancedMesh`.

---

## Technical Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Core 3D Engine** | [Three.js](https://threejs.org/) (r160+) | Scene graph, camera paths, custom shaders, and WebGL rendering |
| **Motion & Scroll** | [GSAP](https://greensock.com/gsap/) | Deterministic numerical interpolation and bidirectional timeline management |
| **Shaders** | GLSL / WebGL 2.0 | Custom vertex/fragment shaders for atmospheric scattering, noise portals, and photonic pulses |
| **Post-Processing** | `three/addons/postprocessing` | UnrealBloomPass for emissive glow, FXAA for anti-aliasing, and ACESFilmic tone mapping |
| **Styling & UI** | Vanilla CSS / Liquid Glass | Glassmorphic HUD, responsive clamp typography (`Space Grotesk`), and zero SaaS templates |
| **Build Tool** | [Vite](https://vitejs.dev/) | Lightning-fast development server, asset pipeline, and production rollup bundler |

---

## Project Structure

```
├── public/                     # Static production assets (branding, textures, references)
│   ├── logo.jpg                # VF Technologies corporate insignia
│   └── references/             # Photographic engineering assets & tower imagery
├── src/
│   ├── chapters/               # 3D chapter controllers
│   │   ├── chapter0-earth.js   # Earth simulation, starfield, LOD, transatlantic trunk
│   │   ├── chapter1-usa.js     # Regional North American network backbones
│   │   ├── chapter2-pole.js    # NESC lattice tower & structural make-ready assets
│   │   ├── chapter3-signal.js  # Photonic signal coupling & particle attenuation
│   │   ├── chapter4-fiber.js   # TIA-598-C fiber cutaway, transmission glass & waveguide
│   │   ├── chapter5-final.js   # Network culmination & deep space framing
│   │   └── chapter6-network.js # 19" ODF rack bay & adapter inspection
│   ├── shaders/                # Custom GLSL shader source code
│   ├── utils/                  # Mathematical utilities, engine hooks, audio controller
│   ├── environment.js          # Dynamic horizon gradients, haze, and lighting
│   ├── narrative.js            # 6-scene continuous DOM narrative state engine
│   └── scroll.js               # Smooth unified scroll orchestrator (0.00 -> 8.50)
├── index.html                  # Main DOM layout, Liquid Glass styling, and UI overlays
├── main.js                     # Master entry point, post-processing stack & render loop
└── package.json                # Project dependencies and npm scripts
```

---

## Getting Started

### Prerequisites
- **Node.js**: Version 18.0.0 or higher
- **Package Manager**: `npm`, `pnpm`, or `yarn`

### Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/srinath9121/vfiber-ltd.git
cd vfiber-ltd
npm install
```

### Local Development
Start the local development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

Open `http://localhost:5173/` in any modern WebGL2-compatible browser.

### Production Build
Generate an optimized, minified production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## Deployment

The repository is pre-configured for automated continuous deployment via **Vercel**:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node.js Version**: 18.x or 20.x

Every push to the `main` branch triggers an automated production deployment.

---

## License & Copyright

&copy; 2026 **VF Technologies (Venkateswara Fiber Technologies Pvt Ltd.)**. All rights reserved.  
*Powering a Better Tomorrow.*
