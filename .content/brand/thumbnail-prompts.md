# Thumbnail AI Prompt Template Library

Standardized prompts for generating AI thumbnail art that matches the dak-dev blog's neo-brutalist dark aesthetic. These templates work with any AI image generation tool (Gemini, DALL-E, Midjourney, Stable Diffusion, etc.).

**How to use:** Copy the Base Prompt below, then append a Topic Variant for your post's subject. Paste the combined prompt into your AI image tool. The generated art serves as the background layer -- the thumbnail CLI composites branded text on top.

---

## Base Prompt

Always include this core prompt. Copy it verbatim, then append a topic variant from the next section.

```
Style: dark, moody digital illustration on near-black (#0A0A0A) background.
Aesthetic: neo-brutalist, geometric, high contrast. Sharp edges, no soft gradients.
Limited color palette — primarily dark grays with neon green (#00ff88) as the sole accent color.
Mood: technical, engineered, minimal. Think circuit boards, grid patterns, architectural blueprints.
Composition: leave the bottom 25% relatively dark and simple (this area will have a text overlay added later).
Aspect ratio: 16:9
No text, no words, no letters in the image.
```

---

## Topic Variants

Pick the variant that best matches your post's topic. Append it directly after the Base Prompt.

### 1. AI / Agents

**Visual elements:** Neural network nodes, glowing connection lines, brain circuitry, autonomous pathways

```
Subject: an abstract neural network visualization. Glowing nodes connected by sharp geometric lines forming a brain-like structure. Neon green (#00ff88) accent on key nodes and connection paths. Circuit-board traces radiate outward from a central processing cluster. The network pulses with data flowing along rigid, angular pathways.
```

### 2. DevTools / Workflow

**Visual elements:** Terminal windows, code fragments, CLI interfaces, tmux-style pane layouts

```
Subject: a stylized developer terminal environment. Multiple rectangular panes arranged in a tmux-style grid layout. Faint code fragments visible as geometric patterns inside each pane. Neon green (#00ff88) accent on cursor lines and active borders. Sharp dividing lines between panes. The composition feels like looking at an engineer's command center from above.
```

### 3. Web / Frontend

**Visual elements:** Browser wireframes, grid layouts, CSS geometric shapes, responsive breakpoints

```
Subject: an abstract web interface wireframe. Overlapping browser frames with visible grid systems and geometric placeholder shapes. Neon green (#00ff88) accent on key interactive elements and grid intersections. Responsive breakpoint lines slice across the composition at sharp angles. CSS-inspired geometric shapes (boxes, flex containers) float in structured arrangements.
```

### 4. Hardware / Setup

**Visual elements:** Abstract device outlines, schematics, component diagrams, desk blueprints

```
Subject: a technical hardware schematic viewed from above. Abstract device outlines and component diagrams rendered as architectural blueprints. Neon green (#00ff88) accent on key connection points and power traces. Geometric representations of circuit components arranged in a precise grid. The mood is an engineer's workbench translated into minimal vector art.
```

### 5. Performance / Optimization

**Visual elements:** Speed lines, gauges, data flow arrows, metrics dashboards, flame graphs

```
Subject: an abstract performance metrics dashboard. Geometric gauges, sharp-edged flame graph columns, and angular data flow arrows. Neon green (#00ff88) accent on peak metrics and critical path indicators. Speed lines streak horizontally across the composition. Stacked bar segments and measurement rulers create a sense of precision engineering and benchmarking.
```

### 6. Open Source / Community

**Visual elements:** Interconnected nodes, branching trees, collaborative networks, pull request flows

```
Subject: a collaborative network graph. Interconnected nodes branching outward in a tree-like structure resembling a git history graph. Neon green (#00ff88) accent on merge points and active branches. Sharp geometric lines connect contributors represented as abstract geometric shapes. The composition radiates outward from a central repository node.
```

### 7. Career / Growth

**Visual elements:** Ascending structures, stairways, building blocks, scaffolding, skill trees

