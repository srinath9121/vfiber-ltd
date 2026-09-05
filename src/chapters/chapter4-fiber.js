// chapter4-fiber.js — Phase 11: Real Loose-Tube Telecommunications Fiber Infrastructure
// Grounded strictly in public/2. Actual fiber bundle loose-tube construction/ (YZhsiXd5...jpg)
// and public/3. Individual optical fiber — extreme macro/ (JJWN9rWh...jpg).
//
// PHYSICAL LAYER HIERARCHY:
//   1. Outer Black HDPE Protective Jacket (Thick PE sheath, stepped cutaway reveal)
//   2. Yellow Aramid / Kevlar Tensile Yarn Layer (Ring nestled beneath jacket, #D8B428)
//   3. Central FRP (Fiber Reinforced Polymer) Strength Member (Solid bone-white rod, #F2F2EC)
//   4. 6 Helical PBT Loose Buffer Tubes in TIA-598-C colors:
//      [0: Blue, 1: Orange, 2: Green, 3: Brown, 4: Violet, 5: White]
//   5. Primary-Coated 250µm Fiber Strands inside Thixotropic Gel
//   6. Macro Fused Silica Glass Cladding (125µm scale, transparent dielectric, IOR 1.444)
//   7. Concentric Optical Core (9µm scale) carrying localized Ruby (#C41E3A) / Cyan (#00CFFF) pulse.

import * as THREE from 'three';
import { clamp, map } from '../utils/math.js';
import { ImageTransformShader } from '../shaders/shaders.js';

export const tunnel = new THREE.Group();

// ── Dedicated Inspection Lighting for Cable Geometry ──────────────────────────
const cableLightGroup = new THREE.Group();

const cableKeyLight = new THREE.DirectionalLight(0xfff8ee, 3.2);
cableKeyLight.position.set(5.0, 6.0, 8.0);
cableLightGroup.add(cableKeyLight);

const cableFillLight = new THREE.DirectionalLight(0x8cb8e6, 1.8);
cableFillLight.position.set(-5.0, -2.0, 4.0);
cableLightGroup.add(cableFillLight);

const cableBackLight = new THREE.DirectionalLight(0x00cfff, 1.4);
cableBackLight.position.set(2.0, 4.0, -12.0);
cableLightGroup.add(cableBackLight);

tunnel.add(cableLightGroup);

// ── 1. Materials (100% Grounded in References — Physical PBR, Zero Emission on Cable) ──

// Outer HDPE Cable Jacket (Matte, carbon-black extruded PE with subtle sheen)
const jacketMat = new THREE.MeshStandardMaterial({
  color: 0x181a1d,
  roughness: 0.68,
  metalness: 0.05,
  side: THREE.DoubleSide
});

// Aramid / Kevlar Yarn Ring (Spun tensile synthetic filaments, fibrous gold)
const aramidMat = new THREE.MeshStandardMaterial({
  color: 0xd4ad24,
  roughness: 0.85,
  metalness: 0.02,
  side: THREE.DoubleSide
});

// Central FRP Strength Member (Solid bone-white pultruded glass-resin rod)
const frpMat = new THREE.MeshStandardMaterial({
  color: 0xf5f5ee,
  roughness: 0.26,
  metalness: 0.04
});

// Standard TIA-598-C PBT Buffer Tube Molded Polymer Materials
const tubeColors = [
  0x0058a8, // 1: Blue (Hero tube)
  0xe65c00, // 2: Orange
  0x008a30, // 3: Green
  0x6e4020, // 4: Brown
  0x722880, // 5: Violet
  0xdedede  // 6: White
];

const tubeMaterials = tubeColors.map((col) => new THREE.MeshPhysicalMaterial({
  color: col,
  roughness: 0.30,
  metalness: 0.03,
  clearcoat: 0.45,
  clearcoatRoughness: 0.15,
  side: THREE.DoubleSide
}));

// Water-Blocking Thixotropic Gel (Translucent clear compound inside tubes)
const gelMat = new THREE.MeshStandardMaterial({
  color: 0xdff0f8,
  roughness: 0.12,
  metalness: 0.02,
  transparent: true,
  opacity: 0.45
});

