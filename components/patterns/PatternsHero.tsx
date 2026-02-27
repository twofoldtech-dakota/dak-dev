'use client';

import { motion } from 'framer-motion';
import {
  staggerContainerVariants,
  slideUpVariants,
  drawLineVariants,
} from '@/lib/animations';
import Link from 'next/link';

interface PatternsHeroProps {
  patternCount: number;
  chapterCount: number;
}

export function PatternsHero({ patternCount, chapterCount }: PatternsHeroProps) {
  return (
    <header className="relative min-h-[45vh] flex items-center border-b-4 border-text patterns-grid-bg-depth overflow-hidden -mx-4 sm:-mx-6 lg:-mx-0">

      {/* Corner marks + coordinate labels */}
      <div className="absolute z-[2] top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-accent/40" aria-hidden="true" />
      <span className="hero-coord z-[2] top-4 left-14" aria-hidden="true">0,0</span>
      <div className="absolute z-[2] top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-accent/40" aria-hidden="true" />
      <span className="hero-coord z-[2] top-4 right-14" aria-hidden="true">1,0</span>
      <div className="absolute z-[2] bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-accent/40" aria-hidden="true" />
      <span className="hero-coord z-[2] bottom-4 left-14" aria-hidden="true">0,1</span>
      <div className="absolute z-[2] bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-accent/40" aria-hidden="true" />
      <span className="hero-coord z-[2] bottom-4 right-14" aria-hidden="true">1,1</span>

      {/* Grid intersection accent dots */}
      <div className="hero-grid-dot z-[1]" style={{ top: '20%', left: '75%' }} aria-hidden="true" />
      <div className="hero-grid-dot z-[1]" style={{ top: '65%', left: '85%', animationDelay: '1.5s' }} aria-hidden="true" />
      <div className="hero-grid-dot z-[1]" style={{ top: '30%', left: '55%', animationDelay: '2.8s' }} aria-hidden="true" />
      <div className="hero-grid-dot z-[1]" style={{ top: '80%', left: '35%', animationDelay: '0.8s' }} aria-hidden="true" />


      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 md:py-20 w-full">
        <motion.div
          className="max-w-4xl"
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Category badge */}
          <motion.div variants={slideUpVariants} className="mb-6 inline-block border-4 border-accent bg-surface px-6 py-2">
            <p className="text-sm font-bold uppercase tracking-wider text-accent">
              Reference &middot; {patternCount} Patterns &middot; {chapterCount} Chapters
            </p>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={slideUpVariants}
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight"
          >
            Agent Patterns
          </motion.h1>

          {/* Accent line */}
          <motion.div
            className="h-1 bg-accent mb-8 origin-left"
            style={{ maxWidth: '200px' }}
            aria-hidden="true"
            variants={drawLineVariants}
          />

          {/* Description */}
          <motion.p
            variants={slideUpVariants}
            className="text-xl md:text-2xl text-muted max-w-2xl mb-10 leading-relaxed"
          >
            Repeatable techniques for engineering with AI coding agents. A
            structured reference — not tips, not tricks, not a beginner&apos;s
            guide.
          </motion.p>

          {/* Entry point buttons */}
          <motion.div variants={slideUpVariants} className="flex flex-wrap gap-4">
            <Link
              href="#chapters"
              className="inline-flex items-center gap-3 px-6 py-3 border-2 border-text/30 bg-transparent text-muted font-bold text-sm uppercase tracking-wider hover:border-text hover:text-text hover:bg-surface hover:shadow-[4px_4px_0_0_var(--color-text)] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-accent focus:ring-offset-4 focus:ring-offset-background"
            >
              <span className="text-accent/60 font-mono" aria-hidden="true">01</span>
              Chapters
            </Link>
            <Link
              href="#problems"
              className="inline-flex items-center gap-3 px-6 py-3 border-2 border-text/30 bg-transparent text-muted font-bold text-sm uppercase tracking-wider hover:border-text hover:text-text hover:bg-surface hover:shadow-[4px_4px_0_0_var(--color-text)] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-accent focus:ring-offset-4 focus:ring-offset-background"
            >
              <span className="text-accent/60 font-mono" aria-hidden="true">02</span>
              Problems
            </Link>
            <Link
              href="/patterns/graph"
              className="inline-flex items-center gap-3 px-6 py-3 border-2 border-text/30 bg-transparent text-muted font-bold text-sm uppercase tracking-wider hover:border-text hover:text-text hover:bg-surface hover:shadow-[4px_4px_0_0_var(--color-text)] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-accent focus:ring-offset-4 focus:ring-offset-background"
            >
              <span className="text-accent/60 font-mono" aria-hidden="true">03</span>
              Language Map
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </header>
  );
}
