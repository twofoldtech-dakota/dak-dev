'use client';

import { useState, useEffect, useRef } from 'react';

interface ReadingProgressOptions {
  /**
   * Throttle interval in milliseconds for scroll event handler
   * @default 16 (approximately 60fps)
   */
  throttleMs?: number;
  /**
   * Selector for the article content to track
   * @default 'article'
   */
  targetSelector?: string;
}

/**
 * Custom hook to track reading progress through an article
 * Returns a percentage value (0-100) representing scroll depth
 * Optimized for 60fps performance with no layout thrashing
 */
export function useReadingProgress(options: ReadingProgressOptions = {}) {
  const { throttleMs = 16, targetSelector = 'article' } = options;
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const frameRef = useRef<number | null>(null);
  const lastScrollRef = useRef(0);

  useEffect(() => {
    const articleElement = document.querySelector(targetSelector);

    if (!articleElement) {
      return;
    }

    // Show progress bar once user starts scrolling into the article
    // and hide when they've scrolled past it entirely
    const updateVisibility = () => {
      const articleRect = articleElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Show when article top is above viewport bottom AND article bottom is below viewport top
      const articleTopAboveViewportBottom = articleRect.top < viewportHeight;
      const articleBottomBelowViewportTop = articleRect.bottom > 0;

      setIsVisible(articleTopAboveViewportBottom && articleBottomBelowViewportTop);
    };

    // Initial visibility check
    updateVisibility();

    // Update visibility on scroll
    window.addEventListener('scroll', updateVisibility, { passive: true });

    // Calculate reading progress
    const calculateProgress = () => {
      const articleRect = articleElement.getBoundingClientRect();
      const articleTop = articleRect.top + window.scrollY;
      const articleHeight = articleRect.height;
      const windowHeight = window.innerHeight;
      const scrollTop = window.scrollY;

      // Calculate how far through the article we've scrolled
      const scrollDistance = scrollTop + windowHeight - articleTop;
      const totalDistance = articleHeight + windowHeight;
      const percentage = Math.min(
        Math.max((scrollDistance / totalDistance) * 100, 0),
        100
      );

      setProgress(percentage);
    };

    // Throttled scroll handler using requestAnimationFrame
    const handleScroll = () => {
      const now = Date.now();

      // Throttle to approximately 60fps
      if (now - lastScrollRef.current >= throttleMs) {
        lastScrollRef.current = now;

        // Cancel any pending frame
        if (frameRef.current !== null) {
          cancelAnimationFrame(frameRef.current);
        }

        // Schedule new calculation
        frameRef.current = requestAnimationFrame(() => {
          calculateProgress();
          frameRef.current = null;
        });
      }
    };

    // Initial calculation
    calculateProgress();

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Recalculate on resize
    window.addEventListener('resize', calculateProgress, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', updateVisibility);
      window.removeEventListener('resize', calculateProgress);

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [throttleMs, targetSelector]);

  return { progress, isVisible };
}
