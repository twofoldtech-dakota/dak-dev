# /frontend-design

Create distinctive, production-grade frontend interfaces following the DAK blog neo-brutalist design system. Use this skill when building web components, pages, or UI elements.

## Description

This skill activates when the user asks to build, create, or modify UI components, pages, layouts, or any visual frontend element. It enforces the established neo-brutalist design system, ensuring every piece of UI is consistent with the DAK blog's aesthetic identity.

---

## Design System Reference

### Color Tokens

All colors are defined as CSS custom properties in `app/globals.css`. **Never use raw hex values** — always reference semantic tokens via Tailwind utilities.

| Token | Dark Mode | Light Mode | Tailwind Class |
|-------|-----------|------------|----------------|
| `--color-background` | `#0a0a0a` | `#f5f5f5` | `bg-background`, `text-background` |
| `--color-surface` | `#333333` | `#e0e0e0` | `bg-surface`, `text-surface` |
| `--color-text` | `#f5f5f5` | `#0a0a0a` | `bg-text`, `text-text`, `border-text` |
| `--color-muted` | `#a9a9a9` | `#666666` | `text-muted`, `border-muted` |
| `--color-accent` | `#00ff88` | `#00cc6a` | `bg-accent`, `text-accent`, `border-accent` |

Theme switching is handled via `html.light` / `html.dark` classes. Components must work in both themes without conditional logic — the CSS variable system handles it automatically.

### Typography

- **Font Family**: Space Grotesk (loaded via `next/font/google`, applied as `--font-space-grotesk`)
- **Weights**: 400 (Regular), 600 (Semibold), 700 (Bold)
- **Tailwind config**: `font-sans` maps to Space Grotesk via `@theme inline` in `globals.css`
- **Scale**: Use Tailwind's default type scale (`text-sm` through `text-6xl`)
- **Line Height**: 1.5 for body text (`leading-relaxed`), 1.2 for headings (`leading-tight`)

### Neo-Brutalist Design Principles

1. **Thick Borders**: Use `border-2` minimum, `border-4` for primary elements. Always `border-text` or `border-accent`.
2. **Hard Shadows**: Offset box shadows only — `shadow-[4px_4px_0_0_var(--color-text)]` or `shadow-[8px_8px_0_0_var(--color-text)]`. No blur, no spread.
3. **Zero Border Radius**: Never use `rounded-*` classes. All elements are sharp-cornered.
4. **No Gradients**: Flat colors only. No `bg-gradient-*`, no `linear-gradient()`.
5. **No Soft Shadows**: No `shadow-sm`, `shadow-md`, `shadow-lg`, etc. Only hard offset shadows using arbitrary values.
6. **High Contrast**: Text on background must meet WCAG AA (4.5:1 minimum). The token system guarantees this when used correctly.
7. **Bold Typography**: Headings are `font-bold` or `font-semibold`. Body text is confident and large enough to read.
8. **Raw Aesthetic**: Design should feel engineered and intentional, not polished or corporate.

---

## Design Thinking

Work within the established system. Creative expression comes from **composition, spacing, and interaction** — not from breaking the visual language. When designing a new component:

1. **Start with structure**: What semantic HTML element is this? (`<article>`, `<section>`, `<nav>`, `<aside>`, etc.)
2. **Apply the system**: Border weight, shadow depth, color tokens. The system provides the aesthetic automatically.
3. **Add interaction**: Hover escalation (shadow grows, border changes to accent), press feedback (shadow shrinks), focus rings.
4. **Consider hierarchy**: More important elements get thicker borders (4px) and deeper shadows (8px). Secondary elements use thinner borders (2px) and shallower shadows (4px).
5. **Respect whitespace**: Generous padding (`p-6`, `p-8`) and gaps (`gap-6`, `gap-8`). The brutalist aesthetic needs breathing room.

---

## Technical Stack (Hard Requirements)

Every component must use:

- **Next.js 16+** App Router — Server Components by default, `'use client'` only when needed
- **React 19+** — Functional components with hooks, named exports
- **TypeScript** strict mode — Explicit types for all props, no `any`
- **Tailwind CSS** with semantic tokens — Use the custom token classes (`bg-background`, `text-text`, `border-accent`, etc.)
- **Framer Motion** — For component animations, import variants from `@/lib/animations`
- **`next/image`** — For all image rendering (never raw `<img>`)