// Primary Acrylate Fiber Coating (250µm standard telecom coating)
const acrylateMat = new THREE.MeshStandardMaterial({
  color: 0x0066cc,
  roughness: 0.28,
  metalness: 0.08,
  transparent: true,
  opacity: 1.0
});

// Bare Fused Silica Glass Cladding (125µm extreme macro dielectric)
const glassCladdingMat = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  transmission: 0.94,
  opacity: 1.0,
  transparent: true,
  roughness: 0.04,
  ior: 1.45,
  reflectivity: 0.5
});

// Precision Ceramic Zirconia Ferrule (Ivory-white lapped endface)
const ferruleMat = new THREE.MeshStandardMaterial({
  color: 0xebedf0,
  roughness: 0.14,
  metalness: 0.04
});

// ── 2. Glass Cladding & Core Shaders (Macro Fused Silica Waveguide & Photonic Core) ──

// Outer Cladding Tube Shader (Fused silica glass wall with dielectric Fresnel glints)
export const claddingWallShaderMat = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  transparent: true,
  depthWrite: false,
  uniforms: {
    uTime:     { value: 0 },
    uProgress: { value: 0 },
    uOpacity:  { value: 0 }
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
    uniform float uTime;
    uniform float uProgress;
    uniform float uOpacity;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vec3 viewDir = normalize(vViewPosition);
      vec3 norm = normalize(vNormal);
      float fresnel = pow(1.0 - abs(dot(viewDir, norm)), 2.8);
      
      // Fused silica dielectric glass wall (IOR 1.444)
      vec3 glassBase = vec3(0.005, 0.012, 0.024);
      vec3 rimSheen = vec3(0.12, 0.32, 0.58) * fresnel * 0.9;
      
      // Specular internal bounce from traveling ruby laser core
      float bounce = pow(fresnel, 3.5) * 0.6;
      vec3 laserBounce = vec3(0.77, 0.12, 0.23) * bounce;
      
      vec3 finalCol = glassBase + rimSheen + laserBounce;
      gl_FragColor = vec4(finalCol, uOpacity * (0.25 + 0.55 * fresnel));
    }
  `
});

// Inner Optical Core Shader (Traveling Ruby #C41E3A core with Electric Cyan #00CFFF leading edge)
export const coreWaveShaderMat = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms: {
    uTime:     { value: 0 },
    uProgress: { value: 0 },
    uOpacity:  { value: 0 },
    uRubyColor:{ value: new THREE.Color(0xC41E3A) },
    uCyanColor:{ value: new THREE.Color(0x00CFFF) }
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
    uniform float uTime;
    uniform float uProgress;
    uniform float uOpacity;
    uniform vec3 uRubyColor;
    uniform vec3 uCyanColor;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      float signalSpeed = 5.0 + uProgress * 15.0;
      float pulseZ = fract(vUv.y * 6.0 - uTime * signalSpeed);
      
      // Tight longitudinal Gaussian energy envelope
      float pulseProfile = exp(-pow((pulseZ - 0.5) * 6.5, 2.0));
      
      // Ruby Red core with Electric Cyan leading edge
      float cyanLead = smoothstep(0.47, 0.56, pulseZ) * pulseProfile;
      float rubyCenter = smoothstep(0.56, 0.36, pulseZ) * pulseProfile;
      
      vec3 photonPulse = uRubyColor * rubyCenter * 4.2 + uCyanColor * cyanLead * 3.2;
      
      // Core center density & edge falloff
      vec3 viewDir = normalize(vViewPosition);
      vec3 norm = normalize(vNormal);
      float coreDensity = 0.55 + 0.45 * pow(abs(dot(viewDir, norm)), 0.8);
      
      gl_FragColor = vec4(photonPulse * coreDensity, uOpacity * (0.4 + 0.6 * pulseProfile));
    }
  `
});

// Alias for backwards-compatibility with main.js imports
export const fiberMaterial = coreWaveShaderMat;

