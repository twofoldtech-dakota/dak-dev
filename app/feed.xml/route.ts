import { generateRSSFeed } from '@/lib/rss';

/**
 * RSS feed route handler
 * Generates and serves RSS 2.0 XML feed at /feed.xml
 */
export async function GET() {
  const feed = generateRSSFeed(50);

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
