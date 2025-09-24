import { Metadata } from 'next';
import Link from 'next/link';
import { getAllTags, getPaginatedBlogPosts } from '@/lib/mdx';

interface BlogPageProps {
  searchParams: {
    page?: string;
    tag?: string;
  };
}

export const metadata: Metadata = {
  title: 'Blog - Latest Posts and Updates',
  description: 'Read our latest blog posts about web development, tutorials, and platform updates.',
  openGraph: {
    title: 'Blog - Latest Posts and Updates',
    description: 'Read our latest blog posts about web development, tutorials, and platform updates.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - Latest Posts and Updates',
    description: 'Read our latest blog posts about web development, tutorials, and platform updates.',
  },
};

export default function BlogPage({ searchParams }: BlogPageProps) {
  const currentPage = parseInt(searchParams.page || '1', 10);
  const selectedTag = searchParams.tag;

  // Get paginated posts
  const { posts, pagination } = getPaginatedBlogPosts(currentPage, 6);

  // Filter by tag if specified
  const filteredPosts = selectedTag
    ? posts.filter(post =>
        post.frontmatter.tags && post.frontmatter.tags.includes(selectedTag)
      )
    : posts;

  const allTags = getAllTags();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Stay up to date with the latest news, tutorials, and insights from our team.
        </p>
      </div>

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Filter by topic:</h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/blog"
              className={`inline-block px-3 py-1 rounded-full text-sm transition-colors ${
                !selectedTag
                  ? 'bg-blue-100 text-blue-800 font-medium'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Posts
            </Link>
            {allTags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className={`inline-block px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTag === tag
                    ? 'bg-blue-100 text-blue-800 font-medium'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Posts Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredPosts.map((post) => (
            <article
              key={post.slug}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {post.frontmatter.image && (
                <div className="aspect-video bg-gray-200">
                  <img
                    src={post.frontmatter.image}
                    alt={post.frontmatter.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <time dateTime={post.frontmatter.date}>
                    {new Date(post.frontmatter.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <span>•</span>
                  <span>{post.readingTime.text}</span>
                </div>

                <h2 className="text-xl font-bold mb-3 line-clamp-2">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {post.frontmatter.title}
                  </Link>
                </h2>

                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.frontmatter.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>By {post.frontmatter.author}</span>
                  </div>

                  {post.frontmatter.tags && post.frontmatter.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {post.frontmatter.tags.slice(0, 2).map((tag) => (
                        <Link
                          key={tag}
                          href={`/blog?tag=${encodeURIComponent(tag)}`}
                          className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"
                        >
                          {tag}
                        </Link>
                      ))}
                      {post.frontmatter.tags.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{post.frontmatter.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-block text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                  >
                    Read more →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            {selectedTag ? `No posts found for "${selectedTag}"` : 'No posts found'}
          </h2>
          <p className="text-gray-500 mb-6">
            {selectedTag
              ? 'Try selecting a different tag or view all posts.'
              : 'Check back soon for new content!'
            }
          </p>
          {selectedTag && (
            <Link
              href="/blog"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Posts
            </Link>
          )}
        </div>
      )}

      {/* Pagination */}
      {!selectedTag && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          {pagination.hasPrev && (
            <Link
              href={`/blog?page=${pagination.currentPage - 1}`}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← Previous
            </Link>
          )}

          <div className="flex items-center gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isActive = pageNum === pagination.currentPage;
              const isNearby = Math.abs(pageNum - pagination.currentPage) <= 2;
              const isFirst = pageNum === 1;
              const isLast = pageNum === pagination.totalPages;

              if (!isNearby && !isFirst && !isLast) {
                return pageNum === 2 || pageNum === pagination.totalPages - 1 ? (
                  <span key={pageNum} className="text-gray-400">…</span>
                ) : null;
              }

              return (
                <Link
                  key={pageNum}
                  href={`/blog?page=${pageNum}`}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pageNum}
                </Link>
              );
            })}
          </div>

          {pagination.hasNext && (
            <Link
              href={`/blog?page=${pagination.currentPage + 1}`}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Next →
            </Link>
          )}
        </div>
      )}

      {/* Newsletter Signup */}
      <div className="mt-16 bg-gray-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Subscribe to our newsletter to get the latest posts delivered directly to your inbox.
        </p>
        <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
}