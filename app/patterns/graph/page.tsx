import { getAllPatterns, CHAPTERS } from '@/lib/patterns';
import { computeGraphLayout, COLUMN_COUNT, SIDE_PADDING, TOP_PADDING } from '@/lib/graph-layout';
import { PatternLanguageGraph } from '@/components/patterns/PatternLanguageGraph';
import Link from 'next/link';

export const metadata = {
  title: 'Pattern Language Map | Dakota Smith',
  description:
    'Interactive graph showing how all agent patterns relate to each other — enables, composes, prevents, and contrasts relationships at a glance.',
  keywords: [
    'pattern language',
    'pattern map',
    'agent patterns',
    'pattern relationships',
  ],
};

export default function PatternGraphPage() {
  const allPatterns = getAllPatterns();
  const graphData = allPatterns.length >= 3 ? computeGraphLayout(allPatterns) : null;

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <header className="pt-2 pb-8 patterns-grid-bg -mx-4 sm:-mx-6 lg:-mx-0 px-4 sm:px-6 lg:px-0">
        <nav className="mb-5" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-xs text-muted font-mono">
            <li>
              <Link
                href="/patterns"
                className="hover:text-text hover:underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-text focus:ring-offset-2 focus:ring-offset-background"
              >
                Patterns
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">
              <span className="text-text font-semibold">Graph</span>
            </li>
          </ol>
        </nav>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Pattern Language Map
        </h1>
        <p className="text-muted max-w-2xl leading-relaxed">
          Hover to highlight connections. Click any node to navigate to that
          pattern. Lines show how patterns relate: enables, composes, prevents,
          and contrasts.
        </p>
      </header>

      <div className="border-b-2 border-text/30" />

      {/* Graph */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-0 py-10">
        {graphData ? (
          <PatternLanguageGraph
            nodes={graphData.nodes}
            edges={graphData.edges}
            width={graphData.width}
            height={graphData.height}
            columnCount={COLUMN_COUNT}
            sidePadding={SIDE_PADDING}
            topPadding={TOP_PADDING}
          />
        ) : (
          <div className="border border-dashed border-muted/30 p-12 text-center">
            <p className="text-xs font-mono text-muted uppercase tracking-wider">
              Graph requires at least 3 published patterns
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
