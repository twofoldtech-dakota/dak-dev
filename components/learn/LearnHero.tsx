'use client';

import { motion } from 'framer-motion';
import { staggerContainerVariants, slideUpVariants } from '@/lib/animations';
import Link from 'next/link';

interface LearnHeroProps {
  patternCount: number;
  chapterCount: number;
  toolkitTopicCount: number;
}

export function LearnHero({ patternCount, chapterCount, toolkitTopicCount }: LearnHeroProps) {
  return (
    <header className="relative border-b-4 border-text overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={slideUpVariants} className="mb-8 inline-block border-4 border-accent bg-surface px-6 py-2">
            <p className="text-sm font-bold uppercase tracking-wider text-accent">
              Learn &middot; Expert Guides
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <motion.div variants={slideUpVariants}>
              <Link
                href="/learn/patterns"
                className="group block border-4 border-text p-8 transition-all hover:shadow-[8px_8px_0_0_var(--color-accent)] hover:-translate-x-1 hover:-translate-y-1"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-3 group-hover:text-accent transition-colors">
                  Patterns
                </h2>
                <p className="text-muted text-lg mb-6 leading-relaxed">
                  Named patterns for AI-assisted engineering. A structured reference of repeatable techniques.
                </p>
                <div className="flex gap-4 text-sm font-mono text-muted">
                  <span><span className="text-text font-bold">{patternCount}</span> patterns</span>
                  <span><span className="text-text font-bold">{chapterCount}</span> chapters</span>
                </div>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-accent">
                  Browse patterns
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </motion.div>

            <motion.div variants={slideUpVariants}>
              <Link
                href="/learn/toolkit"
                className="group block border-4 border-text p-8 transition-all hover:shadow-[8px_8px_0_0_var(--color-accent)] hover:-translate-x-1 hover:-translate-y-1"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-3 group-hover:text-accent transition-colors">
                  Claude Code Toolkit
                </h2>
                <p className="text-muted text-lg mb-6 leading-relaxed">
                  Expert&apos;s guide to agentic engineering. Mental models, production architectures, and real-world pitfalls.
                </p>
                <div className="flex gap-4 text-sm font-mono text-muted">
                  <span><span className="text-text font-bold">{toolkitTopicCount}</span> deep-dives</span>
                  <span>interactive tutorials</span>
                </div>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-accent">
                  Explore toolkit
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
