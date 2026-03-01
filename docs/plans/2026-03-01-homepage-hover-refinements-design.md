# Homepage Hover Refinements Design

**Date:** 2026-03-01
**Scope:** CSS-only hover micro-interactions for homepage elements
**JS Impact:** Zero — all Tailwind class additions on server components

## Problem

Several arrow/chevron icons across the homepage are static on hover, while the Featured Post "Read Article" arrow already translates right. This inconsistency makes some interactive elements feel dead compared to others.

## Solution

Add `transition-transform group-hover:translate-x-1` (or `translate-x-0.5` for smaller chevrons) to all arrow/chevron SVGs that currently lack hover animation. Matches the existing pattern established by the Featured Post arrow.

## Changes

### 1. Featured Section Header — "View All Posts" arrow
**File:** `app/page.tsx` ~line 65
**Change:** Add `transition-transform group-hover:translate-x-1` to the arrow SVG. Ensure parent Link has `group` class (it doesn't currently — needs adding to the `items-center gap-2` link).

### 2. Patterns Section Header — "Explore Catalog" arrow
**File:** `components/home/PatternsShowcase.tsx` ~line 76
**Change:** Add `transition-transform group-hover:translate-x-1` to the arrow SVG. Add `group` to parent Link.

### 3. Patterns CTA — "Browse All Patterns" arrow
**File:** `components/home/PatternsShowcase.tsx` ~line 184
**Change:** Add `transition-transform group-hover:translate-x-1` to the arrow SVG. Add `group` to parent Link.

### 4. ToolsBar Header — "View all" arrow
**File:** `components/home/ToolsBar.tsx` ~line 86
**Change:** Add `transition-transform group-hover:translate-x-1` to the arrow SVG. Add `group` to parent Link.

### 5. Pattern Row Chevrons
**File:** `components/home/PatternsShowcase.tsx` ~line 160
**Change:** Add `transition-transform group-hover:translate-x-0.5` to the chevron SVG (already has `transition-colors`; merge into single `transition-all`).

### 6. Hero CTA — "Read My Articles" arrow
**File:** `components/home/Hero.tsx` ~line 96
**Change:** Add `group` to the parent Link. Add `transition-transform group-hover:translate-x-1` to the arrow SVG.

## Not Changed

- "View Language Map" secondary link — too small, animation would feel noisy
- ToolsBar card icons — already have color transition, lift handles the feedback
- Section divider — static by design
- No entrance animations — server components stay server-rendered