// ── 3. Geometry Construction: Authentic Manufactured Loose-Tube Cable Assembly ─
// Coordinates:
// The Camera flies along the Hero Optical Fiber axis at (0, 0, z) within `tunnel`.
// The FRP rod is centered at (0, -frpOffset, z) so the hero tube orbits right on (0, 0, z)!
// This allows the camera to view the full cutaway externally, then smoothly enter the hero fiber!

const cableAssembly = new THREE.Group();
tunnel.add(cableAssembly);

const tubeRadius = 0.28;        // Buffer tube outer radius
const tubeOrbitRadius = 0.68;   // Orbit radius from FRP rod center
const frpRadius = 0.34;         // FRP central rod radius
const aramidInnerRadius = 1.02; // Aramid ring radius
const aramidOuterRadius = 1.10;
const jacketInnerRadius = 1.10;
const jacketOuterRadius = 1.36; // HDPE jacket outer radius

// The FRP center is offset downwards so Hero Tube 0 (Blue) is dead-center at (0, 0):
const frpCenterY = -tubeOrbitRadius;
const frpCenterX = 0.0;

// [A] Central FRP Strength Member (Solid bone-white rod)
// Extends from z = -50.0 to z = +0.8
const frpLength = 50.8;
const frpGeo = new THREE.CylinderGeometry(frpRadius, frpRadius, frpLength, 24, 1, false);
const frpMesh = new THREE.Mesh(frpGeo, frpMat);
frpMesh.rotation.x = Math.PI / 2;
frpMesh.position.set(frpCenterX, frpCenterY, -24.6); // front face at z = +0.8
cableAssembly.add(frpMesh);

// End cap chamfer for FRP rod at z = +0.8
const frpCapGeo = new THREE.CylinderGeometry(frpRadius * 0.95, frpRadius, 0.08, 24, 1, false);
const frpCapMesh = new THREE.Mesh(frpCapGeo, frpMat);
frpCapMesh.rotation.x = Math.PI / 2;
frpCapMesh.position.set(frpCenterX, frpCenterY, 0.8);
cableAssembly.add(frpCapMesh);

// [B] 6 Helical PBT Loose Buffer Tubes
// Tube 0 (Blue) is at angle = +PI/2 from FRP center, which places it at (0, 0) in X/Y!
const bufferTubesGroup = new THREE.Group();

for (let i = 0; i < 6; i++) {
  // Tube 0 is at PI/2, placing it at frpCenterY + tubeOrbitRadius = 0.0!
  const baseAngle = Math.PI / 2 + (i * Math.PI * 2) / 6;
  const isHeroTube = (i === 0);

  // Non-hero tubes end at z = +0.6; Hero tube extends forward to z = +2.6
  const endZ = isHeroTube ? 2.6 : 0.6;
  const startZ = -50.0;
  const tubeLength = endZ - startZ;
  const segments = isHeroTube ? 72 : 48;
  const twistRate = 0.032;

  const points = [];
  for (let s = 0; s <= segments; s++) {
    const t = s / segments;
    const z = startZ + t * tubeLength;
    const twist = z * twistRate * (isHeroTube && z > 0.0 ? Math.max(0, (1.2 - z) / 2.0) : 1.0);
    const theta = baseAngle + twist;
    
    // For hero tube past z = 0.0, gently straighten towards (0, 0)
    let tx = frpCenterX + Math.cos(theta) * tubeOrbitRadius;
    let ty = frpCenterY + Math.sin(theta) * tubeOrbitRadius;
    if (isHeroTube && z > 0.0) {
      const straightT = Math.min(1.0, z / 2.2);
      tx = tx * (1.0 - straightT);
      ty = ty * (1.0 - straightT);
    }
    points.push(new THREE.Vector3(tx, ty, z));
  }

  const curve = new THREE.CatmullRomCurve3(points);
  // Outer colored tube wall
  const tubeGeo = new THREE.TubeGeometry(curve, segments, tubeRadius, 16, false);
  const tubeMesh = new THREE.Mesh(tubeGeo, tubeMaterials[i]);
  bufferTubesGroup.add(tubeMesh);

  // Clear gel core inside each tube
  const gelGeo = new THREE.TubeGeometry(curve, Math.floor(segments * 0.7), tubeRadius * 0.80, 12, false);
  const gelMesh = new THREE.Mesh(gelGeo, gelMat);
  bufferTubesGroup.add(gelMesh);

  // Individual miniature 250µm fibers inside each tube (visible at cut end face)
  for (let f = 0; f < 4; f++) {
    const fAngle = (f / 4) * Math.PI * 2;
    const fOffX = Math.cos(fAngle) * (tubeRadius * 0.45);
    const fOffY = Math.sin(fAngle) * (tubeRadius * 0.45);
    const fPoints = points.slice(-8).map(p => new THREE.Vector3(p.x + fOffX, p.y + fOffY, p.z));
    const fCurve = new THREE.CatmullRomCurve3(fPoints);
    const fGeo = new THREE.TubeGeometry(fCurve, 8, 0.024, 6, false);
    const fMat = tubeMaterials[(i + f) % 6];
    bufferTubesGroup.add(new THREE.Mesh(fGeo, fMat));
  }
}
cableAssembly.add(bufferTubesGroup);

