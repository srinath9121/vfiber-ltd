// chapter0-earth.js — Cinematic Earth, Fresnel GLSL atmosphere, network mesh, and physical protagonist Carrier Signal
// Phase 2 Refinement: Thin luminous red core (#C41E3A), subtle cyan secondary aura (#00CFFF),
// natural multi-point CatmullRom curve, deterministic trailing particle field, and seamless bridge into Texas & infrastructure.

import * as THREE from 'three';
import { clamp, map, lerp } from '../utils/math.js';

// ── Geographic Math Helper ───────────────────────────────────────────────────

export function latLonToVec3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta)
  );
}

function getRandomSpherePoint(radius) {
  const u = Math.random();
  const v = Math.random();
  const theta = u * 2.0 * Math.PI;
  const phi = Math.acos(2.0 * v - 1.0);
  const sinPhi = Math.sin(phi);
  return new THREE.Vector3(
    radius * sinPhi * Math.cos(theta),
    radius * sinPhi * Math.sin(theta),
    radius * Math.cos(phi)
  );
}

// ── Earth & Space Environment Construction (Phase 10 — Ultimate Photorealism) ───

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
const sphereSegments = isMobile ? 32 : 64;

const textureLoader = new THREE.TextureLoader();

// High-fidelity NASA Blue Marble 2:1 equirectangular day texture & photographic night city lights
const earthDayTexture = textureLoader.load(
  'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
);
const earthNightTexture = textureLoader.load('/references/earth 3.jpg');
const spaceSkyTexture = textureLoader.load('/references/main phtots of background.png');

// 1. 3D Deep Space Skysphere Environment (Grounded in deep black space — subtle astronomical background)
const spaceSkyGeo = new THREE.SphereGeometry(450, 32, 32);
// Low-contrast deep space astronomical tint (no competing foreground horizons)
const spaceSkyMat = new THREE.MeshBasicMaterial({
  color: 0x010204,
  side: THREE.BackSide,
  transparent: true,
  opacity: 1.0
});
export const spaceSkyMesh = new THREE.Mesh(spaceSkyGeo, spaceSkyMat);
spaceSkyMesh.renderOrder = -100;

// 2. Dense 3D Parallax Pin-point Starfield (Grounded in ISS astro-photography: milky way night 1-4)
// Real space photography reveals thousands of distant faint stars obeying power-law magnitude
// distribution: ~80% faint distant pinpricks, ~16% medium brightness, and ~4% bright beacon stars.
const starCount = isMobile ? 1800 : 5200;
const starGeo = new THREE.BufferGeometry();
const starPositions = new Float32Array(starCount * 3);
const starColors = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
  // Natural galactic plane clustering + deep space voids (matching milky way night 1-4.jpg)
  let theta, phi;
  const isGalacticCore = Math.random() < 0.58; // 58% concentrated along galactic plane band
  if (isGalacticCore) {
    theta = Math.random() * Math.PI * 2;
    // Gaussian-like concentration around the galactic equator (phi ~ PI/2)
    const galacticDev = (Math.random() + Math.random() + Math.random() - 1.5) * 0.28;
    phi = (Math.PI * 0.5) + galacticDev;
  } else {
    // Sparse field with dark cosmic voids
    theta = Math.random() * Math.PI * 2;
    phi = Math.acos(2.0 * Math.random() - 1.0);
  }

  // Tilt the galactic plane ~42 degrees relative to celestial coordinates
  const tilt = 0.73; // ~42 degrees
  const x0 = Math.sin(phi) * Math.cos(theta);
  const y0 = Math.sin(phi) * Math.sin(theta);
  const z0 = Math.cos(phi);
  const x = x0;
  const y = y0 * Math.cos(tilt) - z0 * Math.sin(tilt);
  const z = y0 * Math.sin(tilt) + z0 * Math.cos(tilt);

  const r = 260 + Math.random() * 160;
  starPositions[i * 3]     = r * x;
  starPositions[i * 3 + 1] = r * y;
  starPositions[i * 3 + 2] = r * z;

  // Physical astronomical magnitude distribution (88% faint pinpricks, 9% medium, 3% beacon)
  const magRoll = Math.random();
  let brightness;
  if (magRoll > 0.97) {
    brightness = 0.90 + Math.random() * 0.10; // 3% bright beacon stars
  } else if (magRoll > 0.88) {
    brightness = 0.45 + Math.random() * 0.25; // 9% medium stars
  } else {
    brightness = 0.08 + Math.random() * 0.22; // 88% faint distant pinpricks
  }

  // Realistic stellar spectrum: K/M warm amber (enriched in core), G solar yellow, A/B blue-white
  const specRoll = Math.random();
  let baseR, baseG, baseB;
  if (isGalacticCore && Math.random() < 0.35) {
    // Warm amber/gold stellar core dust
    baseR = 1.0; baseG = 0.78; baseB = 0.52;
  } else if (specRoll > 0.82) {
    // Hot blue-white stars
    baseR = 0.85; baseG = 0.92; baseB = 1.0;
  } else if (specRoll > 0.60) {
    // Warm amber K/M giants
    baseR = 1.0; baseG = 0.82; baseB = 0.60;
  } else if (specRoll > 0.30) {
    // Soft solar yellow
    baseR = 1.0; baseG = 0.95; baseB = 0.85;
  } else {
    // Neutral stellar white
    baseR = 0.92; baseG = 0.94; baseB = 0.98;
  }

  starColors[i * 3]     = baseR * brightness;
  starColors[i * 3 + 1] = baseG * brightness;
  starColors[i * 3 + 2] = baseB * brightness;
}

starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

const starMat = new THREE.PointsMaterial({
  size: 1.05,
  vertexColors: true,
  transparent: true,
  opacity: 0.90,
  sizeAttenuation: true
});
export const starFieldMesh = new THREE.Points(starGeo, starMat);

// 3. Primary 3D Earth Globe with Photographic Day/Night Terminator
// Sun direction angled from top-left to cast a dramatic day/night terminator across the globe
const sunDirection = new THREE.Vector3(-8.5, 3.8, 3.2).normalize();

export const earthMaterial = new THREE.ShaderMaterial({
  transparent: true,
  uniforms: {
    uDayMap:       { value: earthDayTexture },
    uNightMap:     { value: earthNightTexture },
    uSunDirection: { value: sunDirection },
    uOpacity:      { value: 1.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform sampler2D uDayMap;
    uniform sampler2D uNightMap;
    uniform vec3 uSunDirection;
    uniform float uOpacity;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      // 1. Day / Night Terminator Line (Smooth physical astronomical shadow transition)
      float sunDot = dot(vNormal, uSunDirection);
      float dayFactor = smoothstep(-0.08, 0.16, sunDot);

      // 2. Texture Sampling (Day Blue Marble + Night Nocturnal Lights)
      vec3 dayCol = texture2D(uDayMap, vUv).rgb;
      vec3 nightCol = texture2D(uNightMap, vUv).rgb;

      // 3. Ocean Depth & Specular Glint (Ref: earth 2.jpg / earth 4.jpg)
      // Deepen ocean navy tones while keeping continents vibrant
      float oceanMask = smoothstep(0.12, 0.35, dayCol.b - max(dayCol.r, dayCol.g) * 0.78);
      vec3 viewDir = normalize(vViewPosition);
      vec3 halfDir = normalize(uSunDirection + viewDir);
      float specComp = pow(max(0.0, dot(vNormal, halfDir)), 32.0) * oceanMask;
      vec3 specularCol = vec3(0.95, 0.98, 1.0) * specComp * 1.4;

      // 4. Daytime Surface Rayleigh Scattering (Thin blue atmospheric haze across lit continent/ocean edges)
      float fresnel = 1.0 - max(0.0, dot(viewDir, vNormal));
      float dayScattering = pow(fresnel, 3.8) * max(0.0, sunDot) * 0.45;
      vec3 rayleighHaze = vec3(0.16, 0.48, 0.92) * dayScattering;

      // 5. Nocturnal City Lights (Grounded in earth 3.jpg & milky way night.jpg)
      // Physically motivated solar attenuation: Rapidly extinguishes on sunlit day side
      float nightAttenuation = smoothstep(0.12, -0.15, sunDot);
      float nightLightIntensity = pow(nightCol.r, 1.35) * 2.2;
      vec3 warmAmber = vec3(1.0, 0.74, 0.38);
      vec3 cityLights = warmAmber * nightLightIntensity * nightAttenuation;

      // Night landmass ambient visibility (faint photographic earthshine — deep indigo/charcoal)
      vec3 nightAmbient = dayCol * vec3(0.015, 0.022, 0.035);

      vec3 finalCol = mix(nightAmbient + cityLights, dayCol + rayleighHaze, dayFactor) + specularCol * dayFactor;

      gl_FragColor = vec4(finalCol, uOpacity);
    }
  `
});

const earthGeometry = new THREE.SphereGeometry(3.5, sphereSegments, sphereSegments);
export const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
earthMesh.rotation.y = -0.75; // Initial deep space alignment

// 4. Subtle Separate Cloud Shell (Very faint, rotates slowly for real spherical parallax)
const cloudGeo = new THREE.SphereGeometry(3.512, sphereSegments, sphereSegments);
const cloudMat = new THREE.MeshStandardMaterial({
  map: earthDayTexture,
  transparent: true,
  opacity: 0.10,
  blending: THREE.AdditiveBlending
});
export const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
earthMesh.add(cloudMesh);

// 5. Thin Atmospheric Limb (GLSL Rayleigh Shader — Reference earth 4.jpg & milky way night 1-4.jpg)
// Razor-thin physical limb sits tightly on planetary boundary (radius = 3.530 vs Earth 3.500).
// Shines brilliant Rayleigh blue on sunlit limb, smoothly extinguishes on night side — NO uniform cyan halo.
const atmosphereGeo = new THREE.SphereGeometry(3.530, sphereSegments, sphereSegments);
const atmosphereMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  side: THREE.FrontSide,
  uniforms: {
    uSunDirection: { value: sunDirection },
    uOpacity:      { value: 0.90 }
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uSunDirection;
    uniform float uOpacity;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = 1.0 - max(0.0, dot(viewDir, vNormal));
      // Ultra-thin razor atmospheric limb (ref: earth 4.jpg)
      float rim = pow(fresnel, 8.5);

      // Physical sun alignment: brilliant on sunlit limb, zero on night side
      float sunDot = dot(vNormal, uSunDirection);
      float sunFactor = smoothstep(-0.06, 0.28, sunDot);

      // Atmospheric Rayleigh scattering: deep indigo-blue base transitioning to razor cyan-white edge
      vec3 rayleighBlue = mix(vec3(0.04, 0.32, 0.88), vec3(0.35, 0.80, 1.0), pow(fresnel, 2.8));

      // Faint twilight airglow tint (warm green/gold) right at the terminator (ref: milky way night.jpg)
      float terminatorGlow = smoothstep(-0.10, 0.05, sunDot) * (1.0 - smoothstep(0.05, 0.25, sunDot));
      vec3 airglowCol = vec3(0.40, 0.85, 0.45) * terminatorGlow * 0.4;

      gl_FragColor = vec4(rayleighBlue + airglowCol, rim * uOpacity * sunFactor);
    }
  `
});

export const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
earthMesh.add(atmosphereMesh);

// ── Real Global Telecommunications Infrastructure (Phase 10B — Grounded in Real Physical Fiber) ──
// Strictly replaces the generic polygon wireframe net with authentic terrestrial & subsea fiber paths.
// Hierarchy:
// 1. Geographic Ground Landing Hubs (real latitude/longitude coordinates)
// 2. Transoceanic Subsea Fiber Cables & Continental Terrestrial Backbones (smooth 3D CatmullRom splines)
// 3. Subdued inactive state (restrained dark cyan/slate, opacity 0.14)
// 4. Hero Active Transatlantic Route carrying the protagonist pulse into Texas!

export const networkGroup = new THREE.Group();

// Ground Gateway Landing Stations (Real Latitudes & Longitudes)
const hubCoordinates = [
  { name: 'London Gateway',        lat: 51.50,  lon: -0.12 },
  { name: 'Frankfurt Core Hub',    lat: 50.11,  lon: 8.68 },
  { name: 'Marseille Subsea Hub',  lat: 43.30,  lon: 5.37 },
  { name: 'New York Landing',      lat: 40.71,  lon: -74.00 },
  { name: 'Chicago Data Corridor', lat: 41.88,  lon: -87.63 },
  { name: 'Texas Switching Hub',   lat: 31.00,  lon: -100.00 },
  { name: 'Denver Backbone Hub',   lat: 39.74,  lon: -104.99 },
  { name: 'Silicon Valley Gateway',lat: 37.38,  lon: -121.97 },
  { name: 'Tokyo Subsea Landing',  lat: 35.68,  lon: 139.69 },
  { name: 'Hong Kong Gateway',     lat: 22.31,  lon: 114.17 },
  { name: 'Singapore Global Hub',  lat: 1.35,   lon: 103.82 },
  { name: 'Mumbai Gateway',        lat: 18.96,  lon: 72.82 },
  { name: 'Alexandria Subsea',     lat: 31.20,  lon: 29.92 },
  { name: 'Fortaleza Landing',     lat: -3.73,  lon: -38.52 },
  { name: 'São Paulo Hub',         lat: -23.55, lon: -46.63 },
  { name: 'Sydney Gateway',        lat: -33.87, lon: 151.21 }
];

const hubPositions = hubCoordinates.map(h => latLonToVec3(h.lat, h.lon, 3.518));

// Ground station nodes: Precision engineering landing points
export const nodeMat = new THREE.MeshBasicMaterial({
  color: 0x00CFFF,
  transparent: true,
  opacity: 0.22
});
const nodeGeom = new THREE.SphereGeometry(0.016, 10, 10);
hubPositions.forEach((pos) => {
  const node = new THREE.Mesh(nodeGeom, nodeMat);
  node.position.copy(pos);
  networkGroup.add(node);
});

// Authentic Global Fiber Route Paths
const fiberRoutes = [
  // 1. US Transcontinental Terrestrial Fiber Trunk (NY -> Chicago -> Denver -> Silicon Valley)
  [
    { lat: 40.71, lon: -74.00 },
    { lat: 41.88, lon: -87.63 },
    { lat: 39.74, lon: -104.99 },
    { lat: 37.38, lon: -121.97 }
  ],
  // 2. Texas Regional Interconnects
  [
    { lat: 41.88, lon: -87.63 },
    { lat: 31.00, lon: -100.00 }
  ],
  [
    { lat: 31.00, lon: -100.00 },
    { lat: 37.38, lon: -121.97 }
  ],
  // 3. European Core Terrestrial Backbone (London -> Frankfurt -> Marseille)
  [
    { lat: 51.50, lon: -0.12 },
    { lat: 50.11, lon: 8.68 },
    { lat: 43.30, lon: 5.37 }
  ],
  // 4. Euro-Asia Subsea Corridor (Marseille -> Alexandria -> Mumbai)
  [
    { lat: 43.30, lon: 5.37 },
    { lat: 36.00, lon: 18.00 },
    { lat: 31.20, lon: 29.92 },
    { lat: 22.00, lon: 40.00 },
    { lat: 14.00, lon: 58.00 },
    { lat: 18.96, lon: 72.82 }
  ],
  // 5. Asia-Pacific Subsea Backbone (Mumbai -> Singapore -> Hong Kong -> Tokyo)
  [
    { lat: 18.96, lon: 72.82 },
    { lat: 6.00,  lon: 88.00 },
    { lat: 1.35,  lon: 103.82 },
    { lat: 12.00, lon: 110.00 },
    { lat: 22.31, lon: 114.17 },
    { lat: 28.00, lon: 128.00 },
    { lat: 35.68, lon: 139.69 }
  ],
  // 6. Transpacific Subsea Cable (Silicon Valley -> Hawaii -> Tokyo)
  [
    { lat: 37.38, lon: -121.97 },
    { lat: 32.00, lon: -140.00 },
    { lat: 21.30, lon: -157.80 },
    { lat: 28.00, lon: 175.00 },
    { lat: 35.68, lon: 139.69 }
  ],
  // 7. Pan-American Subsea Trunk (Texas -> Miami -> Fortaleza -> São Paulo)
  [
    { lat: 31.00, lon: -100.00 },
    { lat: 25.76, lon: -80.19 },
    { lat: 15.00, lon: -65.00 },
    { lat: -3.73, lon: -38.52 },
    { lat: -23.55, lon: -46.63 }
  ]
];

export const lineMaterial = new THREE.LineBasicMaterial({
  color: 0x00A3C4,
  transparent: true,
  opacity: 0.14
});

fiberRoutes.forEach((route) => {
  const pts = route.map((w, idx) => {
    // Elevate slightly along mid-span for natural subsea/aerial curvature
    const spanFrac = idx / Math.max(1, route.length - 1);
    const arcLift = Math.sin(spanFrac * Math.PI) * 0.022;
    return latLonToVec3(w.lat, w.lon, 3.514 + arcLift);
  });
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.5);
  const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(36));
  const line = new THREE.Line(geo, lineMaterial);
  networkGroup.add(line);
});

