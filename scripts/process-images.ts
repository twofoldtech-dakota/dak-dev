#!/usr/bin/env npx tsx
/**
 * Image Processing CLI Tool
 *
 * Process images for blog posts - resize, optimize, and generate blur placeholders.
 *
 * Usage:
 *   npm run images:process -- --slug my-post --source ./image.jpg
 *   npm run images:process -- --slug my-post --source "https://example.com/image.jpg"
 *   npm run images:validate
 *   npm run images:check
 */

import fs from 'fs';
import path from 'path';
import {
  loadImage,
  processPostImages,
  validateImageSpec,
  getImageMetadata,
  postImagesExist,
  getPostImageDir,
  IMAGE_SPECS,
  type ProcessedImage,
} from '../lib/image-utils';
import { getAllSlugs, getPostBySlug } from '../lib/posts';

const COMMANDS = ['process', 'validate', 'check'] as const;
type Command = (typeof COMMANDS)[number];

interface ProcessArgs {
  slug: string;
  source: string;
}

function printUsage() {
  console.log(`
Image Processing CLI

Usage:
  npm run images:process -- --slug <slug> --source <path-or-url>
  npm run images:validate
  npm run images:check

Commands:
  process   - Process a source image into thumbnail and hero versions
  validate  - Validate all post images meet specifications
  check     - Check which posts are missing images

Examples:
  npm run images:process -- --slug my-new-post --source ./photo.jpg
  npm run images:process -- --slug my-new-post --source "https://picsum.photos/2000/1500"
  npm run images:validate
  npm run images:check
`);
}

function parseArgs(): { command: Command; args: Partial<ProcessArgs>; ci: boolean } {
  const argv = process.argv.slice(2);

  // Determine command from npm script name, environment variable, or first arg
  let command: Command = 'process';
  const npmEvent = process.env.npm_lifecycle_event || '';
  const ci = argv.includes('--ci');

  if (npmEvent.includes('validate') || argv.includes('--validate') || argv.includes('validate')) {
    command = 'validate';
  } else if (npmEvent.includes('check') || argv.includes('--check') || argv.includes('check')) {
    command = 'check';
  }

  const args: Partial<ProcessArgs> = {};

  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--slug':
        args.slug = argv[++i];
        break;
      case '--source':
        args.source = argv[++i];
        break;
      case '--help':
      case '-h':
        printUsage();
        process.exit(0);
    }
  }

  return { command, args, ci };
}

