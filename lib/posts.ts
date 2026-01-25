import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

export interface PostFrontmatter {
  title: string;
  date: string;
  excerpt: string;
  slug: string;
  tags: string[];
  thumbnail: string;
  thumbnailBlur?: string;
  hero: string;
  heroBlur?: string;
  published: boolean;
  author?: string;
  keywords?: string[];
}

export interface Post {
  frontmatter: PostFrontmatter;
  content: string;
  readingTime: string;
}

const postsDirectory = path.join(process.cwd(), 'content/posts');

export function getAllPosts(): Post[] {
  // Ensure directory exists
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPosts = fileNames
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, '');
      return getPostBySlug(slug);
    })
    .filter((post): post is Post => post !== null && post.frontmatter.published)
    .sort((a, b) => {
      const dateA = new Date(a.frontmatter.date);
      const dateB = new Date(b.frontmatter.date);
      return dateB.getTime() - dateA.getTime();
    });

  return allPosts;
}

export function getPostBySlug(slug: string): Post | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    const frontmatter = data as PostFrontmatter;
    const stats = readingTime(content);

    return {
      frontmatter: {
        ...frontmatter,
        slug,
      },
      content,
      readingTime: stats.text,
    };
  } catch {
    return null;
  }
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.filter((fileName) => fileName.endsWith('.mdx')).map((fileName) => fileName.replace(/\.mdx$/, ''));
}
