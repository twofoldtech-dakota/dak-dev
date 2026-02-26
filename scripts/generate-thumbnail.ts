#!/usr/bin/env npx tsx
/**
 * Thumbnail Generation CLI
 *
 * Composites AI-generated art with branded overlay (gradient scrim, title text,
 * accent line, author name) to produce consistent blog post thumbnails.
 *
 * Usage:
 *   npm run thumbnail:create -- --slug my-post --source ./ai-art.png
 *   npm run thumbnail:create -- --slug my-post --source ./ai-art.png --accent "#00d4ff"
 *   npm run thumbnail:create -- --slug my-post --source ./ai-art.png --text "Custom Text"
 */

import fs from 'fs';
import path from 'path';
import {
  loadImage,
  processImage,
  compositeThumbnail,
  shortenTitle,
  IMAGE_SPECS,
} from '../lib/image-utils';
import { getPostBySlug } from '../lib/posts';
import { injectBlurPlaceholders } from '../lib/content-validation/blur-inject';

interface CliArgs {
  slug: string;
  source: string;
  text?: string;
  accent?: string;
}

function printUsage() {
  console.log(`
Thumbnail Generation CLI

Usage:
  npm run thumbnail:create -- --slug <slug> --source <path-or-url>

Options:
  --slug     Post slug (must match content/posts/<slug>.mdx)
  --source   Path or URL to AI-generated art image
  --text     Override thumbnail text (default: from frontmatter thumbnailText or auto-shortened title)
  --accent   Accent color (default: #00ff88). Examples: #00d4ff, #ff6b35, #a855f7

Examples:
  npm run thumbnail:create -- --slug my-post --source ./ai-art.png
  npm run thumbnail:create -- --slug my-post --source ./ai-art.png --accent "#00d4ff"
  npm run thumbnail:create -- --slug my-post --source ./ai-art.png --text "Build Agents"
`);
}

function parseArgs(): CliArgs | null {
  const argv = process.argv.slice(2);
  const args: Partial<CliArgs> = {};

  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--slug':
        args.slug = argv[++i];
        break;
      case '--source':
        args.source = argv[++i];
        break;
      case '--text':
        args.text = argv[++i];
        break;
      case '--accent':
        args.accent = argv[++i];
        break;
      case '--help':
      case '-h':
        printUsage();
        process.exit(0);
    }
  }

  if (!args.slug || !args.source) {
    return null;
  }

  return args as CliArgs;
}

async function main() {
  const args = parseArgs();
  if (!args) {
    console.error('Error: --slug and --source are required');
    printUsage();
    process.exit(1);
  }

  console.log('\n--- Thumbnail Generator ---');
  console.log(`Slug:   ${args.slug}`);
  console.log(`Source: ${args.source}`);

  // Look up post for title/thumbnailText
  const post = getPostBySlug(args.slug);
  if (!post) {
    console.error(`\nError: No post found at content/posts/${args.slug}.mdx`);
    console.error('Create the post file first, then run this script.');
    process.exit(1);
  }

  // Determine overlay text: CLI arg > frontmatter > auto-shortened title
  const overlayText =
    args.text ||
    post.frontmatter.thumbnailText ||
    shortenTitle(post.frontmatter.title);

  const accentColor = args.accent || '#00ff88';

  console.log(`Text:   "${overlayText}"`);
  console.log(`Accent: ${accentColor}`);

  // Load source image
  console.log('\nLoading source image...');
  const sourceBuffer = await loadImage(args.source);
  console.log(`  Loaded ${Math.round(sourceBuffer.length / 1024)}KB`);

  // Output directory
  const outputDir = path.join(process.cwd(), 'public', 'images', 'posts', args.slug);
  fs.mkdirSync(outputDir, { recursive: true });

  // Process both sizes
  const sizes = [
    { name: 'thumbnail', spec: IMAGE_SPECS.thumbnail, file: 'thumbnail.jpg' },
    { name: 'hero', spec: IMAGE_SPECS.hero, file: 'hero.jpg' },
  ] as const;

  for (const size of sizes) {
    console.log(`\nGenerating ${size.name} (${size.spec.width}x${size.spec.height})...`);

    // Resize source art to target dimensions
    const resized = await processImage(sourceBuffer, size.spec.width, size.spec.height);

    // Composite branded overlay
    const final = await compositeThumbnail(
      resized,
      size.spec.width,
      size.spec.height,
      overlayText,
      { accentColor }
    );

    // Save
    const outputPath = path.join(outputDir, size.file);
    fs.writeFileSync(outputPath, final);
    const sizeKB = Math.round(final.length / 1024);
    console.log(`  Saved: ${outputPath} (${sizeKB}KB)`);
  }

  // Generate and inject blur placeholders
  console.log('\nInjecting blur placeholders...');
  const blurResult = await injectBlurPlaceholders(args.slug);
  if (blurResult.errors.length > 0) {
    console.warn('  Blur injection warnings:');
    for (const err of blurResult.errors) {
      console.warn(`    - ${err}`);
    }
  }
  if (blurResult.updated) {
    const injected: string[] = [];
    if (blurResult.thumbnailInjected) injected.push('thumbnail');
    if (blurResult.heroInjected) injected.push('hero');
    console.log(`  Blur data injected into frontmatter (${injected.join(', ')})`);
  } else {
    console.log('  Blur data already present (or no changes needed)');
  }

  console.log('\nDone! Images saved to:');
  console.log(`  public/images/posts/${args.slug}/thumbnail.jpg`);
  console.log(`  public/images/posts/${args.slug}/hero.jpg\n`);
}

main().catch((error) => {
  console.error('\nError:', error instanceof Error ? error.message : error);
  process.exit(1);
});
