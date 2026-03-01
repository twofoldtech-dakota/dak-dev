# Homepage Hover Refinements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add consistent arrow/chevron hover animations to all homepage interactive links.

**Architecture:** Pure CSS changes via Tailwind utility classes. Add `group` to parent links and `transition-transform group-hover:translate-x-1` to arrow SVGs. No JS, no new components, no bundle impact.

**Tech Stack:** Tailwind CSS classes only.

---

### Task 1: Featured Section — "View All Posts" arrow

**Files:**
- Modify: `app/page.tsx:59-65`

**Step 1: Add `group` to parent Link and `transition-transform group-hover:translate-x-1` to SVG**

Change the Link className from:
```
"hidden sm:inline-flex items-center gap-2 text-text font-semibold hover:underline underline-offset-4 decoration-4 focus:outline-none focus:ring-4 focus:ring-text focus:ring-offset-4 focus:ring-offset-background"
```
to:
```
"group hidden sm:inline-flex items-center gap-2 text-text font-semibold hover:underline underline-offset-4 decoration-4 focus:outline-none focus:ring-4 focus:ring-text focus:ring-offset-4 focus:ring-offset-background"
```

Change the SVG className from:
```
"w-5 h-5"
```
to:
```
"w-5 h-5 transition-transform group-hover:translate-x-1"
```

**Step 2: Visual verification**

Run: `npm run dev`
Hover over "View All Posts" in Featured Post section header. Arrow should slide right 4px on hover.

---

### Task 2: Patterns Section — "Explore Catalog" arrow

**Files:**
- Modify: `components/home/PatternsShowcase.tsx:70-76`

**Step 1: Add `group` to parent Link and `transition-transform group-hover:translate-x-1` to SVG**

Change the Link className from:
```
"hidden sm:inline-flex items-center gap-2 text-text font-semibold hover:underline underline-offset-4 decoration-4 focus:outline-none focus:ring-4 focus:ring-text focus:ring-offset-4 focus:ring-offset-background"
```
to:
```
"group hidden sm:inline-flex items-center gap-2 text-text font-semibold hover:underline underline-offset-4 decoration-4 focus:outline-none focus:ring-4 focus:ring-text focus:ring-offset-4 focus:ring-offset-background"
```

Change the SVG className from:
```
"w-5 h-5"
```
to:
```
"w-5 h-5 transition-transform group-hover:translate-x-1"
```

---

### Task 3: Pattern row chevrons

**Files:**
- Modify: `components/home/PatternsShowcase.tsx:160`

**Step 1: Add translate animation to chevron SVG**

Change the SVG className from:
```
"w-4 h-4 text-muted/0 group-hover:text-muted transition-colors flex-shrink-0"
```
to:
```
"w-4 h-4 text-muted/0 group-hover:text-muted group-hover:translate-x-0.5 transition-all flex-shrink-0"
```

Note: `transition-colors` becomes `transition-all` so both the color and transform animate. The parent `<Link>` already has `group` class.

---

### Task 4: Patterns CTA — "Browse All Patterns" arrow

**Files:**
- Modify: `components/home/PatternsShowcase.tsx:179-185`

**Step 1: Add `group` to parent Link and `transition-transform group-hover:translate-x-1` to SVG**

Change the Link className from:
```
"inline-flex items-center justify-center font-semibold px-6 py-3 text-base gap-2 bg-transparent text-accent border-4 border-accent hover:bg-accent hover:text-background shadow-[4px_4px_0_0_var(--color-accent)] hover:shadow-[6px_6px_0_0_var(--color-accent)] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-accent focus:ring-offset-4 focus:ring-offset-background"
```
to:
```
"group inline-flex items-center justify-center font-semibold px-6 py-3 text-base gap-2 bg-transparent text-accent border-4 border-accent hover:bg-accent hover:text-background shadow-[4px_4px_0_0_var(--color-accent)] hover:shadow-[6px_6px_0_0_var(--color-accent)] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-accent focus:ring-offset-4 focus:ring-offset-background"
```

Change the SVG className from:
```
"w-5 h-5"
```
to:
```
"w-5 h-5 transition-transform group-hover:translate-x-1"
```

---

### Task 5: ToolsBar — "View all" arrow

**Files:**
- Modify: `components/home/ToolsBar.tsx:81-86`

**Step 1: Add `group` to parent Link and `transition-transform group-hover:translate-x-1` to SVG**

Change the Link className from:
```
"inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted hover:text-text transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
```
to:
```
"group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted hover:text-text transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
```

Change the SVG className from:
```
"w-4 h-4"
```
to:
```
"w-4 h-4 transition-transform group-hover:translate-x-1"
```

---

### Task 6: Hero CTA — "Read My Articles" arrow

**Files:**
- Modify: `components/home/Hero.tsx:96-102`

**Step 1: Add `group` to parent Link and `transition-transform group-hover:translate-x-1` to SVG**

Change the Link className from:
```
"inline-flex items-center justify-center font-semibold px-8 py-4 text-lg gap-3 bg-transparent text-accent border-4 border-accent hover:bg-accent hover:text-background shadow-[4px_4px_0_0_var(--color-accent)] hover:shadow-[6px_6px_0_0_var(--color-accent)] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-accent focus:ring-offset-4 focus:ring-offset-background"
```
to:
```
"group inline-flex items-center justify-center font-semibold px-8 py-4 text-lg gap-3 bg-transparent text-accent border-4 border-accent hover:bg-accent hover:text-background shadow-[4px_4px_0_0_var(--color-accent)] hover:shadow-[6px_6px_0_0_var(--color-accent)] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-accent focus:ring-offset-4 focus:ring-offset-background"
```

Change the SVG className from:
```
"w-5 h-5"
```
to:
```
"w-5 h-5 transition-transform group-hover:translate-x-1"
```

---

### Task 7: Visual smoke test and commit

**Step 1: Run dev server and verify all 6 hover effects**

Run: `npm run dev`

Check each:
1. Homepage → Featured Post section header → "View All Posts" arrow slides right on hover
2. Homepage → Agent Patterns section header → "Explore Catalog" arrow slides right on hover
3. Homepage → Agent Patterns → each pattern row chevron slides right + fades in on hover
4. Homepage → Agent Patterns → "Browse All Patterns" CTA arrow slides right on hover
5. Homepage → Builds section header → "View all" arrow slides right on hover
6. Homepage → Hero → "Read My Articles" CTA arrow slides right on hover

**Step 2: Commit**

```bash
git add app/page.tsx components/home/PatternsShowcase.tsx components/home/ToolsBar.tsx components/home/Hero.tsx
git commit -m "feat: add hover arrow animations to all homepage interactive links"
```
