// src/config/siteMetrics.js
// ── SINGLE SOURCE OF TRUTH ──
// Update all numbers, contact info, and company identity here.
// Every page section reads from this file — never hardcode elsewhere.

export const SITE_CONFIG = {
  companyName: 'Venkateswara Fiber Technologies Private Limited',
  shortName:   'VF Technologies',
  tagline:     'Powering a Better Tomorrow.',
  badge:       'ENGINEERING & TELECOMMUNICATION INFRASTRUCTURE',

  // ── UPDATE YOUR EXACT NUMBERS HERE ──
  metrics: {
    structuresAnalyzed: {
      value:   25000,
      suffix:  '+',
      label:   'STRUCTURES ANALYZED',
      subtext: 'Thousands of structures. Thousands of engineering decisions.'
    },
    polesManaged: {
      value:   18500,
      suffix:  '+',
      label:   'POLES MANAGED',
      subtext: 'Every pole is part of a network. Every network depends on precision. Across the United States.'
    },
    yearsOfExperience: {
      value:   5,
      suffix:  '+ Years',
      label:   'ENGINEERING EXCELLENCE',
      subtext: 'High-precision backend telecom engineering for US broadband providers.'
    },
    usStatesCovered: {
      value:   14,
      suffix:  '+ States',
      label:   'US FOOTPRINT',
      subtext: 'Supporting fiber & utility deployments across the United States.'
    }
  },

  // ── UPDATE CONTACT DETAILS HERE ──
  contact: {
    phoneDisplay:   '+91 91210 67876',
    phoneHref:      'tel:+919121067876',
    email:          'services@vf-technologies.com',
    address:        'Madhapur, Hyderabad, Telangana, India.',
    linkedinUrl:    'https://www.linkedin.com/company/venkateswara-fiber-technologies-pvt-ltd',
    operatingHours: 'Mon – Sat | US & IST Overlapping Engineering Shifts'
  }
};

