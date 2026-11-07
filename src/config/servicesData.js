// src/config/servicesData.js
// Full B2B technical breakdown for all 4 VF Technologies services + 4 tech stack tools.

export const SERVICES = [
  {
    id:    'research-permitting',
    num:   '01',
    title: 'Research & Permitting',
    slug:  '/services/research-permitting',
    overview: 'End-to-end jurisdictional research, right-of-way verification, and permit package preparation for utility pole attachments and fiber route deployments across the United States.',
    deliverables: [
      'Right-of-Way (ROW) verification & landowner contact documentation',
      'Jurisdictional research — DOT, Railroad, Municipal, and Tribal authority permits',
      'Utility pole ownership audits & joint-use attachment applications',
      'Permit package preparation with engineering drawings and compliance forms',
      'Make-ready coordination with pole owners (AT&T, Comcast, local utilities)'
    ],
    tools: ['GIS Portals', 'AutoCAD', 'Municipal Databases'],
    accent: '#00CFFF'
  },
  {
    id:    'design-drafting',
    num:   '02',
    title: 'Design / Drafting',
    slug:  '/services/design-drafting',
    overview: 'High-precision Construction Drawing (CD) packages, traffic control plans, strand maps, and as-built redline reconciliation for fiber network deployments.',
    deliverables: [
      'Construction Drawing (CD) packages — aerial & underground routes',
      'Traffic Control Plans (TCP) for public right-of-way installations',
      'Base map drafting, strand maps & OSP fiber layout schematics',
      'As-built redline reconciliation & BOM (Bill of Materials) generation',
      'Permit schematic drawings meeting DOT and municipal standards'
    ],
    tools: ['AutoCAD', 'Spatial GIS', 'Katapult Pro'],
    accent: '#C41E3A'
  },
  {
    id:    'osp-fiber',
    num:   '03',
    title: 'OSP Fiber',
    slug:  '/services/osp-fiber',
    overview: 'End-to-end Outside Plant (OSP) FTTH/FTTx network architecture — from aerial route optimization to splice closure diagrams and optical link loss budgeting.',
    deliverables: [
      'End-to-end FTTH / FTTx network architecture design',
      'Aerial & buried route optimization with mid-span clearance validation',
      'Splice closure diagrams & optical link loss budget calculations',
      'ODF distribution panel mapping & fiber count documentation',
      'Make-ready engineering — pole transfer, guying, and riser design'
    ],
    tools: ['Katapult Pro', 'Frontier', 'AutoCAD'],
    accent: '#00CFFF'
  },
  {
    id:    'pole-loading-analysis',
    num:   '04',
    title: 'Pole Loading Analysis (O-Calc Pro)',
    slug:  '/services/pole-loading-analysis',
    overview: 'NESC-compliant 3D structural digital twin modeling, wind/ice load calculations, and pass/fail structural certification reports for utility poles using O-Calc Pro.',
    deliverables: [
      '3D structural digital twin modeling of utility pole assemblies',
      'NESC Grade B/C & GO-95 wind and ice load vector calculations',
      'Guying & anchor sizing analysis for overloaded structures',
      'Pass/fail structural certification reports for pole make-ready',
      'Make-ready remediation design — riser height, transfer, and replacement specs'
    ],
    tools: ['O-Calc Pro', 'Katapult Pro', 'AutoCAD'],
    accent: '#C41E3A'
  }
];

export const TECH_STACK = [
  {
    num:         '01',
    stage:       'FIELD RECONNAISSANCE',
    name:        'FRONTIER',
    image:       '/services/frontier.jpg',
    description: 'Field asset capture, pole reconnaissance, existing attachment documentation, and route verification for OSP fiber deployments.'
  },
  {
    num:         '02',
    stage:       'WORKFLOW ENGINE',
    name:        'KATAPULT PRO',
    image:       '/services/katapult.jpg',
    description: 'Photogrammetry processing, mid-span clearance auditing, pole attachment modeling, and make-ready engineering workflows.'
  },
  {
    num:         '03',
    stage:       'DESIGN DOCUMENTATION',
    name:        'AUTOCAD',
    image:       '/services/autocad.jpg',
    description: 'High-precision construction drawings (CDs), strand maps, traffic control plans, and permit schematics for fiber deployments.'
  },
  {
    num:         '04',
    stage:       'STRUCTURAL VALIDATION',
    name:        'O-CALC PRO',
    image:       '/services/ocalc-pro.jpg',
    description: '3D structural pole loading analysis, wind/ice vector modeling, NESC Grade B/C certification, and make-ready remediation design.'
  }
];