// [C] Hero Optical Fiber Breakout from Blue Tube (z = +2.6 to z = +4.5)
// Primary blue acrylate coating (250µm scale)
const breakoutPoints = [
  new THREE.Vector3(0.0, 0.0, 2.6),
  new THREE.Vector3(0.0, 0.0, 3.5),
  new THREE.Vector3(0.0, 0.0, 4.5)
];
const breakoutCurve = new THREE.CatmullRomCurve3(breakoutPoints);
const breakoutGeo = new THREE.TubeGeometry(breakoutCurve, 16, 0.052, 12, false);
const breakoutMesh = new THREE.Mesh(breakoutGeo, acrylateMat);
cableAssembly.add(breakoutMesh);

// Stripped bare fused silica glass section (125µm scale, z = +4.5 to z = +6.5)
const glassPoints = [
  new THREE.Vector3(0.0, 0.0, 4.5),
  new THREE.Vector3(0.0, 0.0, 6.5)
];
const glassCurve = new THREE.CatmullRomCurve3(glassPoints);
const glassGeo = new THREE.TubeGeometry(glassCurve, 16, 0.026, 14, false);
const glassMesh = new THREE.Mesh(glassGeo, glassCladdingMat);
cableAssembly.add(glassMesh);

// Concentric 9µm optical core inside bare glass (emissive laser signal)
const coreWireGeo = new THREE.TubeGeometry(glassCurve, 16, 0.009, 8, false);
const coreWireMat = new THREE.MeshBasicMaterial({
  color: 0xff2244,
  transparent: true,
  opacity: 1.0
});
const coreWireMesh = new THREE.Mesh(coreWireGeo, coreWireMat);
cableAssembly.add(coreWireMesh);

// [D] Aramid / Kevlar Tensile Yarn Layer (Ring nestled between buffer tubes and jacket)
// Stepped reveal: extends from z = -50.0 to z = -0.5
const aramidLength = 49.5;
const aramidGeo = new THREE.CylinderGeometry(aramidOuterRadius, aramidOuterRadius, aramidLength, 32, 1, true);
const aramidMesh = new THREE.Mesh(aramidGeo, aramidMat);
aramidMesh.rotation.x = Math.PI / 2;
aramidMesh.position.set(frpCenterX, frpCenterY, -25.25);
cableAssembly.add(aramidMesh);

// Exposed Kevlar fibrous tuft collar at z = -0.5
const aramidTuftGeo = new THREE.TorusGeometry(aramidOuterRadius - 0.04, 0.07, 10, 32);
const aramidTuftMesh = new THREE.Mesh(aramidTuftGeo, aramidMat);
aramidTuftMesh.position.set(frpCenterX, frpCenterY, -0.5);
cableAssembly.add(aramidTuftMesh);

// [E] Outer Black HDPE Protective Jacket (Stepped cutaway reveal)
// Extends from z = -50.0 to z = -1.8
const jacketLength = 48.2;
const jacketGeo = new THREE.CylinderGeometry(jacketOuterRadius, jacketOuterRadius, jacketLength, 32, 1, false);
const jacketMesh = new THREE.Mesh(jacketGeo, jacketMat);
jacketMesh.rotation.x = Math.PI / 2;
jacketMesh.position.set(frpCenterX, frpCenterY, -25.9); // ends at z = -1.8
cableAssembly.add(jacketMesh);

