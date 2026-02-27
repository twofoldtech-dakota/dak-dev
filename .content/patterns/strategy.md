# Agent Patterns — Content Strategy

> Repeatable techniques for engineering with AI coding agents

**Format:** Searchable reference catalog (not a blog)
**URL:** `/patterns`
**Audience:** Professional software engineers already using coding agents who want to get consistently better results
**Inspired by:** Design Patterns (GoF, 1994) — named patterns with consistent anatomy, organized into chapters, cross-referenced

---

## What This Is

A structured, searchable reference of named patterns for working effectively with AI coding agents. Each pattern addresses a specific recurring problem that professional engineers encounter when using agents to build software.

Patterns are tool-agnostic. They apply across Claude Code, Copilot, Cursor, Windsurf, and whatever comes next. The principles are about the *engineering workflow*, not the specific tool.

## What This Is NOT

- Not a beginner's guide to AI ("what is a prompt")
- Not a tool manual (Claude Code docs already exist)
- Not a collection of tips or tricks
- Not a claim that agents replace engineering judgment — patterns describe how to *amplify* existing expertise

---

## Pattern Anatomy

Every pattern follows the same structure. This consistency is what makes it a reference rather than a blog.

### Required Fields

| Field | Description |
|-------|-------------|
| **Name** | A memorable, descriptive name (2-3 words). Becomes shared vocabulary. |
| **Chapter** | Which chapter this pattern belongs to (1-6). |
| **Slug** | URL-friendly identifier derived from name. |
| **Intent** | One sentence: what this pattern achieves. |
| **Problem** | 1-2 paragraphs: the recurring situation that motivates this pattern. What goes wrong without it. |
| **Solution** | 2-4 paragraphs + concrete examples: the technique. This is the core of the pattern. Includes code/prompt examples where relevant. |
| **Signals** | Bullet list: how to recognize when you need this pattern. Observable symptoms in your workflow. |
| **Consequences** | What you gain and what it costs. Every pattern has tradeoffs. |
| **Related Patterns** | Explicit links to other patterns that compose with, enable, or contrast this one. Includes a short note on the relationship. |

### Optional Fields

| Field | Description |
|-------|-------------|
| **Example** | A longer worked example showing the pattern applied to a real scenario. |
| **Anti-Pattern** | What happens when people try the opposite, or apply this pattern incorrectly. |
| **Difficulty** | Beginner / Intermediate / Advanced — how much agent experience you need to apply it. |

---

## Chapter Structure

### Chapter 1: Foundation

*Setting up your environment, codebase, and tools for agent success — before you write a single prompt.*

Foundation patterns are about preparation. Engineers who skip these end up fighting their tools instead of leveraging them. These patterns pay compound interest over time.

| # | Pattern | Intent |
|---|---------|--------|
| 1.1 | **Convention File** | Make implicit project rules explicit in a file the agent always reads, so it follows your standards without being told each time. |
| 1.2 | **Safety Net** | Establish automated checks (tests, types, linting) as guardrails so agent mistakes get caught immediately, not in production. |
| 1.3 | **Memory Layer** | Use persistent context files to maintain project knowledge across sessions, eliminating repetitive re-explanation. |
| 1.4 | **Agent-Friendly Architecture** | Organize code with clear boundaries, named modules, and explicit interfaces so agents can navigate and modify it confidently. |

### Chapter 2: Context

*Managing what the agent knows — and doesn't know — at any given moment.*

Context is the single biggest lever on agent output quality. These patterns address the fundamental constraint that agents have limited attention and no memory beyond what you provide.

| # | Pattern | Intent |
|---|---------|--------|
| 2.1 | **Context Priming** | Front-load the most relevant files and decisions before making a request, so the agent starts from understanding rather than guessing. |
| 2.2 | **Scope Fence** | Explicitly constrain the agent's working area to prevent drift into unrelated code, keeping changes focused and reviewable. |
| 2.3 | **Progressive Disclosure** | Reveal project complexity incrementally instead of dumping everything at once, avoiding context overload. |
| 2.4 | **Anchor Point** | Reference specific files, functions, and line numbers to ground the agent in concrete code rather than abstract descriptions. |

