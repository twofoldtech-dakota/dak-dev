# Thumbnail Generation System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a standardized thumbnail generation system that composites AI-generated art with branded text overlays using Sharp.

**Architecture:** A CLI script (`scripts/generate-thumbnail.ts`) reads post frontmatter, loads AI art, and composites a branded overlay (gradient scrim + punchy tagline + accent line + author name) using Sharp's SVG composite. A prompt template library (`.content/brand/thumbnail-prompts.md`) standardizes the AI art generation style.

**Tech Stack:** Sharp (SVG composite, image resize), TypeScript, tsx runner, Space Grotesk font (base64 embedded in SVG)

---

### Task 1: Download Space Grotesk font file for SVG embedding

The compositing script renders text via SVG overlays. Sharp uses librsvg internally, which supports `@font-face` with base64 data URIs. We need the actual font file.

**Files:**
- Create: `scripts/fonts/SpaceGrotesk-Bold.ttf`

**Step 1: Download the font**

Run:
```bash
mkdir -p scripts/fonts && curl -L -o scripts/fonts/SpaceGrotesk-Bold.ttf "https://github.com/floriankarsten/space-grotesk/raw/master/fonts/ttf/SpaceGrotesk-Bold.ttf"
```

If the direct GitHub URL doesn't work, download from Google Fonts:
```bash
curl -L -o /tmp/space-grotesk.zip "https://fonts.google.com/download?family=Space+Grotesk" && unzip -o /tmp/space-grotesk.zip -d /tmp/space-grotesk && cp /tmp/space-grotesk/static/SpaceGrotesk-Bold.ttf scripts/fonts/SpaceGrotesk-Bold.ttf
```

**Step 2: Verify the font file exists and is valid**

Run: `file scripts/fonts/SpaceGrotesk-Bold.ttf`
Expected: Output containing "TrueType" or "font"

**Step 3: Add to .gitignore consideration**

The font file (~50KB) is small enough to commit. No gitignore needed.

---

### Task 2: Add `thumbnailText` to PostFrontmatter interface

**Files:**
- Modify: `lib/posts.ts:6-19` (PostFrontmatter interface)

**Step 1: Add the optional field**

In `lib/posts.ts`, add `thumbnailText` to the `PostFrontmatter` interface:

```typescript
export interface PostFrontmatter {
  title: string;
  date: string;
  excerpt: string;
  slug: string;
  tags: string[];
  thumbnail: string;
  thumbnailBlur?: string;
  hero: string;
  heroBlur?: string;
  published: boolean;
  author?: string;
  keywords?: string[];
  thumbnailText?: string;  // Short 1-5 word tagline for thumbnail overlay
}
```

**Step 2: Verify build still works**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No new errors (there may be pre-existing ones — just confirm no new ones from this change)

**Step 3: Commit**

```bash
git add lib/posts.ts
git commit -m "feat: add thumbnailText optional field to PostFrontmatter"
```

---

### Task 3: Add `compositeThumbnail()` function to image-utils.ts

This is the core compositing function. It takes a resized image buffer and overlays the branded text/gradient scrim using Sharp's SVG composite.

**Files:**
- Modify: `lib/image-utils.ts` (add new function at end of file)

**Step 1: Write the compositing function**

Add to the end of `lib/image-utils.ts`:

