import type { Metadata } from 'next';
import Link from 'next/link';
import { PageTransition } from '@/components/ui/PageTransition';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dak-dev.vercel.app';

export const metadata: Metadata = {
  title: 'Learn | Dakota Smith',
  description: 'Expert guides for agentic engineering — patterns for AI-assisted development and deep-dives into Claude Code\'s toolkit.',
  openGraph: {
    title: 'Learn — Patterns & Toolkit',
    description: 'Expert guides for agentic engineering with Claude Code.',
    url: `${siteUrl}/learn`,
  },
  alternates: { canonical: '/learn' },
};

export default function LearnPage() {
  return (
    <PageTransition className="min-h-screen pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-5xl md:text-6xl font-bold mb-8">Learn</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <Link
            href="/learn/patterns"
            className="block border-4 border-text p-8 hover:shadow-[6px_6px_0_0_var(--color-accent)] transition-all"
          >
            <h2 className="text-2xl font-bold mb-2">Patterns</h2>
            <p className="text-muted">Named patterns for AI-assisted engineering</p>
          </Link>
          <Link
            href="/learn/toolkit"
            className="block border-4 border-text p-8 hover:shadow-[6px_6px_0_0_var(--color-accent)] transition-all"
          >
            <h2 className="text-2xl font-bold mb-2">Claude Code Toolkit</h2>
            <p className="text-muted">Expert&apos;s guide to agentic engineering with Claude</p>
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
