/**
 * SEO validation
 */

import type { PostFrontmatter } from '../posts';
import type { ValidationResult, ValidationIssue } from './types';

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
