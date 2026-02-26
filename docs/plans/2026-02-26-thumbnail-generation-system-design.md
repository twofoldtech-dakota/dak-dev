# Thumbnail Generation System Design

**Date:** 2026-02-26
**Status:** Implemented
**Goal:** Standardized, consistent blog post thumbnails with AI-generated art and branded compositing

---

## Problem

Each blog post thumbnail is generated ad-hoc with different AI tools, prompts, and styles. No consistent visual identity across posts. No standardized process for adding branding/text overlay.

## Solution

A two-part system:

1. **AI Prompt Template Library** — standardized prompts ensuring cohesive visual style
2. **Sharp Compositing CLI** — takes AI art and composites a branded overlay (gradient scrim, short punchy text, accent line, author name)

## Architecture

### Part 1: Prompt Template Library

**Location:** `.content/brand/thumbnail-prompts.md`

**Base prompt (included in every generation):**

```
Style: dark, moody digital illustration on near-black (#0A0A0A) background.
Aesthetic: neo-brutalist, geometric, high contrast. Sharp edges, no soft gradients.
Limited color palette — primarily dark grays with one neon accent color
(#00ff88 green, #00d4ff cyan, or #ff6b35 orange).
Mood: technical, engineered, minimal. Think circuit boards, grid patterns,
architectural blueprints.
Composition: leave the bottom 25% relatively dark/simple (text overlay zone).
Aspect ratio: 16:9
```

**Topic variants:**

| Category | Visual Elements |
|----------|----------------|
| AI / Agents | Neural network nodes, glowing connection lines, brain circuitry |
| DevTools / Workflow | Terminal windows, code fragments, command line interfaces |
| Web / Frontend | Browser wireframes, grid layouts, CSS geometric shapes |
| Hardware / Setup | Abstract device outlines, schematics, component diagrams |
| Performance | Speed lines, gauges, data flow visualizations, metrics dashboards |
| Open Source | Interconnected nodes, branching trees, collaborative networks |
| Career / Growth | Ascending structures, stairways, building blocks, scaffolding |
| Architecture | System diagrams, layered structures, modular blocks |
| Security | Lock mechanisms, shield patterns, encrypted data streams |
| Data / APIs | Pipeline flows, connected endpoints, JSON tree structures |
| Mobile / Apps | Device frames, gesture paths, notification patterns |
| Cloud / Infrastructure | Server racks, network topology, container visualizations |

### Part 2: Compositing Script

**Location:** `scripts/generate-thumbnail.ts`
**Command:** `npm run thumbnail:create <slug> <source-image-path>`

**Pipeline:**

1. Read post frontmatter from `content/posts/<slug>.mdx`
2. Extract `thumbnailText` field (or auto-shorten title to ~3-4 words)
3. Load source AI art image
4. Resize to target dimensions (800x450 for thumbnail, 1600x900 for hero)
5. Composite overlay layers:
   - **Gradient scrim:** transparent → `rgba(0, 0, 0, 0.75)` over bottom ~35%
   - **Accent line:** 4px horizontal line in `#00ff88` above the text
   - **Thumbnail text:** 1-5 word punchy tagline in Space Grotesk Bold, white
   - **Author branding:** "Dakota Smith" in small muted text, bottom-right
6. Save as JPEG to `public/images/posts/<slug>/thumbnail.jpg` and `hero.jpg`
7. Generate blur placeholders and inject into frontmatter

**Overlay layout (800x450):**

```
┌─────────────────────────────────────────────┐
│                                             │
│            AI-Generated Art                 │
│           (full bleed, 16:9)                │
│                                             │
│                                             │
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│ ━━━━━━━━━━━━━━━━━━━━━━━ (#00ff88 accent)   │
│ PUNCHY TAGLINE                              │
│ (Space Grotesk Bold)          Dakota Smith  │
└─────────────────────────────────────────────┘
  gradient scrim zone (~35% height)
```

### Part 3: Frontmatter Addition

New optional field in post frontmatter:

```yaml
thumbnailText: "Build an Agent"  # optional, 1-5 words
```

If omitted, the script auto-generates a shortened version from the title (first 3-4 significant words).

## Integration Points

- **Existing:** Reuses `lib/image-utils.ts` — `processImage()`, `generateBlurPlaceholder()`, `IMAGE_SPECS`
- **Existing:** Reuses `lib/content-validation/blur-inject.ts` for frontmatter blur injection
- **New npm script:** `thumbnail:create` in `package.json`
- **Font:** Space Grotesk loaded from `public/fonts/` or system for SVG rendering

## Workflow

```
1. Decide post topic → pick matching topic variant from prompt library
2. Copy base prompt + topic variant into AI image tool (Gemini, DALL-E, etc.)
3. Generate image, download it
4. Run: npm run thumbnail:create my-post-slug ./path/to/downloaded-art.png
5. Both thumbnail (800x450) + hero (1600x900) saved with blur placeholders
```

## Technical Notes

- All compositing via Sharp `composite()` with SVG overlays for text and gradient
- SVG text rendering uses inline font specification for Space Grotesk
- Gradient scrim is an SVG `<linearGradient>` composited as a layer
- Zero new dependencies — Sharp is already in the project
- Script is TypeScript, run via `tsx` (already a dev dependency)

## Files to Create/Modify

| File | Action |
|------|--------|
| `.content/brand/thumbnail-prompts.md` | Create — prompt template library |
| `scripts/generate-thumbnail.ts` | Create — compositing CLI script |
| `lib/image-utils.ts` | Extend — add `compositeThumbnail()` function |
| `package.json` | Add `thumbnail:create` script |
| `content/posts/*.mdx` | Optional — add `thumbnailText` to existing posts |
