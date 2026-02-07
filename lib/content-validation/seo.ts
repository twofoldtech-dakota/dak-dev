/**
 * SEO validation
 */

import type { PostFrontmatter } from '../posts';
import type { ValidationResult, ValidationIssue } from './types';

/**
 * Strip code blocks from content for keyword density calculation
 */
function stripCodeBlocks(content: string): string {
  return content.replace(/```[\s\S]*?```/g, '').replace(/`[^`]+`/g, '');
}

/**
 * Calculate keyword density as a percentage of total words
 */
function calculateKeywordDensity(content: string, keyword: string): number {
  const strippedContent = stripCodeBlocks(content).toLowerCase();
  const words = strippedContent.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;

  const keywordLower = keyword.toLowerCase();
  const keywordWords = keywordLower.split(/\s+/);

  // For multi-word keywords, count substring occurrences
  if (keywordWords.length > 1) {
    const text = strippedContent.replace(/\s+/g, ' ');
    let count = 0;
    let idx = 0;
    while ((idx = text.indexOf(keywordLower, idx)) !== -1) {
      count++;
      idx += keywordLower.length;
    }
    return (count * keywordWords.length * 100) / words.length;
  }

  // Single-word keyword
  const count = words.filter((w) => w.includes(keywordLower)).length;
  return (count * 100) / words.length;
}

/**
 * Validate SEO aspects of the post
 */
export function validateSEO(frontmatter: PostFrontmatter, content: string): ValidationResult {
  const issues: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  // Check primary keyword appears in key places
  const primaryKeyword = frontmatter.keywords?.[0]?.toLowerCase();

  if (primaryKeyword) {
    const titleLower = frontmatter.title?.toLowerCase() || '';
    const contentLower = content.toLowerCase();

    // Keyword in title
    if (!titleLower.includes(primaryKeyword)) {
      warnings.push({
        type: 'warning',
        category: 'seo',
        message: `Primary keyword "${primaryKeyword}" not in title`,
        suggestion: 'Include primary keyword in the title for better SEO',
      });
    }

    // Keyword in first paragraph
    const firstParagraph = content.split('\n\n')[1]?.toLowerCase() || '';
    if (!firstParagraph.includes(primaryKeyword)) {
      warnings.push({
        type: 'warning',
        category: 'seo',
        message: `Primary keyword "${primaryKeyword}" not in first paragraph`,
        suggestion: 'Mention primary keyword early in the content',
      });
    }

    // Keyword in at least one H2
    const h2Sections = content.match(/^## .+$/gm) || [];
    const keywordInH2 = h2Sections.some((h2) => h2.toLowerCase().includes(primaryKeyword));
    if (!keywordInH2) {
      warnings.push({
        type: 'warning',
        category: 'seo',
        message: `Primary keyword "${primaryKeyword}" not in any H2 heading`,
        suggestion: 'Include primary keyword in at least one section heading',
      });
    }

    // Keyword density check (0.5% - 2.5%)
    const density = calculateKeywordDensity(content, primaryKeyword);
    const roundedDensity = Math.round(density * 100) / 100;

    if (density > 2.5) {
      issues.push({
        type: 'error',
        category: 'seo',
        field: 'keywords',
        message: `Keyword "${primaryKeyword}" density too high: ${roundedDensity}% (max 2.5%)`,
        suggestion: 'Reduce keyword repetition to avoid over-stuffing',
      });
    } else if (density < 0.5) {
      warnings.push({
        type: 'warning',
        category: 'seo',
        field: 'keywords',
        message: `Keyword "${primaryKeyword}" density low: ${roundedDensity}% (recommended 0.5-2.5%)`,
        suggestion: 'Consider mentioning the primary keyword more naturally throughout the content',
      });
    }
  }

  const passed = issues.length === 0;
  const score = Math.max(0, 100 - issues.length * 15 - warnings.length * 5);

  return {
    passed,
    score,
    issues,
    warnings,
    metrics: {
      wordCount: 0,
      headingCount: 0,
      codeBlockCount: 0,
      passiveVoicePercentage: 0,
      avgSentenceLength: 0,
    },
  };
}
