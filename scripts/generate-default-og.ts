/**
 * Generate a static default OG image (1200x630 PNG)
 * Neo-brutalist design with neon green accents, depth grid,
 * corner coordinates, scanline, and pulsing dots
 *
 * Usage: npx tsx scripts/generate-default-og.ts
 * Output: public/og-default.png
 */

import sharp from 'sharp';
import path from 'path';

const WIDTH = 1200;
const HEIGHT = 630;
const ACCENT = '#00ff88';
const BG = '#0A0A0A';
const TEXT = '#F5F5F5';
const MUTED = '#A9A9A9';
const GRID_DIM = '#1a1a1a';
const GRID_MID = '#222222';

function buildSvg(): string {
  const elements: string[] = [];

  // === Background ===
  elements.push(`<rect width="${WIDTH}" height="${HEIGHT}" fill="${BG}"/>`);

  // === Radial vignette mask (fade grid at edges) ===
  elements.push(`
  <defs>
    <radialGradient id="vignette" cx="35%" cy="45%" r="65%">
      <stop offset="0%" stop-color="white" stop-opacity="1"/>
      <stop offset="70%" stop-color="white" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="white" stop-opacity="0.1"/>
    </radialGradient>
    <mask id="vignetteMask">
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#vignette)"/>
    </mask>
    <linearGradient id="scanGlow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0"/>
      <stop offset="40%" stop-color="${ACCENT}" stop-opacity="0.12"/>
      <stop offset="50%" stop-color="${ACCENT}" stop-opacity="0.3"/>
      <stop offset="60%" stop-color="${ACCENT}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
    </linearGradient>
  </defs>`);

  // === Layer 1: Fine grid (12px, very subtle) ===
  const fineGrid: string[] = [];
  for (let x = 0; x <= WIDTH; x += 12) {
    fineGrid.push(
      `<line x1="${x}" y1="0" x2="${x}" y2="${HEIGHT}" stroke="${GRID_DIM}" stroke-width="0.5" opacity="0.4"/>`
    );
  }
  for (let y = 0; y <= HEIGHT; y += 12) {
    fineGrid.push(
      `<line x1="0" y1="${y}" x2="${WIDTH}" y2="${y}" stroke="${GRID_DIM}" stroke-width="0.5" opacity="0.4"/>`
    );
  }
  elements.push(`<g mask="url(#vignetteMask)">${fineGrid.join('')}</g>`);

  // === Layer 2: Medium grid (48px) ===
  const medGrid: string[] = [];
  for (let x = 0; x <= WIDTH; x += 48) {
    medGrid.push(
      `<line x1="${x}" y1="0" x2="${x}" y2="${HEIGHT}" stroke="${GRID_MID}" stroke-width="1" opacity="0.5"/>`
    );
  }
  for (let y = 0; y <= HEIGHT; y += 48) {
    medGrid.push(
      `<line x1="0" y1="${y}" x2="${WIDTH}" y2="${y}" stroke="${GRID_MID}" stroke-width="1" opacity="0.5"/>`
    );
  }
  elements.push(`<g mask="url(#vignetteMask)">${medGrid.join('')}</g>`);

  // === Layer 3: Accent grid (192px, green tint) ===
  const accentGrid: string[] = [];
  for (let x = 0; x <= WIDTH; x += 192) {
    accentGrid.push(
      `<line x1="${x}" y1="0" x2="${x}" y2="${HEIGHT}" stroke="${ACCENT}" stroke-width="1" opacity="0.08"/>`
    );
  }
  for (let y = 0; y <= HEIGHT; y += 192) {
    accentGrid.push(
      `<line x1="0" y1="${y}" x2="${WIDTH}" y2="${y}" stroke="${ACCENT}" stroke-width="1" opacity="0.08"/>`
    );
  }
  elements.push(`<g mask="url(#vignetteMask)">${accentGrid.join('')}</g>`);

  // === Grid intersection dots (green, scattered) ===
  const dotPositions = [
    { x: 192, y: 192, o: 0.5, r: 2.5 },
    { x: 384, y: 192, o: 0.35, r: 2 },
    { x: 576, y: 384, o: 0.4, r: 2.5 },
    { x: 768, y: 192, o: 0.3, r: 2 },
    { x: 960, y: 384, o: 0.45, r: 2.5 },
    { x: 384, y: 384, o: 0.25, r: 2 },
    { x: 1056, y: 192, o: 0.35, r: 2 },
    { x: 144, y: 384, o: 0.3, r: 2 },
    { x: 816, y: 480, o: 0.2, r: 1.5 },
    { x: 624, y: 96, o: 0.25, r: 1.5 },
    { x: 1008, y: 528, o: 0.2, r: 1.5 },
    { x: 240, y: 480, o: 0.15, r: 1.5 },
  ];
  for (const dot of dotPositions) {
    // Glow halo
    elements.push(
      `<circle cx="${dot.x}" cy="${dot.y}" r="${dot.r * 3}" fill="${ACCENT}" opacity="${dot.o * 0.3}"/>`
    );
    // Core dot
    elements.push(
      `<circle cx="${dot.x}" cy="${dot.y}" r="${dot.r}" fill="${ACCENT}" opacity="${dot.o}"/>`
    );
  }

  // === Scanline (horizontal green band) ===
  elements.push(
    `<rect x="0" y="270" width="${WIDTH}" height="40" fill="url(#scanGlow)"/>`
  );
  // Sharp scanline core
  elements.push(
    `<rect x="0" y="288" width="${WIDTH}" height="2" fill="${ACCENT}" opacity="0.15"/>`
  );

  // === Corner coordinate marks ===
  const cornerSize = 28;
  const cornerWeight = 2;
  const cornerPad = 20;
  const cornerTextSize = 14;

  // Top-left [0,0]
  elements.push(`<g opacity="0.45">
    <line x1="${cornerPad}" y1="${cornerPad}" x2="${cornerPad + cornerSize}" y2="${cornerPad}" stroke="${ACCENT}" stroke-width="${cornerWeight}"/>
    <line x1="${cornerPad}" y1="${cornerPad}" x2="${cornerPad}" y2="${cornerPad + cornerSize}" stroke="${ACCENT}" stroke-width="${cornerWeight}"/>
    <text x="${cornerPad + cornerSize + 6}" y="${cornerPad + cornerTextSize - 1}" font-family="monospace" font-size="${cornerTextSize}" fill="${ACCENT}">[0,0]</text>
  </g>`);

  // Top-right [1,0]
  elements.push(`<g opacity="0.45">
    <line x1="${WIDTH - cornerPad}" y1="${cornerPad}" x2="${WIDTH - cornerPad - cornerSize}" y2="${cornerPad}" stroke="${ACCENT}" stroke-width="${cornerWeight}"/>
    <line x1="${WIDTH - cornerPad}" y1="${cornerPad}" x2="${WIDTH - cornerPad}" y2="${cornerPad + cornerSize}" stroke="${ACCENT}" stroke-width="${cornerWeight}"/>
    <text x="${WIDTH - cornerPad - cornerSize - 42}" y="${cornerPad + cornerTextSize - 1}" font-family="monospace" font-size="${cornerTextSize}" fill="${ACCENT}">[1,0]</text>
  </g>`);

  // Bottom-left [0,1]
  elements.push(`<g opacity="0.45">
    <line x1="${cornerPad}" y1="${HEIGHT - cornerPad}" x2="${cornerPad + cornerSize}" y2="${HEIGHT - cornerPad}" stroke="${ACCENT}" stroke-width="${cornerWeight}"/>
    <line x1="${cornerPad}" y1="${HEIGHT - cornerPad}" x2="${cornerPad}" y2="${HEIGHT - cornerPad - cornerSize}" stroke="${ACCENT}" stroke-width="${cornerWeight}"/>
    <text x="${cornerPad + cornerSize + 6}" y="${HEIGHT - cornerPad - 3}" font-family="monospace" font-size="${cornerTextSize}" fill="${ACCENT}">[0,1]</text>
  </g>`);

  // Bottom-right [1,1]
  elements.push(`<g opacity="0.45">
    <line x1="${WIDTH - cornerPad}" y1="${HEIGHT - cornerPad}" x2="${WIDTH - cornerPad - cornerSize}" y2="${HEIGHT - cornerPad}" stroke="${ACCENT}" stroke-width="${cornerWeight}"/>
    <line x1="${WIDTH - cornerPad}" y1="${HEIGHT - cornerPad}" x2="${WIDTH - cornerPad}" y2="${HEIGHT - cornerPad - cornerSize}" stroke="${ACCENT}" stroke-width="${cornerWeight}"/>
    <text x="${WIDTH - cornerPad - cornerSize - 42}" y="${HEIGHT - cornerPad - 3}" font-family="monospace" font-size="${cornerTextSize}" fill="${ACCENT}">[1,1]</text>
  </g>`);

  // === Top accent border (green) ===
  elements.push(`<rect x="0" y="0" width="${WIDTH}" height="5" fill="${ACCENT}"/>`);

  // === Main content card (neo-brutalist, green border + hard shadow) ===
  const cardX = 80;
  const cardY = 160;
  const cardW = 700;
  const cardH = 320;
  const shadowOffset = 10;

  // Hard shadow
  elements.push(
    `<rect x="${cardX + shadowOffset}" y="${cardY + shadowOffset}" width="${cardW}" height="${cardH}" fill="${ACCENT}" opacity="0.12"/>`
  );
  // Card background
  elements.push(
    `<rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" fill="${BG}" stroke="${ACCENT}" stroke-width="3"/>`
  );

  // === Card content ===

  // "Dakota Smith" — large bold
  elements.push(
    `<text x="${cardX + 48}" y="${cardY + 100}" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="72" font-weight="700" fill="${TEXT}" letter-spacing="-2">Dakota Smith</text>`
  );

  // "Fullstack Solutions Architect" — muted
  elements.push(
    `<text x="${cardX + 48}" y="${cardY + 148}" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="28" font-weight="600" fill="${MUTED}">Fullstack Solutions Architect</text>`
  );

  // "Agentic Engineering" — accent colored
  elements.push(
    `<text x="${cardX + 48}" y="${cardY + 188}" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="28" font-weight="600" fill="${ACCENT}" opacity="0.85">Agentic Engineering</text>`
  );

  // Divider line
  elements.push(
    `<line x1="${cardX + 48}" y1="${cardY + 218}" x2="${cardX + 280}" y2="${cardY + 218}" stroke="${ACCENT}" stroke-width="2" opacity="0.4"/>`
  );

  // Green accent bar + domain
  elements.push(
    `<rect x="${cardX + 48}" y="${cardY + 245}" width="4" height="28" fill="${ACCENT}"/>`
  );
  elements.push(
    `<text x="${cardX + 64}" y="${cardY + 269}" font-family="monospace" font-size="18" font-weight="700" fill="${TEXT}" letter-spacing="3">DAK-DEV.VERCEL.APP</text>`
  );

  // === Decorative elements on right side of card ===
  // Small terminal cursor blink suggestion
  elements.push(
    `<rect x="${cardX + cardW - 80}" y="${cardY + 240}" width="14" height="22" fill="${ACCENT}" opacity="0.5"/>`
  );
  // Monospace hint text
  elements.push(
    `<text x="${cardX + cardW - 60}" y="${cardY + 258}" font-family="monospace" font-size="16" fill="${ACCENT}" opacity="0.35">_</text>`
  );

  return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
${elements.join('\n')}
</svg>`;
}

async function main() {
  const svg = buildSvg();
  const outputPath = path.join(process.cwd(), 'public', 'og-default.png');

  await sharp(Buffer.from(svg)).png({ quality: 90 }).toFile(outputPath);

  const stats = await import('fs').then((fs) =>
    fs.promises.stat(outputPath)
  );
  console.log(
    `Generated: ${outputPath} (${WIDTH}x${HEIGHT}, ${(stats.size / 1024).toFixed(1)}KB)`
  );
}

main().catch((err) => {
  console.error('Failed to generate default OG image:', err);
  process.exit(1);
});
