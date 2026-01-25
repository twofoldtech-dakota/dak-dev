import { getAllPosts } from '@/lib/posts';
import { Card } from '@/components/ui/Card';
import { Hero } from '@/components/home/Hero';
import { JsonLd } from '@/components/seo/JsonLd';
import { generateWebSiteSchema } from '@/lib/schema';
import Link from 'next/link';

export const metadata = {
  title: 'Dakota Smith | Software Engineer & Technical Writer',
  description:
    'High-performance personal blog featuring tech articles and engineering insights. Building great software with Next.js, TypeScript, and modern web technologies.',
};

export default async function Home() {
  // Fetch all posts and get the 6 most recent
  const allPosts = await getAllPosts();
  const recentPosts = allPosts.slice(0, 6);

  // Generate Schema.org structured data for homepage
  const webSiteSchema = generateWebSiteSchema();

  return (
    <>
      {/* Schema.org JSON-LD */}
      <JsonLd data={webSiteSchema} />

      {/* Hero Section */}
      <Hero />

      {/* Recent Posts Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-12 flex items-end justify-between border-b-4 border-text pb-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-2">
                Recent Posts
              </h2>
              <p className="text-lg text-muted">
                Latest articles and engineering insights
              </p>
            </div>
            <Link
              href="/blog"
              className="hidden sm:inline-flex items-center gap-2 text-text font-semibold hover:underline underline-offset-4 decoration-4 focus:outline-none focus:ring-4 focus:ring-text focus:ring-offset-4 focus:ring-offset-background"
            >
              View All Posts
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
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>

          {/* Posts Grid */}
          {recentPosts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recentPosts.map((post) => (
                  <Card
                    key={post.frontmatter.slug}
                    title={post.frontmatter.title}
                    excerpt={post.frontmatter.excerpt}
                    slug={post.frontmatter.slug}
                    thumbnail={post.frontmatter.thumbnail}
                    date={post.frontmatter.date}
                    readingTime={post.readingTime}
                    tags={post.frontmatter.tags}
                  />
                ))}
              </div>

              {/* Mobile "View All" Button */}
              <div className="mt-12 sm:hidden flex justify-center">
                <Link href="/blog">
                  <button className="inline-flex items-center justify-center font-semibold px-6 py-3 text-base gap-2 bg-surface text-text border-4 border-text hover:bg-text hover:text-background shadow-[4px_4px_0_0_#f5f5f5] hover:shadow-[6px_6px_0_0_#f5f5f5] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-text focus:ring-offset-4 focus:ring-offset-background">
                    View All Posts
                  </button>
                </Link>
              </div>
            </>
          ) : (
            <div className="border-4 border-text p-12 text-center">
              <p className="text-2xl font-semibold mb-2">No posts yet</p>
              <p className="text-muted">Check back soon for new content.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
