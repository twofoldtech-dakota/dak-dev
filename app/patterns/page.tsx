import type { Metadata } from 'next';
import { getAllPatterns, CHAPTERS } from '@/lib/patterns';
import { PageTransition } from '@/components/ui/PageTransition';
import { ChapterHeader } from '@/components/patterns/ChapterHeader';
import { PatternCard } from '@/components/patterns/PatternCard';
import { PatternsHero } from '@/components/patterns/PatternsHero';
import { DifficultyLegend } from '@/components/patterns/DifficultyLegend';
import { ProblemIndex } from '@/components/patterns/ProblemIndex';
import { JsonLd } from '@/components/seo/JsonLd';
import { generatePatternCollectionSchema } from '@/lib/schema';
import Link from 'next/link';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dak-dev.vercel.app';

export function generateMetadata(): Metadata {
  const allPatterns = getAllPatterns();
  const description = `A searchable reference of ${allPatterns.length} named patterns across ${CHAPTERS.length} chapters for working effectively with AI coding agents.`;
  const ogImage = `${siteUrl}/api/og?type=pattern&title=${encodeURIComponent('Agent Patterns')}`;

  return {
    title: 'Agent Patterns | Dakota Smith',
    description,
    keywords: [
      'AI coding patterns',
      'agent patterns',
      'Claude Code',
      'AI engineering',
      'coding agents',
    ],
    openGraph: {
      title: 'Agent Patterns — AI Coding Agent Reference',
      description,
      url: `${siteUrl}/patterns`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'Agent Patterns catalog' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Agent Patterns — AI Coding Agent Reference',
      description,
      images: [ogImage],
    },
    alternates: { canonical: '/patterns' },
  };
}

export default function PatternsPage() {
  const allPatterns = getAllPatterns();
  const collectionSchema = generatePatternCollectionSchema(
    allPatterns.length,
    CHAPTERS.length
  );

  return (
    <PageTransition className="min-h-screen pb-16">
      <JsonLd data={collectionSchema} />

      {/* Hero — full-bleed */}
      <PatternsHero
        patternCount={allPatterns.length}
        chapterCount={CHAPTERS.length}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-0 mt-12">
        {/* Difficulty Legend */}
        <DifficultyLegend className="mb-12" />

        {/* Chapters */}
        <div id="chapters" className="space-y-12 scroll-mt-20">
          {CHAPTERS.map((chapter) => {
            const chapterPatterns = allPatterns.filter(
              (p) => p.frontmatter.chapter === chapter.number
            );

            return (
              <section key={chapter.number}>
                <Link
                  href={`/patterns/chapter/${chapter.slug}`}
                  className="group block mb-5"
                >
                  <ChapterHeader
                    chapter={chapter}
                    patternCount={chapterPatterns.length}
                    className="group-hover:[&_h2]:underline group-hover:[&_h2]:decoration-2 group-hover:[&_h2]:underline-offset-4"
                  />
                </Link>

                {chapterPatterns.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {chapterPatterns.map((pattern) => (
                      <PatternCard
                        key={pattern.frontmatter.slug}
                        pattern={pattern}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-muted/30 p-6 text-center">
                    <p className="text-xs font-mono text-muted uppercase tracking-wider">Patterns coming soon</p>
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Problem Index */}
        <ProblemIndex
          className="mt-16"
          publishedSlugs={new Set(allPatterns.map((p) => p.frontmatter.slug))}
        />
      </div>
    </PageTransition>
  );
}
