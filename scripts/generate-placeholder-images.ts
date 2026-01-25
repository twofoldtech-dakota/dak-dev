#!/usr/bin/env npx tsx
/**
 * Placeholder Image Generator
 *
 * Generates neo-brutalist placeholder images for blog posts that are missing images.
 * Uses sharp to create dark background images with centered text.
 *
 * Usage:
 *   npx tsx scripts/generate-placeholder-images.ts
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { IMAGE_SPECS, generateBlurPlaceholder } from '../lib/image-utils';
import { getAllSlugs, getPostBySlug } from '../lib/posts';

// Neo-brutalist design colors
const COLORS = {
  background: '#0A0A0A',
  text: '#F5F5F5',
  accent: '#333333',
};

interface PlaceholderConfig {
  width: number;
  height: number;
  title: string;
  subtitle?: string;
}

/**
 * Generate an SVG with neo-brutalist styling
 */
function generateSvg(config: PlaceholderConfig): string {
  const { width, height, title, subtitle } = config;

  // Calculate font sizes based on image dimensions
  const titleFontSize = Math.floor(width / 20);
  const subtitleFontSize = Math.floor(width / 40);
  const borderWidth = Math.floor(width / 200);

  // Word wrap the title to fit within the image
  const maxCharsPerLine = Math.floor(width / (titleFontSize * 0.6));
  const titleLines = wrapText(title, maxCharsPerLine);

  // Calculate vertical positioning
  const lineHeight = titleFontSize * 1.3;
  const totalTitleHeight = titleLines.length * lineHeight;
  const startY = (height - totalTitleHeight) / 2 + titleFontSize;

  // Generate title text elements
  const titleElements = titleLines
    .map(
      (line, i) =>
        `<text x="${width / 2}" y="${startY + i * lineHeight}" font-family="system-ui, -apple-system, sans-serif" font-size="${titleFontSize}" font-weight="700" fill="${COLORS.text}" text-anchor="middle">${escapeXml(line)}</text>`
    )
    .join('\n    ');

  // Subtitle element (if provided)
  const subtitleElement = subtitle
    ? `<text x="${width / 2}" y="${startY + titleLines.length * lineHeight + subtitleFontSize}" font-family="system-ui, -apple-system, sans-serif" font-size="${subtitleFontSize}" font-weight="400" fill="${COLORS.accent}" text-anchor="middle">${escapeXml(subtitle)}</text>`
    : '';

  // Create geometric accents for neo-brutalist style
  const accentSize = Math.floor(width / 16);
  const cornerOffset = Math.floor(width / 20);

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="100%" height="100%" fill="${COLORS.background}"/>

  <!-- Border -->
  <rect x="${borderWidth / 2}" y="${borderWidth / 2}" width="${width - borderWidth}" height="${height - borderWidth}" fill="none" stroke="${COLORS.accent}" stroke-width="${borderWidth}"/>

  <!-- Corner accents (neo-brutalist geometric elements) -->
  <rect x="${cornerOffset}" y="${cornerOffset}" width="${accentSize}" height="${borderWidth * 2}" fill="${COLORS.text}"/>
  <rect x="${cornerOffset}" y="${cornerOffset}" width="${borderWidth * 2}" height="${accentSize}" fill="${COLORS.text}"/>

  <rect x="${width - cornerOffset - accentSize}" y="${cornerOffset}" width="${accentSize}" height="${borderWidth * 2}" fill="${COLORS.text}"/>
  <rect x="${width - cornerOffset - borderWidth * 2}" y="${cornerOffset}" width="${borderWidth * 2}" height="${accentSize}" fill="${COLORS.text}"/>

  <rect x="${cornerOffset}" y="${height - cornerOffset - borderWidth * 2}" width="${accentSize}" height="${borderWidth * 2}" fill="${COLORS.text}"/>
  <rect x="${cornerOffset}" y="${height - cornerOffset - accentSize}" width="${borderWidth * 2}" height="${accentSize}" fill="${COLORS.text}"/>

  <rect x="${width - cornerOffset - accentSize}" y="${height - cornerOffset - borderWidth * 2}" width="${accentSize}" height="${borderWidth * 2}" fill="${COLORS.text}"/>
  <rect x="${width - cornerOffset - borderWidth * 2}" y="${height - cornerOffset - accentSize}" width="${borderWidth * 2}" height="${accentSize}" fill="${COLORS.text}"/>

  <!-- Title -->
  ${titleElements}

  <!-- Subtitle -->
  ${subtitleElement}
</svg>`;
}

/**
 * Wrap text to fit within a maximum character width
 */
function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= maxChars) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines;
}

/**
 * Escape special XML characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate placeholder images for a post
 */
async function generatePlaceholderImages(
  slug: string,
  title: string
): Promise<{ thumbnailBlur: string; heroBlur: string }> {
  const outputDir = path.join(process.cwd(), 'public', 'images', 'posts', slug);

  // Ensure directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  // Generate thumbnail
  const thumbnailSvg = generateSvg({
    width: IMAGE_SPECS.thumbnail.width,
    height: IMAGE_SPECS.thumbnail.height,
    title,
    subtitle: 'dak.dev',
  });

  const thumbnailBuffer = await sharp(Buffer.from(thumbnailSvg))
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();

  const thumbnailPath = path.join(outputDir, 'thumbnail.jpg');
  fs.writeFileSync(thumbnailPath, thumbnailBuffer);
  const thumbnailBlur = await generateBlurPlaceholder(thumbnailBuffer);

  // Generate hero
  const heroSvg = generateSvg({
    width: IMAGE_SPECS.hero.width,
    height: IMAGE_SPECS.hero.height,
    title,
    subtitle: 'dak.dev',
  });

  const heroBuffer = await sharp(Buffer.from(heroSvg))
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();

  const heroPath = path.join(outputDir, 'hero.jpg');
  fs.writeFileSync(heroPath, heroBuffer);
  const heroBlur = await generateBlurPlaceholder(heroBuffer);

  return { thumbnailBlur, heroBlur };
}

async function main() {
  console.log('\n🎨 Placeholder Image Generator');
  console.log('═'.repeat(50));

  const slugs = getAllSlugs();
  let generated = 0;

  for (const slug of slugs) {
    const post = getPostBySlug(slug);
    if (!post) continue;

    const outputDir = path.join(process.cwd(), 'public', 'images', 'posts', slug);
    const thumbnailExists = fs.existsSync(path.join(outputDir, 'thumbnail.jpg'));
    const heroExists = fs.existsSync(path.join(outputDir, 'hero.jpg'));

    // Skip if both images already exist
    if (thumbnailExists && heroExists) {
      console.log(`\n✅ ${post.frontmatter.title}`);
      console.log('   Images already exist, skipping...');
      continue;
    }

    console.log(`\n📝 ${post.frontmatter.title}`);
    console.log(`   Slug: ${slug}`);

    try {
      const { thumbnailBlur, heroBlur } = await generatePlaceholderImages(
        slug,
        post.frontmatter.title
      );

      console.log('   ✅ Generated thumbnail.jpg');
      console.log('   ✅ Generated hero.jpg');

      // Output blur data
      console.log('\n   📋 Blur data for frontmatter:');
      console.log(`   thumbnailBlur: "${thumbnailBlur.substring(0, 50)}..."`);
      console.log(`   heroBlur: "${heroBlur.substring(0, 50)}..."`);

      generated++;
    } catch (error) {
      console.error(`   ❌ Error: ${error instanceof Error ? error.message : error}`);
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log(`📊 Summary: Generated images for ${generated} posts`);
  console.log('═'.repeat(50) + '\n');
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
