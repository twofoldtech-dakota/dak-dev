# Dakota Smith Personal Blog - Project Plan

**Project ID:** proj_dakota_blog_2026
**Status:** Ready to Execute
**Created:** 2026-01-25
**Estimated Duration:** 35-47 hours

---

## Project Goal

Build a high-performance personal blog for Dakota Smith (@daksmitty) featuring:

- **Framework:** Next.js 16+ with App Router (SSG)
- **Design:** Neo-brutalist dark theme (#0A0A0A, #333333, #A9A9A9)
- **Performance:** Lighthouse 98+ scores across all categories
- **Accessibility:** WCAG 2.1 AA minimum (targeting AAA)
- **Content:** MDX-based with advanced code syntax highlighting
- **Features:** Giscus comments, Vercel Analytics, SEO optimization
- **Deployment:** Vercel (free *.vercel.app domain)

---

## Epic Breakdown

### Epic 1: Foundation & Project Setup
**Priority:** 1 | **Duration:** 4-6 hours | **Stories:** 5

Initialize Next.js project, configure TypeScript and Tailwind CSS, set up MDX pipeline, and establish typography system with Space Grotesk font.

**Key Deliverables:**
- Next.js 16+ with App Router and TypeScript
- Tailwind CSS with neo-brutalist theme configuration
- MDX content pipeline with frontmatter support
- Space Grotesk font optimization
- Sample blog posts for development

---

### Epic 2: Advanced Code Highlighting System
**Priority:** 2 | **Duration:** 5-7 hours | **Stories:** 4

Implement professional-grade syntax highlighting with Shiki, featuring line numbers, diff support, and copy-to-clipboard functionality.

**Key Deliverables:**
- Shiki integration with custom dark theme
- Line numbers and line highlighting
- Diff mode with accessible indicators
- Copy-to-clipboard button
- Support for 20+ programming languages

---

### Epic 3: Core UI Components & Design System
**Priority:** 3 | **Duration:** 8-10 hours | **Stories:** 8

Build reusable UI components with neo-brutalist aesthetic, create responsive navigation, and implement animation system with motion preferences.

**Key Deliverables:**
- Responsive header and footer
- Button, Card, and Tag components
- Framer Motion with prefers-reduced-motion support
- Page transitions and scroll animations
- Complete design system documentation

---

### Epic 4: Blog Pages & Content Display
**Priority:** 4 | **Duration:** 7-9 hours | **Stories:** 7

Build all blog pages including homepage, listing, individual posts, tag filtering, and about page with optimal SEO.

**Key Deliverables:**
- Homepage with hero and recent posts
- Blog listing with pagination (12 posts/page)
- Dynamic post pages with hero images
- Tag filtering system
- Table of contents generation
- About page with bio

---

### Epic 5: SEO, Analytics & Comments Integration
**Priority:** 5 | **Duration:** 5-7 hours | **Stories:** 7

Implement comprehensive SEO with Schema.org markup, integrate Giscus comments, and add privacy-friendly analytics.

**Key Deliverables:**
- Schema.org JSON-LD structured data
- Dynamic OpenGraph image generation
- XML sitemap and robots.txt
- Giscus comments with lazy loading
- Vercel Analytics (cookie-free)
- Optional analytics dashboard

---

### Epic 6: Performance Optimization & Deployment
**Priority:** 6 | **Duration:** 6-8 hours | **Stories:** 11

Optimize bundle size, conduct Lighthouse audits, ensure WCAG compliance, and configure production deployment.

**Key Deliverables:**
- Bundle optimization (<100KB gzipped)
- Image optimization with blur placeholders
- Lighthouse 98+ scores achieved
- Core Web Vitals optimized (LCP, FID, CLS)
- Accessibility audit passed (WCAG AA)
- Vercel deployment configured
- Production caching and security headers

---

## Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Lighthouse Performance | 98+ | Pending |
| Lighthouse Accessibility | 100 | Pending |
| Lighthouse Best Practices | 100 | Pending |
| Lighthouse SEO | 100 | Pending |
| Largest Contentful Paint (LCP) | < 2.0s | Pending |
| First Input Delay (FID) | < 50ms | Pending |
| Cumulative Layout Shift (CLS) | < 0.05 | Pending |
| Bundle Size (gzipped) | < 100KB | Pending |

---

## Technology Stack

### Core
- **Framework:** Next.js 16+ (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v3+
- **Content:** MDX with gray-matter

### UI & Design
- **Typography:** Space Grotesk (next/font/google)
- **Icons:** lucide-react or react-icons
- **Animations:** Framer Motion
- **Components:** Custom (no UI library)

### Features
- **Syntax Highlighting:** Shiki
- **Comments:** Giscus (GitHub Discussions)
- **Analytics:** Vercel Analytics
- **SEO:** next-seo, @vercel/og

### Development
- **Linting:** ESLint + Prettier
- **Type Checking:** TypeScript
- **Bundle Analysis:** @next/bundle-analyzer
- **Performance:** Lighthouse CI

### Deployment
- **Hosting:** Vercel
- **Domain:** *.vercel.app (free tier)
- **CDN:** Vercel Edge Network
- **Storage:** GitHub repository

---

## Design System

### Color Palette (Neo-Brutalist Dark)
```
Background:  #0A0A0A (near-black)
Surface:     #333333 (dark gray)
Text:        #A9A9A9 (light gray)
Accent:      TBD (high-contrast neon)
```

### Typography Scale
```
Font Family: Space Grotesk
Weights:     400 (Regular), 600 (Semibold), 700 (Bold)
Scale:       Tailwind default (text-sm to text-6xl)
```

### Brutalist Design Elements
- Hard shadows (no blur)
- Thick borders (2-4px)
- High contrast
- Bold typography
- Minimal gradients
- Sharp corners

---

## Content Structure

### Post Frontmatter Schema
```yaml
---
title: "Post Title"
date: "2026-01-25"
excerpt: "Brief description for previews"
slug: "post-slug"
tags: ["javascript", "nextjs"]
thumbnail: "/images/posts/post-slug/thumbnail.jpg"
hero: "/images/posts/post-slug/hero.jpg"
published: true
---
```

### Directory Structure
```
/content
  /posts
    /my-first-post.mdx
    /another-post.mdx
/public
  /images
    /posts
      /my-first-post
        thumbnail.jpg
        hero.jpg
```

---

## Architectural Decisions

1. **Next.js 16 App Router with Turbopack** - File-based routing, React Server Components
2. **Static Site Generation (SSG)** - All pages pre-rendered at build time
3. **MDX for Content** - Markdown with React components
4. **Shiki for Highlighting** - Build-time syntax highlighting
5. **Framer Motion** - Animations with reduced-motion support
6. **Giscus for Comments** - GitHub Discussions (no database)
7. **Vercel Analytics** - Privacy-friendly (no cookies)
8. **Tree-Shaken Bundles** - Optimal bundle size
9. **WCAG 2.1 AA** - Accessibility baseline
10. **Git-Based Backup** - GitHub as single source of truth

---

## Key Clarifications

- ✅ Fresh start (no content migration)
- ✅ Single author (Dakota only)
- ✅ Weekly publish-when-ready cadence
- ✅ GitHub storage (2 images per post)
- ✅ No dynamic backend features
- ✅ Advanced code syntax highlighting
- ✅ Accessibility-first approach
- ✅ Simple analytics (page views only)
- ✅ No cookies or GDPR compliance needed
- ✅ Vercel free domain initially

---

## Next Steps

To begin execution, run:

```bash
/meta loop
```

This will start **Epic 1: Foundation & Project Setup** and execute the first story.

---

## Progress Tracking

**Total Stories:** 47
**Completed:** 0
**Progress:** 0%

### Milestones
- [ ] Foundation Complete (Epic 1)
- [ ] Code Highlighting Live (Epic 2)
- [ ] Design System Complete (Epic 3)
- [ ] Blog Functional (Epic 4)
- [ ] SEO & Analytics Ready (Epic 5)
- [ ] Production Launch (Epic 6)

---

*Generated by Meta-Orchestrator on 2026-01-25*
