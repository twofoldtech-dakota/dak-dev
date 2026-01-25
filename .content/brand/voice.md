# Dakota Smith - Brand Voice & Content Style Guide

> The definitive guide for maintaining consistent tone, messaging, and quality across all blog content.

---

## Brand Identity

### Who I Am
- Strategic Technical Leader & Fullstack Architect with 14 years of enterprise experience
- Track record of shipping 30+ production-ready projects
- Specialize in bridging high-level business vision and deep technical execution
- "M-shaped" skill set: multiple technical domains + leadership + project management
- Big Picture Thinker: translate business requirements into scalable, secure architectures

### Target Audience
- **Primary**: Mid-to-senior level developers seeking deep technical content
- **Secondary**: Tech enthusiasts interested in performance and modern tooling
- **Tertiary**: Engineers evaluating technologies for their own projects

### Core Values
1. **Performance**: Every millisecond matters
2. **Accessibility**: The web should work for everyone
3. **Clarity**: Complex concepts explained without dumbing down
4. **Practicality**: Real solutions to real problems

---

## Voice Characteristics

### Primary Traits

| Trait | Description | Example |
|-------|-------------|---------|
| **Technical** | Deep knowledge, precise terminology | "The LCP improved from 2.4s to 1.1s after implementing priority hints" |
| **Accessible** | Complex concepts made understandable | "Think of SSG like pre-cooking meals - the work happens once, then it's instant to serve" |
| **Direct** | Confident statements, no hedging | "This approach reduces bundle size by 40%" (not "This might help reduce...") |
| **Educational** | Teaches the why, not just the how | "We use dynamic imports here because..." |
| **Practical** | Actionable, results-oriented | "Here's the exact configuration that achieved our Lighthouse 100" |

### Tone Spectrum

```
Casual ←――――――――|―――――――――→ Formal
                 ↑
            [We are here]
        Professional but approachable
```

- More conversational than academic papers
- More technical than marketing content
- Never corporate-speak or buzzword-heavy
- Occasional personality, but substance first

---

## Writing Guidelines

### Words and Phrases to USE

**Confident Starters:**
- "Here's how to..."
- "The key insight is..."
- "This approach works because..."
- "Let's explore..."
- "Notice how..."

**Active Constructions:**
- "This reduces..." (not "This can be used to reduce...")
- "You'll achieve..." (not "It is possible to achieve...")
- "The function returns..." (not "The function can return...")

**Technical Precision:**
- Specific metrics: "42% reduction in LCP"
- Concrete examples: "For a 100KB bundle..."
- Named technologies: "Using React 19's compiler..."

### Words and Phrases to AVOID

**Hedging Language:**
- ~~"I think"~~ → State it directly
- ~~"maybe"~~ → Research and be certain
- ~~"sort of"~~ → Be specific
- ~~"kind of"~~ → Define what it actually is
- ~~"probably"~~ → Test and confirm

**Filler Words:**
- ~~"just"~~ → Remove entirely
- ~~"simply"~~ → If it were simple, no explanation needed
- ~~"basically"~~ → Get to the point
- ~~"obviously"~~ → Nothing is obvious; explain it
- ~~"actually"~~ → Usually unnecessary

**Hyperbole:**
- ~~"amazing"~~ → Describe the specific benefit
- ~~"revolutionary"~~ → Explain what changed
- ~~"game-changing"~~ → Show the impact with data
- ~~"best ever"~~ → Compare with specifics
- ~~"incredible"~~ → Quantify the improvement

**Corporate Speak:**
- ~~"leverage"~~ → use
- ~~"synergy"~~ → integration, combination
- ~~"paradigm shift"~~ → significant change
- ~~"move the needle"~~ → improve metrics
- ~~"circle back"~~ → revisit, follow up

---

## Content Structure Standards

### Post Anatomy

```
1. TITLE (30-70 characters)
   - Action-oriented or benefit-focused
   - Contains primary keyword
   - No clickbait, but compelling

2. EXCERPT (150-160 characters exactly)
   - Summarizes the core value
   - Includes call-to-action verb
   - Optimized for search snippets

3. INTRODUCTION (2-3 paragraphs)
   - Hook: Why this matters now
   - Context: What problem we're solving
   - Promise: What the reader will learn

4. BODY (3+ sections with H2 headers)
   - Logical progression
   - Code examples where relevant
   - Subheadings (H3) for complex sections

5. CONCLUSION (1-2 paragraphs)
   - Key takeaways (bullet points work well)
   - Call to action (next steps, related content)
```

