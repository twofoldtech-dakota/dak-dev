import { ReactNode } from 'react';
import { getAllPatterns, CHAPTERS } from '@/lib/patterns';
import { PatternsSidebar } from '@/components/patterns/PatternsSidebar';
import { PatternsMobileNav } from '@/components/patterns/PatternsMobileNav';

export default function PatternsLayout({ children }: { children: ReactNode }) {
  const allPatterns = getAllPatterns();

  const sidebarPatterns = allPatterns.map((p) => ({
    slug: p.frontmatter.slug,
    name: p.frontmatter.name,
    number: p.frontmatter.number,
    chapter: p.frontmatter.chapter,
    difficulty: p.frontmatter.difficulty,
  }));

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* Mobile nav */}
      <PatternsMobileNav
        chapters={CHAPTERS}
        patterns={sidebarPatterns}
        className="px-4 sm:px-6 lg:hidden pt-4"
      />

      <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-10 lg:px-8 lg:pb-8 lg:pt-6">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <PatternsSidebar chapters={CHAPTERS} patterns={sidebarPatterns} />
        </div>

        {/* Main content */}
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
