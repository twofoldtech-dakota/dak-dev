/**
 * Search index generator - server-only (uses Node.js fs)
 * Generates the search index from MDX posts and patterns
 */

import { getAllPosts, Post } from '../posts';
import { getAllPatterns, CHAPTERS, Pattern } from '../patterns';
import { SearchIndexItem } from './types';

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

function generatePostSearchItems(): SearchIndexItem[] {
  const posts = getAllPosts();

  return posts.map((post: Post) => {
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
      type: 'post' as const,
    };
  });
}

function generatePatternSearchItems(): SearchIndexItem[] {
  const patterns = getAllPatterns();

  return patterns.map((pattern: Pattern) => {
    const cleanContent = stripMarkdown(pattern.content);
    const contentPreview = cleanContent.slice(0, 500);
    const chapter = CHAPTERS.find(
      (c) => c.number === pattern.frontmatter.chapter
    );

    return {
      slug: pattern.frontmatter.slug,
      title: pattern.frontmatter.name,
      excerpt: pattern.frontmatter.intent,
      contentPreview,
      tags: [],
      keywords: pattern.frontmatter.keywords || [],
      date: '',
      type: 'pattern' as const,
      patternNumber: pattern.frontmatter.number,
      chapterName: chapter?.name || '',
    };
  });
}

/**
 * Generate search index from all published posts and patterns
 * Returns array of searchable items optimized for client-side search
 */
export function generateSearchIndex(): SearchIndexItem[] {
  return [...generatePostSearchItems(), ...generatePatternSearchItems()];
}