---

## Established Component Patterns

### Card (`components/ui/Card.tsx`)

```tsx
// Border-4, hard shadow, hover escalation to accent
<Link className="block bg-surface border-4 border-text shadow-[8px_8px_0_0_var(--color-text)] hover:shadow-[12px_12px_0_0_var(--color-accent)] hover:border-accent transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-accent focus:ring-offset-4 focus:ring-offset-background">
```

Key patterns:
- `border-4 border-text` base border
- `shadow-[8px_8px_0_0_var(--color-text)]` hard offset shadow
- Hover: shadow grows to 12px and shifts to accent color, border becomes accent, element lifts (`-translate-y-1`)
- Focus: `ring-4 ring-accent ring-offset-4 ring-offset-background`

### Button (`components/ui/Button.tsx`)

4 variants with consistent interaction:

| Variant | Base | Hover |
|---------|------|-------|
| `primary` | `bg-text text-background border-4 border-text shadow-[4px_4px_0_0]` | Inverts colors, shadow grows to 6px accent |
| `secondary` | `bg-surface text-text border-4 border-text shadow-[4px_4px_0_0]` | `bg-text text-background`, shadow to accent |
| `ghost` | `bg-transparent text-text border-2 border-text` | `bg-text text-background` |
| `accent` | `bg-transparent text-accent border-4 border-accent shadow-[4px_4px_0_0_accent]` | `bg-accent text-background` |

All buttons use Framer Motion: `whileHover={{ scale: 1.02 }}` and `whileTap={{ scale: 0.98 }}`.

### Tag (`components/ui/Tag.tsx`)

```tsx
// Border-2, glow on hover
<span className="inline-block px-3 py-1 text-sm font-semibold border-2 border-text transition-all duration-200 hover:bg-text hover:text-background hover:border-accent hover:shadow-[0_0_12px_var(--color-accent)]">
```

Key: hover adds a glow shadow `shadow-[0_0_12px_var(--color-accent)]` — one of the few non-offset shadows allowed, used sparingly for accent emphasis.

### ScrollReveal (`components/ui/ScrollReveal.tsx`)

Viewport-triggered animations using `whileInView`:

```tsx
<motion.div
  variants={stagger ? staggerContainerVariants : singleVariants}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: '-80px' }}
>
```

Use `ScrollReveal` for section-level reveals and `ScrollRevealItem` for individual items within a staggered container.

---

## Animation Guidelines

### Shared Variants (`lib/animations.ts`)

Import from `@/lib/animations` — never define one-off variants inline when a shared one exists:

| Export | Use For |
|--------|---------|
| `fadeInVariants` | Simple opacity fade (0.3s) |
| `slideUpVariants` | Content entering from below (0.4s, custom ease) |
| `slideDownVariants` | Content entering from above (0.4s) |
| `scaleVariants` | Scale-in effect (0.95 to 1) |
| `staggerContainerVariants` | Parent of staggered children (0.1s stagger) |
| `staggerItemVariants` | Children within a stagger container |
| `pageTransitionVariants` | Route change animations (initial/animate/exit) |
| `drawLineVariants` | Horizontal line drawing effect (scaleX 0 to 1) |
| `glitchHoverVariants` | Subtle positional jitter on hover |

### Rules

- **Always wrap** the top-level client component in `<MotionConfig reducedMotion="user">` or verify the parent layout already does
- **CSS transitions** for simple state changes (hover colors, shadow shifts): `transition-all duration-200` or `duration-300`
- **Framer Motion** for entrance animations, stagger effects, and complex interactions
- **Performance budget**: Animation-related JS must stay under 5KB total. Import only what you need from framer-motion.
- **New variants**: If a new animation pattern is needed and will be reused, add it to `lib/animations.ts` rather than defining inline

---

## Accessibility Requirements

**Minimum: WCAG 2.1 AA. Target: AAA where feasible.**