```typescript
/**
 * Generate an SVG overlay with gradient scrim, accent line, title text, and author branding.
 * Uses base64-embedded Space Grotesk font for consistent rendering via librsvg.
 */
export async function compositeThumbnail(
  imageBuffer: Buffer,
  width: number,
  height: number,
  text: string,
  options?: { accentColor?: string }
): Promise<Buffer> {
  const accentColor = options?.accentColor || '#00ff88';

  // Load and base64-encode the font for SVG embedding
  const fontPath = path.join(__dirname, '..', 'scripts', 'fonts', 'SpaceGrotesk-Bold.ttf');
  let fontBase64 = '';
  if (fs.existsSync(fontPath)) {
    fontBase64 = fs.readFileSync(fontPath).toString('base64');
  }

  // Scale text sizes proportionally
  const titleFontSize = Math.round(width * 0.05);     // ~40px at 800w, ~80px at 1600w
  const brandFontSize = Math.round(width * 0.02);     // ~16px at 800w, ~32px at 1600w
  const accentHeight = Math.round(height * 0.009);    // ~4px at 450h, ~8px at 900h
  const padding = Math.round(width * 0.05);            // ~40px at 800w, ~80px at 1600w
  const scrimHeight = Math.round(height * 0.40);       // 40% of image height

  // Position calculations (from bottom)
  const brandY = height - padding;
  const titleY = brandY - Math.round(brandFontSize * 1.8);
  const accentY = titleY - Math.round(titleFontSize * 1.3);

  const fontFace = fontBase64
    ? `@font-face {
        font-family: 'Space Grotesk';
        src: url(data:font/ttf;base64,${fontBase64}) format('truetype');
        font-weight: 700;
      }`
    : '';

  const fontFamily = fontBase64
    ? "'Space Grotesk', sans-serif"
    : "system-ui, -apple-system, sans-serif";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <style>${fontFace}</style>
      <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(0,0,0,0)" />
        <stop offset="40%" stop-color="rgba(0,0,0,0.4)" />
        <stop offset="100%" stop-color="rgba(0,0,0,0.85)" />
      </linearGradient>
    </defs>

    <!-- Gradient scrim over bottom portion -->
    <rect x="0" y="${height - scrimHeight}" width="${width}" height="${scrimHeight}" fill="url(#scrim)" />

    <!-- Accent line -->
    <rect x="${padding}" y="${accentY}" width="${width - padding * 2}" height="${accentHeight}" fill="${accentColor}" />

    <!-- Title text -->
    <text x="${padding}" y="${titleY}"
      font-family="${fontFamily}" font-size="${titleFontSize}" font-weight="700"
      fill="#F5F5F5" letter-spacing="-0.02em">
      ${escapeXml(text)}
    </text>

    <!-- Author branding -->
    <text x="${width - padding}" y="${brandY}"
      font-family="${fontFamily}" font-size="${brandFontSize}" font-weight="600"
      fill="#A9A9A9" text-anchor="end">
      Dakota Smith
    </text>
  </svg>`;

  return sharp(imageBuffer)
    .composite([{
      input: Buffer.from(svg),
      top: 0,
      left: 0,
    }])
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
}

/** Escape special XML characters for safe SVG embedding */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Auto-shorten a post title to ~3-4 significant words for thumbnail text.
 * Strips common filler words and takes the first meaningful words.
 */
export function shortenTitle(title: string): string {
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'can', 'shall', 'my', 'your', 'our',
    'how', 'why', 'what', 'when', 'where', 'i',
  ]);

  // Remove text after colon (subtitle) and split into words
  const mainTitle = title.split(':')[0].trim();
  const words = mainTitle.split(/\s+/);

  // Filter stop words but keep first word always
  const significant = words.filter((w, i) =>
    i === 0 || !stopWords.has(w.toLowerCase())
  );

  // Take first 3-4 significant words
  const maxWords = significant.length <= 4 ? significant.length : 3;
  return significant.slice(0, maxWords).join(' ');
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No new errors from the added functions

**Step 3: Commit**

```bash
git add lib/image-utils.ts
git commit -m "feat: add compositeThumbnail() and shortenTitle() to image-utils"
```

---

### Task 4: Create the generate-thumbnail CLI script

**Files:**
- Create: `scripts/generate-thumbnail.ts`

**Step 1: Write the CLI script**

```typescript
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
  generateBlurPlaceholder,
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
  if (blurResult.updated) {
    console.log('  Blur data injected into frontmatter');
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
```

**Step 2: Add npm script to package.json**

In `package.json`, add to the `"scripts"` section:

```json
"thumbnail:create": "npx tsx scripts/generate-thumbnail.ts"
```

**Step 3: Verify script runs with --help**

