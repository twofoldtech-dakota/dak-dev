import type { Metadata } from 'next';
import Link from 'next/link';
import { PageTransition } from '@/components/ui/PageTransition';
import { TOOLKIT_TOPICS, getToolkitPage } from '@/lib/toolkit';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dak-dev.vercel.app';

export const metadata: Metadata = {
  title: 'Claude Code Toolkit | Dakota Smith',
  description: 'Expert\'s guide to agentic engineering with Claude Code — 9 deep-dives into hooks, skills, agents, MCP, and more.',
  openGraph: {
    title: 'Claude Code Toolkit — Expert\'s Guide',
    description: '9 deep-dives into Claude Code features for expert agentic engineering.',
    url: `${siteUrl}/learn/toolkit`,
  },
  alternates: { canonical: '/learn/toolkit' },
};

export default function ToolkitIndexPage() {
  const topicsWithStatus = TOOLKIT_TOPICS.map((topic) => ({
    ...topic,
    hasContent: getToolkitPage(topic.slug) !== null,
  }));

  return (
    <PageTransition className="min-h-screen pb-16">
      <nav className="mb-6 pt-4 px-4 sm:px-6 lg:px-0" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-xs text-muted font-mono">
          <li><Link href="/learn" className="hover:text-text hover:underline underline-offset-2">Learn</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page"><span className="text-text font-semibold">Toolkit</span></li>
        </ol>
      </nav>

      <header className="mb-12 px-4 sm:px-6 lg:px-0">
        <div className="inline-block border-4 border-accent bg-surface px-6 py-2 mb-6">
          <p className="text-sm font-bold uppercase tracking-wider text-accent">
            Reference &middot; {TOOLKIT_TOPICS.length} Deep-Dives
          </p>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">Claude Code Toolkit</h1>
        <p className="text-xl text-muted max-w-2xl leading-relaxed">
          Expert&apos;s guide to agentic engineering. Not documentation — mental models, production architectures, and the pitfalls the docs don&apos;t warn about.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 sm:px-6 lg:px-0">
        {topicsWithStatus.map((topic) => (
          <Link
            key={topic.slug}
            href={topic.hasContent ? `/learn/toolkit/${topic.slug}` : '#'}
            className={`group block border-4 p-6 transition-all ${
              topic.hasContent
                ? 'border-text hover:shadow-[6px_6px_0_0_var(--color-accent)] hover:-translate-x-px hover:-translate-y-px'
                : 'border-text/20 opacity-50 cursor-not-allowed'
            }`}
            aria-disabled={!topic.hasContent}
          >
            <div className="flex items-start gap-3 mb-3">
              <svg className="w-6 h-6 text-accent shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={topic.icon} />
              </svg>
              <div>
                <h2 className="text-lg font-bold">{topic.name}</h2>
                <span className="text-xs font-mono text-muted uppercase">
                  {topic.hasContent ? 'Available' : 'Coming Soon'}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted leading-relaxed">{topic.description}</p>
          </Link>
        ))}
      </div>
    </PageTransition>
  );
}
