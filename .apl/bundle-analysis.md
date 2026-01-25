# Bundle Analysis Report

## Baseline Measurement (Pre-Optimization)

**Build Date:** 2026-01-25
**Build Method:** webpack (--webpack flag)

### Top 10 Chunks (Gzipped)

1. **4bd1b696-*.js** - 62.5 KB (likely Shiki + dependencies)
2. **framework-*.js** - 59.9 KB (Next.js React framework)
3. **794-*.js** - 51.0 KB (likely MDX/content processing)
4. **123-*.js** - 45.5 KB (unknown, needs investigation)
5. **polyfills-*.js** - 39.5 KB (browser polyfills)
6. **main-*.js** - 38.3 KB (main app code)
7. **216-*.js** - 13.7 KB
8. **268-*.js** - 8.6 KB
9. **437-*.js** - 5.3 KB
10. **webpack-*.js** - 1.7 KB

### Total Bundle Size Analysis

**Main chunks total (gzipped):** ~326 KB
**Target:** < 100 KB total JavaScript

### Large Dependencies Identified

1. **Shiki** (syntax highlighting) - ~62 KB chunk
2. **Next.js Framework** - ~60 KB (framework overhead, unavoidable)
3. **MDX processing** - ~51 KB
4. **Framer Motion** - included in main bundle
5. **Polyfills** - ~40 KB

### Optimization Targets (Priority Order)

1. **Lazy-load Giscus comments** - Load only when needed
2. **Tree-shake Framer Motion** - Use only motion.div, AnimatePresence
3. **Optimize Shiki loading** - Consider dynamic import for code highlighting
4. **Remove unused polyfills** - Configure browserslist

### Current Status

- Bundle analyzer configured and working
- Baseline measurements documented
- Large modules identified
- Next.js framework overhead acceptable (~60 KB)
- **Main optimization needed:** Reduce Shiki/MDX chunk from 113 KB to <50 KB

## Optimizations Applied

### 1. Giscus Lazy Loading
- **Action:** Dynamic import using next/dynamic
- **Result:** Giscus separated into 395-byte chunk (loaded on-demand)
- **Impact:** ~8 KB saved from initial bundle

### 2. Font Optimization (Already Optimal)
- Using next/font/google with Space Grotesk
- font-display: swap configured
- Weights subset to 400, 600, 700
- Font automatically preloaded
- WOFF2 format (optimal compression)

### 3. Tailwind CSS (Already Optimal)
- Tailwind v4 with automatic tree-shaking
- CSS bundle: 6.6 KB gzipped (excellent!)
- Critical CSS automatically inlined

### 4. Image Optimization
- All images use next/image
- Hero images marked with priority
- Blur placeholders added (SVG data URLs)
- Aspect ratios set to prevent CLS
- Responsive sizes configured

### Post-Optimization Bundle Status
- **Total main chunks:** ~320 KB (minimal improvement from baseline)
- **CSS:** 6.6 KB gzipped
- **Giscus:** 395 bytes (separate chunk, lazy-loaded)
- **Framework:** 60 KB (unavoidable Next.js overhead)

### Next Steps
- Run Lighthouse audits to measure real-world performance
- Identify runtime performance issues
- Further optimize if needed based on Core Web Vitals