earthMesh.add(networkGroup);

// Ambient Signal Beams placeholder export to keep external chapter contracts intact
export const beamsGroup = new THREE.Group();
export const beams = [];
earthMesh.add(beamsGroup);

// ── THE CARRIER SIGNAL (STORY PROTAGONIST — PHASE 2 REFINEMENT) ───────────────
// Multi-point CatmullRom curve across Atlantic with natural spatial variation:
// Europe Hub -> Biscay -> Mid-Atlantic -> US East Coast -> Appalachian -> Texas Hub

// ── THE CARRIER SIGNAL & SUBSEA ARMORED CABLE INFRASTRUCTURE (PHASE 11C) ─────
// Grounded in public/1. Submarine cable/, 4. Submarine cable on ocean floor/, 5. Cable landing station/
// Real-world transatlantic subsea route (MAREA/BRUSA corridor): Europe -> Biscay -> Mid-Atlantic -> US East Coast Landing -> Texas Hub

export const carrierSignalGroup = new THREE.Group();

// Subsea waypoints adhering tightly to seabed floor (Earth r = 3.50) & coastal landing
const waypoints = [
  latLonToVec3(50.0, 8.0, 3.518),     // 0: European Hub
  latLonToVec3(46.0, -12.0, 3.508),   // 1: Biscay shelf exit (ocean floor bedding)
  latLonToVec3(38.0, -32.0, 3.505),   // 2: Mid-Atlantic trench bedding
  latLonToVec3(36.85, -75.97, 3.515), // 3: US East Coast Beach Landing (Virginia Beach CLS)
  latLonToVec3(33.5, -86.0, 3.518),   // 4: Appalachian terrestrial conduit
  latLonToVec3(31.0, -100.0, 3.518)   // 5: Texas Destination Hub
];

