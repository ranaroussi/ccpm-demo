import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

// Types for frontmatter
export interface BlogPostFrontmatter {
  title: string;
  description: string;
  date: string;
  author: string;
  tags?: string[];
  published?: boolean;
  image?: string;
}

export interface DocsFrontmatter {
  title: string;
  description: string;
  order?: number;
  published?: boolean;
}

export interface BlogPost {
  slug: string;
  frontmatter: BlogPostFrontmatter;
  content: string;
  readingTime: {
    text: string;
    minutes: number;
    time: number;
    words: number;
  };
}

export interface DocsPage {
  slug: string;
  frontmatter: DocsFrontmatter;
  content: string;
  path: string[];
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
  children?: TableOfContentsItem[];
}

const CONTENT_PATH = path.join(process.cwd(), 'content');
const BLOG_PATH = path.join(CONTENT_PATH, 'blog');
const DOCS_PATH = path.join(CONTENT_PATH, 'docs');

// Get all blog posts
export function getAllBlogPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_PATH)) {
    return [];
  }

  const files = fs.readdirSync(BLOG_PATH);
  const posts = files
    .filter((file) => file.endsWith('.mdx') || file.endsWith('.md'))
    .map((file) => {
      const filePath = path.join(BLOG_PATH, file);
      const source = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(source);
      const slug = file.replace(/\.(mdx|md)$/, '');

      return {
        slug,
        frontmatter: data as BlogPostFrontmatter,
        content,
        readingTime: readingTime(content),
      };
    })
    .filter((post) => post.frontmatter.published !== false)
    .sort((a, b) => {
      return new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime();
    });

  return posts;
}

// Get a single blog post by slug
export function getBlogPost(slug: string): BlogPost | null {
  try {
    const filePath = path.join(BLOG_PATH, `${slug}.mdx`);
    let source: string;

    if (fs.existsSync(filePath)) {
      source = fs.readFileSync(filePath, 'utf-8');
    } else {
      // Try .md extension
      const mdFilePath = path.join(BLOG_PATH, `${slug}.md`);
      if (fs.existsSync(mdFilePath)) {
        source = fs.readFileSync(mdFilePath, 'utf-8');
      } else {
        return null;
      }
    }

    const { data, content } = matter(source);

    return {
      slug,
      frontmatter: data as BlogPostFrontmatter,
      content,
      readingTime: readingTime(content),
    };
  } catch (error) {
    return null;
  }
}

// Get all docs pages
export function getAllDocsPages(): DocsPage[] {
  if (!fs.existsSync(DOCS_PATH)) {
    return [];
  }

  const pages: DocsPage[] = [];

  function traverseDir(dir: string, currentPath: string[] = []): void {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        traverseDir(filePath, [...currentPath, file]);
      } else if (file.endsWith('.mdx') || file.endsWith('.md')) {
        const source = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(source);
        const slug = file.replace(/\.(mdx|md)$/, '');

        pages.push({
          slug,
          frontmatter: data as DocsFrontmatter,
          content,
          path: [...currentPath, slug],
        });
      }
    }
  }

  traverseDir(DOCS_PATH);

  return pages
    .filter((page) => page.frontmatter.published !== false)
    .sort((a, b) => (a.frontmatter.order || 0) - (b.frontmatter.order || 0));
}

// Get a single docs page by path segments
export function getDocsPage(pathSegments: string[]): DocsPage | null {
  try {
    const slug = pathSegments[pathSegments.length - 1];
    const dirPath = pathSegments.slice(0, -1);
    const fullDirPath = path.join(DOCS_PATH, ...dirPath);
    const filePath = path.join(fullDirPath, `${slug}.mdx`);

    let source: string;

    if (fs.existsSync(filePath)) {
      source = fs.readFileSync(filePath, 'utf-8');
    } else {
      // Try .md extension
      const mdFilePath = path.join(fullDirPath, `${slug}.md`);
      if (fs.existsSync(mdFilePath)) {
        source = fs.readFileSync(mdFilePath, 'utf-8');
      } else {
        return null;
      }
    }

    const { data, content } = matter(source);

    return {
      slug,
      frontmatter: data as DocsFrontmatter,
      content,
      path: pathSegments,
    };
  } catch (error) {
    return null;
  }
}

// Generate table of contents from markdown content
export function generateTableOfContents(content: string): TableOfContentsItem[] {
  const headings: TableOfContentsItem[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const title = match[2].trim();
      const id = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

      headings.push({
        id,
        title,
        level,
      });
    }
  }

  // Build nested structure
  const nested: TableOfContentsItem[] = [];
  const stack: TableOfContentsItem[] = [];

  for (const heading of headings) {
    // Remove items from stack that are at the same or deeper level
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      nested.push(heading);
    } else {
      const parent = stack[stack.length - 1];
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(heading);
    }

    stack.push(heading);
  }

  return nested;
}

// Get blog posts by tag
export function getBlogPostsByTag(tag: string): BlogPost[] {
  const allPosts = getAllBlogPosts();
  return allPosts.filter((post) =>
    post.frontmatter.tags && post.frontmatter.tags.includes(tag)
  );
}

// Get all unique tags
export function getAllTags(): string[] {
  const allPosts = getAllBlogPosts();
  const tags = new Set<string>();

  allPosts.forEach((post) => {
    if (post.frontmatter.tags) {
      post.frontmatter.tags.forEach((tag) => tags.add(tag));
    }
  });

  return Array.from(tags).sort();
}

// Get paginated blog posts
export function getPaginatedBlogPosts(page: number = 1, limit: number = 10) {
  const allPosts = getAllBlogPosts();
  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const posts = allPosts.slice(startIndex, endIndex);

  return {
    posts,
    pagination: {
      currentPage: page,
      totalPages,
      totalPosts,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}