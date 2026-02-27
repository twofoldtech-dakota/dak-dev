/**
 * Generate a static default OG image (1200x630 PNG)
 * Matches the neo-brutalist style of /api/og route
 * Uses sharp to render an SVG template — no extra dependencies
 *
 * Usage: npx tsx scripts/generate-default-og.ts
 * Output: public/og-default.png
 */

import sharp from 'sharp';
import path from 'path';

const WIDTH = 1200;
const HEIGHT = 630;

function buildSvg(): string {
  // Grid pattern: 40px cells, subtle lines
  const gridLines: string[] = [];
  for (let x = 0; x <= WIDTH; x += 40) {
    gridLines.push(
      `<line x1="${x}" y1="0" x2="${x}" y2="${HEIGHT}" stroke="#333" stroke-width="2" opacity="0.3"/>`
    );
  }
  for (let y = 0; y <= HEIGHT; y += 40) {
    gridLines.push(
      `<line x1="0" y1="${y}" x2="${WIDTH}" y2="${y}" stroke="#333" stroke-width="2" opacity="0.3"/>`
    );
  }

  return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#0A0A0A"/>

  <!-- Grid background -->
  ${gridLines.join('\n  ')}

  <!-- Title card with neo-brutalist border + shadow -->
  <rect x="88" y="281" width="8" height="8" fill="#F5F5F5"/>
  <rect x="80" y="220" width="724" height="230" fill="#0A0A0A" stroke="#F5F5F5" stroke-width="4"/>
  <rect x="88" y="228" width="724" height="230" fill="none" stroke="#F5F5F5" stroke-width="4" opacity="0.3"/>

  <!-- "Dakota Smith" title -->
  <text x="120" y="310" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="700" fill="#F5F5F5" letter-spacing="-1">Dakota Smith</text>

  <!-- "Software Engineer" subtitle -->
  <text x="120" y="370" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="600" fill="#A9A9A9">Fullstack Solutions Architect</text>

  <!-- Accent bar at bottom -->
  <rect x="120" y="410" width="4" height="24" fill="#F5F5F5"/>
  <text x="136" y="430" font-family="monospace" font-size="18" font-weight="700" fill="#F5F5F5" letter-spacing="3" text-transform="uppercase">DAK-DEV.VERCEL.APP</text>

  <!-- Top accent border -->
  <rect x="0" y="0" width="${WIDTH}" height="6" fill="#F5F5F5"/>
</svg>`;
}

async function main() {
  const svg = buildSvg();
  const outputPath = path.join(process.cwd(), 'public', 'og-default.png');

  await sharp(Buffer.from(svg)).png({ quality: 90 }).toFile(outputPath);

  console.log(`Generated: ${outputPath} (${WIDTH}x${HEIGHT})`);
}

main().catch((err) => {
  console.error('Failed to generate default OG image:', err);
  process.exit(1);
});
