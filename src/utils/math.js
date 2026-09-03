// math.js — shared math utilities

export const lerp = (a, b, t) => a + (b - a) * t;

export const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

export const map = (val, inMin, inMax, outMin, outMax) =>
  outMin + ((val - inMin) / (inMax - inMin)) * (outMax - outMin);
