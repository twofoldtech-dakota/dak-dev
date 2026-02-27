import Link from 'next/link';
import type { Pattern } from '@/lib/patterns';
import { DifficultyBadge } from './DifficultyBadge';

const CHAPTER_BORDER_COLORS: Record<number, string> = {
  1: 'border-l-chapter-1',
  2: 'border-l-chapter-2',
  3: 'border-l-chapter-3',
  4: 'border-l-chapter-4',
  5: 'border-l-chapter-5',
  6: 'border-l-chapter-6',
};

const CHAPTER_TEXT_COLORS: Record<number, string> = {
  1: 'text-chapter-1',
  2: 'text-chapter-2',
  3: 'text-chapter-3',
  4: 'text-chapter-4',
  5: 'text-chapter-5',
  6: 'text-chapter-6',
};

interface PatternCardProps {
  pattern: Pattern;
  className?: string;
}

export function PatternCard({ pattern, className = '' }: PatternCardProps) {
  const { frontmatter, readingTime } = pattern;

  return (
    <Link
      href={`/patterns/${frontmatter.slug}`}
      className={`group block border-2 border-text/60 hover:border-text bg-surface/60 border-l-4 ${CHAPTER_BORDER_COLORS[frontmatter.chapter]} p-5 transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--color-text)] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background ${className}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className={`font-mono font-bold text-xs ${CHAPTER_TEXT_COLORS[frontmatter.chapter]} tabular-nums`}>
          {frontmatter.number}
        </span>
        <DifficultyBadge difficulty={frontmatter.difficulty} />
      </div>
      <h3 className="text-lg font-bold mb-1.5 group-hover:underline decoration-2 underline-offset-4 tracking-tight">
        {frontmatter.name}
      </h3>
      <p className="text-sm text-muted leading-relaxed line-clamp-2">
        {frontmatter.intent}
      </p>
      <div className="mt-3 text-[11px] text-muted font-mono">{readingTime}</div>
    </Link>
  );
}
