/**
 * Frontmatter validation
 */

import type { PostFrontmatter } from '../posts';
import type { ValidationResult, ValidationIssue } from './types';
import { loadGuidelines } from './guidelines';

/**
 * Validate post frontmatter against brand guidelines
 */
export function validateFrontmatter(frontmatter: PostFrontmatter): ValidationResult {
  const guidelines = loadGuidelines();
  const rules = guidelines.validation_rules;
  const issues: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  // Title validation
  const titleLength = frontmatter.title?.length || 0;
  if (titleLength < rules.title.min_length) {
    issues.push({
      type: 'error',
      category: 'frontmatter',
      field: 'title',
      message: `Title too short: ${titleLength} chars (min: ${rules.title.min_length})`,
      suggestion: 'Expand the title to be more descriptive',
    });
  }
  if (titleLength > rules.title.max_length) {
    issues.push({
      type: 'error',
      category: 'frontmatter',
      field: 'title',
      message: `Title too long: ${titleLength} chars (max: ${rules.title.max_length})`,
      suggestion: 'Shorten the title while keeping it descriptive',
    });
  }

  // Check for forbidden words in title
  for (const word of rules.title.forbidden_words) {
    if (frontmatter.title?.toLowerCase().includes(word.toLowerCase())) {
      warnings.push({
        type: 'warning',
        category: 'frontmatter',
        field: 'title',
        message: `Title contains discouraged word: "${word}"`,
        suggestion: 'Consider using more specific language',
      });
    }
  }

  // Excerpt validation
  const excerptLength = frontmatter.excerpt?.length || 0;
  if (excerptLength < rules.excerpt.min_length) {
    issues.push({
      type: 'error',
      category: 'frontmatter',
      field: 'excerpt',
      message: `Excerpt too short: ${excerptLength} chars (min: ${rules.excerpt.min_length})`,
      suggestion: 'Expand the excerpt to be more compelling',
    });
  }
  if (excerptLength > rules.excerpt.max_length) {
    issues.push({
      type: 'error',
      category: 'frontmatter',
      field: 'excerpt',
      message: `Excerpt too long: ${excerptLength} chars (max: ${rules.excerpt.max_length})`,
      suggestion: 'Trim the excerpt to fit meta description limits',
    });
  }

  // Tags validation
  const tagCount = frontmatter.tags?.length || 0;
  if (tagCount < rules.seo.min_tags) {
    issues.push({
      type: 'error',
      category: 'seo',
      field: 'tags',
      message: `Too few tags: ${tagCount} (min: ${rules.seo.min_tags})`,
      suggestion: 'Add relevant category tags',
    });
  }
  if (tagCount > rules.seo.max_tags) {
    warnings.push({
      type: 'warning',
      category: 'seo',
      field: 'tags',
      message: `Too many tags: ${tagCount} (max: ${rules.seo.max_tags})`,
      suggestion: 'Focus on the most relevant tags',
    });
  }

  // Keywords validation
  const keywordCount = frontmatter.keywords?.length || 0;
  if (keywordCount < rules.seo.min_keywords) {
    issues.push({
      type: 'error',
      category: 'seo',
      field: 'keywords',
      message: `Too few keywords: ${keywordCount} (min: ${rules.seo.min_keywords})`,
      suggestion: 'Add SEO keywords to improve discoverability',
    });
  }
  if (keywordCount > rules.seo.max_keywords) {
    warnings.push({
      type: 'warning',
      category: 'seo',
      field: 'keywords',
      message: `Too many keywords: ${keywordCount} (max: ${rules.seo.max_keywords})`,
      suggestion: 'Focus on primary keywords',
    });
  }

  // Date validation
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(frontmatter.date || '')) {
    issues.push({
      type: 'error',
      category: 'frontmatter',
      field: 'date',
      message: 'Invalid date format',
      suggestion: 'Use ISO 8601 format: YYYY-MM-DD',
    });
  }

  // Images validation (paths only, not actual files)
  if (rules.images.thumbnail.required && !frontmatter.thumbnail) {
    warnings.push({
      type: 'warning',
      category: 'images',
      field: 'thumbnail',
      message: 'Thumbnail image path not defined',
      suggestion: 'Add thumbnail path: /images/posts/{slug}/thumbnail.jpg',
    });
  }
  if (rules.images.hero.required && !frontmatter.hero) {
    warnings.push({
      type: 'warning',
      category: 'images',
      field: 'hero',
      message: 'Hero image path not defined',
      suggestion: 'Add hero path: /images/posts/{slug}/hero.jpg',
    });
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
