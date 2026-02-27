/**
 * Dynamic XML Sitemap Generator
 * Generates sitemap with all posts, patterns, pages, and tag pages
 */

import { getAllPosts } from '@/lib/posts';
import { getAllPatterns, CHAPTERS } from '@/lib/patterns';
import { getAllTagSlugs, slugifyTag } from '@/lib/tags';
import type { MetadataRoute } from 'next';

const SITE_URL = 'https://dak-dev.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const patterns = getAllPatterns();
  const tagSlugs = getAllTagSlugs(posts);

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/patterns`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Blog post pages
  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.frontmatter.slug}`,
    lastModified: new Date(post.frontmatter.date),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Pattern pages
  const patternPages: MetadataRoute.Sitemap = patterns.map((pattern) => ({
    url: `${SITE_URL}/patterns/${pattern.frontmatter.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Pattern sub-pages (graph, cards)
  const patternSubPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/patterns/graph`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/patterns/cards`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ];

  // Chapter pages
  const chapterPages: MetadataRoute.Sitemap = CHAPTERS.map((chapter) => ({
    url: `${SITE_URL}/patterns/chapter/${chapter.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Tag pages
  const tagPages: MetadataRoute.Sitemap = tagSlugs.map((tagSlug) => ({
    url: `${SITE_URL}/blog/tags/${tagSlug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...postPages, ...patternPages, ...patternSubPages, ...chapterPages, ...tagPages];
}