// Beveled cut rim showing 1.5mm HDPE jacket wall thickness at z = -1.8
const jacketRimGeo = new THREE.TorusGeometry(jacketOuterRadius - 0.08, 0.08, 12, 32);
const jacketRimMesh = new THREE.Mesh(jacketRimGeo, jacketMat);
jacketRimMesh.position.set(frpCenterX, frpCenterY, -1.8);
cableAssembly.add(jacketRimMesh);

// [F] Extreme Macro Fused Silica Cladding & Internal Photonic Core (SF 4.80 → 5.30)
// Outer Fused Silica Cladding Wall (125µm scale glass boundary)
const claddingWallMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(1.65, 1.65, 52, 32, 1, true),
  claddingWallShaderMat
);
claddingWallMesh.rotation.x = Math.PI / 2;
claddingWallMesh.position.set(0.0, 0.0, -21.0);
tunnel.add(claddingWallMesh);

// Inner Optical Waveguide Core (9µm scale concentrated traveling photonic pulse)
const macroCoreMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(0.32, 0.32, 52, 24, 1, true),
  coreWaveShaderMat
);
macroCoreMesh.rotation.x = Math.PI / 2;
macroCoreMesh.position.set(0.0, 0.0, -21.0);
tunnel.add(macroCoreMesh);

// Ceramic Zirconia Ferrule Bezel at aperture (z = 4.8)
const ferruleBezel = new THREE.Mesh(
  new THREE.CylinderGeometry(1.72, 1.72, 0.5, 32, 1, true),
  ferruleMat
);
ferruleBezel.rotation.x = Math.PI / 2;
ferruleBezel.position.set(0.0, 0.0, 4.8);
tunnel.add(ferruleBezel);

// ── Macro Loose-Tube Photographic Transformation Plane ─────────────────────────
const fiberTexLoader = new THREE.TextureLoader();
const fiberTexture = fiberTexLoader.load('/references/2. Actual fiber bundle  loose-tube construction/YZhsiXd5_1000198363.jpg');
fiberTexture.colorSpace = THREE.SRGBColorSpace;

const fiberImageMat = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  transparent: true,
  depthWrite: false,
  uniforms: {
    uTexture:    { value: fiberTexture },
    uProgress:   { value: 0.0 },
    uOpacity:    { value: 0.0 },
    uTime:       { value: 0.0 },
    uDistortion: { value: 0.08 }
  },
  vertexShader: ImageTransformShader.vertexShader,
  fragmentShader: ImageTransformShader.fragmentShader
});

// Cylindrical cutaway geometry conforming to the HDPE jacket outer radius (1.35m)
const fiberDepthGeo = new THREE.CylinderGeometry(1.35, 1.35, 4.6, 32, 12, true, -Math.PI * 0.45, Math.PI * 0.90);
const fiberDepthPlane = new THREE.Mesh(
  fiberDepthGeo,
  fiberImageMat
);
fiberDepthPlane.rotation.x = Math.PI / 2;
fiberDepthPlane.position.set(frpCenterX, frpCenterY, 3.8);
cableAssembly.add(fiberDepthPlane);

// Position entire fiber infrastructure group along optical launch axis
tunnel.position.set(0.40, 10.42, 0.0);
tunnel.visible = false;

// ── 4. Lifecycle & Scroll Update (SF 3.50 → 5.30) ─────────────────────────────

