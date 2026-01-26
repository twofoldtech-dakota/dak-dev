import { getAllPosts, Post } from './posts';

export interface SearchIndexItem {
  slug: string;
  title: string;
  excerpt: string;
  contentPreview: string;
  tags: string[];
  keywords: string[];
  date: string;
}

/**
 * Strip MDX/HTML tags and special characters from content
 */
function stripMarkdown(content: string): string {
  return content
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`[^`]*`/g, '')
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove MDX component syntax
    .replace(/<\/?[A-Z][A-Za-z0-9]*[^>]*>/g, '')
    // Remove markdown headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove markdown bold/italic
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove markdown links
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove markdown images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // Remove frontmatter
    .replace(/^---[\s\S]*?---/gm, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate search index from all published posts
 * Returns array of searchable items optimized for client-side search
 */
export function generateSearchIndex(): SearchIndexItem[] {
  const posts = getAllPosts();

  return posts.map((post: Post) => {
    // Strip markdown and get first 500 characters for content preview
    const cleanContent = stripMarkdown(post.content);
    const contentPreview = cleanContent.slice(0, 500);

    return {
      slug: post.frontmatter.slug,
      title: post.frontmatter.title,
      excerpt: post.frontmatter.excerpt,
      contentPreview,
      tags: post.frontmatter.tags || [],
      keywords: post.frontmatter.keywords || [],
      date: post.frontmatter.date,
    };
  });
}

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
function getMatchScore(item: SearchIndexItem, query: string): number {
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
