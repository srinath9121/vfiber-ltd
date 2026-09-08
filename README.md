# VF Technologies — Powering a Better Tomorrow

An interactive, high-performance 3D WebGL digital experience showcasing the end-to-end telecommunications infrastructure engineering of **VF Technologies (Venkateswara Fiber Technologies Pvt Ltd.)**. 

Built with **Three.js**, **GLSL Shaders**, **GSAP**, and **Vite**, this application transforms complex physical telecom engineering—from transatlantic subsea optical fiber routes and structural tower analysis to macro single-mode waveguide physics and optical distribution frames—into an immersive, bidirectional scroll-driven journey.

---

## Key Highlights & Experience Architecture

The experience follows the continuous physical propagation of a single carrier photon across six distinct engineering chapters:

```
[00: Orbit] ──► [01: Regional] ──► [02: Pole Loading] ──► [03: Coupling] ──► [04: Fiber Core] ──► [05: ODF Bay] ──► [06: Contact]
```

### 1. Planetary Orbit & Transatlantic Corridor (`Chapter 0`)
- **Photorealistic Earth Simulation**: Multi-layer planetary shaders featuring photographic day/night terminator transitions, Rayleigh atmospheric limb scattering, specular ocean reflectance, and nocturnal terrestrial illumination.
- **Level of Detail (LOD)**: Dynamic 3-tier geometric LOD (`THREE.LOD`) dynamically scaling polycount based on camera altitude, reducing GPU vertex overhead by over 75% during close-up operations.
- **Transoceanic Subsea Cables**: Physically modeled subsea armored cable routes based on international submarine fiber corridors with instanced landing station hubs.

### 2. Regional Western Network Infrastructure (`Chapter 1`)
- **Backbone Routing**: High-precision geographical mapping across North American data hubs, featuring surface-conformal telemetry rings and Bezier interconnect trunks.
- **Telecommunication Landing Hubs**: Instanced GPU nodes providing high visual density with minimal draw calls.

### 3. Structural Make-Ready Engineering (`Chapter 2`)
- **4-Leg Tapered Steel Lattice Tower**: Accurate representation conforming to telecommunications standards (NESC C2-2023 Grade B Heavy loading criteria).
- **Physical Hardware Assemblies**: Sector antennas, microwave dish radomes with riveted aluminium shrouds, coaxial feeder lines, safety climbing ladders, and concrete pier foundations.
- **Memory Lifecycle Management**: Automatic GPU memory reclamation and geometry disposal when navigating past the structure.

### 4. Waveguide Coupling & Photonic Mode Conversion (`Chapter 3`)
- **Deterministic Particle Field**: Custom GLSL `ShaderMaterial` simulating lightwave coupling from RF electrical inputs to optical glass waveguides.
- **Perspective-Correct Size Attenuation**: Dynamic camera-distance-attenuated point sizing maintaining physical particle volume across wide-angle descents.
- **Dynamic Spectral Shift**: Chromatic position-based color ramp transitioning from electric cyan (`#00CFFF`) to high-energy ruby core pulses (`#C41E3A`).

### 5. Multi-Fiber Cable Cutaway & Internal Waveguide (`Chapter 4`)
- **Precision Mechanical Cable Cutaway**: Structural cross-section detailing HDPE outer jacket, dielectric aramid/Kevlar tensile yarn, central FRP anti-buckling rod, and helical PBT loose-buffer tubes adhering to TIA-598-C color-coding.
- **Physical Optical Transmission**: `MeshPhysicalMaterial` transmission utilizing dedicated `WebGLRenderTarget` textures for real-time refractive dispersion (`IOR 1.45`).
- **Photonic Core Waveguide**: Volumetric raymarching shader illustrating internal total reflection and laser pulse dynamics.

### 6. Optical Distribution Frame (ODF) Bay (`Chapter 5`)
- **19-Inch Equipment Rack Bay**: 6 rows of 1U patch panels with 72 LC-UPC duplex adapter ports and ceramic alignment sleeves.
- **GPU Instanced Draw Calls**: Replaced individual port meshes with `THREE.InstancedMesh`, collapsing 144 separate draw calls into 2 draw calls.
- **Interactive Telemetry Inspection**: Raycasting against instanced adapters with instant lookup of circuit loss, optical return loss, and wavelength specifications.

