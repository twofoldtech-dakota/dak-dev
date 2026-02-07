/**
 * Internal link validation
 *
 * Validates internal links in blog posts, checks targets exist and are published,
 * enforces minimum internal links, and suggests cross-links.
 */

import { getAllPosts, getAllSlugs, getPostBySlug, getRelatedPosts } from '../posts';
import type { ValidationResult, ValidationIssue } from './types';

interface LinkInfo {
  href: string;
  slug: string;
  line?: number;
}

/**
 * Extract internal blog links from markdown content
 */
function extractInternalLinks(content: string): LinkInfo[] {
  const links: LinkInfo[] = [];
  const lines = content.split('\n');

  // Match markdown links pointing to /blog/[slug]
  const linkRegex = /\[([^\]]*)\]\(\/blog\/([^)\s#?]+)\)/g;

  for (let i = 0; i < lines.length; i++) {
    let match;
    while ((match = linkRegex.exec(lines[i])) !== null) {
      links.push({
        href: `/blog/${match[2]}`,
        slug: match[2],
        line: i + 1,
      });
    }
  }

  return links;
}

/**
 * Validate internal links in a post
 */
export function validateLinks(
  slug: string,
  content: string,
  options?: { minInternalLinks?: number }
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const minLinks = options?.minInternalLinks ?? 2;

  const internalLinks = extractInternalLinks(content);
  const allSlugs = new Set(getAllSlugs());

  // Check each link target exists and is published
  for (const link of internalLinks) {
    if (!allSlugs.has(link.slug)) {
      issues.push({
        type: 'error',
        category: 'links',
        field: link.href,
        message: `Broken internal link: ${link.href} (post not found)`,
        suggestion: `Remove or fix the link on line ${link.line}`,
        line: link.line,
      });
      continue;
    }

    const targetPost = getPostBySlug(link.slug);
    if (targetPost && !targetPost.frontmatter.published) {
      warnings.push({
        type: 'warning',
        category: 'links',
        field: link.href,
        message: `Link to unpublished post: ${link.href}`,
        suggestion: `The target post "${targetPost.frontmatter.title}" is not published yet`,
        line: link.line,
      });
    }
  }

  // Check minimum internal links
  const validLinks = internalLinks.filter((l) => allSlugs.has(l.slug));
  if (validLinks.length < minLinks) {
    warnings.push({
      type: 'warning',
      category: 'links',
      message: `Only ${validLinks.length} internal links (recommended minimum: ${minLinks})`,
      suggestion: 'Add more internal links to related posts for better SEO',
    });
  }

  // Suggest cross-links using tag-overlap logic
  const relatedPosts = getRelatedPosts(slug, 5);
  const linkedSlugs = new Set(internalLinks.map((l) => l.slug));
  const suggestions = relatedPosts
    .filter((p) => !linkedSlugs.has(p.frontmatter.slug))
    .slice(0, 3);

  if (suggestions.length > 0) {
    const suggestionList = suggestions
      .map((p) => `"${p.frontmatter.title}" (/blog/${p.frontmatter.slug})`)
      .join(', ');
    warnings.push({
      type: 'warning',
      category: 'links',
      message: `Consider linking to related posts: ${suggestionList}`,
      suggestion: 'Cross-linking improves SEO and user engagement',
    });
  }

  // Check for orphan status (no inbound links from other posts)
  const allPosts = getAllPosts();
  const hasInboundLink = allPosts.some((post) => {
    if (post.frontmatter.slug === slug) return false;
    const postLinks = extractInternalLinks(post.content);
    return postLinks.some((l) => l.slug === slug);
  });

  if (!hasInboundLink) {
    warnings.push({
      type: 'warning',
      category: 'links',
      message: 'Orphan post: no other published posts link to this post',
      suggestion: 'Ask related posts to add a link to this post for discoverability',
    });
  }

  const passed = issues.length === 0;
  const score = Math.max(0, 100 - issues.length * 15 - warnings.length * 5);

  return {
    passed,
    score,
    issues,
    warnings,
    metrics: {
      wordCount: 0,
      headingCount: 0,
      codeBlockCount: 0,
      passiveVoicePercentage: 0,
      avgSentenceLength: 0,
    },
  };
}
