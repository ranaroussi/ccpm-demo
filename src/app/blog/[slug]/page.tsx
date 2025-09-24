import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBlogPost, getAllBlogPosts, generateTableOfContents } from '@/lib/mdx';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = getBlogPost(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    authors: [{ name: post.frontmatter.author }],
    keywords: post.frontmatter.tags,
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      type: 'article',
      publishedTime: post.frontmatter.date,
      authors: [post.frontmatter.author],
      tags: post.frontmatter.tags,
      images: post.frontmatter.image ? [post.frontmatter.image] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      images: post.frontmatter.image ? [post.frontmatter.image] : undefined,
    },
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  const tableOfContents = generateTableOfContents(post.content);

  const mdxOptions = {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'wrap',
            properties: {
              className: ['anchor'],
            },
          },
        ],
        [
          rehypePrettyCode,
          {
            theme: 'github-dark',
            keepBackground: false,
          },
        ],
      ],
    },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.frontmatter.title}</h1>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <time dateTime={post.frontmatter.date}>
            {new Date(post.frontmatter.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          <span>•</span>
          <span>{post.readingTime.text}</span>
          <span>•</span>
          <span>By {post.frontmatter.author}</span>
        </div>

        {post.frontmatter.tags && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.frontmatter.tags.map((tag) => (
              <span
                key={tag}
                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <p className="text-lg text-gray-600">{post.frontmatter.description}</p>
      </div>

      <div className="flex gap-8">
        <article className="flex-1 prose prose-lg max-w-none">
          <MDXRemote source={post.content} options={mdxOptions} />
        </article>

        {tableOfContents.length > 0 && (
          <aside className="w-64 shrink-0">
            <div className="sticky top-8">
              <h2 className="font-semibold mb-4">Table of Contents</h2>
              <nav className="text-sm">
                <TableOfContentsComponent items={tableOfContents} />
              </nav>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function TableOfContentsComponent({ items }: { items: any[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className={`block text-gray-600 hover:text-blue-600 transition-colors ${
              item.level > 2 ? 'ml-4' : ''
            } ${item.level > 3 ? 'ml-8' : ''}`}
          >
            {item.title}
          </a>
          {item.children && item.children.length > 0 && (
            <TableOfContentsComponent items={item.children} />
          )}
        </li>
      ))}
    </ul>
  );
}