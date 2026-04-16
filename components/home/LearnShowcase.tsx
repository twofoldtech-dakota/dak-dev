import { getAllPatterns, CHAPTERS } from '@/lib/patterns';
import { TOOLKIT_TOPICS } from '@/lib/toolkit-types';
import Link from 'next/link';
import { DifficultyBadge } from '@/components/patterns/DifficultyBadge';
import { ScrollReveal, ScrollRevealItem } from '@/components/ui/ScrollReveal';

const CHAPTER_TEXT_COLORS: Record<number, string> = {
  1: 'text-chapter-1',
  2: 'text-chapter-2',
  3: 'text-chapter-3',
  4: 'text-chapter-4',
  5: 'text-chapter-5',
  6: 'text-chapter-6',
};

const CHAPTER_BORDER_COLORS: Record<number, string> = {
  1: 'border-l-chapter-1',
  2: 'border-l-chapter-2',
  3: 'border-l-chapter-3',
  4: 'border-l-chapter-4',
  5: 'border-l-chapter-5',
  6: 'border-l-chapter-6',
};

const CHAPTER_BG_COLORS: Record<number, string> = {
  1: 'bg-chapter-1/10',
  2: 'bg-chapter-2/10',
  3: 'bg-chapter-3/10',
  4: 'bg-chapter-4/10',
  5: 'bg-chapter-5/10',
  6: 'bg-chapter-6/10',
};

/**
 * Unified homepage showcase for the Learn section — Patterns + Toolkit
 * Server component with ScrollReveal for viewport-triggered animations
 */