- **Color contrast**: >= 4.5:1 for normal text, >= 3:1 for large text. The token system handles this — don't override it.
- **Keyboard navigation**: All interactive elements must be focusable and operable via keyboard
- **Focus indicators**: `focus:ring-4 focus:ring-accent focus:ring-offset-4 focus:ring-offset-background` (visible, high-contrast)
- **Touch targets**: Minimum 44x44px for interactive elements (`min-w-[44px] min-h-[44px]`)
- **Semantic HTML**: Use `<article>`, `<section>`, `<nav>`, `<aside>`, `<main>`, `<header>`, `<footer>` appropriately
- **ARIA attributes**: Add `aria-label` to icon-only buttons, `aria-current` for navigation, `role` when semantic HTML isn't sufficient
- **Alt text**: All `<Image>` components must have descriptive `alt` text (never empty unless purely decorative with `alt=""` and `aria-hidden="true"`)
- **Reduced motion**: Animations are handled by `MotionConfig reducedMotion="user"`. CSS animations use `@media (prefers-reduced-motion: reduce)` in `globals.css`.

---

## Performance Requirements

- **Lighthouse**: 98+ across all categories
- **Server Components**: Default. Only add `'use client'` when the component needs hooks, event handlers, or browser APIs.
- **Dynamic imports**: Use `next/dynamic` for heavy client components (modals, interactive widgets, comment sections)
- **Images**: Always use `next/image` with `sizes` prop, appropriate `placeholder="blur"`, and AVIF/WebP format support
- **Bundle size**: Total JS < 100KB gzipped. Use `@next/bundle-analyzer` to verify.
- **Fonts**: Space Grotesk is loaded via `next/font` with `display: 'swap'` — no additional font loading needed

---

## Anti-Patterns (Never Do These)

- **Raw hex colors**: Use token classes (`text-text`, `bg-accent`), never `text-[#f5f5f5]`
- **`rounded-*` classes**: No border radius. Ever. Not `rounded-sm`, not `rounded-full`, nothing.
- **Soft shadows**: No `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`. Only hard offset `shadow-[Xpx_Ypx_0_0_color]`.
- **Gradients**: No `bg-gradient-*`, no CSS `linear-gradient()` or `radial-gradient()`
- **Default Tailwind colors**: No `text-gray-500`, `bg-blue-600`, etc. Only the 5 semantic tokens.
- **External UI libraries**: No Radix, Shadcn, MUI, Chakra, etc. All components are custom-built.
- **Inline animation variants**: If a variant will be reused, add it to `lib/animations.ts`
- **`<img>` tags**: Always use `next/image` (`Image` from `next/image`)
- **Missing `'use client'`**: If the component uses hooks, event handlers, or motion components, it needs the directive
- **Implicit `any`**: All props must have explicit TypeScript interfaces

---

## File Organization

| Directory | Purpose | Example |
|-----------|---------|---------|
| `components/ui/` | Design system primitives | `Button.tsx`, `Card.tsx`, `Tag.tsx` |
| `components/blog/` | Blog-specific components | `PostHeader.tsx`, `ShareButtons.tsx` |
| `components/layout/` | Structural/layout components | `Header.tsx`, `Footer.tsx`, `Container.tsx` |
| `lib/` | Utilities and shared logic | `animations.ts`, `posts.ts`, `seo.ts` |
| `app/` | Pages and route layouts | `page.tsx`, `layout.tsx` |

Rules:
- One component per file
- Named exports (not default)
- Component filename matches export name: `Button.tsx` exports `function Button()`
- Props interface defined in the same file, named `ComponentNameProps`
- `'use client'` directive at the top of the file if the component uses client features

---

## Implementation Checklist

When creating or modifying a UI component, verify:

- [ ] Uses semantic color tokens (no raw hex)
- [ ] Zero border radius
- [ ] Hard offset shadows only
- [ ] Proper border weights (2px or 4px)
- [ ] Focus states with accent ring
- [ ] Touch targets >= 44x44px for interactive elements
- [ ] `alt` text on all images
- [ ] `'use client'` directive if using hooks/motion/events
- [ ] TypeScript props interface defined
- [ ] Animations imported from `@/lib/animations` where applicable
- [ ] Works in both dark and light themes (via token system)
- [ ] Keyboard navigable
