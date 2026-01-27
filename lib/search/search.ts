/**
 * Search utilities - browser-safe, no Node.js dependencies
 * Used by both server and client code
 */

import { SearchIndexItem } from './types';

/**
 * Search through the index for matching posts
 * Performs case-insensitive substring matching across title, excerpt, content, tags, and keywords
 */
export function searchPosts(
  index: SearchIndexItem[],
  query: string
): SearchIndexItem[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  const terms = normalizedQuery.split(/\s+/);

  return index
    .filter((item) => {
      // Create searchable text from all fields
      const searchableText = [
        item.title,
        item.excerpt,
        item.contentPreview,
        ...item.tags,
        ...item.keywords,
      ]
        .join(' ')
        .toLowerCase();

      // Check if all search terms are present (AND logic)
      return terms.every((term) => searchableText.includes(term));
    })
    .sort((a, b) => {
      // Score based on where matches appear (title matches score higher)
      const scoreA = getMatchScore(a, normalizedQuery);
      const scoreB = getMatchScore(b, normalizedQuery);

      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }

      // If scores are equal, sort by date (most recent first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
}

/**
 * Calculate match score for ranking search results
 * Higher score = better match
 */
export function getMatchScore(item: SearchIndexItem, query: string): number {
  let score = 0;

  // Title matches are worth the most
  if (item.title.toLowerCase().includes(query)) {
    score += 10;
  }

  // Exact tag matches are valuable
  if (item.tags.some((tag) => tag.toLowerCase() === query)) {
    score += 8;
  }

  // Keyword matches
  if (item.keywords.some((keyword) => keyword.toLowerCase().includes(query))) {
    score += 5;
  }

  // Excerpt matches
  if (item.excerpt.toLowerCase().includes(query)) {
    score += 3;
  }

  // Content preview matches (least valuable)
  if (item.contentPreview.toLowerCase().includes(query)) {
    score += 1;
  }

  return score;
}
