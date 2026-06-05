// The Learn ON-RAMP — a plain-English foundations layer for non-technical
// readers (founders, PMs, designers, ops) who watched an agentic-engineering
// demo and asked "how do I understand what you're doing?". It decodes the
// vocabulary and the core mental models, then hands the curious off to the four
// pillars. This module is client-safe (no fs) so the Decoder client island can
// import the glossary data directly.
//
// NOT A FIFTH PILLAR. The four pillars (Patterns, Toolkit, Harness, Security)
// are expert guides for builders; this layer sits *in front of* them. It still
// ships a boundary statement and this client-safe types module to stay
// consistent with the per-section convention (DESIGN.md §4) — without claiming
// peer status. There is no boundary-on-the-hero contract to satisfy here; the
// boundary renders on the on-ramp's own index.
//
// ROUTING INVARIANT: the on-ramp owns a small, fixed route set —
//   /learn/start              (index — "Start Here")
//   /learn/start/decoder      (the glossary)
//   /learn/start/demo/<slug>  (annotated "Demo, Decoded" walkthroughs)
// It is intentionally EXCLUDED from the four-pillar sidebar/active-slug parsing
// (LearnSidebar keys off /learn/{patterns,toolkit,harness,security}). Adding the
// on-ramp to that parsing means revisiting LearnSidebar + LearnMobileNav.

// The boundary statement — what this is NOT, on purpose. Renders on the
// on-ramp index so the "front door, not a pillar" mental model stays legible.
export const ONRAMP_BOUNDARY =
  'A plain-English on-ramp for people who saw the demo and want to understand it — not build it yet. It decodes the words and the mental models behind agentic engineering, then points you at the four pillars when you want to go deep. Not a tutorial. Not "AI for dummies". The shortest path from "what am I looking at?" to "I get it."';

export interface GlossaryClusterMeta {
  /** Stable id, used as the section anchor. */
  id: string;
  name: string;
  /** One-line framing for the cluster header. */
  blurb: string;
  order: number;
}

export interface DeeperLink {
  label: string;
  href: string;
  /** External links open in a new tab with rel="noopener noreferrer". */
  external?: boolean;
}

export interface GlossaryTerm {
  term: string;
  /** Cluster id (see GLOSSARY_CLUSTERS). */
  cluster: string;
  /**
   * A familiar analogy — PAIRED WITH, never a replacement for, the precise
   * term. The brand rule is "explain without dumbing down"; the analogy builds
   * intuition, the definition keeps it honest.
   */
  analogy: string;
  /** The precise definition, in one plain sentence. */
  definition: string;
  /** A concrete example a non-technical reader would recognise. */
  example: string;
  /** Optional "go deeper" link, usually into one of the four pillars. */
  deeper?: DeeperLink;
}

export const GLOSSARY_CLUSTERS: GlossaryClusterMeta[] = [
  {
    id: 'foundations',
    name: 'The Foundations',
    blurb: 'What the model is, underneath — before any talk of "agents".',
    order: 1,
  },
  {
    id: 'action',
    name: 'How Agents Act',
    blurb: 'What turns a chatbot that answers into something that does things.',
    order: 2,
  },
  {
    id: 'trust',
    name: 'Building & Trusting It',
    blurb: 'The scaffolding, the guardrails, and why it sometimes makes things up.',
    order: 3,
  },
];

