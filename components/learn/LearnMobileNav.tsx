'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import type { ChapterMeta } from '@/lib/patterns';
import type { ToolkitTopicMeta } from '@/lib/toolkit-types';

const TEXT_COLORS: Record<number, string> = {
  1: 'text-chapter-1', 2: 'text-chapter-2', 3: 'text-chapter-3',
  4: 'text-chapter-4', 5: 'text-chapter-5', 6: 'text-chapter-6',
};
const BORDER_COLORS: Record<number, string> = {
  1: 'border-chapter-1', 2: 'border-chapter-2', 3: 'border-chapter-3',
  4: 'border-chapter-4', 5: 'border-chapter-5', 6: 'border-chapter-6',
};

interface SidebarPattern {
  slug: string;
  name: string;
  number: string;
  chapter: number;
  difficulty: string;
}

interface LearnMobileNavProps {
  chapters: ChapterMeta[];
  patterns: SidebarPattern[];
  toolkitTopics: ToolkitTopicMeta[];
  className?: string;
}

export function LearnMobileNav({
  chapters,
  patterns,
  toolkitTopics,
  className = '',
}: LearnMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<'patterns' | 'toolkit'>(
    pathname.startsWith('/learn/toolkit') ? 'toolkit' : 'patterns'
  );

  const activePatternSlug = pathname.startsWith('/learn/patterns/')
    ? pathname.replace('/learn/patterns/', '').split('/')[0]
    : null;
  const activePattern = patterns.find((p) => p.slug === activePatternSlug);
  const activeTopicSlug = pathname.startsWith('/learn/toolkit/')
    ? pathname.replace('/learn/toolkit/', '').split('/')[0]
    : null;
  const activeTopic = toolkitTopics.find((t) => t.slug === activeTopicSlug);

  const currentLabel = activePattern
    ? `${activePattern.number} ${activePattern.name}`
    : activeTopic
    ? activeTopic.name
    : 'Navigate Learn';

  return (
    <div className={`lg:hidden ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 border-4 border-text bg-surface font-semibold text-sm"
        aria-expanded={isOpen}
      >
        <span>{currentLabel}</span>
        <svg className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <nav className="border-4 border-t-0 border-text bg-surface max-h-[60vh] overflow-y-auto">
          {/* Tab switcher */}
          <div className="flex border-b-2 border-text/20">
            <button
              onClick={() => setActiveTab('patterns')}
              className={`flex-1 px-4 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'patterns' ? 'bg-background text-text border-b-2 border-accent -mb-0.5' : 'text-muted hover:text-text'
              }`}
            >
              Patterns
            </button>
            <button
              onClick={() => setActiveTab('toolkit')}
              className={`flex-1 px-4 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'toolkit' ? 'bg-background text-text border-b-2 border-accent -mb-0.5' : 'text-muted hover:text-text'
              }`}
            >
              Toolkit
            </button>
          </div>

          {activeTab === 'patterns' && (
            <>
              <Link href="/learn/patterns" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-sm font-bold uppercase tracking-wider border-b border-muted/20 hover:bg-background">All Patterns</Link>
              <Link href="/learn/patterns/graph" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-sm font-bold uppercase tracking-wider border-b border-muted/20 hover:bg-background">Language Map</Link>
              <Link href="/learn/patterns/cards" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-sm font-bold uppercase tracking-wider border-b-2 border-muted/20 hover:bg-background">Cards</Link>

              {chapters.map((chapter) => {
                const chapterPatterns = patterns.filter((p) => p.chapter === chapter.number);
                return (
                  <div key={chapter.number} className="border-b border-muted/20 last:border-b-0">
                    <Link
                      href={`/learn/patterns/chapter/${chapter.slug}`}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 border-l-4 ${BORDER_COLORS[chapter.number]} hover:bg-background`}
                    >
                      <span className={`font-mono font-bold text-xs ${TEXT_COLORS[chapter.number]}`}>{chapter.number}</span>
                      <span className="text-sm font-semibold">{chapter.name}</span>
                    </Link>
                    {chapterPatterns.length > 0 && (
                      <ul>
                        {chapterPatterns.map((pattern) => (
                          <li key={pattern.slug}>
                            <Link
                              href={`/learn/patterns/${pattern.slug}`}
                              onClick={() => setIsOpen(false)}
                              className={`flex items-center gap-2 px-4 pl-10 py-2 text-sm transition-colors ${
                                activePatternSlug === pattern.slug ? 'font-semibold text-text bg-background' : 'text-muted hover:text-text hover:bg-background'
                              }`}
                            >
                              <span className={`font-mono text-xs ${TEXT_COLORS[pattern.chapter]}`}>{pattern.number}</span>
                              <span className="truncate">{pattern.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {activeTab === 'toolkit' && (
            <>
              <Link href="/learn/toolkit" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-sm font-bold uppercase tracking-wider border-b-2 border-muted/20 hover:bg-background">All Topics</Link>
              {toolkitTopics.map((topic) => (
                <Link
                  key={topic.slug}
                  href={`/learn/toolkit/${topic.slug}`}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 border-b border-muted/20 last:border-b-0 hover:bg-background transition-colors ${
                    activeTopicSlug === topic.slug ? 'font-semibold text-text bg-background' : 'text-muted'
                  }`}
                >
                  <svg className="w-4 h-4 text-accent/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={topic.icon} />
                  </svg>
                  <div className="min-w-0">
                    <span className="text-sm block truncate">{topic.name}</span>
                  </div>
                </Link>
              ))}
            </>
          )}
        </nav>
      )}
    </div>
  );
}