### Chapter 3: Task

*Breaking work into units that agents handle well.*

How you decompose a task determines whether the agent produces something useful or something you throw away. These patterns address the structural mismatch between how engineers think about work and how agents execute it.

| # | Pattern | Intent |
|---|---------|--------|
| 3.1 | **Vertical Slice** | Break features into thin end-to-end slices rather than horizontal layers, giving the agent complete context for each piece. |
| 3.2 | **Checkpoint Loop** | Work in small cycles of do-then-verify instead of one big request, catching drift early before it compounds. |
| 3.3 | **Scaffold First** | Have the agent build types, interfaces, and structure before filling in implementation, establishing constraints that guide the rest. |
| 3.4 | **Parallel Fan-Out** | Split independent subtasks across concurrent agent sessions to multiply throughput without multiplying errors. |

### Chapter 4: Steering

*Guiding agent behavior toward the output you actually want.*

The gap between what you asked for and what the agent produces usually isn't a capability problem — it's a communication problem. These patterns close that gap.

| # | Pattern | Intent |
|---|---------|--------|
| 4.1 | **Test-First Steering** | Write failing tests first so the agent has a concrete, verifiable target instead of an ambiguous description. |
| 4.2 | **Example-Driven Spec** | Show the desired output shape rather than describing it abstractly, reducing interpretation error. |
| 4.3 | **Negative Space** | Define what the agent should NOT do, because constraints eliminate more bad output than instructions produce good output. |
| 4.4 | **Constraint Over Instruction** | Specify boundaries and invariants rather than step-by-step procedures, giving the agent room to find good solutions within your guardrails. |

### Chapter 5: Verification

*Ensuring the agent's output is correct, complete, and safe to ship.*

Trust but verify. Agents are confident, fast, and sometimes wrong. These patterns build verification into the workflow so errors surface early, not in code review or production.

| # | Pattern | Intent |
|---|---------|--------|
| 5.1 | **Incremental Verification** | Check output at each step rather than reviewing everything at the end, when the cost of fixing problems has compounded. |
| 5.2 | **Adversarial Review** | Use a separate agent pass to critique and find flaws in generated code, exploiting the fact that reviewing is easier than generating. |
| 5.3 | **Regression Guard** | Run the full test suite after each significant change, not just at the end, because agents can break things far from where they're working. |
| 5.4 | **Diff Review** | Always read the actual diff before accepting, because the agent's summary of what it did and what it actually did can diverge. |

### Chapter 6: Recovery

*What to do when things go wrong, and how to build resilience into your workflow.*

Agents get stuck, produce bad output, and go down rabbit holes. These patterns aren't about preventing failure — they're about making failure cheap and recoverable.

| # | Pattern | Intent |
|---|---------|--------|
| 6.1 | **Clean Slate** | Recognize when a conversation is stuck and start fresh instead of compounding errors with more context that's already confused. |
| 6.2 | **Rollback Point** | Commit frequently so you can revert any agent change in seconds, making experimentation free. |
| 6.3 | **Fallback Escalation** | Define what to do when the agent can't solve it — decompose further, switch approach, or take over manually. |
| 6.4 | **Human Checkpoint** | Place explicit approval gates before irreversible or high-risk actions, because speed is worthless if it's speed in the wrong direction. |

---

## Cross-Reference Map

Patterns don't exist in isolation. These relationships are first-class navigation in the reference.

### Enables (A makes B possible or more effective)

- **Safety Net** enables **Checkpoint Loop** — you can't verify incrementally without automated checks to run
- **Safety Net** enables **Regression Guard** — guards need an existing test suite to run
- **Convention File** enables **Context Priming** — the convention file is the single most important context to prime
- **Scaffold First** enables **Parallel Fan-Out** — shared types/interfaces let independent agents stay compatible
- **Rollback Point** enables **Clean Slate** — frequent commits make starting fresh painless

### Composes (A + B used together produce a stronger result)

