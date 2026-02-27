import Link from 'next/link';
import { mdxComponents } from '@/components/blog/MdxComponents';
import { Callout } from '@/components/patterns/Callout';
import { FlowDiagram } from '@/components/patterns/FlowDiagram';
import { ReactNode } from 'react';

/**
 * PatternRef — inline cross-reference for use within pattern MDX content.
 * Usage: <PatternRef slug="safety-net">Safety Net</PatternRef>
 */
function PatternRef({ slug, children }: { slug: string; children?: ReactNode }) {
  return (
    <Link
      href={`/patterns/${slug}`}
      className="text-accent font-semibold underline decoration-2 underline-offset-4 hover:decoration-4 transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
    >
      {children}
    </Link>
  );
}

/**
 * Extended MDX components for pattern pages.
 * Includes all base blog components plus pattern-specific ones.
 */
export const patternMdxComponents = {
  ...mdxComponents,
  PatternRef,
  Callout,
  FlowDiagram,
};
