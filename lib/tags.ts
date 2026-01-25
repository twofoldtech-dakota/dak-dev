import { Post } from './posts';

/**
 * Slugify a tag name for URL use
 */
export function slugifyTag(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Get all unique tags from all posts
 */
export function getAllTags(posts: Post[]): string[] {
  const tagSet = new Set<string>();

  posts.forEach((post) => {
    if (post.frontmatter.tags) {
      post.frontmatter.tags.forEach((tag) => {
        tagSet.add(tag);
      });
    }
  });

  return Array.from(tagSet).sort();
}

/**
 * Get all unique tag slugs for static generation
 */
export function getAllTagSlugs(posts: Post[]): string[] {
  const tags = getAllTags(posts);
  return tags.map(slugifyTag);
}

/**
 * Filter posts by tag
 */
export function getPostsByTag(posts: Post[], tagSlug: string): Post[] {
  return posts.filter((post) => {
    if (!post.frontmatter.tags) return false;
    return post.frontmatter.tags.some((tag) => slugifyTag(tag) === tagSlug);
  });
}

/**
 * Get original tag name from slug
 */
export function getTagNameFromSlug(posts: Post[], tagSlug: string): string | null {
  const allTags = getAllTags(posts);
  const matchingTag = allTags.find((tag) => slugifyTag(tag) === tagSlug);
  return matchingTag || null;
}

/**
 * Get tag counts for all tags
 */
export function getTagCounts(posts: Post[]): Map<string, number> {
  const tagCounts = new Map<string, number>();

  posts.forEach((post) => {
    if (post.frontmatter.tags) {
      post.frontmatter.tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    }
  });

  return tagCounts;
}
