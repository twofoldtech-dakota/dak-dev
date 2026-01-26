# Dakota Smith Blog - Feature Enhancements Plan

> **Status:** Ready to Execute | **Created:** 2026-01-25
> **Total Stories:** 29 | **Estimated Effort:** 22-28 hours | **Epics:** 4

---

## Executive Summary

This plan enhances your existing high-performance blog with 9 new features to improve discoverability, user engagement, and SEO. All features maintain your current performance targets (Lighthouse 98+) and neo-brutalist design aesthetic.

### Features Being Added

**High Priority:**
- ✅ Client-side search across all blog posts
- ✅ Resume download functionality
- ✅ RSS feed for content syndication
- ✅ Related posts recommendations
- ✅ Reading progress indicator

**Medium Priority:**
- ✅ Social sharing buttons (Twitter/X, LinkedIn, native share)
- ✅ Newsletter signup
- ✅ Dark/Light mode toggle
- ✅ Improved internal linking for SEO

---

## Epic Breakdown

### Epic 007: Search & Discovery Features
**Priority:** 1 | **Stories:** 5 | **Estimated:** 6-8 hours

Improve content discoverability through client-side search and related post recommendations.

#### Features:
1. **Client-Side Search** (3 stories)
   - Generate search index at build time
   - Search UI with keyboard shortcut (Cmd/Ctrl+K)
   - Dedicated search results page

2. **Related Posts** (2 stories)
   - Tag-based recommendation algorithm
   - "You might also like" component at end of posts

**Key Decisions:**
- No backend required - fully client-side with JSON index
- Can start with simple string matching, upgrade to FlexSearch later if needed
- Search index kept under 50KB gzipped

---

### Epic 008: Content Syndication & Downloads
**Priority:** 2 | **Stories:** 4 | **Estimated:** 4-5 hours

Enable content syndication via RSS and resume downloads.

#### Features:
1. **RSS Feed** (2 stories)
   - Generate RSS 2.0 XML at build time
   - Auto-discovery links and subscribe button

2. **Resume Download** (2 stories)
   - Create/generate PDF resume
   - Enable download button on About page

**Key Decisions:**
- RSS feed statically generated (no runtime overhead)
- Resume can be static PDF for MVP (manual creation acceptable)
- Feed limited to 50 most recent posts

---

### Epic 009: Reading Experience Enhancements
**Priority:** 3 | **Stories:** 4 | **Estimated:** 5-6 hours

Enhance reader engagement with progress tracking and social sharing.

#### Features:
1. **Reading Progress Indicator** (2 stories)
   - Scroll-based progress bar at top of viewport
   - Neo-brutalist styling with smooth animation

2. **Social Sharing Buttons** (2 stories)
   - Twitter/X, LinkedIn, and native Web Share API
   - Positioned at end of posts or sticky sidebar

**Key Decisions:**
- Use IntersectionObserver for performance
- Respect prefers-reduced-motion
- Web Share API with fallback to manual links

---

### Epic 010: User Preferences & SEO Improvements
**Priority:** 4 | **Stories:** 7 | **Estimated:** 7-9 hours

Add theme toggle, newsletter signup, and improve SEO through internal linking.

#### Features:
1. **Dark/Light Mode Toggle** (3 stories)
   - Theme system with localStorage persistence
   - Light mode color palette (neo-brutalist)
   - Toggle UI in header (3-state: light/dark/system)

2. **Newsletter Signup** (1 story)
   - Email signup form (mailto for MVP)
   - Can upgrade to Buttondown/ConvertKit later

3. **Internal Linking** (3 stories)
   - Audit existing posts for linking opportunities
   - Add 2-3 internal links per post
   - Document linking guidelines for future posts

**Key Decisions:**
- Theme toggle prevents FOUC with inline script
- Light mode maintains WCAG AA contrast standards
- Newsletter starts with mailto, can upgrade later
- Internal linking is editorial work (not code-heavy)

---

## Architecture & Technical Decisions

### Performance Budget
- **Bundle Size Increase:** < 20KB gzipped total
- **Search Index:** < 50KB gzipped
- **Lighthouse Scores:** Maintain 98+ across all metrics
- **Interaction to Next Paint:** < 200ms for search/theme toggle

### Technology Choices
| Feature | Technology | Rationale |
|---------|------------|-----------|
| Search | JSON index + simple string matching | No backend, fast, can upgrade to FlexSearch later |
| RSS | Static generation at build time | Zero runtime overhead |
| Progress Bar | IntersectionObserver + Framer Motion | Performance-optimized, smooth animations |
| Theme Toggle | React Context + localStorage | Standard pattern, no FOUC |
| Sharing | Web Share API + fallback URLs | Progressive enhancement |

### Design System Updates

**Light Mode Palette:**
```css
--background-light: #F5F5F5;  /* Off-white */
--surface-light: #E0E0E0;      /* Light gray */
--text-light: #0A0A0A;         /* Near-black */
--muted-light: #666666;        /* Dark gray */
```

