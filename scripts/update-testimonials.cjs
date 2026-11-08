const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Update CSS for .vf-tech-img-wrap to have clean white background
html = html.replace(
  /\.vf-tech-img-wrap\s*\{[^}]+\}/,
  `.vf-tech-img-wrap {
        height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1.2rem;
        border-radius: 8px;
        overflow: hidden;
        background: #ffffff;
        border: 1px solid rgba(1, 75, 170, 0.12);
        box-shadow: 0 2px 8px rgba(1, 75, 170, 0.04);
        padding: 16px;
      }`
);

// 2. Update .vf-testimonial-card and avatar CSS
html = html.replace(
  /\.vf-testimonial-card\s*\{[^}]+\}/,
  `.vf-testimonial-card {
        padding: 2.2rem 2rem 2rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
        background: #ffffff;
        border: 1px solid rgba(1, 75, 170, 0.12);
        border-radius: 10px;
        box-shadow: 0 8px 24px rgba(1, 75, 170, 0.06);
        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }`
);

html = html.replace(
  /\.vf-testimonial-avatar\s*\{[^}]+\}/,
  `.vf-testimonial-avatar {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        object-fit: cover;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border: 2px solid #ffffff;
        outline: 2px solid rgba(1, 75, 170, 0.18);
      }`
);

// 3. Replace testimonial img tags with real photo paths
// Testimonial 1: David Miller
html = html.replace(
  /<img[^>]+alt="David Miller"[^>]*>/,
  '<img src="/testimonials/david-miller.jpg" alt="David Miller" class="vf-testimonial-avatar" loading="lazy" />'
);

// Testimonial 2: Michael Chang
html = html.replace(
  /<img[^>]+alt="Michael Chang"[^>]*>/,
  '<img src="/testimonials/michael-chang.jpg" alt="Michael Chang" class="vf-testimonial-avatar" loading="lazy" />'
);

// Testimonial 3: Sarah Connor
html = html.replace(
  /<img[^>]+alt="Sarah Connor"[^>]*>/,
  '<img src="/testimonials/sarah-connor.jpg" alt="Sarah Connor" class="vf-testimonial-avatar" loading="lazy" />'
);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully updated index.html with real photos and polished styling');

