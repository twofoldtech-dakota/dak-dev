/**
 * robots.txt Generator
 * Allows all crawlers and references sitemap
 */

import type { MetadataRoute } from 'next';

const SITE_URL = 'https://dak-dev.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/components-demo/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