### Title Formulas That Work

| Formula | Example |
|---------|---------|
| Building [X] with [Y] | "Building High-Performance APIs with Edge Functions" |
| How to [Achieve X] | "How to Achieve Perfect Lighthouse Scores" |
| [X] Deep Dive: [Specific Topic] | "React 19 Deep Dive: The New Compiler" |
| [Number] [Things] for [Outcome] | "5 Caching Strategies for Sub-Second Load Times" |
| Why [X] and How to [Y] | "Why Layout Shift Happens and How to Fix It" |

### Excerpt Formula

```
[Action verb] + [what you'll learn] + [benefit/outcome]
```

Examples:
- "Learn how to leverage Next.js 16's App Router to build lightning-fast websites with perfect Lighthouse scores."
- "Discover the caching strategies that reduced our API response times from 800ms to under 50ms."

---

## Code Block Standards

### Language Identifiers
Always include the language: ```typescript, ```javascript, ```python, etc.

### Line Highlighting
Use line highlighting to draw attention to key sections:

```typescript {3,7-10}
// Lines 3 and 7-10 will be highlighted
```

### Diff Syntax
Show changes with visual indicators:

```typescript diff
- const oldWay = 'deprecated';
+ const newWay = 'modern';
```

### Code Commentary
- Comment sparingly, only for non-obvious logic
- Explain the "why" in surrounding prose
- Keep examples concise but complete

---

## SEO Requirements

### Keywords
- **Primary keyword**: In title, first paragraph, and at least one H2
- **Secondary keywords**: 3-5 related terms distributed naturally
- **Keyword density**: 1-2% (don't force it)

### Meta Requirements
- `title`: 30-70 characters
- `excerpt`: 150-160 characters (this becomes meta description)
- `keywords`: Array of 3-7 relevant terms
- `tags`: 2-5 category tags

### Schema.org
All posts automatically generate:
- BlogPosting schema
- BreadcrumbList schema
- Person schema (author)

---

## Visual & Design Alignment

### Neo-Brutalist Aesthetic
Content should complement the design system:

| Design Element | Content Equivalent |
|----------------|-------------------|
| Thick borders (2-4px) | Bold, definitive statements |
| High contrast (#F5F5F5 on #0A0A0A) | Clear, unambiguous positions |
| No rounded corners | Direct communication, no softening |
| Hard shadows | Substance over style |
| Raw, unpolished feel | Authentic voice, real experiences |

### Typography Considerations
- Font: Space Grotesk (matches heading confidence)
- Use **bold** for emphasis, not italics
- Use code formatting for technical terms: `useState`, `next.config.ts`
- Lists for scannable content

---

## Quality Checklist

Before publishing, every post must:

### Technical Accuracy
- [ ] All code examples tested and working
- [ ] Performance claims backed by data
- [ ] Technical terms used correctly
- [ ] Links to documentation included

### Voice Consistency
- [ ] No hedging language
- [ ] No filler words
- [ ] Active voice throughout
- [ ] Confident, direct tone

### Structure
- [ ] Title: 30-70 characters
- [ ] Excerpt: 150-160 characters exactly
- [ ] Introduction with hook and promise
- [ ] 3+ H2 sections
- [ ] Conclusion with takeaways

### SEO
- [ ] Primary keyword in title and H2
- [ ] 3-7 keywords in frontmatter
- [ ] 2-5 relevant tags
- [ ] Compelling excerpt for snippets

---

## Examples: Before & After

### Hedging → Confidence

**Before:**
> "I think this approach might help improve performance, and it could potentially reduce your bundle size."

**After:**
> "This approach improves performance by reducing bundle size 35%. Here's how it works."

### Passive → Active

**Before:**
> "The component was rendered by React when the state was updated."

**After:**
> "React re-renders the component whenever state updates."

### Vague → Specific

**Before:**
> "This makes the website load much faster."

**After:**
> "This reduces LCP from 2.8s to 1.2s, a 57% improvement."

### Corporate → Human

**Before:**
> "Leveraging cutting-edge paradigms to synergize development workflows."

**After:**
> "Using modern tools to speed up development."

---

*This style guide is a living document. Update it as the brand evolves.*
