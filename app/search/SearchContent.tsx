'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { searchPosts, SearchIndexItem } from '@/lib/search';
import { Card } from '@/components/ui/Card';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchIndexItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const performSearch = async () => {
      setIsLoading(true);

      try {
        // Fetch search index from API
        const response = await fetch('/api/search');
        const index = await response.json();

        if (query.trim().length > 0) {
          const searchResults = searchPosts(index, query);
          setResults(searchResults);
        } else {
          setResults([]);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Search failed:', error);
        }
        setResults([]);
      }

      setIsLoading(false);
    };

    performSearch();
  }, [query]);

  return (
    <div className="min-h-screen py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-muted hover:text-text mb-6 font-semibold focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Blog
          </Link>

          <div className="border-b-4 border-text pb-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {query ? (
                <>
                  Search Results for{' '}
                  <span className="text-accent">&quot;{query}&quot;</span>
                </>
              ) : (
                'Search Posts'
              )}
            </h1>

            {query && !isLoading && (
              <p className="text-lg text-muted">
                Found{' '}
                <span className="text-text font-semibold">
                  {results.length}
                </span>{' '}
                {results.length === 1 ? 'result' : 'results'}
              </p>
            )}
          </div>
        </header>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="inline-block w-12 h-12 border-4 border-text border-t-accent animate-spin"></div>
            <p className="mt-4 text-muted font-semibold">Searching...</p>
          </div>
        )}

        {/* Empty Query State */}
        {!isLoading && !query && (
          <div className="text-center py-16 px-4">
            <div className="max-w-md mx-auto">
              <svg
                className="w-16 h-16 mx-auto mb-6 text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h2 className="text-2xl font-bold mb-3">No search query</h2>
              <p className="text-muted mb-6">
                Enter a search term in the URL or use the search button in the
                header
              </p>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-6 py-3 bg-surface border-4 border-text text-text font-bold hover:bg-text hover:text-background shadow-[4px_4px_0_0_var(--color-text)] hover:shadow-[8px_8px_0_0_var(--color-accent)] hover:-translate-y-1 transition-all focus:outline-none focus:ring-4 focus:ring-accent focus:ring-offset-4 focus:ring-offset-background"
              >
                Browse All Posts
              </Link>
            </div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && query && results.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="max-w-md mx-auto">
              <svg
                className="w-16 h-16 mx-auto mb-6 text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-2xl font-bold mb-3">No results found</h2>
              <p className="text-muted mb-6">
                We couldn&apos;t find any posts matching &quot;{query}&quot;. Try different
                keywords or check your spelling.
              </p>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-6 py-3 bg-surface border-4 border-text text-text font-bold hover:bg-text hover:text-background shadow-[4px_4px_0_0_var(--color-text)] hover:shadow-[8px_8px_0_0_var(--color-accent)] hover:-translate-y-1 transition-all focus:outline-none focus:ring-4 focus:ring-accent focus:ring-offset-4 focus:ring-offset-background"
              >
                Browse All Posts
              </Link>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {results.map((result) => (
              <Card
                key={result.slug}
                title={result.title}
                excerpt={result.excerpt}
                slug={result.slug}
                thumbnail={`/images/posts/${result.slug}/thumbnail.jpg`}
                date={result.date}
                tags={result.tags}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function SearchContent() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center py-16">
              <div className="inline-block w-12 h-12 border-4 border-text border-t-accent animate-spin"></div>
              <p className="mt-4 text-muted font-semibold">Loading...</p>
            </div>
          </div>
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