async function processCommand(args: ProcessArgs) {
  console.log('\n🖼️  Image Processing');
  console.log('═'.repeat(50));
  console.log(`Slug: ${args.slug}`);
  console.log(`Source: ${args.source}`);
  console.log('═'.repeat(50));

  try {
    // Load source image
    console.log('\n📥 Loading source image...');
    const sourceBuffer = await loadImage(args.source);
    console.log(`   Loaded ${Math.round(sourceBuffer.length / 1024)}KB`);

    // Process images
    console.log('\n🔄 Processing images...');
    const result = await processPostImages(args.slug, sourceBuffer);

    // Display results
    console.log('\n✅ Images processed successfully!\n');
    displayImageResult('Thumbnail', result.thumbnail);
    displayImageResult('Hero', result.hero);

    // Output blur data for frontmatter
    console.log('\n📋 Frontmatter blur data (copy to your MDX file):');
    console.log('─'.repeat(50));
    console.log(`thumbnail: "${result.thumbnail.path}"`);
    console.log(`thumbnailBlur: "${result.thumbnail.blurDataURL}"`);
    console.log(`hero: "${result.hero.path}"`);
    console.log(`heroBlur: "${result.hero.blurDataURL}"`);
    console.log('─'.repeat(50));

    // Check if post exists and offer to show where to add
    const post = getPostBySlug(args.slug);
    if (post) {
      console.log(`\n💡 Post found at: content/posts/${args.slug}.mdx`);
      console.log('   Add the blur fields to your frontmatter to enable blur placeholders.');
    } else {
      console.log(`\n💡 No post found with slug "${args.slug}"`);
      console.log('   Create your post file at: content/posts/' + args.slug + '.mdx');
    }

    console.log('\n');
  } catch (error) {
    console.error('\n❌ Error processing images:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

function displayImageResult(type: string, image: ProcessedImage) {
  console.log(`📷 ${type}:`);
  console.log(`   Path: ${image.path}`);
  console.log(`   Size: ${image.metadata.width}x${image.metadata.height} (${image.metadata.sizeKB}KB)`);
  console.log(`   Blur: ${image.blurDataURL.substring(0, 50)}...`);
}

async function validateCommand(ci: boolean = false) {
  console.log('\n🔍 Image Validation Report');
  console.log('═'.repeat(50));
  console.log(`Date: ${new Date().toISOString().split('T')[0]}`);
  console.log('═'.repeat(50));

  const slugs = getAllSlugs();
  let totalIssues = 0;
  let totalWarnings = 0;
  let postsChecked = 0;

  for (const slug of slugs) {
    const post = getPostBySlug(slug);
    if (!post?.frontmatter.published) continue;

    postsChecked++;
    const imageDir = getPostImageDir(slug);
    const thumbnailPath = path.join(imageDir, 'thumbnail.jpg');
    const heroPath = path.join(imageDir, 'hero.jpg');

    console.log(`\n📝 ${post.frontmatter.title}`);

    // Check thumbnail
    if (fs.existsSync(thumbnailPath)) {
      const issues = await validateImageSpec(thumbnailPath, IMAGE_SPECS.thumbnail);
      if (issues.length === 0) {
        const meta = await getImageMetadata(thumbnailPath);
        console.log(`   ✅ Thumbnail: ${meta.width}x${meta.height} (${meta.sizeKB}KB)`);
      } else {
        for (const issue of issues) {
          const icon = issue.type === 'error' ? '❌' : '⚠️';
          console.log(`   ${icon} Thumbnail: ${issue.message}`);
          if (issue.type === 'error') totalIssues++;
          else totalWarnings++;
        }
      }
    } else {
      console.log('   ❌ Thumbnail: Missing');
      totalIssues++;
    }

    // Check hero
    if (fs.existsSync(heroPath)) {
      const issues = await validateImageSpec(heroPath, IMAGE_SPECS.hero);
      if (issues.length === 0) {
        const meta = await getImageMetadata(heroPath);
        console.log(`   ✅ Hero: ${meta.width}x${meta.height} (${meta.sizeKB}KB)`);
      } else {
        for (const issue of issues) {
          const icon = issue.type === 'error' ? '❌' : '⚠️';
          console.log(`   ${icon} Hero: ${issue.message}`);
          if (issue.type === 'error') totalIssues++;
          else totalWarnings++;
        }
      }
    } else {
      console.log('   ❌ Hero: Missing');
      totalIssues++;
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('📊 Summary');
  console.log('═'.repeat(50));
  console.log(`Posts checked: ${postsChecked}`);
  console.log(`Errors: ${totalIssues} ❌`);
  console.log(`Warnings: ${totalWarnings} ⚠️`);

  if (totalIssues === 0 && totalWarnings === 0) {
    console.log('\n✅ All images pass validation!\n');
  } else {
    console.log('\n💡 Run `npm run images:process` to fix image issues.\n');
    if (ci && totalIssues > 0) {
      process.exit(1);
    }
  }
}

async function checkCommand() {
  console.log('\n📋 Missing Images Report');
  console.log('═'.repeat(50));

  const slugs = getAllSlugs();
  const missing: { slug: string; title: string; thumbnail: boolean; hero: boolean }[] = [];

  for (const slug of slugs) {
    const post = getPostBySlug(slug);
    if (!post) continue;

    const exists = postImagesExist(slug);
    if (!exists.thumbnail || !exists.hero) {
      missing.push({
        slug,
        title: post.frontmatter.title,
        thumbnail: exists.thumbnail,
        hero: exists.hero,
      });
    }
  }

  if (missing.length === 0) {
    console.log('\n✅ All posts have images!\n');
    return;
  }

  console.log(`\nFound ${missing.length} posts with missing images:\n`);

  for (const post of missing) {
    console.log(`📝 ${post.title}`);
    console.log(`   Slug: ${post.slug}`);
    console.log(`   Missing: ${!post.thumbnail ? 'thumbnail' : ''}${!post.thumbnail && !post.hero ? ', ' : ''}${!post.hero ? 'hero' : ''}`);
    console.log(`   Fix: npm run images:process -- --slug ${post.slug} --source <image-path>\n`);
  }

  console.log('═'.repeat(50));
  console.log(`Total: ${missing.length} posts need images\n`);
}

async function main() {
  const { command, args, ci } = parseArgs();

  switch (command) {
    case 'process':
      if (!args.slug || !args.source) {
        console.error('Error: --slug and --source are required for processing');
        printUsage();
        process.exit(1);
      }
      await processCommand(args as ProcessArgs);
      break;

    case 'validate':
      await validateCommand(ci);
      break;

    case 'check':
      await checkCommand();
      break;

    default:
      printUsage();
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
