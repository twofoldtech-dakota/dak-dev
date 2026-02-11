'use client';

import { useState, useEffect, useRef } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
const DURATION = 1200; // ms total decode time

interface TextDecodeProps {
  text: string;
  delay?: number;
  className?: string;
}

export function TextDecode({ text, delay = 0, className }: TextDecodeProps) {
  const [displayed, setDisplayed] = useState(text);
  const [started, setStarted] = useState(false);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion.current) return;

    const timeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!started || prefersReducedMotion.current) return;

    const startTime = performance.now();
    let raf: number;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / DURATION, 1);
      const lockedCount = Math.floor(progress * text.length);

      const chars = text.split('').map((char, i) => {
        if (char === ' ') return ' ';
        if (i < lockedCount) return text[i];
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      });

      setDisplayed(chars.join(''));

      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [started, text]);

  return (
    <span className={className} role="text" aria-label={text}>
      {displayed.split('').map((char, i) => (
        <span key={i} aria-hidden="true">
          {char}
        </span>
      ))}
    </span>
  );
}