export const carrierCurve = new THREE.CatmullRomCurve3(waypoints, false, 'centripetal', 0.5);

// ── Physical Subsea Armored Cable Assemblies (Non-Emissive PBR) ────────────────

// 1. Subsea Cable Structural Outer Polyethylene Protective Sheath
const subseaCableGeo = new THREE.TubeGeometry(carrierCurve, 180, 0.0035, 10, false);
const subseaCableMat = new THREE.MeshStandardMaterial({
  color: 0x181d24,
  roughness: 0.75,
  metalness: 0.10
});
const subseaCableMesh = new THREE.Mesh(subseaCableGeo, subseaCableMat);
carrierSignalGroup.add(subseaCableMesh);

// 2. Galvanized Steel Armor Wire Wraps (Deep-sea armor reinforcement)
const steelArmorMat = new THREE.MeshStandardMaterial({
  color: 0x4a5460,
  roughness: 0.35,
  metalness: 0.85
});
const armorPts = carrierCurve.getPoints(90);
for (let a = 15; a < 65; a += 4) {
  const pt = armorPts[a];
  const ringGeo = new THREE.TorusGeometry(0.0042, 0.0008, 8, 14);
  const ringMesh = new THREE.Mesh(ringGeo, steelArmorMat);
  ringMesh.position.copy(pt);
  ringMesh.lookAt(armorPts[a + 1] || pt);
  carrierSignalGroup.add(ringMesh);
}

