import type { PatternDifficulty } from '@/lib/patterns';
import { DifficultyBadge, DIFFICULTY_META } from './DifficultyBadge';

const LEVELS: PatternDifficulty[] = ['beginner', 'intermediate', 'advanced'];

interface DifficultyLegendProps {
  className?: string;
}

export function DifficultyLegend({ className = '' }: DifficultyLegendProps) {
  return (
    <div className={`border-2 border-text/20 bg-surface/30 p-5 ${className}`}>
      <p className="text-xs font-mono text-muted uppercase tracking-widest mb-4">
        Difficulty levels
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {LEVELS.map((level) => {
          const meta = DIFFICULTY_META[level];
          return (
            <div key={level} className="flex items-start gap-3">
              <DifficultyBadge difficulty={level} className="shrink-0 mt-0.5" />
              <p className="text-sm text-muted leading-snug">
                {meta.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