---

## Technical Stack & Performance Architecture

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Core Engine** | [Three.js](https://threejs.org/) (r160+) | 3D scene graph, camera choreography, material pipelines, and rendering. |
| **Post-Processing** | `EffectComposer` | UnrealBloomPass for physical emissive photonic glow, FXAAShader for edge smoothing. |
| **Color Management** | ACESFilmic Tone Mapping | sRGB output color space (`THREE.SRGBColorSpace`) with HDR exposure calibration. |
| **Animation Engine** | [GSAP](https://greensock.com/gsap/) | Deterministic numerical interpolation and timeline management. |
| **Shader Layer** | GLSL / WebGL 2.0 | Custom vertex/fragment shaders for atmospheric Fresnel, noise dissolve portals, and photonic pulses. |
| **Build & Tooling** | [Vite](https://vitejs.dev/) | Lightning-fast HMR and optimized production bundling. |

### Engineering Standards
- **Zero Arbitrary Keyframes**: Every animation is tied to a single source of truth scroll progress (`scrollFloat` 0.00 to 6.00), guaranteeing 100% bidirectional symmetry forwards and backwards.
- **Draw Call Minimization**: Redundant meshes (landing nodes, ODF adapters, ceramic sleeves) are rendered via `THREE.InstancedMesh`.
- **Resource Lifecycle**: All chapter transitions implement explicit `.dispose()` routines to prevent WebGL context exhaustion on memory-constrained mobile hardware.
- **Design System**: Liquid Glass design language featuring frosted glass backdrops (`backdrop-filter`), subtle borders, curated HSL palettes, and modern typography (`Space Grotesk`).

---

## Project Structure

```
├── public/                     # Static production assets (branding, textures, models)
│   ├── logo.jpg                # Authentic VF Technologies corporate insignia
│   └── references/             # Photographic engineering references
├── src/
│   ├── chapters/               # Isolated modular 3D chapter controllers
│   │   ├── chapter0-earth.js   # Earth simulation, starfield, LOD, transatlantic subsea trunk
│   │   ├── chapter1-usa.js     # Regional North American network backbones
│   │   ├── chapter2-pole.js    # NESC lattice tower & structural make-ready assets
│   │   ├── chapter3-signal.js  # Photonic signal coupling & particle attenuation
│   │   ├── chapter4-fiber.js   # TIA-598-C fiber cutaway, transmission glass, & waveguide
│   │   ├── chapter5-final.js   # Network return, animated metrics, & CTA interface
│   │   └── chapter6-network.js # 19" ODF rack bay & interactive port inspection
│   ├── shaders/                # Custom GLSL shaders & noise functions
│   ├── utils/                  # Mathematical utilities, asset registry, audio engine
│   ├── environment.js          # Dynamic horizon gradients, haze, and lighting
│   └── scroll.js               # Smooth unified scroll orchestrator
├── index.html                  # Main application markup & liquid glass HUD styling
├── main.js                     # Master entry point, post-processing stack, & render loop
└── package.json                # Dependencies and build scripts
```

---

## Getting Started

### Prerequisites
- **Node.js**: Version 18.0.0 or higher
- **Package Manager**: `npm`, `pnpm`, or `yarn`

### Installation
Clone the repository and install project dependencies:

```bash
git clone https://github.com/srinath9121/vfiber-ltd.git
cd vfiber-ltd
npm install
```

### Development
Start the local development server:

```bash
npm run dev
```
Navigate to `http://localhost:5173/` in your WebGL2-compatible browser.

### Production Build
Generate an optimized production bundle:

```bash
npm run build
```

To preview the built production bundle locally:

```bash
npm run preview
```

---

## Deployment

The application is configured for deployment on modern edge hosting platforms such as **Vercel**, **Netlify**, or **AWS Amplify**:

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework Preset**: Vite

---

## License & Intellectual Property

&copy; 2026 **VF Technologies (Venkateswara Fiber Technologies Pvt Ltd.)**. All rights reserved.  
*Powering a Better Tomorrow.*