// 3. Submersible Optical Repeaters (Pressure-resistant titanium repeater cylinders)
const repeaterMat = new THREE.MeshStandardMaterial({
  color: 0x6c7a8c,
  roughness: 0.28,
  metalness: 0.88
});
const repeaterIndices = [22, 48];
repeaterIndices.forEach((idx) => {
  const repPos = armorPts[idx];
  const nextPos = armorPts[idx + 1] || repPos;
  const repGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.025, 14);
  repGeo.rotateX(Math.PI / 2);
  const repMesh = new THREE.Mesh(repGeo, repeaterMat);
  repMesh.position.copy(repPos);
  repMesh.lookAt(nextPos);
  carrierSignalGroup.add(repMesh);
});

// 4. Beach Landing Station & Articulated Protection Conduit (Ref: 5. Cable landing station)
// Articulated cast-iron pipe with yellow polyurethane locking bands at US Landing
const landingPt = latLonToVec3(36.85, -75.97, 3.515);
const nextLandPt = latLonToVec3(36.5, -77.5, 3.516);

// Texture Loader for PBR Articulated Cast-Iron Landing Conduit (Ref: 5. Cable landing station / 6vvddEUa...)
const landingTextureLoader = new THREE.TextureLoader();
const castIronTexture = landingTextureLoader.load('/textures/cast_iron_landing_map.jpg');
castIronTexture.wrapS = THREE.RepeatWrapping;
castIronTexture.wrapT = THREE.RepeatWrapping;
castIronTexture.repeat.set(2, 2);

const castIronMat = new THREE.MeshStandardMaterial({
  color: 0x32363c,
  map: castIronTexture,
  roughnessMap: castIronTexture,
  roughness: 0.68,
  metalness: 0.55
});
const yellowBandMat = new THREE.MeshStandardMaterial({
  color: 0xe6a100,
  roughness: 0.35,
  metalness: 0.05
});
const bmhConcreteMat = new THREE.MeshStandardMaterial({
  color: 0xa0a29e,
  roughness: 0.85,
  metalness: 0.02
});

// Articulated landing pipe segments with ball-and-socket joints (Ref: Falcon Seeb Beach landing 6vvddEUa...)
for (let i = 0; i < 6; i++) {
  const frac = i / 5;
  const pos = landingPt.clone().lerp(nextLandPt, frac * 0.15);

  // Cast-Iron Main Pipe Segment
  const pipeGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.015, 14);
  pipeGeo.rotateX(Math.PI / 2);
  const pipeMesh = new THREE.Mesh(pipeGeo, castIronMat);
  pipeMesh.position.copy(pos);
  pipeMesh.lookAt(nextLandPt);
  carrierSignalGroup.add(pipeMesh);

  // Articulated Ball-and-Socket Interlocking Joint Flange
  const jointGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.004, 14);
  jointGeo.rotateX(Math.PI / 2);
  const jointMesh = new THREE.Mesh(jointGeo, castIronMat);
  jointMesh.position.copy(pos);
  jointMesh.lookAt(nextLandPt);
  carrierSignalGroup.add(jointMesh);

  // Vivid Yellow Polyurethane Locking Collar (Matching Seeb Beach landing reference 6vvddEUa...)
  const bandGeo = new THREE.TorusGeometry(0.0058, 0.0012, 8, 14);
  const bandMesh = new THREE.Mesh(bandGeo, yellowBandMat);
  bandMesh.position.copy(pos);
  bandMesh.lookAt(nextLandPt);
  carrierSignalGroup.add(bandMesh);
}

