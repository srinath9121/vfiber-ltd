// shaders.js — Reusable GLSL Shaders & Cinematic Transition Systems
// Part of Phase 07: GLSL Shader & Cinematic Transition System for VF Technologies

import * as THREE from 'three';

// ── 1. Planetary Rayleigh Atmosphere Shader ────────────────────────────────────
// Creates a thin physical Rayleigh scattering atmospheric limb tight on planetary boundary
export const RayleighAtmosphereShader = {
  uniforms: {
    uSunDirection: { value: new THREE.Vector3(0.8, 0.4, 1.0).normalize() },
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
      vec3 norm = normalize(vNormal);
      float fresnel = 1.0 - max(0.0, dot(viewDir, norm));
      float sunDot = max(0.0, dot(norm, uSunDirection));

      // Rayleigh scattering intensity on lit atmosphere limb
      float scattering = pow(fresnel, 3.8) * sunDot * 1.8;
      vec3 atmosphericColor = mix(vec3(0.0, 0.45, 0.95), vec3(0.0, 0.81, 1.0), fresnel);

      gl_FragColor = vec4(atmosphericColor * scattering, uOpacity * scattering);
    }
  `
};

// ── 2. Concentric Optical Core Photonic Wave Shader ───────────────────────────
// Photonic pulse traveling strictly inside 9µm silica core (#C41E3A Ruby Red / #00CFFF Electric Cyan)
export const OpticalCoreWaveShader = {
  uniforms: {
    uTime:      { value: 0.0 },
    uProgress:  { value: 0.0 },
    uOpacity:   { value: 1.0 },
    uRubyColor: { value: new THREE.Color(0xC41E3A) },
    uCyanColor: { value: new THREE.Color(0x00CFFF) }
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
      float speed = 5.0 + uProgress * 15.0;
      float pulseZ = fract(vUv.y * 6.0 - uTime * speed);
      
      // Tight longitudinal Gaussian energy envelope
      float pulseProfile = exp(-pow((pulseZ - 0.5) * 6.5, 2.0));
      
      float cyanLead = smoothstep(0.47, 0.56, pulseZ) * pulseProfile;
      float rubyCenter = smoothstep(0.56, 0.36, pulseZ) * pulseProfile;
      
      vec3 photonPulse = uRubyColor * rubyCenter * 4.2 + uCyanColor * cyanLead * 3.2;
      
      vec3 viewDir = normalize(vViewPosition);
      vec3 norm = normalize(vNormal);
      float coreDensity = 0.55 + 0.45 * pow(abs(dot(viewDir, norm)), 0.8);
      
      gl_FragColor = vec4(photonPulse * coreDensity, uOpacity * (0.4 + 0.6 * pulseProfile));
    }
  `
};

// ── 3. Fused Silica Dielectric Glass Cladding Shader ──────────────────────────
// Glass wall dielectric transmission & specular internal reflection (IOR = 1.444)
export const SilicaGlassCladdingShader = {
  uniforms: {
    uTime:     { value: 0.0 },
    uProgress: { value: 0.0 },
    uOpacity:  { value: 1.0 }
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
      
      vec3 glassBase = vec3(0.005, 0.012, 0.024);
      vec3 rimSheen = vec3(0.12, 0.32, 0.58) * fresnel * 0.9;
      
      float bounce = pow(fresnel, 3.5) * 0.6;
      vec3 laserBounce = vec3(0.77, 0.12, 0.23) * bounce;
      
      vec3 finalCol = glassBase + rimSheen + laserBounce;
      gl_FragColor = vec4(finalCol, uOpacity * (0.25 + 0.55 * fresnel));
    }
  `
};

// ── 4. Atmospheric Haze & Depth Fog Shader ────────────────────────────────────
// Provides physical Rayleigh extinction fog behind infrastructure
export const AtmosphericHazeShader = {
  uniforms: {
    uOpacity: { value: 0.0 },
    uColor1:  { value: new THREE.Color(0x050a14) },
    uColor2:  { value: new THREE.Color(0x0d1f3c) }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uOpacity;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    varying vec2 vUv;
    void main() {
      float dist = length(vUv - vec2(0.5));
      vec3 col = mix(uColor2, uColor1, smoothstep(0.1, 0.75, dist));
      gl_FragColor = vec4(col, uOpacity * (1.0 - dist * 0.6));
    }
  `
};

