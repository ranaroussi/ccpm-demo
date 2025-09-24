import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDocsPage, getAllDocsPages, generateTableOfContents } from '@/lib/mdx';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';

interface DocsPageProps {
  params: {
    slug?: string[];
  };
}

// Generate static params for all docs pages
export async function generateStaticParams() {
  const pages = getAllDocsPages();
  return pages.map((page) => ({
    slug: page.path,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: DocsPageProps): Promise<Metadata> {
  const slug = params.slug || ['index'];
  const page = getDocsPage(slug);

  if (!page) {
    return {
      title: 'Documentation Not Found',
    };
  }

  return {
    title: `${page.frontmatter.title} - Documentation`,
    description: page.frontmatter.description,
    openGraph: {
      title: `${page.frontmatter.title} - Documentation`,
      description: page.frontmatter.description,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: `${page.frontmatter.title} - Documentation`,
      description: page.frontmatter.description,
    },
  };
}

export default function DocsPage({ params }: DocsPageProps) {
  const slug = params.slug || ['index'];
  const page = getDocsPage(slug);

  if (!page) {
    notFound();
  }

  const tableOfContents = generateTableOfContents(page.content);
  const allPages = getAllDocsPages();

  // Build navigation tree
  const navigationTree = buildNavigationTree(allPages);

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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-64 shrink-0">
          <div className="sticky top-8">
            <h2 className="font-semibold mb-4">Documentation</h2>
            <nav className="text-sm">
              <NavigationTree items={navigationTree} currentPath={page.path} />
            </nav>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="max-w-4xl">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">{page.frontmatter.title}</h1>
              {page.frontmatter.description && (
                <p className="text-lg text-gray-600">{page.frontmatter.description}</p>
              )}
            </div>

            <div className="flex gap-8">
              <article className="flex-1 prose prose-lg max-w-none">
                <MDXRemote source={page.content} options={mdxOptions} />
              </article>

              {tableOfContents.length > 0 && (
                <aside className="w-64 shrink-0">
                  <div className="sticky top-8">
                    <h2 className="font-semibold mb-4">On this page</h2>
                    <nav className="text-sm">
                      <TableOfContentsComponent items={tableOfContents} />
                    </nav>
                  </div>
                </aside>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildNavigationTree(pages: any[]) {
  const tree: any = {};

  pages.forEach((page) => {
    let current = tree;
    page.path.forEach((segment: string, index: number) => {
      if (!current[segment]) {
        current[segment] = {
          title: segment,
          path: page.path.slice(0, index + 1),
          children: {},
          isPage: index === page.path.length - 1,
          order: page.frontmatter.order || 0,
          ...(index === page.path.length - 1 && {
            title: page.frontmatter.title,
            description: page.frontmatter.description,
          }),
        };
      }
      current = current[segment].children;
    });
  });

  return tree;
}

function NavigationTree({ items, currentPath }: { items: any; currentPath: string[] }) {
  const sortedItems = Object.values(items).sort((a: any, b: any) => a.order - b.order);

  return (
    <ul className="space-y-1">
      {sortedItems.map((item: any) => {
        const isActive = JSON.stringify(item.path) === JSON.stringify(currentPath);
        const hasChildren = Object.keys(item.children).length > 0;

        return (
          <li key={item.path.join('/')}>
            {item.isPage ? (
              <a
                href={`/docs/${item.path.join('/')}`}
                className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-900 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.title}
              </a>
            ) : (
              <div className="px-3 py-2 font-medium text-sm text-gray-900">
                {item.title}
              </div>
            )}
            {hasChildren && (
              <div className="ml-4 mt-1">
                <NavigationTree items={item.children} currentPath={currentPath} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
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