import { PresetFrame, Position } from '../types/frame';

// Helper to create an SVG Data URL representing a photobox frame with transparent cutouts
export function createSvgFrameDataUrl(
  width: number,
  height: number,
  positions: Position[],
  options: {
    bgFill: string;
    borderColor?: string;
    brandText?: string;
    subText?: string;
    tagline?: string;
    pattern?: 'clean' | 'dots' | 'retro' | 'minimal' | 'film';
    cornerRound?: number;
  }
): string {
  const {
    bgFill,
    brandText = 'SOREAJA PHOTOBOX',
    subText = 'SPECIAL MOMENTS • SEOUL & JAKARTA',
    tagline = '© 2026 SOREAJA MEMORIES',
    pattern = 'clean',
    cornerRound = 16,
  } = options;

  // Mask cutouts: in mask, black (#000000) hides/makes transparent, white (#ffffff) keeps visible
  const maskCutouts = positions
    .map(
      (p) =>
        `<rect x="${p.x}" y="${p.y}" width="${p.width}" height="${p.height}" rx="${cornerRound}" ry="${cornerRound}" fill="black" />`
    )
    .join('\n');

  // Decorative slot borders on top of the frame
  const slotFrames = positions
    .map(
      (p) =>
        `<rect x="${p.x - 2}" y="${p.y - 2}" width="${p.width + 4}" height="${p.height + 4}" rx="${cornerRound + 2}" ry="${cornerRound + 2}" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2" />`
    )
    .join('\n');

  let patternDef = '';
  let patternRect = '';
  if (pattern === 'dots') {
    patternDef = `<pattern id="p-dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="rgba(255,255,255,0.06)"/></pattern>`;
    patternRect = `<rect width="${width}" height="${height}" fill="url(#p-dots)" mask="url(#frame-cutouts)"/>`;
  } else if (pattern === 'film') {
    patternDef = `<pattern id="p-grain" width="40" height="40" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="40" y2="40" stroke="rgba(255,255,255,0.03)" stroke-width="1"/></pattern>`;
    patternRect = `<rect width="${width}" height="${height}" fill="url(#p-grain)" mask="url(#frame-cutouts)"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <mask id="frame-cutouts">
        <!-- Everything white is kept -->
        <rect x="0" y="0" width="${width}" height="${height}" fill="white" />
        <!-- Cutout holes are black (transparent) -->
        ${maskCutouts}
      </mask>
      ${patternDef}
    </defs>

    <!-- Main solid frame with cutout mask -->
    <rect x="0" y="0" width="${width}" height="${height}" fill="${bgFill}" mask="url(#frame-cutouts)" />
    ${patternRect}

    <!-- Frame Border Accents -->
    ${slotFrames}

    <!-- Brand Typography Header / Footer -->
    <g font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
      <!-- Top header branding -->
      <text x="${width / 2}" y="${Math.max(48, positions[0]?.y ? positions[0].y / 2 + 10 : 50)}" text-anchor="middle" font-size="22" font-weight="800" fill="white" letter-spacing="4">${brandText}</text>
      <text x="${width / 2}" y="${Math.max(72, positions[0]?.y ? positions[0].y / 2 + 28 : 74)}" text-anchor="middle" font-size="11" font-weight="500" fill="rgba(255,255,255,0.7)" letter-spacing="2">${subText}</text>
      
      <!-- Bottom footer branding -->
      <line x1="60" y1="${height - 70}" x2="${width - 60}" y2="${height - 70}" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
      <text x="60" y="${height - 40}" text-anchor="start" font-size="12" font-weight="700" fill="white" letter-spacing="2">SOREAJA • STUDIO</text>
      <text x="${width - 60}" y="${height - 40}" text-anchor="end" font-size="11" font-weight="500" fill="rgba(255,255,255,0.65)">${tagline}</text>
      <text x="${width / 2}" y="${height - 40}" text-anchor="middle" font-size="10" font-weight="400" fill="rgba(255,255,255,0.4)">PHOTO ID #SORE-2026</text>
    </g>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// Preset 1: Classic 4-Cut Strip (Korean Photobooth standard: 600 x 1800)
const strip4Positions: Position[] = [
  { x: 50, y: 110, width: 500, height: 360 },
  { x: 50, y: 495, width: 500, height: 360 },
  { x: 50, y: 880, width: 500, height: 360 },
  { x: 50, y: 1265, width: 500, height: 360 },
];

// Preset 2: Duo Snapshot (2 horizontal cuts in a vertical portrait: 800 x 1200)
const duo2Positions: Position[] = [
  { x: 60, y: 120, width: 680, height: 460 },
  { x: 60, y: 620, width: 680, height: 460 },
];

// Preset 3: Modern 4-Grid (Square photobox print: 1200 x 1200)
const grid4Positions: Position[] = [
  { x: 70, y: 110, width: 510, height: 450 },
  { x: 620, y: 110, width: 510, height: 450 },
  { x: 70, y: 590, width: 510, height: 450 },
  { x: 620, y: 590, width: 510, height: 450 },
];

// Preset 4: Nostalgic 3-Cut Strip (Vertical strip: 600 x 1600)
const strip3Positions: Position[] = [
  { x: 50, y: 120, width: 500, height: 410 },
  { x: 50, y: 560, width: 500, height: 410 },
  { x: 50, y: 1000, width: 500, height: 410 },
];

// Preset 5: Cinema 6-Cut Collage (Postcard 1200 x 1800)
const cinema6Positions: Position[] = [
  { x: 60, y: 110, width: 520, height: 450 },
  { x: 620, y: 110, width: 520, height: 450 },
  { x: 60, y: 590, width: 520, height: 450 },
  { x: 620, y: 590, width: 520, height: 450 },
  { x: 60, y: 1070, width: 520, height: 450 },
  { x: 620, y: 1070, width: 520, height: 450 },
];

export const PRESET_FRAMES: PresetFrame[] = [
  {
    id: 'soreaja-strip-4cut-midnight',
    name: 'Soreaja Midnight Strip (4-Cut)',
    subtitle: 'Classic Korean Photobox 4-Cut Vertical',
    theme: 'Dark Minimalist',
    description: 'Standard 600×1800 strip with 4 stacked shots, deep charcoal finish and clean typography.',
    category: 'Strip',
    canvasWidth: 600,
    canvasHeight: 1800,
    photoCount: 4,
    positions: strip4Positions,
    frameImg: createSvgFrameDataUrl(600, 1800, strip4Positions, {
      bgFill: '#18181B',
      brandText: 'SOREAJA 4-CUT',
      subText: 'TIMELESS MOMENTS • EDITION 01',
      tagline: 'LIFE IN 4 CUTS',
      pattern: 'dots',
      cornerRound: 12,
    }),
  },
  {
    id: 'soreaja-grid-4cut-pastel',
    name: 'Soreaja Pastel Quad (2×2)',
    subtitle: 'Square 1200×1200 Photobox Quad Grid',
    theme: 'Pastel Lavender',
    description: 'Balanced 2×2 grid layout perfect for group photos and square keepsake prints.',
    category: 'Grid',
    canvasWidth: 1200,
    canvasHeight: 1200,
    photoCount: 4,
    positions: grid4Positions,
    frameImg: createSvgFrameDataUrl(1200, 1200, grid4Positions, {
      bgFill: '#312E81',
      brandText: 'SOREAJA QUAD',
      subText: 'MEMORIES ARCHIVE • SEOUL-JAKARTA',
      tagline: 'KEEP EVERY SMILE FOREVER',
      pattern: 'clean',
      cornerRound: 20,
    }),
  },
  {
    id: 'soreaja-duo-landscape',
    name: 'Soreaja Horizon Duo (2-Cut)',
    subtitle: '800×1200 Double Wide Frame',
    theme: 'Warm Sunset Terracotta',
    description: 'Spacious dual-slot layout for cinematic wide shots and couple poses.',
    category: 'Polaroid',
    canvasWidth: 800,
    canvasHeight: 1200,
    photoCount: 2,
    positions: duo2Positions,
    frameImg: createSvgFrameDataUrl(800, 1200, duo2Positions, {
      bgFill: '#831843',
      brandText: 'SOREAJA DUO',
      subText: 'GOLDEN HOUR EDITION',
      tagline: 'TWO SHOTS • ENDLESS MEMORIES',
      pattern: 'film',
      cornerRound: 14,
    }),
  },
  {
    id: 'soreaja-strip-3cut-retro',
    name: 'Soreaja Vintage Trio (3-Cut)',
    subtitle: '600×1600 Film Trio Strip',
    theme: 'Retro Emerald',
    description: 'Taller 3-cut format inspired by 90s vintage booth cameras.',
    category: 'Strip',
    canvasWidth: 600,
    canvasHeight: 1600,
    photoCount: 3,
    positions: strip3Positions,
    frameImg: createSvgFrameDataUrl(600, 1600, strip3Positions, {
      bgFill: '#064E3B',
      brandText: 'SOREAJA VINTAGE',
      subText: 'ANALOGUE PHOTO ARCHIVE',
      tagline: 'AUTHENTIC VIBES ONLY',
      pattern: 'dots',
      cornerRound: 10,
    }),
  },
  {
    id: 'soreaja-cinema-6cut',
    name: 'Soreaja Cinema Postcard (6-Cut)',
    subtitle: '1200×1800 Postcard Sheet',
    theme: 'Film Noir & Slate',
    description: 'Expansive 6-photo collage sheet designed for parties and group celebrations.',
    category: 'Special',
    canvasWidth: 1200,
    canvasHeight: 1800,
    photoCount: 6,
    positions: cinema6Positions,
    frameImg: createSvgFrameDataUrl(1200, 1800, cinema6Positions, {
      bgFill: '#0F172A',
      brandText: 'SOREAJA CINEMA 6',
      subText: 'FULL REEL MEMORY POSTCARD',
      tagline: 'A CELEBRATION IN FRAMES',
      pattern: 'film',
      cornerRound: 14,
    }),
  },
];
