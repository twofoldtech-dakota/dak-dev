import type { ChapterMeta } from '@/lib/patterns';

const BORDER_COLORS: Record<number, string> = {
  1: 'border-chapter-1',
  2: 'border-chapter-2',
  3: 'border-chapter-3',
  4: 'border-chapter-4',
  5: 'border-chapter-5',
  6: 'border-chapter-6',
};

const TEXT_COLORS: Record<number, string> = {
  1: 'text-chapter-1',
  2: 'text-chapter-2',
  3: 'text-chapter-3',
  4: 'text-chapter-4',
  5: 'text-chapter-5',
  6: 'text-chapter-6',
};

interface ChapterHeaderProps {
  chapter: ChapterMeta;
  patternCount: number;
  className?: string;
}

export function ChapterHeader({ chapter, patternCount, className = '' }: ChapterHeaderProps) {
  return (
    <div className={`border-l-4 ${BORDER_COLORS[chapter.number]} pl-5 ${className}`}>
      <div className="flex items-baseline gap-3 mb-1">
        <span className={`font-mono font-bold text-4xl ${TEXT_COLORS[chapter.number]} opacity-20 leading-none`}>
          {chapter.number}
        </span>
        <h2 className="text-2xl font-bold tracking-tight">{chapter.name}</h2>
      </div>
      <p className="text-sm text-muted max-w-2xl leading-relaxed">{chapter.description}</p>
      {patternCount > 0 && (
        <p className="text-xs text-muted mt-2 font-mono tabular-nums">
          {patternCount} pattern{patternCount !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
