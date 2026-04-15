import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

export type ToolkitSubPage = 'mental-model' | 'playbook' | 'compositions' | 'pitfalls';

export interface ToolkitFrontmatter {
  title: string;
  topic: string;
  subPage?: ToolkitSubPage;
  order: number;
  description: string;
  relatedPatterns?: string[];
  relatedTopics?: string[];
  published: boolean;
  keywords?: string[];
}

export interface ToolkitPage {
  frontmatter: ToolkitFrontmatter;
  content: string;
  readingTime: string;
}

export interface ToolkitTopicMeta {
  slug: string;
  name: string;
  description: string;
  order: number;
  icon: string;
}

export const TOOLKIT_TOPICS: ToolkitTopicMeta[] = [
  { slug: 'claude-md', name: 'CLAUDE.md', description: 'Project instruction architecture, layered configs, context priming strategies', order: 1, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { slug: 'hooks', name: 'Hooks', description: 'Execution lifecycle automation, validation pipelines, agent guardrails', order: 2, icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
  { slug: 'skills', name: 'Skills', description: 'Reusable prompt engineering, skill composition, invocation patterns', order: 3, icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
  { slug: 'agents', name: 'Agents & Subagents', description: 'Delegation patterns, isolation strategies, worktree workflows', order: 4, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { slug: 'agent-teams', name: 'Agent Teams', description: 'Multi-agent orchestration, role-based pipelines, coordination architectures', order: 5, icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { slug: 'mcp', name: 'MCP Servers', description: 'External tool integration, custom server patterns, protocol mastery', order: 6, icon: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01' },
  { slug: 'commands', name: 'Commands', description: 'Custom slash commands, workflow automation, command composition', order: 7, icon: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { slug: 'settings', name: 'Settings & Config', description: 'Permission architectures, model selection strategy, profile management', order: 8, icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  { slug: 'memory', name: 'Memory System', description: 'Persistent context strategies, memory taxonomy, cross-session intelligence', order: 9, icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4' },
];

const toolkitDirectory = path.join(process.cwd(), 'content/toolkit');

export function getAllToolkitTopicSlugs(): string[] {
  return TOOLKIT_TOPICS.map((t) => t.slug);
}

export function getToolkitTopicBySlug(slug: string): ToolkitTopicMeta | undefined {
  return TOOLKIT_TOPICS.find((t) => t.slug === slug);
}

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

export const SUB_PAGE_META: Record<ToolkitSubPage, { label: string; icon: string }> = {
  'mental-model': { label: 'Mental Model', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  'playbook': { label: 'Playbook', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  'compositions': { label: 'Compositions', icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z' },
  'pitfalls': { label: 'Pitfalls', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
};