- **Scaffold First** + **Test-First Steering** — build the types, write the tests, then the implementation is heavily constrained
- **Vertical Slice** + **Checkpoint Loop** — slice thin, verify each slice, build confidence incrementally
- **Context Priming** + **Anchor Point** — prime with files, then anchor requests to specific locations within them
- **Negative Space** + **Constraint Over Instruction** — define what not to do + define boundaries = tightly scoped solution space
- **Adversarial Review** + **Diff Review** — agent critiques the code, human reviews the diff, two independent checks

### Prevents (A reduces the need for B)

- **Scope Fence** prevents **Clean Slate** — if you fence well, the agent rarely drifts far enough to need a restart
- **Incremental Verification** prevents **Regression Guard** (at scale) — catching issues per-step means fewer surprises at the full-suite level
- **Convention File** prevents **Negative Space** (partially) — conventions encode "don't do X" durably so you don't repeat it per-request

### Contrasts (A vs B — different approaches to similar problems)

- **Example-Driven Spec** vs **Constraint Over Instruction** — showing what you want vs defining the space of acceptable solutions
- **Progressive Disclosure** vs **Context Priming** — gradual revelation vs front-loading; depends on task complexity
- **Checkpoint Loop** vs **Parallel Fan-Out** — serial verification vs parallel execution; depends on task independence

---

## Entry Points

A searchable reference needs multiple ways in, not just a table of contents.

### By Chapter (for systematic reading)
The default. Read Foundation → Context → Task → Steering → Verification → Recovery as a progression from setup to execution to quality.

### By Problem (for "I'm stuck right now")
Index patterns by the symptom you're experiencing:
- "The agent keeps making changes I didn't ask for" → Scope Fence, Negative Space
- "I keep re-explaining the same things" → Convention File, Memory Layer
- "The output is technically correct but doesn't match our codebase style" → Convention File, Agent-Friendly Architecture
- "The agent produced a huge diff and I'm not sure it's right" → Checkpoint Loop, Incremental Verification, Diff Review
- "The conversation got confused and the agent is going in circles" → Clean Slate, Rollback Point
- "I'm not getting enough value from agents on complex tasks" → Vertical Slice, Scaffold First, Test-First Steering
- "The agent broke something unrelated to what I asked for" → Scope Fence, Safety Net, Regression Guard
- "I'm spending more time fixing agent output than writing it myself" → Test-First Steering, Constraint Over Instruction, Checkpoint Loop

### By Difficulty
- **Beginner** (start here): Convention File, Safety Net, Anchor Point, Checkpoint Loop, Diff Review, Rollback Point
- **Intermediate**: Context Priming, Scope Fence, Vertical Slice, Test-First Steering, Incremental Verification, Clean Slate
- **Advanced**: Memory Layer, Agent-Friendly Architecture, Parallel Fan-Out, Adversarial Review, Scaffold First + Test-First Steering composition

---

## Relationship to the Blog

The patterns section and the blog are separate but connected:

- **Patterns** are the reference — stable, structured, updated in place
- **Blog posts** can announce new patterns, discuss them in depth, show case studies, share the story behind discovering a pattern
- Blog posts link INTO the patterns section (e.g., "this project used the Checkpoint Loop pattern")
- Patterns can reference blog posts as extended examples
- Patterns are not date-stamped; blog posts are

---

## Growth Model

Start with the 24 patterns above. Add new patterns when:

1. A recurring problem is identified that no existing pattern addresses
2. The new pattern has a clear name, intent, and at least 2 concrete examples
3. It's distinct from existing patterns (not a variation — those go in the existing pattern's content)

Patterns can also be revised as the field evolves. The reference is a living document.

---

## Open Questions

- [ ] Should patterns have a visual/diagrammatic element? (e.g., before/after workflow diagrams)
- [ ] Is there value in a "pattern language" map — a visual graph showing all relationships?
- [ ] Should there be a "quick reference" card for each pattern (printable/shareable summary)?
- [ ] How to handle tool-specific examples? (keep generic, or show Claude Code + Cursor + Copilot variants?)

---

*Strategy document — iterate before building.*
