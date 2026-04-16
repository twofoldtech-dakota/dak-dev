import Link from 'next/link';

interface Connection {
  pattern: { name: string; slug: string };
  topic: { name: string; slug: string };
}

const CONNECTIONS: Connection[] = [
  { pattern: { name: 'Convention File', slug: 'convention-file' }, topic: { name: 'CLAUDE.md', slug: 'claude-md' } },
  { pattern: { name: 'Safety Net', slug: 'safety-net' }, topic: { name: 'Hooks', slug: 'hooks' } },
  { pattern: { name: 'Memory Layer', slug: 'memory-layer' }, topic: { name: 'Memory System', slug: 'memory' } },
  { pattern: { name: 'Parallel Fan-Out', slug: 'parallel-fan-out' }, topic: { name: 'Agent Teams', slug: 'agent-teams' } },
  { pattern: { name: 'Progressive Disclosure', slug: 'progressive-disclosure' }, topic: { name: 'Skills', slug: 'skills' } },
  { pattern: { name: 'Agent-Friendly Architecture', slug: 'agent-friendly-architecture' }, topic: { name: 'MCP Servers', slug: 'mcp' } },
];

export function ConnectionsMap() {
  return (
    <section className="mt-16 px-4 sm:px-6 lg:px-0">
      <h2 className="text-2xl font-bold mb-2">Connections</h2>
      <p className="text-muted mb-8">Patterns and toolkit topics that reinforce each other.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CONNECTIONS.map((conn) => (
          <div
            key={conn.pattern.slug}
            className="flex items-center gap-3 border-2 border-text/30 px-4 py-3 hover:border-text transition-colors"
          >
            <Link
              href={`/learn/patterns/${conn.pattern.slug}`}
              className="text-sm font-semibold hover:text-accent transition-colors truncate"
            >
              {conn.pattern.name}
            </Link>
            <svg className="w-4 h-4 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <Link
              href={`/learn/toolkit/${conn.topic.slug}`}
              className="text-sm font-semibold hover:text-accent transition-colors truncate"
            >
              {conn.topic.name}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
