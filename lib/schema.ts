/**
 * Schema.org JSON-LD structured data generators
 * Provides rich snippets for search engines and social platforms
 */

import type { PostFrontmatter } from './posts';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.vercel.app';
const SITE_NAME = 'Dakota Smith Blog';
const AUTHOR_NAME = 'Dakota Smith';
const AUTHOR_URL = 'https://github.com/twofoldtech-dakota';

export interface PersonSchema {
  '@context': 'https://schema.org';
  '@type': 'Person';
  name: string;
  url: string;
  sameAs?: string[];
}

export interface WebSiteSchema {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  description: string;
  author: PersonSchema;
  inLanguage: string;
}

export interface BlogPostingSchema {
  '@context': 'https://schema.org';
  '@type': 'BlogPosting';
  headline: string;
  description: string;
  image: string | string[];
  datePublished: string;
  dateModified?: string;
  author: PersonSchema;
  publisher: PersonSchema;
  url: string;
  mainEntityOfPage: {
    '@type': 'WebPage';
    '@id': string;
  };
  keywords?: string[];
}

export interface BreadcrumbListSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item?: string;
  }>;
}

export interface ProfilePageSchema {
  '@context': 'https://schema.org';
  '@type': 'ProfilePage';
  mainEntity: {
    '@type': 'Person';
    name: string;
    jobTitle: string;
    description: string;
    url: string;
    address: {
      '@type': 'PostalAddress';
      addressLocality: string;
      addressRegion: string;
    };
    sameAs: string[];
    knowsAbout: string[];
  };
}

/**
 * Generate Person schema for author
 */
export function generatePersonSchema(): PersonSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: AUTHOR_NAME,
    url: AUTHOR_URL,
    sameAs: [
      AUTHOR_URL,
      // Add more social profiles as needed
    ],
  };
}

/**
 * Generate WebSite schema for homepage
 */
export function generateWebSiteSchema(): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description:
      'High-performance personal blog featuring engineering projects, web development insights, and technical tutorials.',
    author: generatePersonSchema(),
    inLanguage: 'en-US',
  };
}

/**
 * Generate BlogPosting schema for individual blog posts
 */
export function generateBlogPostingSchema(
  post: PostFrontmatter,
  content?: string
): BlogPostingSchema {
  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  const imageUrl = post.hero.startsWith('http') ? post.hero : `${SITE_URL}${post.hero}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: imageUrl,
    datePublished: post.date,
    dateModified: post.date, // Add dateModified to frontmatter if needed
    author: generatePersonSchema(),
    publisher: generatePersonSchema(),
    url: postUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    keywords: post.keywords || post.tags,
  };
}

/**
 * Generate BreadcrumbList schema for navigation hierarchy
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url?: string }>
): BreadcrumbListSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url && { item: `${SITE_URL}${item.url}` }),
    })),
  };
}

/**
 * Generate ProfilePage schema for resume page
 */
export function generateResumeSchema(): ProfilePageSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      jobTitle: 'Principal Architect | Enterprise DXP & Agentic Orchestration',
      description:
        'Systems Architect with 15 years in enterprise software, specializing in Sitecore/.NET modernization and Deterministic AI Orchestration. 30+ production-ready projects.',
      url: `${SITE_URL}/resume`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Kansas City',
        addressRegion: 'MO',
      },
      sameAs: [
        'https://linkedin.com/in/dakota-smith-a855b230',
        'https://github.com/twofoldtech-dakota',
      ],
      knowsAbout: [
        'Next.js',
        'React',
        'TypeScript',
        '.NET',
        'Sitecore',
        'Enterprise CMS',
        'AI Integration',
        'Solution Architecture',
      ],
    },
  };
}

/**
 * Render JSON-LD script tag
 */
export function renderJsonLd(schema: object): string {
  return JSON.stringify(schema, null, 2);
}
