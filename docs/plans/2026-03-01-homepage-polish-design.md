# Homepage Polish: PatternsShowcase + ToolsBar

**Date:** 2026-03-01
**Status:** Approved
**Components:** `components/home/PatternsShowcase.tsx`, `components/home/ToolsBar.tsx`

## Problem

1. Pattern sample rows have no breathing room — padding is cramped, intent text is hidden on mobile
2. Tools & Projects bar is a flat line of 11px monospace text with nearly invisible separators

## Design

### A. Pattern Sample Rows

Two-line layout per row:
- **Line 1:** pattern number (chapter-colored mono) + pattern name (bold) + difficulty badge (right-aligned)
- **Line 2:** intent one-liner (muted, `line-clamp-1`, always visible)
- Padding: `px-5 py-4`
- Gap between rows: `space-y-3`
- Hover: right-arrow indicator, translate lift, shadow
- Chapter-colored `border-l-4` stays

### B. Tools Strip

Horizontal scrollable strip replacing the flat text line:
- Section header: "Builds" left, "View all" link right
- `border-t-4 border-text` top separator
- Cards: ~160px wide, `border-2 border-text/30`, hover lift
- Card content: SVG icon + name (bold) + category badge (small uppercase)
- Category colors: agent=accent, plugin=chapter-4, product=chapter-2, infrastructure=chapter-3
- CSS-only horizontal scroll with snap points
- Right-edge fade gradient for overflow indication
- Server component — zero client JS
- All links external, open in new tab

### Icon Mapping

| `icon` field | SVG |
|---|---|
| `code` | terminal/command prompt |
| `tool` | wrench |
| `app` | window/layout |
| `package` | box |
| `api` | plug/connection |
| `website` | globe |
