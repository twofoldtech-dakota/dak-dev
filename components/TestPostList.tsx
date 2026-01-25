import { getAllPosts } from '@/lib/posts';

export function TestPostList() {
  const posts = getAllPosts();

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Test: MDX Content Loading</h2>
      {posts.length === 0 ? (
        <p className="text-muted">No posts found</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.frontmatter.slug} className="border-2 border-surface p-4">
              <h3 className="text-xl font-semibold mb-2">{post.frontmatter.title}</h3>
              <p className="text-muted mb-2">{post.frontmatter.excerpt}</p>
              <div className="flex gap-4 text-sm text-muted">
                <span>{post.frontmatter.date}</span>
                <span>{post.readingTime}</span>
                <span>{post.frontmatter.tags.join(', ')}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
