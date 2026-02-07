import { getAllPosts } from '@/lib/posts';
import { getPaginatedPosts } from '@/lib/pagination';
import { getAllTags } from '@/lib/tags';
import { Card } from '@/components/ui/Card';
import { TagList } from '@/components/ui/Tag';
import { Pagination } from '@/components/blog/Pagination';
import { PageTransition } from '@/components/ui/PageTransition';

export const metadata = {
  title: 'Blog | Dakota Smith',
  description: 'Tech articles and engineering insights from Dakota Smith.',
};

export default async function BlogPage() {
  const allPosts = await getAllPosts();
  const paginationData = getPaginatedPosts(allPosts, 1); // Page 1
  const tags = getAllTags(allPosts);

  return (
    <PageTransition className="min-h-screen py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-12 border-b-4 border-text pb-8">
          <h1 className="text-5xl font-bold mb-4">Blog</h1>
          <p className="text-xl text-muted max-w-2xl">
            Thoughts on engineering, performance, and building great software.
          </p>
          {paginationData.totalPosts > 0 && (
            <p className="text-sm text-muted mt-4">
              {paginationData.totalPosts} total post
              {paginationData.totalPosts !== 1 ? 's' : ''}
            </p>
          )}
        </header>

        {/* Tag Filter Bar */}
        {tags.length > 0 && (
          <nav aria-label="Filter by tag" className="mb-12 border-b-4 border-surface bg-surface/20 p-6">
            <p className="text-sm font-semibold text-muted mb-3">Filter by tag</p>
            <TagList tags={tags} interactive />
          </nav>
        )}

        {/* Posts Grid */}
        {paginationData.posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginationData.posts.map((post) => (
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

            {/* Pagination */}
            <Pagination
              currentPage={paginationData.currentPage}
              totalPages={paginationData.totalPages}
              basePath="/blog"
            />
          </>
        ) : (
          <div className="border-4 border-text p-12 text-center">
            <p className="text-2xl font-semibold mb-2">No posts yet</p>
            <p className="text-muted">Check back soon for new content.</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
