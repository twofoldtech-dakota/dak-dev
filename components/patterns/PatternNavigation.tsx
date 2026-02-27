import Link from 'next/link';
import type { Pattern } from '@/lib/patterns';

const CHAPTER_BORDER_COLORS: Record<number, string> = {
  1: 'border-chapter-1',
  2: 'border-chapter-2',
  3: 'border-chapter-3',
  4: 'border-chapter-4',
  5: 'border-chapter-5',
  6: 'border-chapter-6',
};

const CHAPTER_TEXT_COLORS: Record<number, string> = {
  1: 'text-chapter-1',
  2: 'text-chapter-2',
  3: 'text-chapter-3',
  4: 'text-chapter-4',
  5: 'text-chapter-5',
  6: 'text-chapter-6',
};

interface PatternNavigationProps {
  previous: Pattern | null;
  next: Pattern | null;
}

export function PatternNavigation({ previous, next }: PatternNavigationProps) {
  if (!previous && !next) return null;

  return (
    <nav className="grid grid-cols-2 gap-4" aria-label="Pattern navigation">
      {previous ? (
        <Link
          href={`/patterns/${previous.frontmatter.slug}`}
          className={`group border-2 border-text/60 hover:border-text p-4 border-l-4 ${CHAPTER_BORDER_COLORS[previous.frontmatter.chapter]} transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--color-text)] focus:outline-none focus:ring-2 focus:ring-accent`}
        >
          <span className="text-[10px] text-muted uppercase tracking-widest font-mono">
            Previous
          </span>
          <p className="font-bold mt-1 group-hover:underline decoration-2 underline-offset-4 text-sm">
            <span className={`font-mono text-xs ${CHAPTER_TEXT_COLORS[previous.frontmatter.chapter]}`}>
              {previous.frontmatter.number}
            </span>{' '}
            {previous.frontmatter.name}
          </p>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={`/patterns/${next.frontmatter.slug}`}
          className={`group border-2 border-text/60 hover:border-text p-4 border-r-4 ${CHAPTER_BORDER_COLORS[next.frontmatter.chapter]} text-right transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--color-text)] focus:outline-none focus:ring-2 focus:ring-accent`}
        >
          <span className="text-[10px] text-muted uppercase tracking-widest font-mono">
            Next
          </span>
          <p className="font-bold mt-1 group-hover:underline decoration-2 underline-offset-4 text-sm">
            <span className={`font-mono text-xs ${CHAPTER_TEXT_COLORS[next.frontmatter.chapter]}`}>
              {next.frontmatter.number}
            </span>{' '}
            {next.frontmatter.name}
          </p>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
