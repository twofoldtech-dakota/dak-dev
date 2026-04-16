# Design: "Learn" Section — Expert's Guide to Agentic Engineering

**Date:** 2026-04-15
**Status:** Approved
**Owner:** Dakota Smith

---

## Problem

The site has a strong Patterns section (16 named patterns across 6 chapters) teaching abstract AI engineering principles. But there's no structured, technical resource covering Claude Code's concrete integration points — hooks, skills, agents, MCP, etc. The official Claude docs cover basics; there's a gap for expert-level, opinionated guidance on cutting-edge agentic engineering.

## Goal

Unify Patterns and a new **Claude Code Toolkit** under a single "Learn" header link. The Toolkit is NOT documentation — it's an expert's field guide. It teaches what you learn after months of daily production use: mental models, real-world architectures, compositions between features, and the pitfalls the docs don't warn you about.

**Target audience:** Developers who already use Claude Code and want to level up to expert-tier agentic engineering.

---

## Information Architecture

### Header Navigation

Replace "Patterns" with **"Learn"**. Single link, no dropdown. Takes user to `/learn` landing page.

### URL Structure

```
/learn                              ← Landing page (split hero + connections)
/learn/patterns/                    ← Patterns index (moved from /patterns)
/learn/patterns/[slug]              ← Individual pattern pages
/learn/patterns/cards               ← Quick reference cards
/learn/patterns/chapter/[chapter]   ← Chapter pages
/learn/patterns/graph               ← Relationship graph
/learn/toolkit/                     ← Toolkit index
/learn/toolkit/[topic]              ← Topic overview (e.g., /learn/toolkit/hooks)
/learn/toolkit/[topic]/[sub]        ← Sub-pages (e.g., /learn/toolkit/hooks/playbook)
```

Redirects: All `/patterns/*` URLs 301 redirect to `/learn/patterns/*`.

---

## Landing Page (`/learn`)

### Split Hero

Two tracks presented side by side on desktop, stacked on mobile:

**Left Track — "Patterns"**
- Tagline: Named patterns for AI-assisted engineering
- Stats: pattern count, chapter count, difficulty spread
- CTA: Browse patterns
- Visual: Mini chapter grid or pattern graph preview

**Right Track — "Claude Code Toolkit"**
- Tagline: Expert's guide to agentic engineering with Claude
- Stats: 9 deep-dives, interactive tutorials
- CTA: Explore toolkit
- Visual: Feature architecture diagram preview

### Connections Section (below hero)

Visual mapping showing which patterns relate to which toolkit topics. Bidirectional links:
- Convention File ↔ CLAUDE.md
- Safety Net ↔ Hooks
- Memory Layer ↔ Memory System
- Parallel Fan-Out ↔ Agents & Agent Teams
- Progressive Disclosure ↔ Skills
- Agent-Friendly Architecture ↔ MCP Servers

Could be a grid, a mini graph, or an interactive mapping visualization.

---

## Toolkit Content Philosophy

### What This Is NOT

- Not a docs mirror (link to official docs for setup/installation/API reference)
- Not beginner tutorials (assumes working knowledge of Claude Code)
- Not exhaustive option lists

### What This IS

- **Expert mental models** — How to think about each feature architecturally
- **Real-world architectures** — Production configurations, not toy examples
- **Compositions** — How features combine (hooks + skills + agents together)
- **Anti-patterns & gotchas** — What breaks at scale, what the docs don't warn about
- **Decision frameworks** — When to use what, and why
- **Before/after** — Naive approach vs. expert approach with explanation
- **Cutting edge** — Latest Claude Code capabilities, newest patterns, bleeding-edge techniques

---

## Toolkit Topics (9 Deep-Dives)

| # | Topic | Route | Description |
|---|-------|-------|-------------|
| 1 | CLAUDE.md | `/learn/toolkit/claude-md` | Project instruction architecture, layered configs, context priming strategies |
| 2 | Hooks | `/learn/toolkit/hooks` | Execution lifecycle automation, validation pipelines, agent guardrails |
| 3 | Skills | `/learn/toolkit/skills` | Reusable prompt engineering, skill composition, invocation patterns |
| 4 | Agents & Subagents | `/learn/toolkit/agents` | Delegation patterns, isolation strategies, worktree workflows |
| 5 | Agent Teams | `/learn/toolkit/agent-teams` | Multi-agent orchestration, role-based pipelines, coordination architectures |
| 6 | MCP Servers | `/learn/toolkit/mcp` | External tool integration, custom server patterns, protocol mastery |
| 7 | Commands | `/learn/toolkit/commands` | Custom slash commands, workflow automation, command composition |
| 8 | Settings & Config | `/learn/toolkit/settings` | Permission architectures, model selection strategy, profile management |
| 9 | Memory System | `/learn/toolkit/memory` | Persistent context strategies, memory taxonomy, cross-session intelligence |

### Sub-page Structure Per Topic

Each topic gets a landing page + up to 4 sub-pages:

