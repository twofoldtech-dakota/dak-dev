import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

// Re-export all types and constants from toolkit-types (client-safe module)
export * from './toolkit-types';

import type { ToolkitFrontmatter, ToolkitPage } from './toolkit-types';
import { TOOLKIT_TOPICS } from './toolkit-types';

const toolkitDirectory = path.join(process.cwd(), 'content/toolkit');

export function getToolkitPage(topic: string, subPage?: string): ToolkitPage | null {
  try {
    const fileName = subPage ? `${subPage}.mdx` : 'index.mdx';
    const fullPath = path.join(toolkitDirectory, topic, fileName);
    if (!fs.existsSync(fullPath)) return null;
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    const frontmatter = data as ToolkitFrontmatter;
    if (!frontmatter.published) return null;
    const stats = readingTime(content);
    return { frontmatter, content, readingTime: stats.text };
  } catch {
    return null;
  }
}

export function getToolkitTopicPages(topic: string): ToolkitPage[] {
  const topicDir = path.join(toolkitDirectory, topic);
  if (!fs.existsSync(topicDir)) return [];

  return fs.readdirSync(topicDir)
    .filter((f) => f.endsWith('.mdx') && f !== 'index.mdx')
    .map((f) => {
      const sub = f.replace(/\.mdx$/, '');
      return getToolkitPage(topic, sub);
    })
    .filter((p): p is ToolkitPage => p !== null)
    .sort((a, b) => a.frontmatter.order - b.frontmatter.order);
}

export function getAllToolkitPages(): ToolkitPage[] {
  return TOOLKIT_TOPICS.flatMap((topic) => {
    const index = getToolkitPage(topic.slug);
    const subPages = getToolkitTopicPages(topic.slug);
    return [index, ...subPages].filter((p): p is ToolkitPage => p !== null);
  });
}