Run: `npx tsx scripts/generate-thumbnail.ts --help`
Expected: Usage text prints without errors

**Step 4: Commit**

```bash
git add scripts/generate-thumbnail.ts package.json
git commit -m "feat: add thumbnail generation CLI script"
```

---

### Task 5: Test the compositing pipeline end-to-end

**Files:**
- None (testing existing files)

**Step 1: Pick a test post and a source image**

Use an existing post that already has images as a test. We'll generate into a temp directory first.

Run:
```bash
npx tsx scripts/generate-thumbnail.ts --slug building-apl-autonomous-coding-agent --source public/images/posts/building-apl-autonomous-coding-agent/hero.jpg --text "Build an Agent"
```

Expected: Script completes, overwrites existing thumbnail/hero with composited versions.

**Step 2: Visually inspect the output**

Open the generated images to verify:
- AI art is visible as the background
- Gradient scrim darkens the bottom
- "Build an Agent" text is readable in white
- Green accent line appears above the title
- "Dakota Smith" appears bottom-right in gray

Run: `open public/images/posts/building-apl-autonomous-coding-agent/thumbnail.jpg`

**Step 3: Verify image specs pass validation**

Run: `npm run images:validate 2>&1 | grep -A 3 "Building APL"`
Expected: Thumbnail and Hero both show checkmarks (800x450 and 1600x900)

**Step 4: If the test looks good, revert the test images**

Run: `git checkout -- public/images/posts/building-apl-autonomous-coding-agent/`

This restores the original images. We don't want to commit composited versions of existing posts without intent.

---

### Task 6: Create the AI prompt template library

**Files:**
- Create: `.content/brand/thumbnail-prompts.md`

**Step 1: Write the prompt template document**

Create `.content/brand/thumbnail-prompts.md` with the base prompt, topic variants, and usage instructions. Content should include:

- **Base prompt** (always included): dark, moody, neo-brutalist, geometric, high contrast, #0A0A0A background, one neon accent, 16:9, bottom 25% dark for overlay zone
- **12 topic variants** with specific visual elements:
  - AI / Agents
  - DevTools / Workflow
  - Web / Frontend
  - Hardware / Setup
  - Performance / Optimization
  - Open Source / Community
  - Career / Growth
  - Architecture / Systems
  - Security / Privacy
  - Data / APIs
  - Mobile / Apps
  - Cloud / Infrastructure
- **Usage instructions**: copy base prompt + topic variant into AI tool, generate, download, run CLI
- **Accent color guide**: which accent color works best with which topic
- **Quality checklist**: verify before feeding to CLI (dark bottom zone, 16:9ish, high contrast)

**Step 2: Commit**

```bash
git add .content/brand/thumbnail-prompts.md
git commit -m "feat: add AI prompt template library for thumbnail generation"
```

---

### Task 7: Final integration commit and documentation

**Files:**
- Modify: `docs/plans/2026-02-26-thumbnail-generation-system-design.md` (mark as implemented)

**Step 1: Update design doc status**

Change the status line from `Approved` to `Implemented`.

**Step 2: Verify the full workflow end-to-end**

Run the complete workflow as a user would:

```bash
# 1. Check a post exists
cat content/posts/building-apl-autonomous-coding-agent.mdx | head -5

# 2. Generate thumbnail with composited overlay
npx tsx scripts/generate-thumbnail.ts --slug building-apl-autonomous-coding-agent --source public/images/posts/building-apl-autonomous-coding-agent/hero.jpg --text "Build an Agent" --accent "#00d4ff"

# 3. Verify output
file public/images/posts/building-apl-autonomous-coding-agent/thumbnail.jpg
file public/images/posts/building-apl-autonomous-coding-agent/hero.jpg
```

**Step 3: Revert test images (don't commit composited versions of existing posts)**

```bash
git checkout -- public/images/posts/
```

**Step 4: Final commit**

```bash
git add docs/plans/2026-02-26-thumbnail-generation-system-design.md
git commit -m "docs: mark thumbnail generation system as implemented"
```
