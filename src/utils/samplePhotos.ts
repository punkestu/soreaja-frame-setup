// Curated realistic photobooth portraits for testing Layer 1 photo simulation

export interface SamplePhoto {
  id: string;
  name: string;
  url: string;
}

// Generate an artistic SVG portrait fallback that never has CORS restrictions on canvas toDataURL
export function createSamplePhotoSvg(index: number, label?: string): string {
  const palettes = [
    { bg: '#3B82F6', grad: '#93C5FD', accent: '#1D4ED8', text: '#FFFFFF', mood: 'Cool Vibe' },
    { bg: '#EC4899', grad: '#FBCFE8', accent: '#BE185D', text: '#FFFFFF', mood: 'Fun & Warm' },
    { bg: '#F59E0B', grad: '#FDE68A', accent: '#B45309', text: '#1F2937', mood: 'Golden Hour' },
    { bg: '#10B981', grad: '#A7F3D0', accent: '#047857', text: '#FFFFFF', mood: 'Fresh Smile' },
    { bg: '#8B5CF6', grad: '#DDD6FE', accent: '#6D28D9', text: '#FFFFFF', mood: 'Chic Style' },
    { bg: '#06B6D4', grad: '#A5F3FC', accent: '#0E7490', text: '#1F2937', mood: 'Retro Cool' },
  ];

  const p = palettes[index % palettes.length];
  const title = label || `Shot #${index + 1}`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <defs>
      <linearGradient id="g-${index}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${p.bg}" />
        <stop offset="100%" stop-color="${p.grad}" />
      </linearGradient>
    </defs>
    <rect width="600" height="600" fill="url(#g-${index})" />
    
    <!-- Stylized Person Avatar / Silhouette -->
    <g transform="translate(150, 100)">
      <!-- Head -->
      <circle cx="150" cy="110" r="75" fill="${p.accent}" opacity="0.85" />
      <circle cx="150" cy="100" r="65" fill="${p.text}" opacity="0.9" />
      <!-- Eyes & Smile -->
      <circle cx="130" cy="95" r="7" fill="${p.accent}" />
      <circle cx="170" cy="95" r="7" fill="${p.accent}" />
      <path d="M 130 115 Q 150 135 170 115" stroke="${p.accent}" stroke-width="5" fill="none" stroke-linecap="round" />
      <!-- Blush -->
      <ellipse cx="120" cy="112" rx="10" ry="5" fill="#FDA4AF" opacity="0.6" />
      <ellipse cx="180" cy="112" rx="10" ry="5" fill="#FDA4AF" opacity="0.6" />
      <!-- Shoulders -->
      <path d="M 50 290 C 50 200, 250 200, 250 290 Z" fill="${p.accent}" opacity="0.75" />
      <path d="M 65 290 C 65 215, 235 215, 235 290 Z" fill="${p.text}" opacity="0.85" />
    </g>

    <!-- Photo Overlay Elements -->
    <rect x="24" y="24" width="552" height="552" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2" rx="8" />
    <text x="40" y="540" font-family="system-ui, sans-serif" font-size="28" font-weight="800" fill="${p.text}" letter-spacing="1">${title}</text>
    <text x="40" y="565" font-family="system-ui, sans-serif" font-size="16" font-weight="500" fill="${p.text}" opacity="0.8">${p.mood} • Photobox Pose</text>
    <text x="560" y="550" text-anchor="end" font-family="system-ui, sans-serif" font-size="20" font-weight="700" fill="${p.text}" opacity="0.6">#0${index + 1}</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_PHOTOS: SamplePhoto[] = [
  { id: 'sample-1', name: 'Pose 1: V-Sign Peace', url: createSamplePhotoSvg(0, 'Pose 1 • Peace') },
  { id: 'sample-2', name: 'Pose 2: Heart Cheeks', url: createSamplePhotoSvg(1, 'Pose 2 • Heart') },
  { id: 'sample-3', name: 'Pose 3: Candid Smile', url: createSamplePhotoSvg(2, 'Pose 3 • Candid') },
  { id: 'sample-4', name: 'Pose 4: High Five', url: createSamplePhotoSvg(3, 'Pose 4 • High Five') },
  { id: 'sample-5', name: 'Pose 5: Wink Fun', url: createSamplePhotoSvg(4, 'Pose 5 • Wink') },
  { id: 'sample-6', name: 'Pose 6: Big Laugh', url: createSamplePhotoSvg(5, 'Pose 6 • Laugh') },
];
