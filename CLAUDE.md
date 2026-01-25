# Dakota Smith Personal Blog

> High-performance Next.js blog with neo-brutalist design, built for speed and accessibility

**Status:** Ready to Execute | **Target Launch:** Q1 2026
**Owner:** Dakota Smith (@twofoldtech-dakota) | **Framework:** Next.js 16+

---

## Project Overview

A personal blog showcasing tech projects and engineering content, designed to demonstrate high-end front-end engineering skills while maintaining exceptional performance and accessibility.

### Core Goals

- **Performance:** Lighthouse scores 98+ across all categories
- **Accessibility:** WCAG 2.1 AA compliance minimum (targeting AAA)
- **Design:** Neo-brutalist dark aesthetic that feels engineered and innovative
- **Content:** Weekly tech/engineering articles with advanced code highlighting
- **SEO:** Comprehensive optimization with Schema.org structured data

---

## Technology Stack

### Core Framework
- **Next.js 16+** - App Router with SSG, Turbopack default
- **TypeScript** - Strict mode for type safety
- **React 19+** - Server Components, View Transitions, React Compiler

### Styling & Design
- **Tailwind CSS v3+** - JIT mode for optimal bundle size
- **Space Grotesk** - Primary font (Google Fonts, self-hosted)
- **Framer Motion** - Animations with tree-shaking (target <5KB)
- **Custom Components** - No UI library dependencies

### Content Management
- **MDX** - Enhanced Markdown with React component support
- **gray-matter** - Frontmatter parsing for post metadata
- **Shiki** - Advanced syntax highlighting with custom themes

### Features & Integrations
- **Giscus** - GitHub Discussions-based comments (async loaded)
- **Vercel Analytics** - Privacy-friendly page view tracking (no cookies)
- **next-seo** - Dynamic meta tag generation
- **@vercel/og** - OpenGraph image generation

### Development Tools
- **ESLint + Prettier** - Code quality and formatting
- **@next/bundle-analyzer** - Bundle size optimization
- **Lighthouse CI** - Performance monitoring

### Deployment
- **Vercel** - Hosting and CDN (Edge Network)
- **GitHub** - Source control and content backup
- **Vercel Domain** - Free *.vercel.app subdomain

---

## Design System

### Color Palette (Neo-Brutalist Dark)

```css
--background: #0A0A0A;  /* Near-black primary */
--surface: #333333;      /* Dark gray concrete */
--text: #F5F5F5;         /* High-contrast white */
--muted: #A9A9A9;        /* Raw metallic gray */
--accent: TBD;           /* High-contrast neon (to be defined) */
```

### Typography

```
Font Family:  Space Grotesk
Weights:      400 (Regular), 600 (Semibold), 700 (Bold)
Scale:        Tailwind default (0.875rem to 3.75rem)
Line Height:  1.5 (body), 1.2 (headings)
```

### Design Principles