// Concrete Beach Manhole Vault (BMH)
const bmhMesh = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.012, 0.018), bmhConcreteMat);
bmhMesh.position.copy(landingPt.clone().lerp(nextLandPt, 0.16));
bmhMesh.lookAt(nextLandPt);
carrierSignalGroup.add(bmhMesh);

// ── Internal Photonic Signal Waveguide (Ruby Red #C41E3A / Electric Cyan #00CFFF) ──

const carrierTubeGeo = new THREE.TubeGeometry(carrierCurve, 180, 0.007, 8, false);

const carrierShaderMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  uniforms: {
    uProgress:   { value: 0.0 },
    uOpacity:    { value: 0.0 },
    uTime:       { value: 0.0 },
    uRubyColor:  { value: new THREE.Color(0x00CFFF) },
    uCyanColor:  { value: new THREE.Color(0x00CFFF) }
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewDir = normalize(-mvPosition.xyz);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float uProgress;
    uniform float uOpacity;
    uniform float uTime;
    uniform vec3 uRubyColor;
    uniform vec3 uCyanColor;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewDir;

    void main() {
      float t = vUv.x; // Normalized distance along curve (0.0 -> 1.0)
      float fresnel = 1.0 - max(0.0, dot(vViewDir, vNormal));

      // Ahead of traveling photon: subtle, faint carrier waveguide
      if (t > uProgress + 0.005) {
        float guideAlpha = 0.10 * uOpacity;
        vec3 guideCol = mix(uCyanColor, vec3(0.05, 0.12, 0.2), 0.5);
        gl_FragColor = vec4(guideCol, guideAlpha);
        return;
      }

      // Behind traveling photon: energized carrier signal
      float distFromHead = uProgress - t;
      // Head energy pulse (subtle burst right behind photon head)
      float headSurge = smoothstep(0.06, 0.0, distFromHead) * 0.45;

      // Pure Electric Cyan core & rim
      vec3 coreCol = uCyanColor;
      vec3 rimCol  = vec3(1.0);
      vec3 finalCol = mix(coreCol, rimCol, pow(fresnel, 2.2) * 0.5 + headSurge * 0.3);

      float alpha = (0.75 + 0.25 * (1.0 - fresnel) + headSurge) * uOpacity;
      gl_FragColor = vec4(finalCol, clamp(alpha, 0.0, 1.0));
    }
  `
});

const carrierTubeMesh = new THREE.Mesh(carrierTubeGeo, carrierShaderMat);
carrierSignalGroup.add(carrierTubeMesh);

// 2. Leading Traveling Photon (Electric Cyan #00CFFF Core)
const packetGeo = new THREE.SphereGeometry(0.038, 16, 16);
const packetMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  emissive: 0x00CFFF,
  emissiveIntensity: 3.6,
  roughness: 0.2,
  metalness: 0.6,
  transparent: true,
  opacity: 0.0
});
export const packetMesh = new THREE.Mesh(packetGeo, packetMat);

const haloGeo = new THREE.SphereGeometry(0.065, 16, 16);
const haloMat = new THREE.MeshBasicMaterial({
  color: 0x00CFFF,
  transparent: true,
  opacity: 0.0,
  depthWrite: false
});
const packetHaloMesh = new THREE.Mesh(haloGeo, haloMat);
packetMesh.add(packetHaloMesh);

carrierSignalGroup.add(packetMesh);

// 3. Deterministic Trailing Particle Field
// 24 glowing sparks strictly trailing behind photon head along curve
const trailCount = 24;
const trailPositions = new Float32Array(trailCount * 3);
const trailColors = new Float32Array(trailCount * 3);

const trailGeo = new THREE.BufferGeometry();
trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
trailGeo.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));

const trailMat = new THREE.PointsMaterial({
  size: 0.032,
  vertexColors: true,
  transparent: true,
  opacity: 0.0,
  depthWrite: false,
  blending: THREE.AdditiveBlending
});

export const trailPointsMesh = new THREE.Points(trailGeo, trailMat);
carrierSignalGroup.add(trailPointsMesh);

// 4. Texas -> Infrastructure Transition Feeder
// Physical continuation of protagonist signal: leaves Texas hub and arches forward/downward toward infrastructure scale
const texasLocalPos = latLonToVec3(31.0, -100.0, 3.58);
const infraExitPos  = latLonToVec3(29.0, -104.0, 3.95); // Ascending/forward trajectory toward infrastructure horizon
const infraMidPos   = texasLocalPos.clone().lerp(infraExitPos, 0.5).add(new THREE.Vector3(0.08, 0.12, 0.15));

const infraCurve = new THREE.QuadraticBezierCurve3(texasLocalPos, infraMidPos, infraExitPos);
const infraGeo   = new THREE.TubeGeometry(infraCurve, 48, 0.009, 8, false);

const infraMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  uniforms: {
    uProgress:  { value: 0.0 },
    uOpacity:   { value: 0.0 },
    uRubyColor: { value: new THREE.Color(0xC41E3A) },
    uCyanColor: { value: new THREE.Color(0x00CFFF) }
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewDir = normalize(-mvPosition.xyz);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float uProgress;
    uniform float uOpacity;
    uniform vec3 uRubyColor;
    uniform vec3 uCyanColor;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewDir;

    void main() {
      float t = vUv.x;
      float fresnel = 1.0 - max(0.0, dot(vViewDir, vNormal));

      if (t > uProgress + 0.01) {
        gl_FragColor = vec4(uCyanColor, 0.06 * uOpacity);
        return;
      }
      vec3 col = mix(uRubyColor, uCyanColor, pow(fresnel, 2.0) * 0.45);
      float alpha = (0.7 + 0.3 * (1.0 - fresnel)) * uOpacity;
      gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
    }
  `
});

