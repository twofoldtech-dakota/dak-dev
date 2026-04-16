import Link from 'next/link';
import { getToolkitTopicBySlug } from '@/lib/toolkit-types';

interface RelatedToolkitPanelProps {
  topicSlugs: string[];
}

export function RelatedToolkitPanel({ topicSlugs }: RelatedToolkitPanelProps) {
  const topics = topicSlugs
    .map((slug) => getToolkitTopicBySlug(slug))
    .filter(Boolean);

  if (topics.length === 0) return null;

  return (
    <div className="border-4 border-text/20 p-4 mt-6">
      <h3 className="text-xs font-bold uppercase tracking-widest text-muted mb-3">
        Related Toolkit
      </h3>
      <ul className="space-y-2">
        {topics.map((topic) => (
          <li key={topic!.slug}>
            <Link
              href={`/learn/toolkit/${topic!.slug}`}
              className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors"
            >
              <svg className="w-4 h-4 text-accent/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={topic!.icon} />
              </svg>
              <span>{topic!.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
