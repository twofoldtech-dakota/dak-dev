# Combined About Page Design

**Date:** 2026-02-25
**Status:** Approved
**Goal:** Merge Tools, About, and Contact into a single scrolling page

---

## Motivation

- Reduce nav clutter (6 items to 4)
- Create a narrative flow: who I am → what I know → what I've built → how to reach me
- Simplify maintenance (one page instead of three)
- Make a stronger portfolio impression as a single cohesive page

## Route

`/about` — replaces `/about`, `/tools`, and `/contact`

## Page Structure

### 1. Hero / Intro

- Name (H1), role subtitle, location (Kansas City, MO)
- 2-3 sentences of personal intro — human, confident, not resume-speak
- Cut all resume content: executive summary, core competencies, work history, certifications, education, key innovations
- Text-only, no headshot

### 2. Skills

- Section heading: "What I Work With"
- Single group of styled tags/badges — no category groupings
- ~15-20 tags covering key technologies:
  - .NET Core, C#, TypeScript, React, Next.js, Node.js
  - Sitecore, Optimizely, GraphQL, PostgreSQL, MongoDB
  - Docker, Azure, Vercel
  - AI Orchestration, System Architecture
- Neo-brutalist badge style: thick border, hard shadow

### 3. Tools

- Section heading: "Things I've Built"
- Full 9-product grid from `products.json`
- Reuse existing `ProductCard` component
- Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop

### 4. Contact

- Section heading: "Get In Touch"
- Brief inviting copy
- Email CTA button (`dakota@twofold.tech`) with neo-brutalist card styling
- GitHub and LinkedIn icons inline alongside the email button
- Social URLs pulled from same source as Header/Footer

## Navigation Changes

### Header

- Before: Home | Blog | Patterns | Tools | About | Contact
- After: Home | Blog | Patterns | About

### Footer

- Contact link updated to `/about#contact`

## Routing & Redirects

- `/tools` → 308 redirect to `/about#tools`
- `/contact` → 308 redirect to `/about#contact`
- Implemented in `next.config.ts`

## SEO

- Combined metadata for the single page
- Breadcrumb schema updated
- Resume schema retained (structured data value)
- Old tools/contact schemas removed

## Components

### Keep / Reuse

- `ProductCard` / `ProductCardList` — Tools section
- `PageTransition` — page wrapper
- `ScrollReveal` / `ScrollRevealItem` — section animations
- `JsonLd` — structured data

### Rework

- `SkillCategory` — replace with new tag/badge component (or restyle)

### Remove

- `ExperienceCard` — work history no longer displayed

## Files to Remove

- `app/tools/page.tsx`
- `app/contact/page.tsx`

## Anchor IDs

- `#tools` — Tools section
- `#contact` — Contact section