// The 12 starter terms — the words that fly past in a demo. Each follows the
// same shape: analogy → precise definition → concrete example → go deeper.
export const GLOSSARY_TERMS: GlossaryTerm[] = [
  // — Foundations —
  {
    term: 'LLM',
    cluster: 'foundations',
    analogy:
      'Sophisticated autocomplete — the same idea as your phone guessing the next word, trained on far more text and far better at it.',
    definition:
      'A "large language model": software that predicts the most likely next chunk of text from patterns it learned in training. It generates language; it does not look things up.',
    example:
      'Ask it for a quote and it produces something that sounds right — because it is predicting plausible text, not retrieving a stored record.',
    deeper: { label: 'The real risks', href: '/learn/security/the-real-risks' },
  },
  {
    term: 'Token',
    cluster: 'foundations',
    analogy: 'A chunk of text — roughly three-quarters of a word. The unit the model reads and bills in.',
    definition:
      'The fragments a model breaks text into. Around 100 tokens ≈ 75 English words. Limits and pricing are counted in tokens, not words or characters.',
    example: '"strawberry" can be three tokens — which is part of why a model can miscount the letters in it.',
  },
  {
    term: 'Context window',
    cluster: 'foundations',
    analogy: "The model's working memory — a desk. Pile on too many papers and the earliest ones slide off the edge.",
    definition:
      'Everything the model can see at once: your prompt, the conversation so far, attached files, and its own reply. Past the limit, earlier content is dropped — and nothing persists once the session ends.',
    example: 'In a long chat it "forgets" what you said at the start — that text fell off the desk.',
    deeper: { label: 'The agent loop', href: '/learn/harness/agent-loop' },
  },
  {
    term: 'Prompt',
    cluster: 'foundations',
    analogy: 'The brief. Closer to writing instructions for a new contractor than to programming.',
    definition: 'The text you give the model — question, instructions, context. Its quality shapes the quality of the output.',
    example: '"Summarise this" versus "Summarise this in three bullets for a CFO" pull sharply different results from the same model.',
    deeper: { label: 'Patterns', href: '/learn/patterns' },
  },
  // — How agents act —
  {
    term: 'Agent',
    cluster: 'action',
    analogy: 'A worker you delegate to: brief it, and it takes steps on its own. A chatbot answers; an agent acts.',
    definition:
      'An LLM that runs tools in a loop toward a goal — it acts, checks the result, decides the next step, and repeats until done.',
    example: '"Fix the failing test": it reads the test, edits the code, re-runs the suite, and stops once it passes.',
    deeper: { label: 'The agent loop', href: '/learn/harness/agent-loop' },
  },
  {
    term: 'Agentic',
    cluster: 'action',
    analogy: 'The adjective for "acts like an agent" — multi-step and self-directed, not one question and one answer.',
    definition: 'Describes AI that plans and takes a sequence of actions with some autonomy, adapting as new information comes back.',
    example: 'An "agentic workflow" books the whole trip end to end; a chatbot only tells you how to book it.',
  },
  {
    term: 'Tool use',
    cluster: 'action',
    analogy: 'Letting the model pick up the phone. On its own it can only write text; a tool lets it do something in the real world.',
    definition:
      'Also called "function calling": the model requests an action from outside software — search the web, read a file, hit an API — and the result comes back into its context.',
    example: 'Asked for today\'s weather, it calls a weather tool instead of guessing.',
    deeper: { label: 'Hooks', href: '/learn/toolkit/hooks' },
  },
  {
    term: 'MCP',
    cluster: 'action',
    analogy: 'USB-C for AI — one standard plug so any agent can connect to any data source or tool.',
    definition:
      'The Model Context Protocol: an open standard (Anthropic, 2024) for connecting AI systems to external tools and data without building a custom integration for each one.',
    example: 'An MCP server for your docs lets an agent read them without bespoke glue code.',
    deeper: { label: 'MCP in the Toolkit', href: '/learn/toolkit/mcp' },
  },
  // — Building & trusting it —
  {
    term: 'Harness',
    cluster: 'trust',
    analogy: 'The cockpit around the engine. The model is the engine; the harness is everything that makes it useful and safe to fly.',
    definition:
      'The runtime around the model — the loop, tool access, memory, prompts, and guardrails. The model reasons; the harness does everything else.',
    example: 'Two products built on the same model can behave nothing alike because their harnesses differ.',
    deeper: { label: 'Harness Engineering', href: '/learn/harness' },
  },
  {
    term: 'RAG',
    cluster: 'trust',
    analogy: 'Letting it check the notes before answering, instead of going from memory.',
    definition:
      'Retrieval-Augmented Generation: fetch relevant documents at question time and have the model answer from them. It reduces made-up answers — it does not eliminate them.',
    example: 'A support bot that quotes your actual help docs rather than inventing a policy.',
    deeper: { label: 'Data & PII in context', href: '/learn/security/data-and-pii' },
  },
  {
    term: 'Human-in-the-loop',
    cluster: 'trust',
    analogy: 'A dial, not a switch — from "asks before every move" to "acts and reports back".',
    definition:
      'How much the agent does without you: in-the-loop (you approve each action), on-the-loop (it acts, you monitor), or out-of-the-loop (fully autonomous).',
    example: 'An agent that asks before deleting files is in-the-loop; one that opens a pull request for your review is on-the-loop.',
    deeper: { label: 'Permission architecture', href: '/learn/security/permission-architecture' },
  },
  {
    term: 'Hallucination',
    cluster: 'trust',
    analogy: 'A confident bluff. It is generating plausible text, so "I don\'t know" rarely comes naturally.',
    definition: 'When a model states something false as if it were true — because it predicts likely text rather than retrieving verified facts.',
    example: 'It cites a court case that does not exist: fluent, well-formatted, and entirely invented.',
    deeper: { label: 'The real risks', href: '/learn/security/the-real-risks' },
  },
];

export interface DemoFrontmatter {
  title: string;
  slug: string;
  description: string;
  /** One-line "what you'll watch" promise, shown on the index card. */
  scenario: string;
  published: boolean;
  keywords?: string[];
}

export interface DemoMeta {
  slug: string;
  title: string;
  scenario: string;
  /** Single-path 24x24 stroke icon — the site's SVG convention. */
  icon: string;
  order: number;
}

export interface DemoWalkthrough {
  frontmatter: DemoFrontmatter;
  content: string;
  readingTime: string;
}

// "Demo, Decoded" walkthroughs — annotated replays of real agentic work. Each
// has a content file at content/onramp/demos/<slug>.mdx.
export const DEMO_WALKTHROUGHS: DemoMeta[] = [
  {
    slug: 'fix-a-failing-test',
    title: 'Fix a Failing Test',
    scenario: 'Watch an agent find and fix a real bug — every move decoded in plain English as it happens.',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    order: 1,
  },
];

export function getGlossaryByCluster(clusterId: string): GlossaryTerm[] {
  return GLOSSARY_TERMS.filter((t) => t.cluster === clusterId);
}

export function getAllDemoSlugs(): string[] {
  return DEMO_WALKTHROUGHS.map((d) => d.slug);
}

export function getDemoMeta(slug: string): DemoMeta | undefined {
  return DEMO_WALKTHROUGHS.find((d) => d.slug === slug);
}