export function LearnShowcase() {
  const allPatterns = getAllPatterns();

  if (allPatterns.length === 0 && TOOLKIT_TOPICS.length === 0) return null;

  // Chapter stats
  const chapterStats = CHAPTERS.map((chapter) => ({
    ...chapter,
    count: allPatterns.filter((p) => p.frontmatter.chapter === chapter.number).length,
  }));

  // Pick 3 featured patterns (chapters 1, 2, 3) for the sample list
  const featuredPatterns = CHAPTERS.slice(0, 3)
    .map((chapter) => {
      const chapterPatterns = allPatterns.filter(
        (p) => p.frontmatter.chapter === chapter.number
      );
      return chapterPatterns[0] || null;
    })
    .filter((p) => p !== null);

  return (
    <section className="py-16 md:py-24 border-t-4 border-text">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal>
          <div className="mb-12 flex items-end justify-between border-b-4 border-text pb-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-2">Learn</h2>
              <p className="text-lg text-muted">
                A structured reference for agentic engineering
              </p>
            </div>
            <Link
              href="/learn"
              className="group hidden sm:inline-flex items-center gap-2 text-text font-semibold hover:underline underline-offset-4 decoration-4 focus:outline-none focus:ring-4 focus:ring-text focus:ring-offset-4 focus:ring-offset-background"
            >
              Explore All
              <svg
                className="w-5 h-5 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </ScrollReveal>

        {/* Stats Bar */}
        <ScrollReveal>
          <div className="flex flex-wrap gap-6 mb-10">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl md:text-4xl font-bold text-accent tabular-nums">
                {allPatterns.length}
              </span>
              <span className="text-sm font-bold uppercase tracking-wider text-muted">
                Patterns
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl md:text-4xl font-bold text-text tabular-nums">
                {CHAPTERS.length}
              </span>
              <span className="text-sm font-bold uppercase tracking-wider text-muted">
                Chapters
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl md:text-4xl font-bold text-text tabular-nums">
                {TOOLKIT_TOPICS.length}
              </span>
              <span className="text-sm font-bold uppercase tracking-wider text-muted">
                Deep-Dives
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl md:text-4xl font-bold text-text tabular-nums">4</span>
              <span className="text-sm font-bold uppercase tracking-wider text-muted">
                Sub-pages Each
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* Two-Panel Intro */}
        <ScrollReveal stagger>
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Patterns Panel */}
            <ScrollRevealItem>
              <Link
                href="/learn/patterns"
                className="group block border-4 border-text p-6 md:p-8 transition-all duration-200 hover:shadow-[8px_8px_0_0_var(--color-accent)] hover:border-accent hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-accent focus:ring-offset-4 focus:ring-offset-background h-full"
              >
                {/* Panel Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl md:text-3xl font-bold group-hover:text-accent transition-colors">
                    Patterns
                  </h3>
                  <span className="border-2 border-accent text-accent text-xs font-bold uppercase tracking-wider px-3 py-1">
                    {allPatterns.length} patterns
                  </span>
                </div>
                <p className="text-muted mb-6 leading-relaxed">
                  Named, repeatable techniques for AI-assisted engineering. Organized into {CHAPTERS.length} chapters from foundation to advanced orchestration.
                </p>

                {/* Mini Chapter Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                  {chapterStats.map((chapter) => (
                    <div
                      key={chapter.number}
                      className={`${CHAPTER_BG_COLORS[chapter.number]} border border-text/20 p-3 transition-colors group-hover:border-text/40`}
                    >
                      <span className={`block font-mono text-[10px] font-bold ${CHAPTER_TEXT_COLORS[chapter.number]} mb-0.5`}>
                        CH.{chapter.number}
                      </span>
                      <span className="block text-xs font-bold text-text truncate">
                        {chapter.name}
                      </span>
                      <span className="block text-[10px] text-muted mt-0.5 tabular-nums">
                        {chapter.count} {chapter.count === 1 ? 'pattern' : 'patterns'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-accent">
                  Browse patterns
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </ScrollRevealItem>

            {/* Toolkit Panel */}
            <ScrollRevealItem>
              <Link
                href="/learn/toolkit"
                className="group block border-4 border-text p-6 md:p-8 transition-all duration-200 hover:shadow-[8px_8px_0_0_var(--color-accent)] hover:border-accent hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-accent focus:ring-offset-4 focus:ring-offset-background h-full"
              >
                {/* Panel Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl md:text-3xl font-bold group-hover:text-accent transition-colors">
                    Toolkit
                  </h3>
                  <span className="border-2 border-text text-text text-xs font-bold uppercase tracking-wider px-3 py-1">
                    {TOOLKIT_TOPICS.length} deep-dives
                  </span>
                </div>
                <p className="text-muted mb-6 leading-relaxed">
                  Expert&apos;s guide to Claude Code internals. Mental models, production playbooks, composition patterns, and real-world pitfalls.
                </p>

                {/* Topic List */}
                <div className="space-y-2 mb-6">
                  {TOOLKIT_TOPICS.map((topic) => (
                    <div
                      key={topic.slug}
                      className="flex items-start gap-3 border border-text/20 p-3 transition-colors group-hover:border-text/40"
                    >
                      <svg
                        className="w-4 h-4 text-accent/60 shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={topic.icon} />
                      </svg>
                      <div className="min-w-0">
                        <span className="block text-sm font-bold text-text">{topic.name}</span>
                        <span className="block text-[11px] text-muted leading-snug truncate">
                          {topic.description}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-accent">
                  Explore toolkit
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </ScrollRevealItem>
          </div>
        </ScrollReveal>

        {/* Featured Patterns Sample */}
        {featuredPatterns.length > 0 && (
          <ScrollReveal stagger>
            <div className="mb-10">
              <p className="text-xs font-bold uppercase tracking-wider text-muted mb-4">
                Sample patterns
              </p>
              <div className="space-y-3">
                {featuredPatterns.map((pattern) => (
                  <ScrollRevealItem key={pattern.frontmatter.slug}>
                    <Link
                      href={`/learn/patterns/${pattern.frontmatter.slug}`}
                      className={`group block border-2 border-text/20 hover:border-text/60 bg-surface/40 border-l-4 ${CHAPTER_BORDER_COLORS[pattern.frontmatter.chapter]} px-5 py-4 transition-all duration-150 hover:-translate-x-0.5 hover:shadow-[3px_3px_0_0_var(--color-text)] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background`}
                    >
                      <span className="flex items-center gap-4">
                        <span className={`font-mono text-xs font-bold ${CHAPTER_TEXT_COLORS[pattern.frontmatter.chapter]} tabular-nums flex-shrink-0 w-8`}>
                          {pattern.frontmatter.number}
                        </span>
                        <span className="font-bold text-sm group-hover:underline decoration-2 underline-offset-4 flex-1 min-w-0 truncate">
                          {pattern.frontmatter.name}
                        </span>
                        <DifficultyBadge difficulty={pattern.frontmatter.difficulty} className="flex-shrink-0" />
                        <svg
                          className="w-4 h-4 text-muted/0 group-hover:text-muted group-hover:translate-x-0.5 transition-all flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                      <span className="block mt-1.5 pl-12 text-xs text-muted line-clamp-1">
                        {pattern.frontmatter.intent}
                      </span>
                    </Link>
                  </ScrollRevealItem>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* CTAs */}
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Link
              href="/learn/patterns"
              className="group inline-flex items-center justify-center font-semibold px-6 py-3 text-base gap-2 bg-transparent text-accent border-4 border-accent hover:bg-accent hover:text-background shadow-[4px_4px_0_0_var(--color-accent)] hover:shadow-[6px_6px_0_0_var(--color-accent)] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-accent focus:ring-offset-4 focus:ring-offset-background"
            >
              Browse Patterns
              <svg
                className="w-5 h-5 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/learn/toolkit"
              className="group inline-flex items-center justify-center font-semibold px-6 py-3 text-base gap-2 bg-transparent text-text border-4 border-text hover:bg-text hover:text-background shadow-[4px_4px_0_0_var(--color-text)] hover:shadow-[6px_6px_0_0_var(--color-text)] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-text focus:ring-offset-4 focus:ring-offset-background"
            >
              Explore Toolkit
              <svg
                className="w-5 h-5 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/learn/patterns/graph"
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-text transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="3" strokeWidth={2} />
                <circle cx="4" cy="6" r="2" strokeWidth={2} />
                <circle cx="20" cy="6" r="2" strokeWidth={2} />
                <circle cx="4" cy="18" r="2" strokeWidth={2} />
                <circle cx="20" cy="18" r="2" strokeWidth={2} />
                <path strokeWidth={1.5} d="M6 7l4 3M18 7l-4 3M6 17l4-3M18 17l-4-3" />
              </svg>
              View Language Map
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