const infraTubeMesh = new THREE.Mesh(infraGeo, infraMat);
carrierSignalGroup.add(infraTubeMesh);

// Infrastructure photon head (travels along infraCurve as signal leaves Texas)
const infraPacketGeo = new THREE.SphereGeometry(0.034, 16, 16);
const infraPacketMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  emissive: 0xC41E3A,
  emissiveIntensity: 3.5,
  transparent: true,
  opacity: 0.0
});
const infraPacketMesh = new THREE.Mesh(infraPacketGeo, infraPacketMat);
carrierSignalGroup.add(infraPacketMesh);

earthMesh.add(carrierSignalGroup);

// ── Update Function (Called every frame) ──────────────────────────────────────

export function updateChapter0(scrollFloat, time) {
  // 1. Deterministic Earth Rotation Choreography:
  // At scrollFloat = 0: Deep space perspective showing Atlantic, Europe, and Western Hemisphere.
  // As scrollFloat increases (0.0 → 0.95): Earth rotates into Texas center-facing camera (+0.18).
  // Idle wobble dampens to 0 as scroll begins, guaranteeing 100% deterministic forward & backward states.
  const alignProgress = clamp(scrollFloat / 0.85, 0, 1);
  const smoothAlign = alignProgress * alignProgress * (3 - 2 * alignProgress);
  const idleWobble = (1.0 - alignProgress) * Math.sin(time * 0.2) * 0.05;
  const startAngle = -0.75 + idleWobble;
  const targetAngle = 0.18; // Center alignment for Texas
  earthMesh.rotation.y = lerp(startAngle, targetAngle, smoothAlign);

  // 2. Global Network Activation & Transition Fade:
  const networkProgress = (scrollFloat <= 1.70)
    ? clamp(map(scrollFloat, 0.15, 0.45, 0, 1), 0, 1)
    : clamp(map(scrollFloat, 5.82, 5.95, 0, 1), 0, 1);

  const networkFadeOut = (scrollFloat < 1.70)
    ? 1.0
    : (scrollFloat <= 2.10)
    ? clamp(map(scrollFloat, 1.70, 2.10, 1, 0), 0, 1)
    : (scrollFloat < 5.82)
    ? 0.0
    : clamp(map(scrollFloat, 5.82, 5.95, 0, 1), 0, 1);

  lineMaterial.opacity = lerp(0.06, 0.52, networkProgress) * networkFadeOut;
  nodeMat.opacity      = lerp(0.12, 0.85, networkProgress) * networkFadeOut;

  const networkPulse = 0.88 + 0.12 * Math.sin(time * 2.0);
  lineMaterial.opacity *= networkPulse;

  // 3. Ambient Signal Beams:
  const beamsActivation = (scrollFloat < 1.70)
    ? clamp(map(scrollFloat, 0.2, 0.6, 0, 1), 0, 1) * networkFadeOut
    : clamp(map(scrollFloat, 5.82, 5.95, 0, 1), 0, 1);

  beams.forEach((b) => {
    const pulse = 0.15 + 0.45 * Math.abs(Math.sin(time * b.pulseSpeed + b.phase));
    b.material.opacity = pulse * beamsActivation * 0.45;
  });

  // 4. "ONE SIGNAL" Carrier Progression:
  // 0.20 -> 0.42: Signal emerges from network, becomes dominant protagonist
  // 0.40 -> 0.95: Photon travels smoothly across Atlantic to Texas
  // 0.95 -> 1.45: Signal settles at Texas destination hub
  // 1.45 -> 1.95: Signal leaves Texas toward infrastructure transition
  const carrierFadeIn = clamp(map(scrollFloat, 0.22, 0.42, 0, 1), 0, 1);
  const carrierFadeOut = clamp(map(scrollFloat, 1.85, 2.10, 1, 0), 0, 1);
  const carrierOverallOpacity = carrierFadeIn * carrierFadeOut;

  // Signal progress along transatlantic curve (0.0 to 1.0 strictly deterministic)
  const signalTravelProgress = clamp(map(scrollFloat, 0.38, 0.95, 0, 1), 0, 1);

  carrierShaderMat.uniforms.uProgress.value = signalTravelProgress;
  carrierShaderMat.uniforms.uOpacity.value  = carrierOverallOpacity;
  carrierShaderMat.uniforms.uTime.value     = time;

  // Position photon head along CatmullRom curve
  const currentSignalPos = carrierCurve.getPoint(signalTravelProgress);
  packetMesh.position.copy(currentSignalPos);

  // Photon head opacity: visible while traveling, gently hands off at Texas
  const packetVisibility = (signalTravelProgress > 0.01 && scrollFloat < 1.48) ? 1.0 : 0.0;
  packetMesh.material.opacity     = carrierOverallOpacity * packetVisibility;
  packetHaloMesh.material.opacity = carrierOverallOpacity * packetVisibility * 0.45;

  // Restrained ruby pulse on photon head
  packetMesh.material.emissiveIntensity = 3.2 + 1.2 * Math.sin(time * 4.0);
  packetHaloMesh.scale.setScalar(1.0 + 0.15 * Math.sin(time * 3.5));

  // Update Trailing Particle Field (strictly derived from signalTravelProgress — no random drifting)
  const posArr = trailGeo.attributes.position.array;
  const colArr = trailGeo.attributes.color.array;

  if (signalTravelProgress > 0.02 && scrollFloat < 1.45) {
    trailMat.opacity = carrierOverallOpacity * 0.75;
    for (let i = 0; i < trailCount; i++) {
      const lag = (i + 1) * 0.007;
      const sampleT = clamp(signalTravelProgress - lag, 0, 1);
      const pt = carrierCurve.getPoint(sampleT);

      posArr[i * 3]     = pt.x;
      posArr[i * 3 + 1] = pt.y;
      posArr[i * 3 + 2] = pt.z;

      // Restrained hero color: Electric Cyan #00CFFF
      const fadeRatio = i / trailCount;
      colArr[i * 3]     = lerp(0.0, 0.0,    fadeRatio);
      colArr[i * 3 + 1] = lerp(0.812, 0.5,  fadeRatio);
      colArr[i * 3 + 2] = lerp(1.0, 0.8,    fadeRatio);
    }
    trailGeo.attributes.position.needsUpdate = true;
    trailGeo.attributes.color.needsUpdate    = true;
  } else {
    trailMat.opacity = 0.0;
  }

  // 5. TEXAS -> INFRASTRUCTURE TRANSITION (sf 1.45 -> 1.95):
  // Protagonist signal leaves Texas and travels along infraCurve
  const infraTravelProgress = clamp(map(scrollFloat, 1.45, 1.95, 0, 1), 0, 1);
  const infraFade = clamp(map(scrollFloat, 1.42, 1.60, 0, 1), 0, 1) *
                    clamp(map(scrollFloat, 1.95, 2.30, 1, 0), 0, 1);

  infraMat.uniforms.uProgress.value = infraTravelProgress;
  infraMat.uniforms.uOpacity.value  = infraFade;

  if (infraFade > 0.01 && infraTravelProgress > 0.01) {
    const pt = infraCurve.getPoint(infraTravelProgress);
    infraPacketMesh.position.copy(pt);
    infraPacketMat.opacity = infraFade;
    infraPacketMat.emissiveIntensity = 3.0 + 1.5 * Math.sin(time * 4.0);
  } else {
    infraPacketMat.opacity = 0.0;
  }

  // 6. Atmosphere Glow Intensity:
  const atmoFade = (scrollFloat < 1.70)
    ? 1.0
    : (scrollFloat <= 2.10)
    ? clamp(map(scrollFloat, 1.70, 2.10, 1.0, 0.35), 0.35, 1.0)
    : (scrollFloat < 5.82)
    ? 0.35
    : clamp(map(scrollFloat, 5.82, 6.00, 0.35, 1.25), 0.35, 1.25);
  atmosphereMat.uniforms.uOpacity.value = 0.70 * atmoFade;

  // 7. Chapter 0 Text Overlay:
  const ch0 = document.getElementById('chapter0-text');
  if (ch0) {
    const op = clamp(1.0 - (scrollFloat / 0.50), 0, 1);
    ch0.style.opacity = String(op);
    ch0.style.display = op > 0.01 ? 'block' : 'none';
    ch0.style.pointerEvents = op > 0.01 ? 'auto' : 'none';
  }
}
