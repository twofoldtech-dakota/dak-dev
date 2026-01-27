'use client';

import { useEffect, useState } from 'react';

/**
 * Get the initial value for reduced motion preference
 * Safe to call during SSR (returns false on server)
 */
function getInitialValue(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Hook to detect user's motion preferences
 * Returns true if user prefers reduced motion
 *
 * Uses a safe initialization that works correctly during SSR
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getInitialValue);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Sync state with actual value on mount (handles SSR mismatch)
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}
