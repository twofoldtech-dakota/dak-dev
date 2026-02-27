import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

export type PatternDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type RelationshipType = 'enables' | 'composes' | 'prevents' | 'contrasts';

export interface PatternRelationship {
  slug: string;
  type: RelationshipType;
  note: string;
}

export interface PatternFrontmatter {
  name: string;
  slug: string;
  chapter: number;
  number: string;
  intent: string;
  difficulty: PatternDifficulty;
  published: boolean;
  keywords?: string[];
  relatedPatterns?: PatternRelationship[];
}

export interface Pattern {
  frontmatter: PatternFrontmatter;
  content: string;
  readingTime: string;
}

export interface ChapterMeta {
  number: number;
  name: string;
  slug: string;
  description: string;
}

export const CHAPTERS: ChapterMeta[] = [
  { number: 1, name: 'Foundation', slug: 'foundation', description: 'Setting up your environment, codebase, and tools for agent success.' },
  { number: 2, name: 'Context', slug: 'context', description: 'Managing what the agent knows — and doesn\'t know.' },
  { number: 3, name: 'Task', slug: 'task', description: 'Breaking work into units that agents handle well.' },
  { number: 4, name: 'Steering', slug: 'steering', description: 'Guiding agent behavior toward the output you actually want.' },
  { number: 5, name: 'Verification', slug: 'verification', description: 'Ensuring the agent\'s output is correct, complete, and safe.' },
  { number: 6, name: 'Recovery', slug: 'recovery', description: 'What to do when things go wrong.' },
];

const patternsDirectory = path.join(process.cwd(), 'content/patterns');

export function getAllPatterns(): Pattern[] {
  if (!fs.existsSync(patternsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(patternsDirectory);
  const allPatterns = fileNames
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, '');
      return getPatternBySlug(slug);
    })
    .filter((pattern): pattern is Pattern => pattern !== null && pattern.frontmatter.published)
    .sort((a, b) => {
      const chapterDiff = a.frontmatter.chapter - b.frontmatter.chapter;
      if (chapterDiff !== 0) return chapterDiff;
      return parseFloat(a.frontmatter.number) - parseFloat(b.frontmatter.number);
    });

  return allPatterns;
}

export function getPatternBySlug(slug: string): Pattern | null {
  try {
    const fullPath = path.join(patternsDirectory, `${slug}.mdx`);
    if (!fs.existsSync(fullPath)) return null;
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    const frontmatter = data as PatternFrontmatter;
    const stats = readingTime(content);

    return {
      frontmatter: {
        ...frontmatter,
        slug,
      },
      content,
      readingTime: stats.text,
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[patterns] Failed to load pattern: ${slug}`, error);
    }
    return null;
  }
}

export function getAllPatternSlugs(): string[] {
  if (!fs.existsSync(patternsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(patternsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => fileName.replace(/\.mdx$/, ''));
}

export function getPatternsByChapter(chapterNumber: number): Pattern[] {
  return getAllPatterns().filter((p) => p.frontmatter.chapter === chapterNumber);
}

export function getChapterBySlug(slug: string): ChapterMeta | undefined {
  return CHAPTERS.find((c) => c.slug === slug);
}

/**
 * Extract "Signals" bullet points from pattern MDX content.
 * Looks for a ## Signals section and pulls the first N bullet items.
 */
export function extractSignals(content: string, maxItems: number = 3): string[] {
  const lines = content.split('\n');
  const signalsIdx = lines.findIndex((l) => /^##\s+Signals/.test(l.trim()));
  if (signalsIdx === -1) return [];

  const signals: string[] = [];
  for (let i = signalsIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('## ')) break; // next section
    if (line.startsWith('- ') || line.startsWith('* ')) {
      signals.push(line.replace(/^[-*]\s+/, ''));
      if (signals.length >= maxItems) break;
    }
  }
  return signals;
}

export type ToolName = 'claude-code' | 'cursor' | 'copilot' | 'windsurf';

export interface ToolExample {
  description: string;
  code: string;
}

const toolExamplesDirectory = path.join(process.cwd(), 'content/patterns/tools');

export function getToolExamples(slug: string): Record<ToolName, ToolExample> | null {
  try {
    const filePath = path.join(toolExamplesDirectory, `${slug}.json`);
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw) as Record<ToolName, ToolExample>;
  } catch {
    return null;
  }
}

export function getRelatedPatterns(pattern: Pattern): (Pattern & { relationship: PatternRelationship })[] {
  const related = pattern.frontmatter.relatedPatterns || [];
  return related
    .map((rel) => {
      const relatedPattern = getPatternBySlug(rel.slug);
      if (!relatedPattern || !relatedPattern.frontmatter.published) return null;
      return { ...relatedPattern, relationship: rel };
    })
    .filter((p): p is Pattern & { relationship: PatternRelationship } => p !== null);
}