// ── 5. Image Transformation & Parallax Displacement Shader ────────────────────
// Controlled optical depth displacement for image-to-3D physical transitions
// Vocabulary: atmosphere -> signal -> transmission -> glass -> fiber -> depth -> distortion -> transformation
export const ImageTransformShader = {
  uniforms: {
    uTexture:    { value: null },
    uProgress:   { value: 0.0 },
    uOpacity:    { value: 1.0 },
    uTime:       { value: 0.0 },
    uDistortion: { value: 0.05 }
  },
  vertexShader: `
    uniform float uProgress;
    uniform float uTime;
    uniform float uDistortion;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      
      // Controlled physical depth displacement along normal axis
      vec3 displacedPos = position;
      float wave = sin(uv.x * 6.28 + uTime * 2.0) * cos(uv.y * 6.28 + uTime * 1.5);
      displacedPos += normal * wave * uDistortion * uProgress;

      vec4 mvPosition = modelViewMatrix * vec4(displacedPos, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexture;
    uniform float uProgress;
    uniform float uOpacity;
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vec2 displacedUv = vUv + vec2(
        sin(vUv.y * 12.0 + uTime * 1.5) * 0.008 * uProgress,
        cos(vUv.x * 12.0 + uTime * 1.5) * 0.008 * uProgress
      );

      vec4 texColor = texture2D(uTexture, displacedUv);
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - abs(dot(viewDir, normalize(vNormal))), 2.0);

      vec3 finalColor = mix(texColor.rgb, vec3(0.0, 0.81, 1.0), fresnel * uProgress * 0.35);
      gl_FragColor = vec4(finalColor, texColor.a * uOpacity);
    }
  `
};

// ── 6. Draw-0 Frosted Glass Aperture Portal Shader ────────────────────────────
// Transition mask: Frosted/liquid-glass aperture that opens to reveal the underlying Earth
export const ZeroPortalShader = {
  uniforms: {
    uProgress:   { value: 0.0 }, // 0.0 = dark hero void, 1.0 = clear opening
    uTime:       { value: 0.0 },
    uResolution: { value: new THREE.Vector2(1920, 1080) },
    uCenter:     { value: new THREE.Vector2(0.5, 0.5) },
    uRadius:     { value: 0.22 },
    uAspect:     { value: 1.77 },
    uNoiseScale: { value: 4.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uProgress;
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uCenter;
    uniform float uRadius;
    uniform float uAspect;
    uniform float uNoiseScale;
    varying vec2 vUv;

    void main() {
      vec2 st = vUv - uCenter;
      st.x *= uAspect;
      float d = length(st);

      // Expanding portal radius driven by centroid-based uRadius and uProgress
      float targetRadius = max(uAspect, 1.6) * 1.8;
      float currentRadius = mix(uRadius, targetRadius, pow(uProgress, 1.6));

      // Organic crystalline frost noise on the dissolve boundary (Weakness 5)
      float noise = fract(sin(dot(st * uNoiseScale, vec2(12.9898, 78.233))) * 43758.5453);
      float dissolve = currentRadius + noise * 0.12 - 0.06; // ±6% noise on the edge
      float mask = smoothstep(dissolve - 0.05, dissolve + 0.05, d);

      // Liquid glass rim glow along portal boundary
      float ringEdge = exp(-pow((d - dissolve) * 16.0, 2.0));
      vec3 cyanRim = vec3(0.0, 0.81, 1.0) * ringEdge * 2.2 * (1.0 - uProgress * 0.85);
      vec3 rubyCore = vec3(0.77, 0.12, 0.23) * ringEdge * 1.4 * (1.0 - uProgress * 0.85);

      // Deep space void color (#030712) with atmospheric tint
      vec3 voidCol = vec3(0.015, 0.035, 0.075) + cyanRim + rubyCore;

      // Alpha opacity with organic dissolve mask (fades out as portal opens)
      float opacity = mask * (1.0 - uProgress);

      gl_FragColor = vec4(voidCol, opacity);
    }
  `
};
