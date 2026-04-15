import { getAllPatterns, CHAPTERS } from '@/lib/patterns';
import Link from 'next/link';
import { DifficultyBadge } from '@/components/patterns/DifficultyBadge';

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
 * Homepage showcase section for the Agent Patterns catalog
 * Highlights the patterns reference with chapter breakdown and featured patterns
 */
export function PatternsShowcase() {
  const allPatterns = getAllPatterns();

  if (allPatterns.length === 0) return null;

  // Pick one representative pattern per chapter (first published pattern)
  const featuredPatterns = CHAPTERS
    .map((chapter) => {
      const chapterPatterns = allPatterns.filter(
        (p) => p.frontmatter.chapter === chapter.number
      );
      return chapterPatterns[0] || null;
    })
    .filter((p) => p !== null);

  // Count patterns per chapter for the stats
  const chapterStats = CHAPTERS.map((chapter) => ({
    ...chapter,
    count: allPatterns.filter((p) => p.frontmatter.chapter === chapter.number).length,
  }));

  return (
    <section className="py-16 md:py-24 border-t-4 border-text">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 flex items-end justify-between border-b-4 border-text pb-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-2">
              Agent Patterns
            </h2>
            <p className="text-lg text-muted">
              A structured reference for AI-assisted engineering
            </p>
          </div>
          <Link
            href="/learn/patterns"
            className="group hidden sm:inline-flex items-center gap-2 text-text font-semibold hover:underline underline-offset-4 decoration-4 focus:outline-none focus:ring-4 focus:ring-text focus:ring-offset-4 focus:ring-offset-background"
          >
            Explore Catalog
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

        {/* Stats Bar */}
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
            <span className="text-3xl md:text-4xl font-bold text-text tabular-nums">3</span>
            <span className="text-sm font-bold uppercase tracking-wider text-muted">
              Difficulty Levels
            </span>
          </div>
        </div>

        {/* Chapter Grid — shows all 6 chapters with their pattern counts */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {chapterStats.map((chapter) => (
            <Link
              key={chapter.number}
              href={`/learn/patterns/chapter/${chapter.slug}`}
              className={`group block border-2 border-text/30 hover:border-text ${CHAPTER_BG_COLORS[chapter.number]} p-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_var(--color-text)] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background`}
            >
              <span className={`block font-mono text-xs font-bold ${CHAPTER_TEXT_COLORS[chapter.number]} mb-1`}>
                CH.{chapter.number}
              </span>
              <span className="block text-sm font-bold text-text group-hover:underline decoration-2 underline-offset-4">
                {chapter.name}
              </span>
              <span className="block text-xs text-muted mt-1 tabular-nums">
                {chapter.count} {chapter.count === 1 ? 'pattern' : 'patterns'}
              </span>
            </Link>
          ))}
        </div>

        {/* Featured Patterns — one per chapter */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted mb-4">
            Sample from each chapter
          </p>
          {featuredPatterns.map((pattern) => (
            <Link
              key={pattern.frontmatter.slug}
              href={`/learn/patterns/${pattern.frontmatter.slug}`}
              className={`group block border-2 border-text/20 hover:border-text/60 bg-surface/40 border-l-4 ${CHAPTER_BORDER_COLORS[pattern.frontmatter.chapter]} px-5 py-4 transition-all duration-150 hover:-translate-x-0.5 hover:shadow-[3px_3px_0_0_var(--color-text)] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background`}
            >
              {/* Line 1: Number + Name + Difficulty */}
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
              {/* Line 2: Intent */}
              <span className="block mt-1.5 pl-12 text-xs text-muted line-clamp-1">
                {pattern.frontmatter.intent}
              </span>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Link
            href="/learn/patterns"
            className="group inline-flex items-center justify-center font-semibold px-6 py-3 text-base gap-2 bg-transparent text-accent border-4 border-accent hover:bg-accent hover:text-background shadow-[4px_4px_0_0_var(--color-accent)] hover:shadow-[6px_6px_0_0_var(--color-accent)] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-accent focus:ring-offset-4 focus:ring-offset-background"
          >
            Browse All Patterns
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
      </div>
    </section>
  );
}