**Maintained Principles:**
- Thick borders (2-4px)
- Hard shadows (no blur)
- High contrast (4.5:1 minimum)
- No rounded corners

---

## Execution Plan

### To Start
```bash
/meta loop
```
This executes **Epic 007: Search & Discovery Features** autonomously.

### Between Epics
```bash
/meta status          # Check progress
/meta loop            # Execute next Epic
```

### Continuous
Each Epic executes autonomously via APL orchestrator. You control pacing by running `/meta loop` when ready for the next Epic.

---

## Story Summary by Epic

### Epic 007 (Search & Discovery)
- story_048: Create search index generation script
- story_049: Build search UI component
- story_050: Add search results page
- story_051: Build related posts algorithm
- story_052: Create RelatedPosts UI component

### Epic 008 (Syndication & Downloads)
- story_053: Create RSS feed generator
- story_054: Add RSS feed discovery links
- story_055: Create resume PDF export
- story_056: Add download button to About page

### Epic 009 (Reading Experience)
- story_057: Build scroll progress tracker
- story_058: Style progress bar with neo-brutalist design
- story_059: Create ShareButtons component
- story_060: Integrate ShareButtons into blog post layout

### Epic 010 (Preferences & SEO)
- story_061: Implement theme system with context
- story_062: Create light mode color palette
- story_063: Build theme toggle UI component
- story_064: Create newsletter signup component
- story_065: Audit posts for internal linking opportunities
- story_066: Add internal links to existing posts
- story_067: Create internal linking guideline

---

## Success Criteria

### Functional Requirements
- ✅ Search returns results within 300ms of typing
- ✅ RSS feed validates against RSS 2.0 spec
- ✅ Resume downloads successfully from About page
- ✅ Related posts appear on all blog post pages
- ✅ Reading progress bar tracks scroll accurately
- ✅ Social sharing works on all major platforms
- ✅ Theme toggle works without FOUC
- ✅ Each post has minimum 2 internal links

### Non-Functional Requirements
- ✅ Lighthouse Performance: 98+ (no regression)
- ✅ Lighthouse Accessibility: 100 (WCAG 2.1 AA minimum)
- ✅ Bundle size increase: < 20KB gzipped
- ✅ All features keyboard accessible
- ✅ All features respect prefers-reduced-motion

---

## Progress Tracking

### View Status
```bash
/meta status
```

### Detailed Metrics
- **Progress file:** `.meta/enhancements-progress.json`
- **Epic definitions:** `.meta/epics/epic_007.json` through `epic_010.json`
- **Plan overview:** `.meta/enhancements-plan.json`

---

## Risk Assessment

### Low Risk
- RSS feed generation (standard, well-documented)
- Resume download (simple file serving)
- Related posts algorithm (tag-based, straightforward)

### Medium Risk
- Theme toggle (FOUC prevention requires careful implementation)
- Search performance (index size must be optimized)
- Light mode colors (must maintain accessibility in both themes)

### Mitigation Strategies
- **Theme FOUC:** Inline script in <head> before hydration
- **Search performance:** Limit index to essential fields, debounce input
- **Light mode contrast:** Validate all colors against WCAG AA standards
- **Bundle size:** Code-split features, lazy load where possible

---

## Dependencies & Blockers

### External Dependencies
- None (all features use existing stack)

### Internal Dependencies
- Search UI requires search index (story_048 → story_049)
- RSS discovery requires RSS generator (story_053 → story_054)
- Resume button requires PDF file (story_055 → story_056)
- Related posts component requires algorithm (story_051 → story_052)
- Theme toggle UI requires theme system (story_061 → story_062 → story_063)

### Known Blockers
- **None identified** - all features implementable with current stack

---

## Future Enhancements (Out of Scope)

These were considered but deferred for later:
- Advanced fuzzy search with FlexSearch/Algolia
- Email newsletter integration with ConvertKit/Buttondown
- Comments on related posts
- Reading time estimates per section
- Table of contents with progress highlighting
- Print-friendly post layouts

---

## Commands Reference

| Command | Description |
|---------|-------------|
| `/meta loop` | Execute next Epic |
| `/meta loop <epic_id>` | Execute specific Epic |
| `/meta status` | View progress summary |
| `/meta plan` | Re-enter planning mode |
| `/meta export` | Generate markdown docs |

---

## Files Created

```
.meta/
├── enhancements-plan.json           # Project plan
├── enhancements-progress.json       # Progress tracking
├── ENHANCEMENTS_OVERVIEW.md         # This file
└── epics/
    ├── epic_007.json                # Search & Discovery
    ├── epic_008.json                # Syndication & Downloads
    ├── epic_009.json                # Reading Experience
    └── epic_010.json                # Preferences & SEO
```

---

*Generated by Meta-Orchestrator on 2026-01-25*
*Ready to execute - run `/meta loop` to begin*
