'use client';

import { useReadingProgress } from '@/hooks/useReadingProgress';

interface ReadingProgressProps {
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Reading progress indicator bar
 * Displays a fixed progress bar at the top of the viewport
 * showing how far through the article the user has scrolled
 */
export function ReadingProgress({ className = '' }: ReadingProgressProps) {
  const { progress, isVisible } = useReadingProgress();

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed top-16 left-0 right-0 z-40 ${className}`}
      role="progressbar"
      aria-label="Reading progress"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Progress bar fill - Neo-brutalist style */}
      <div
        className="h-[6px] origin-left transition-transform will-change-transform motion-reduce:transition-none"
        style={{
          backgroundColor: 'var(--color-accent)',
          transform: `scaleX(${progress / 100})`,
          boxShadow: '0 4px 0 0 var(--color-accent)',
        }}
      />

      {/* Accessibility: Screen reader percentage announcement */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {Math.round(progress)}% read
      </span>
    </div>
  );
}
