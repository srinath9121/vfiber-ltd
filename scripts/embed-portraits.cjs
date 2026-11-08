const fs = require('fs');

const p1B64 = 'data:image/jpeg;base64,' + fs.readFileSync('public/testimonials/david-miller.jpg').toString('base64');
const p2B64 = 'data:image/jpeg;base64,' + fs.readFileSync('public/testimonials/michael-chang.jpg').toString('base64');
const p3B64 = 'data:image/jpeg;base64,' + fs.readFileSync('public/testimonials/sarah-connor.jpg').toString('base64');

// Update src/config/embeddedAssets.js
let assets = fs.readFileSync('src/config/embeddedAssets.js', 'utf8');
assets = assets.replace(
  /window\.__TESTIMONIAL_AVATARS__\s*=\s*\{[^}]+\};/,
  'window.__TESTIMONIAL_AVATARS__ = { p1: ' + JSON.stringify(p1B64) + ', p2: ' + JSON.stringify(p2B64) + ', p3: ' + JSON.stringify(p3B64) + ' };'
);
fs.writeFileSync('src/config/embeddedAssets.js', assets, 'utf8');

// Also update index.html
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<img[^>]+alt="David Miller"[^>]*>/, '<img src="' + p1B64 + '" alt="David Miller" class="vf-testimonial-avatar" loading="lazy" />');
html = html.replace(/<img[^>]+alt="Michael Chang"[^>]*>/, '<img src="' + p2B64 + '" alt="Michael Chang" class="vf-testimonial-avatar" loading="lazy" />');
html = html.replace(/<img[^>]+alt="Sarah Connor"[^>]*>/, '<img src="' + p3B64 + '" alt="Sarah Connor" class="vf-testimonial-avatar" loading="lazy" />');
fs.writeFileSync('index.html', html, 'utf8');

console.log('Successfully updated embeddedAssets.js and index.html with real human portrait base64!');