export function updateChapter4(scrollFloat, camera, signalParticles) {
  const time = performance.now() * 0.001;
  claddingWallShaderMat.uniforms.uTime.value = time;
  coreWaveShaderMat.uniforms.uTime.value = time;

  if (scrollFloat >= 3.48 && scrollFloat <= 5.30) {
    tunnel.visible = true;

    // Update Macro Fiber Image Shader
    fiberImageMat.uniforms.uTime.value = time;
    fiberImageMat.uniforms.uProgress.value = clamp(map(scrollFloat, 3.50, 4.20, 0, 1), 0, 1);
    const fiberImgFadeOut = clamp(map(scrollFloat, 4.10, 4.35, 1, 0), 0, 1);
    fiberImageMat.uniforms.uOpacity.value = clamp(map(scrollFloat, 3.50, 3.75, 0, 1), 0, 1) * fiberImgFadeOut * 0.55;

    // Transition envelope
    const fadeIn  = clamp(map(scrollFloat, 3.48, 3.70, 0, 1), 0, 1);
    const fadeOut = clamp(map(scrollFloat, 5.15, 5.30, 1, 0), 0, 1);
    const masterOpacity = fadeIn * fadeOut;

    // Mechanical outer assembly visibility (Jacket, buffer tubes, aramid, stripped fiber)
    // Full visibility at 3.50 -> 4.65 (SF 3.6 cutaway, SF 4.2 loose tubes, SF 4.6 bare fiber)
    const extFadeOut = clamp(map(scrollFloat, 4.68, 4.86, 1, 0.0), 0.0, 1.0);
    const extOpacity = masterOpacity * extFadeOut;

    // CRITICAL FIX: Hide the outer cable assembly (opaque buffer tubes, FRP rod, jacket)
    // as camera enters the macro core aperture so near-plane geometry clipping is eliminated
    cableAssembly.visible = (scrollFloat < 4.86);

    // Macro internal core & cladding shader opacity (activates when entering waveguide at SF 4.80 -> 5.25)
    const coreIn = clamp(map(scrollFloat, 4.75, 4.95, 0, 1), 0, 1);
    claddingWallShaderMat.uniforms.uOpacity.value = masterOpacity * coreIn * 0.92;
    coreWaveShaderMat.uniforms.uOpacity.value = masterOpacity * coreIn * 1.0;
    coreWaveShaderMat.uniforms.uProgress.value = clamp(map(scrollFloat, 4.85, 5.25, 0, 1), 0, 1);

    jacketMat.opacity = extOpacity;
    aramidMat.opacity = extOpacity;
    frpMat.opacity = extOpacity;
    tubeMaterials.forEach((m) => { m.opacity = extOpacity; });
    gelMat.opacity = extOpacity * 0.45;
    acrylateMat.opacity = extOpacity;
    coreWireMat.opacity = extOpacity;
    ferruleMat.opacity = masterOpacity;

    // Core laser wire brightness pulse (strictly Ruby Red #C41E3A with subtle Electric Cyan #00CFFF highlight)
    const pulseMix = 0.5 + 0.5 * Math.sin(time * 6.0);
    coreWireMat.color.set(0xc41e3a).lerp(new THREE.Color(0x00cfff), pulseMix * 0.20);

    // Signal particles: strictly synchronized to traveling photonic wavefront
    if (signalParticles) {
      if (scrollFloat >= 3.55 && scrollFloat <= 4.65) {
        signalParticles.visible = true;
        const pProgress = clamp(map(scrollFloat, 3.55, 4.50, 0, 1), 0, 1);
        signalParticles.material.opacity = masterOpacity * (0.35 + 0.65 * pProgress);
      } else {
        signalParticles.visible = false;
      }
    }
  } else {
    tunnel.visible = false;
    cableAssembly.visible = false;
  }

  // Subordinate Engineering HUD overlay (#chapter4-text) — executed unconditionally on every frame
  const t4 = document.getElementById('chapter4-text');
  if (t4) {
    if (scrollFloat >= 3.65 && scrollFloat <= 4.45) {
      const textIn  = clamp(map(scrollFloat, 3.65, 3.85, 0, 1), 0, 1);
      const textOut = clamp(map(scrollFloat, 4.30, 4.45, 1, 0), 0, 1);
      const op = textIn * textOut;
      t4.style.opacity = String(op);
      t4.style.display = op > 0.01 ? 'block' : 'none';
      t4.style.pointerEvents = op > 0.1 ? 'auto' : 'none';
    } else {
      t4.style.opacity = '0';
      t4.style.display = 'none';
      t4.style.pointerEvents = 'none';
    }
  }
}