1. **Raw & Unpolished** - Visible grid lines, thick borders (2-4px), no rounded corners
2. **High Contrast** - Sharp text (#F5F5F5 on #0A0A0A), geometric shadows
3. **Bold Typography** - Large headings, confident spacing
4. **Minimal Blur** - Hard shadows only, no soft gradients
5. **Accessibility First** - prefers-reduced-motion, ARIA labels, keyboard navigation

### Animation Guidelines

- **GPU-Accelerated** - Use `transform` and `opacity` with `will-change`
- **Motion Preferences** - Respect `prefers-reduced-motion` media query
- **Performance Budget** - Keep animation JS under 5KB total
- **Examples:**
  - Typewriter effect for post titles (CSS keyframes)
  - Glitchy hover effects on links (CSS filters/transforms)
  - Fade-in transitions (IntersectionObserver-triggered)
  - Parallax scrolling (requestAnimationFrame-optimized)

---

## Architecture Decisions

### 1. Static Site Generation (SSG)
All pages pre-rendered at build time for optimal performance. No server-side rendering except for dynamic comments.

```typescript
// pages/blog/[slug].tsx
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map(post => ({ slug: post.slug }));
}
```

### 2. MDX Content Pipeline
Posts stored as `.mdx` files in `/content/posts` with frontmatter metadata.

```yaml
---
title: "Building High-Performance Web Apps"
date: "2026-01-25"
excerpt: "Techniques for sub-second page loads"
slug: "high-performance-web-apps"
tags: ["performance", "nextjs", "optimization"]
thumbnail: "/images/posts/high-performance-web-apps/thumbnail.jpg"
hero: "/images/posts/high-performance-web-apps/hero.jpg"
published: true
---
```

### 3. Image Strategy
- 2 images per post (thumbnail 800x450, hero 1600x900)
- Stored in GitHub repo at `/public/images/posts/[slug]/`
- Next.js Image component with AVIF/WebP formats
- Blur placeholders generated at build time

### 4. Code Highlighting
Shiki with custom dark theme, supporting:
- Line numbers and line highlighting
- Diff syntax (`+` for additions, `-` for deletions)
- Copy-to-clipboard button
- 20+ programming languages

### 5. Comments System
Giscus (GitHub Discussions) loaded asynchronously:
```typescript
// Lazy load when comment section is in viewport
useEffect(() => {
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      loadGiscus();
    }
  });
  observer.observe(commentRef.current);
}, []);
```

### 6. SEO Implementation
- **Schema.org JSON-LD** - BlogPosting, BreadcrumbList, Person
- **Dynamic OpenGraph** - Images generated with @vercel/og
- **XML Sitemap** - Auto-generated at build time
- **robots.txt** - Allow all, link to sitemap
- **Canonical URLs** - Prevent duplicate content issues

---

## Performance Targets

| Metric | Target | Priority |
|--------|--------|----------|
| Lighthouse Performance | 98+ | Critical |
| Lighthouse Accessibility | 100 | Critical |
| Lighthouse Best Practices | 100 | High |
| Lighthouse SEO | 100 | High |
| Largest Contentful Paint (LCP) | < 2.0s | Critical |
| First Input Delay (FID) | < 50ms | Critical |
| Cumulative Layout Shift (CLS) | < 0.05 | Critical |
| Bundle Size (gzipped) | < 100KB | High |
| Time to Interactive (TTI) | < 2.0s | High |

### Optimization Strategies

1. **Code Splitting** - Dynamic imports for heavy components
2. **Tree Shaking** - Remove unused code with bundle analyzer
3. **Image Optimization** - AVIF/WebP with lazy loading
4. **Font Optimization** - Preload Space Grotesk with next/font
5. **Caching** - Aggressive cache headers via Vercel Edge Network
6. **Minimal JavaScript** - Static rendering wherever possible

---

## Content Structure

### Directory Layout

```
my-site/
├── app/                      # Next.js App Router pages
│   ├── page.tsx              # Homepage
│   ├── blog/
│   │   ├── page.tsx          # Blog listing
│   │   └── [slug]/page.tsx   # Individual post
│   ├── about/page.tsx        # About page
│   └── layout.tsx            # Root layout
├── components/               # React components
│   ├── ui/                   # Design system components
│   ├── layout/               # Header, Footer, etc.
│   └── blog/                 # Blog-specific components
├── content/                  # MDX content
│   └── posts/
│       ├── my-first-post.mdx
│       └── another-post.mdx
├── lib/                      # Utility functions
│   ├── posts.ts              # Post fetching logic
│   └── seo.ts                # SEO helpers
├── public/
│   └── images/
│       └── posts/
│           └── [slug]/
│               ├── thumbnail.jpg
│               └── hero.jpg
├── styles/
│   └── globals.css           # Tailwind imports
└── tailwind.config.ts        # Tailwind configuration
```

### Post Frontmatter Schema

```typescript
interface PostFrontmatter {
  title: string;              // Post title
  date: string;               // ISO 8601 date
  excerpt: string;            // Brief description (150-160 chars)
  slug: string;               // URL-friendly identifier
  tags: string[];             // Categories (e.g., ["ai", "hardware"])
  thumbnail: string;          // Path to thumbnail image
  hero: string;               // Path to hero image
  published: boolean;         // Draft vs published status
  author?: string;            // Optional (defaults to Dakota Smith)
  keywords?: string[];        // Optional SEO keywords
}
```

---

## Development Guidelines

### Code Style

- **TypeScript Strict Mode** - No implicit `any`, strict null checks
- **Functional Components** - Use hooks, avoid class components
- **Component Organization** - One component per file, named exports
- **Naming Conventions:**
  - Components: PascalCase (`BlogCard.tsx`)
  - Utilities: camelCase (`getPosts.ts`)
  - Constants: UPPER_SNAKE_CASE (`MAX_POSTS_PER_PAGE`)

### Accessibility Checklist

- [ ] All images have `alt` text
- [ ] Color contrast ratio ≥ 4.5:1 (WCAG AA)
- [ ] Keyboard navigation works for all interactive elements
- [ ] `prefers-reduced-motion` respected for animations
- [ ] ARIA labels on icon-only buttons
- [ ] Semantic HTML (`<article>`, `<nav>`, `<main>`)
- [ ] Focus indicators visible and high-contrast

### Performance Checklist

- [ ] Images use Next.js Image component
- [ ] Fonts preloaded with next/font
- [ ] Heavy components lazy-loaded
- [ ] Bundle analyzed with @next/bundle-analyzer
- [ ] Lighthouse CI passes in production

### Git Workflow

1. **Branch Strategy** - `main` branch for production, feature branches for development
2. **Commit Messages** - Conventional Commits format (`feat:`, `fix:`, `docs:`)
3. **Content Workflow** - Add MDX files to `/content/posts`, commit, and push to deploy

---

## UI Development Workflow

### Pencil.dev Integration

This project uses [Pencil.dev](https://www.pencil.dev) MCP for visual UI design and verification. Pencil provides a bidirectional design canvas that integrates directly with Claude Code.

#### Setup (Per Session)

1. **Launch Pencil desktop app** before starting Claude Code
2. Pencil auto-installs MCP tools when the app is running
3. Verify integration: run `/mcp` in Claude Code - should see Pencil tools

#### Workflow for UI Components

1. **Design first**: Create/select the component design in Pencil canvas
2. **Generate code**: Use Claude Code with prompts like:
   - "Generate React/Tailwind/NextJS code from the selected frame"
   - "Create a React component based on the selected frame"
   - "Update CSS based on the variables in the design"
3. **Verify**: Before marking task complete, confirm implementation matches Pencil design

#### Required Verification for UI Tasks (Epics 3 & 4)

UI tasks require visual verification against Pencil designs:

- [ ] Pencil MCP tools available (`/mcp` shows Pencil)
- [ ] Component visually matches Pencil canvas design
- [ ] Neo-brutalist styling applied correctly:
  - Thick borders (2-4px)
  - Hard shadows (no blur)
  - Background: `#0A0A0A`
  - Text: `#F5F5F5`
  - Font: Space Grotesk
- [ ] Accessibility requirements met (contrast, focus states, keyboard nav)

#### Notes

- Keep Pencil running throughout the Claude Code session
- If Pencil tools disappear, restart Pencil app then restart Claude Code
- Pencil verification is **warning-only** - tasks can complete without it, but a warning will be logged

---

## Epic Breakdown

### Epic 1: Foundation & Project Setup (4-6 hours)
Initialize Next.js project, configure TypeScript and Tailwind CSS, set up MDX pipeline, establish Space Grotesk typography system, create sample posts.

**Stories:** 5 | **Priority:** 1

### Epic 2: Advanced Code Highlighting System (5-7 hours)
Implement Shiki with custom dark theme, line numbers, line highlighting, diff support, and copy-to-clipboard functionality.

**Stories:** 4 | **Priority:** 2

### Epic 3: Core UI Components & Design System (8-10 hours)
Build reusable UI components with neo-brutalist aesthetic, create responsive navigation, implement Framer Motion animations with motion preferences.

**Stories:** 8 | **Priority:** 3

### Epic 4: Blog Pages & Content Display (7-9 hours)
Build homepage with hero and recent posts, blog listing with pagination, dynamic post pages with hero images, tag filtering system, about page.

**Stories:** 7 | **Priority:** 4

### Epic 5: SEO, Analytics & Comments Integration (5-7 hours)
Implement Schema.org JSON-LD, dynamic OpenGraph images, XML sitemap, Giscus comments (lazy-loaded), Vercel Analytics.

**Stories:** 7 | **Priority:** 5

### Epic 6: Performance Optimization & Deployment (6-8 hours)
Bundle optimization, image optimization with blur placeholders, Lighthouse audits (target 98+), WCAG compliance, Vercel production deployment.

**Stories:** 11 | **Priority:** 6

**Total:** 47 stories | 35-47 hours | 6 epics

---

## Key Decisions & Clarifications

### Content Strategy
- ✅ **Fresh start** - No existing content to migrate
- ✅ **Single author** - Dakota Smith only (no guest posts)
- ✅ **Weekly cadence** - Publish-when-ready workflow
- ✅ **GitHub storage** - 2 images per post (thumbnail + hero)

### Technical Decisions
- ✅ **No dynamic backend** - Static site only, mailto for contact
- ✅ **Advanced code blocks** - Shiki with full feature set
- ✅ **Free fonts** - Space Grotesk (Google Fonts, self-hosted)
- ✅ **Accessibility first** - Design wow-factor secondary

### Privacy & Analytics
- ✅ **Simple analytics** - Vercel Analytics (page views only)
- ✅ **No cookies** - No GDPR/cookie consent needed
- ✅ **Cookie-free commenting** - Giscus via GitHub auth

### Deployment
- ✅ **Vercel free domain** - *.vercel.app subdomain
- ✅ **Git-only backup** - GitHub as single source of truth
- ✅ **Automatic deployments** - Push to main triggers build

---

## Getting Started

### Prerequisites
- Node.js 20+ and npm/pnpm/yarn
- GitHub account (for Giscus comments)
- Vercel account (for deployment)

### Execution

To begin building, run:

```bash
/meta loop
```

This will execute **Epic 1: Foundation & Project Setup** autonomously.

### Progress Tracking

Check status anytime with:

```bash
/meta status
```

View detailed project overview:

```bash
cat .meta/PROJECT_OVERVIEW.md
```

---

## Useful Commands

| Command | Description |
|---------|-------------|
| `/meta loop` | Execute next Epic |
| `/meta loop <epic_id>` | Execute specific Epic |
| `/meta status` | View progress summary |
| `/meta plan` | Re-enter planning mode |
| `/meta export` | Generate markdown documentation |

---

## Resources

- **Project Plan:** `.meta/plan.json`
- **Epic Definitions:** `.meta/epics/epic_*.json`
- **Clarifications:** `.meta/clarifications.json`
- **Progress Tracking:** `.meta/progress.json`

---

## License

Personal project - All rights reserved by Dakota Smith

---

*Generated by Claude Code Meta-Orchestrator on 2026-01-25*