```
Subject: an abstract ascending structure. Geometric building blocks and scaffolding layers stacking upward in a staircase pattern. Neon green (#00ff88) accent on the leading edge and highest points. Angular platforms connected by sharp-edged pathways form a skill-tree-like progression. The composition moves from dense foundation blocks at the bottom to open possibilities at the top.
```

### 8. Architecture / Systems

**Visual elements:** System diagrams, layered structures, modular blocks, microservice meshes

```
Subject: a system architecture diagram rendered as abstract art. Modular blocks connected by rigid pipelines in a layered structure. Neon green (#00ff88) accent on service boundaries and communication channels. Hexagonal microservice nodes arranged in a precise mesh pattern. Layered horizontal bands represent different system tiers from infrastructure to application.
```

### 9. Security / Privacy

**Visual elements:** Lock mechanisms, shield patterns, encrypted data streams, key exchanges

```
Subject: an abstract security visualization. Geometric lock mechanisms and interlocking shield patterns form a protective grid. Neon green (#00ff88) accent on key exchange points and encryption boundaries. Data streams rendered as angular lines pass through authentication gates. The composition feels like a fortified digital vault seen from a blueprint perspective.
```

### 10. Data / APIs

**Visual elements:** Pipeline flows, connected endpoints, JSON tree structures, database schemas

```
Subject: an abstract data pipeline visualization. Connected API endpoints represented as geometric nodes linked by rigid pipeline flows. Neon green (#00ff88) accent on active data streams and endpoint connections. JSON-like tree structures branch outward in precise right angles. Database table outlines and schema relationships form the underlying grid pattern.
```

### 11. Mobile / Apps

**Visual elements:** Device frames, gesture paths, notification patterns, app store grids

```
Subject: an abstract mobile interface composition. Geometric device frames overlapping at sharp angles with visible gesture path lines. Neon green (#00ff88) accent on touch points and notification indicators. App-grid patterns and swipe trajectories rendered as architectural drawings. Rectangular screen outlines float in a structured arrangement suggesting a design system.
```

### 12. Cloud / Infrastructure

**Visual elements:** Server racks, network topology, container visualizations, deployment pipelines

```
Subject: an abstract cloud infrastructure diagram. Server rack outlines and container blocks arranged in a network topology layout. Neon green (#00ff88) accent on active deployments and network connections. Geometric pipeline flows connect build stages to deployment targets. The composition resembles a bird's-eye view of a data center floor plan rendered as minimal vector art.
```

---

## Accent Color

All thumbnails use the site's brand accent color: **Neon Green `#00ff88`**.

This matches the site's header, links, and UI elements. Every AI prompt variant above already specifies this color. The CLI tool also defaults to `#00ff88` when no `--accent` flag is provided.

Do not use other accent colors — keeping one consistent color across all thumbnails reinforces the brand identity.

---

## Quality Checklist

Before feeding the AI-generated art into the thumbnail CLI, verify:

- [ ] Bottom 25% of the image is relatively dark and simple (text overlay goes here)
- [ ] Overall color palette is dark, not bright or colorful
- [ ] Aspect ratio is approximately 16:9
- [ ] No text, words, or letters appear in the image
- [ ] Has high-contrast geometric elements that read well at small sizes
- [ ] Matches the neo-brutalist aesthetic: sharp edges, no soft gradients, no rounded shapes
- [ ] Accent color is limited to one or two hues, not a rainbow

If the image fails any of these checks, regenerate with additional emphasis in the prompt (e.g., add "absolutely no text" or "much darker overall, near-black background").

---

## Quick Reference Workflow

```
1. Pick a topic variant from this file
2. Copy the Base Prompt + Topic Variant into your AI image tool
3. Generate and download the image (choose the darkest, sharpest result)
4. Run: npm run thumbnail:create -- --slug <post-slug> --source <downloaded-image>
```

**Example (AI post):**

```bash
# After generating and downloading the image as ~/Downloads/ai-agents-bg.png
npm run thumbnail:create -- --slug "building-ai-agents" --source ~/Downloads/ai-agents-bg.png --accent "#00ff88"
```
