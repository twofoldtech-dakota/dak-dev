'use client';

import { useEffect, useState } from 'react';
import { TocItem } from '@/lib/toc';

interface TableOfContentsProps {
  items: TocItem[];
}

/**
 * Table of Contents component
 * Shows heading navigation with active state based on scroll position
 */
export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
      }
    );

    // Observe all headings
    items.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <nav className="border-4 border-text bg-surface p-6" aria-label="Table of contents">
      <h2 className="text-lg font-bold mb-4 uppercase tracking-wider">
        Table of Contents
      </h2>
      <ul className="space-y-2">
        {items.map((item) => {
          const isActive = activeId === item.id;
          const isH3 = item.level === 3;

          return (
            <li key={item.id} className={isH3 ? 'ml-4' : ''}>
              <a
                href={`#${item.id}`}
                className={`
                  block text-sm leading-relaxed transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface
                  ${
                    isActive
                      ? 'text-text font-bold border-l-4 border-accent pl-3'
                      : 'text-muted hover:text-accent border-l-4 border-transparent pl-3 hover:border-accent'
                  }
                `}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(item.id);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // Update URL without scrolling
                    window.history.pushState(null, '', `#${item.id}`);
                  }
                }}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
