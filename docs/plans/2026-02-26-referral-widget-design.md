# Referral Links Floating Widget — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a persistent floating widget to the right edge of every page that lets visitors copy referral/invite links.

**Architecture:** Data-driven referral links stored in `content/referrals.json`, read by the server-component root layout and passed as props to a client-side `ReferralWidget`. The widget is a collapsible tab that slides out a panel with copy-to-clipboard buttons.

**Tech Stack:** Next.js App Router, React 19 (useState/useEffect/useCallback/useRef), Framer Motion (AnimatePresence, motion), Clipboard API

---

### Task 1: Create the referral data file

**Files:**
- Create: `content/referrals.json`

**Step 1: Create the JSON data file**

```json
[
  {
    "name": "Claude AI",
    "url": "https://claude.ai/referral/w3bxl1StJQ?s=cowork"
  }
]
```

**Step 2: Verify the file is valid JSON**

Run: `node -e "require('./content/referrals.json'); console.log('OK')"`
Expected: `OK`

**Step 3: Commit**

```bash
git add content/referrals.json
git commit -m "feat: add referral links data file"
```

---

### Task 2: Create the ReferralWidget component

**Files:**
- Create: `components/ui/ReferralWidget.tsx`

**Reference:** Follow patterns from `components/ui/ScrollToTop.tsx` (floating fixed-position, Framer Motion, neo-brutalist styling, `useReducedMotion`).

**Step 1: Create the component**

```tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface ReferralLink {
  name: string;
  url: string;
}

export function ReferralWidget({ links }: { links: ReferralLink[] }) {
  const [open, setOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const close = useCallback(() => setOpen(false), []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, close]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, close]);

  const copyLink = async (url: string, index: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // Fallback: open in new tab if clipboard fails
      window.open(url, '_blank');
    }
  };

  if (links.length === 0) return null;

  return (
    <div ref={panelRef} className="fixed right-0 top-1/2 -translate-y-1/2 z-40">
      {/* Tab */}
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={open ? 'Close referral links' : 'Open referral links'}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-accent text-background border-2 border-text border-r-0 px-1.5 py-3 font-bold text-xs uppercase tracking-widest shadow-[-3px_3px_0_0_var(--color-text)] hover:shadow-[-5px_5px_0_0_var(--color-text)] hover:translate-x-[-2px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
      >
        REFS
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: 'easeOut' }}
            className="absolute right-8 top-1/2 -translate-y-1/2 w-72 max-w-[85vw] bg-background border-2 border-text shadow-[4px_4px_0_0_var(--color-accent)]"
          >
            <div className="px-4 py-3 border-b-2 border-text">
              <p className="text-xs font-bold uppercase tracking-widest text-muted">
                Referral Links
              </p>
            </div>
            <div className="p-2">
              {links.map((link, i) => (
                <div
                  key={link.url}
                  className="flex items-center justify-between gap-2 px-3 py-2.5 border-b-2 border-text/10 last:border-b-0"
                >
                  <span className="text-sm font-semibold text-text truncate">
                    {link.name}
                  </span>
                  <button
                    onClick={() => copyLink(link.url, i)}
                    className="flex-shrink-0 px-3 py-1 text-xs font-bold uppercase border-2 border-text bg-surface text-text hover:bg-accent hover:text-background transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                    aria-label={`Copy ${link.name} referral link`}
                  >
                    {copiedIndex === i ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

**Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `ReferralWidget`

**Step 3: Commit**

```bash
git add components/ui/ReferralWidget.tsx
git commit -m "feat: add ReferralWidget floating panel component"
```

---

### Task 3: Wire into root layout

**Files:**
- Modify: `app/layout.tsx`

**Step 1: Add import and render the widget**

Add these two lines to `app/layout.tsx`:

1. Import at the top (after the `ScrollToTop` import, line 8):
```tsx
import { ReferralWidget } from '@/components/ui/ReferralWidget';
import referralLinks from '@/content/referrals.json';
```

2. Render next to `<ScrollToTop />` (after line 131):
```tsx
<ReferralWidget links={referralLinks} />
```

**Step 2: Verify the dev server renders correctly**

Run: `npm run dev`
Expected: The "REFS" tab appears on the right edge of every page. Clicking it opens the panel with "Claude AI" and a "Copy" button.

**Step 3: Verify build passes**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds with no errors

**Step 4: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: wire ReferralWidget into root layout"
```

---

### Task 4: Visual/functional QA

**Checklist:**
- [ ] Tab visible on right edge, vertically centered
- [ ] Click tab → panel slides out
- [ ] Click "Copy" → clipboard contains the URL, button text changes to "Copied!"
- [ ] Click tab again → panel closes
- [ ] Click outside panel → closes
- [ ] Press Escape → closes
- [ ] Tab through with keyboard → all buttons focusable
- [ ] Mobile viewport → panel uses max-width 85vw
- [ ] `prefers-reduced-motion` → no slide animation
- [ ] Widget does not overlap `ScrollToTop` button (different vertical positions)