| Sub-page | Purpose |
|----------|---------|
| **Mental Model** | How experts think about this feature. Architecture diagrams, lifecycle visualizations, decision trees. |
| **Playbook** | Production recipes with full configs. Not "hello world" — real workflows with design choice explanations. |
| **Compositions** | How this feature combines with others. The connective tissue between toolkit topics. |
| **Pitfalls** | What breaks, what's counterintuitive, silent failures, performance traps. |

Not every topic requires all four. Some may merge sub-pages if the content is tightly coupled.

### Example: Hooks Topic

- **Mental Model**: Lifecycle diagram showing when hooks fire relative to tool calls. Decision tree: "Should this be a hook, a skill, or a CLAUDE.md rule?"
- **Playbook**: Auto-formatting on save. Security scanning before commits. Custom validation pipelines. CI gate hooks. Each with full config + rationale.
- **Compositions**: Hooks that trigger skills. Hooks that gate agent behavior. Hooks + MCP for external service integration.
- **Pitfalls**: Hook ordering surprises. Performance traps with synchronous hooks. Why hooks silently fail in subagents. Shell compatibility gotchas.

### Example: Agent Teams Topic

- **Mental Model**: Architecture diagrams of orchestrator/worker patterns. When to use fan-out vs. pipeline vs. hierarchy.
- **Playbook**: Code review agent team. Parallel test runner. Research → implement → verify pipeline. Full skill files + orchestration configs.
- **Compositions**: Agent teams + hooks for quality gates. Agent teams + MCP for external data. Agent teams + memory for cross-session learning.
- **Pitfalls**: Context window exhaustion. Coordination overhead. When single-agent is actually better. Worktree conflicts.

---

## Interactive Elements

### Progressive Tutorials (Type B)
- Step-by-step walkthroughs with numbered steps
- Expandable/collapsible sections for progressive disclosure
- Copy-paste code blocks (existing Shiki setup with copy button)
- "Try it yourself" callout boxes with specific instructions
- Before/after comparisons

### Architecture Diagrams (Type C)
- SVG visualizations showing feature lifecycles and data flow
- Interactive elements (hover for details, click to navigate)
- Architecture overview diagram on toolkit index showing how all 9 features interconnect
- Per-topic lifecycle diagrams (e.g., hook execution timeline)
- Composition diagrams showing feature interactions
- Respect `prefers-reduced-motion`

---

## Shared Layout

### Sidebar (Desktop)
Two collapsible sections:
- **Patterns** — Chapters 1-6 with pattern listings (existing)
- **Toolkit** — 9 topics with sub-page listings (new)

### Mobile Navigation
Same two-section structure, adapted for mobile (similar to existing `PatternsMobileNav`)

### Breadcrumbs
- `Learn > Patterns > Convention File`
- `Learn > Toolkit > Hooks > Playbook`

---

## Content Storage

```
content/
├── patterns/           ← Existing, unchanged
│   ├── *.mdx
│   └── tools/*.json
└── toolkit/            ← New
    ├── claude-md/
    │   ├── index.mdx         ← Topic overview/landing
    │   ├── mental-model.mdx
    │   ├── playbook.mdx
    │   ├── compositions.mdx
    │   └── pitfalls.mdx
    ├── hooks/
    │   ├── index.mdx
    │   ├── mental-model.mdx
    │   ├── playbook.mdx
    │   ├── compositions.mdx
    │   └── pitfalls.mdx
    ├── skills/
    │   └── ...
    ├── agents/
    │   └── ...
    ├── agent-teams/
    │   └── ...
    ├── mcp/
    │   └── ...
    ├── commands/
    │   └── ...
    ├── settings/
    │   └── ...
    └── memory/
        └── ...
```

### Toolkit MDX Frontmatter

```typescript
interface ToolkitFrontmatter {
  title: string;              // "Hooks: Expert Mental Model"
  topic: string;              // "hooks"
  subPage: string;            // "mental-model" | "playbook" | "compositions" | "pitfalls"
  order: number;              // Sort order within topic
  description: string;        // SEO description
  relatedPatterns?: string[]; // Slugs of related patterns
  relatedTopics?: string[];   // Slugs of related toolkit topics
  published: boolean;
  keywords?: string[];
}
```

---

## Cross-Referencing

Bidirectional links between patterns and toolkit:
- Pattern pages show a "Related Toolkit" panel linking to relevant deep-dives
- Toolkit pages show a "Related Patterns" panel linking to relevant patterns
- Landing page connections section visualizes the full mapping

Cross-reference data stored in frontmatter (`relatedPatterns` / `relatedTopics`) and rendered by shared components.

---

## SEO Considerations

- All existing `/patterns/*` URLs get 301 redirects to `/learn/patterns/*`
- New JSON-LD schemas for toolkit content (TechArticle / HowTo)
- OG images for toolkit pages using existing `/api/og` endpoint
- Canonical URLs under `/learn/`

---

## Design System

All new components follow existing neo-brutalist aesthetic:
- Thick borders (2-4px), no rounded corners
- Hard shadows, no blur
- Background: `#0A0A0A`, Text: `#F5F5F5`
- Space Grotesk typography
- Accessible focus states, keyboard navigation
- `prefers-reduced-motion` respected on all diagrams/animations
