'use client';

import { useState } from 'react';
import type { ToolName, ToolExample } from '@/lib/patterns';

const TOOL_ORDER: ToolName[] = ['claude-code', 'cursor', 'copilot', 'windsurf'];

const TOOL_LABELS: Record<ToolName, string> = {
  'claude-code': 'CLAUDE CODE',
  cursor: 'CURSOR',
  copilot: 'COPILOT',
  windsurf: 'WINDSURF',
};

interface ToolExamplesProps {
  examples: Record<ToolName, ToolExample>;
}

export function ToolExamples({ examples }: ToolExamplesProps) {
  const [active, setActive] = useState<ToolName>('claude-code');
  const current = examples[active];

  return (
    <div className="mt-12 pt-8 border-t-2 border-text/30">
      <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-muted mb-4">
        Tool-Specific Examples
      </h2>

      {/* Tab bar */}
      <div className="flex border-b-2 border-text/20 mb-0" role="tablist">
        {TOOL_ORDER.map((tool) => {
          const isActive = active === tool;
          return (
            <button
              key={tool}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tool)}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset ${
                isActive
                  ? 'border-b-4 border-accent font-bold text-text -mb-0.5'
                  : 'text-muted hover:text-text'
              }`}
            >
              {TOOL_LABELS[tool]}
            </button>
          );
        })}
      </div>

      {/* Content panel */}
      <div className="border-2 border-text bg-background p-6">
        {current && (
          <>
            <p className="text-sm text-muted mb-4 leading-relaxed">
              {current.description}
            </p>
            <pre className="overflow-x-auto bg-surface/50 border border-text/20 p-4">
              <code className="text-sm font-mono text-text whitespace-pre-wrap">
                {current.code}
              </code>
            </pre>
          </>
        )}
      </div>
    </div>
  );
}
