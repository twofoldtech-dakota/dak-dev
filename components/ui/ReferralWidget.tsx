'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface ReferralLink {
  name: string;
  url: string;
}

export function ReferralWidget({ links }: { links: ReferralLink[] }) {
  const [open, setOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const close = useCallback(() => setOpen(false), []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, close]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, close]);

  const copyLink = async (url: string, index: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // Fallback: open in new tab if clipboard fails
      window.open(url, '_blank');
    }
  };

  if (links.length === 0) return null;

  return (
    <div ref={panelRef} className="fixed right-0 top-1/2 -translate-y-1/2 z-40">
      {/* Tab */}
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={open ? 'Close referral links' : 'Open referral links'}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-accent text-background border-2 border-text border-r-0 px-1.5 py-3 font-bold text-xs uppercase tracking-widest shadow-[-3px_3px_0_0_var(--color-text)] hover:shadow-[-5px_5px_0_0_var(--color-text)] hover:translate-x-[-2px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
      >
        REFS
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: 'easeOut' }}
            className="absolute right-8 top-1/2 -translate-y-1/2 w-72 max-w-[85vw] bg-background border-2 border-text shadow-[4px_4px_0_0_var(--color-accent)]"
          >
            <div className="px-4 py-3 border-b-2 border-text">
              <p className="text-xs font-bold uppercase tracking-widest text-muted">
                Referral Links
              </p>
            </div>
            <div className="p-2">
              {links.map((link, i) => (
                <div
                  key={link.url}
                  className="flex items-center justify-between gap-2 px-3 py-2.5 border-b-2 border-text/10 last:border-b-0"
                >
                  <span className="text-sm font-semibold text-text truncate">
                    {link.name}
                  </span>
                  <button
                    onClick={() => copyLink(link.url, i)}
                    className="flex-shrink-0 px-3 py-1 text-xs font-bold uppercase border-2 border-text bg-surface text-text hover:bg-accent hover:text-background transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                    aria-label={`Copy ${link.name} referral link`}
                  >
                    {copiedIndex === i ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
