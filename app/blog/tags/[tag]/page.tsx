import { notFound } from 'next/navigation';
import { getAllPosts } from '@/lib/posts';
import { getAllTagSlugs, getPostsByTag, getTagNameFromSlug } from '@/lib/tags';
import { Card } from '@/components/ui/Card';
import { PageTransition } from '@/components/ui/PageTransition';
import Link from 'next/link';

export async function generateStaticParams() {
  const allPosts = await getAllPosts();
  const tagSlugs = getAllTagSlugs(allPosts);

  return tagSlugs.map((tag) => ({
    tag,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const allPosts = await getAllPosts();
  const tagName = getTagNameFromSlug(allPosts, tag);

  if (!tagName) {
    return {
      title: 'Tag Not Found | Dakota Smith',
    };
  }

  return {
    title: `Posts tagged with "${tagName}" | Dakota Smith`,
    description: `Browse all posts tagged with ${tagName} on Dakota Smith's blog.`,
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const allPosts = await getAllPosts();

  // Get the original tag name from the slug
  const tagName = getTagNameFromSlug(allPosts, tag);

  if (!tagName) {
    notFound();
  }

  // Filter posts by this tag
  const filteredPosts = getPostsByTag(allPosts, tag);

  if (filteredPosts.length === 0) {
    notFound();
  }

  return (
    <PageTransition className="min-h-screen py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-12 border-b-4 border-text pb-8">
          {/* Breadcrumb */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-muted">
              <li>
                <Link
                  href="/blog"
                  className="hover:text-text hover:underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-text focus:ring-offset-2 focus:ring-offset-background"
                >
                  Blog
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <span className="text-text font-semibold">Tags</span>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">
                <span className="text-text font-semibold">{tagName}</span>
              </li>
            </ol>
          </nav>

          {/* Tag Header */}
          <div className="flex items-center gap-4 mb-4">
            <div className="inline-block border-4 border-text bg-surface px-4 py-2">
              <span className="text-sm font-bold uppercase tracking-wider">
                {tagName}
              </span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Posts tagged with "{tagName}"
          </h1>

          <p className="text-lg text-muted">
            {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}{' '}
            found
          </p>
        </header>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
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

        {/* Back to Blog Link */}
        <div className="mt-16 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-text font-semibold hover:underline underline-offset-4 decoration-4 focus:outline-none focus:ring-4 focus:ring-text focus:ring-offset-4 focus:ring-offset-background"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to All Posts
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
