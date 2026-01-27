/**
 * Content structure validation
 */

import type { ValidationResult, ValidationIssue } from './types';
import { loadGuidelines } from './guidelines';

/**
 * Validate content structure (word count, headings, code blocks)
 */
export function validateStructure(content: string): ValidationResult {
  const guidelines = loadGuidelines();
  const rules = guidelines.validation_rules.structure;
  const issues: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  // Word count
  const words = content.replace(/```[\s\S]*?```/g, '').split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  if (wordCount < rules.min_word_count) {
    issues.push({
      type: 'error',
      category: 'structure',
      message: `Content too short: ${wordCount} words (min: ${rules.min_word_count})`,
      suggestion: 'Expand the content with more details and examples',
    });
  }
  if (wordCount > rules.max_word_count) {
    warnings.push({
      type: 'warning',
      category: 'structure',
      message: `Content very long: ${wordCount} words (max: ${rules.max_word_count})`,
      suggestion: 'Consider splitting into multiple posts',
    });
  }

  // Heading count (H2)
  const h2Matches = content.match(/^## /gm) || [];
  const headingCount = h2Matches.length;

  if (headingCount < rules.min_headings) {
    issues.push({
      type: 'error',
      category: 'structure',
      message: `Too few H2 headings: ${headingCount} (min: ${rules.min_headings})`,
      suggestion: 'Break content into more logical sections',
    });
  }

  // Code blocks
  const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
  const codeBlockCount = codeBlocks.length;

  // Check code blocks have language identifiers
  const codeBlockRules = guidelines.validation_rules.code_blocks;
  if (codeBlockRules.require_language_identifier) {
    for (const block of codeBlocks) {
      if (block.match(/^```\s*\n/)) {
        warnings.push({
          type: 'warning',
          category: 'structure',
          message: 'Code block missing language identifier',
          suggestion: 'Add language after ```: ```typescript, ```javascript, etc.',
        });
        break; // Only warn once
      }
    }
  }

  // Check for conclusion section
  const hasConclusion =
    /^##\s*(Conclusion|Summary|Takeaways|Key Takeaways|Wrapping Up)/im.test(content);
  if (rules.require_conclusion && !hasConclusion) {
    warnings.push({
      type: 'warning',
      category: 'structure',
      message: 'No conclusion section detected',
      suggestion: 'Add a "## Conclusion" section with key takeaways',
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
      wordCount,
      headingCount,
      codeBlockCount,
      passiveVoicePercentage: 0,
      avgSentenceLength: 0,
    },
  };
}
