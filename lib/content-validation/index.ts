/**
 * Content validation module
 *
 * Validates blog posts against brand guidelines, structure requirements,
 * SEO best practices, and image specifications.
 *
 * Usage:
 *   import { validatePost, validateFrontmatter } from '@/lib/content-validation';
 *
 *   const result = await validatePost('my-post-slug');
 */

import { getPostBySlug, type Post, type PostFrontmatter } from '../posts';
import type { ValidationResult } from './types';
import { loadGuidelines } from './guidelines';
import { validateFrontmatter } from './frontmatter';
import { validateStructure } from './structure';
import { validateBrandVoice } from './voice';
import { validateSEO } from './seo';
import { validateImages } from './images';
import { validateLinks } from './links';

// Re-export types
export type { ValidationResult, ValidationIssue, BrandGuidelines } from './types';

// Re-export individual validators
export { validateFrontmatter } from './frontmatter';
export { validateStructure } from './structure';
export { validateBrandVoice } from './voice';
export { validateSEO } from './seo';
export { validateImages } from './images';
export { validateLinks } from './links';
export { loadGuidelines, clearGuidelinesCache } from './guidelines';
export { injectBlurPlaceholders } from './blur-inject';
export { syncCalendarStatus } from './calendar-sync';

/**
 * Main validation function - validates all aspects of a post
 */
export async function validatePost(
  slug: string
): Promise<ValidationResult & { breakdown: Record<string, ValidationResult> }> {
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      passed: false,
      score: 0,
      issues: [{ type: 'error', category: 'frontmatter', message: `Post not found: ${slug}` }],
      warnings: [],
      metrics: {
        wordCount: 0,
        headingCount: 0,
        codeBlockCount: 0,
        passiveVoicePercentage: 0,
        avgSentenceLength: 0,
      },
      breakdown: {},
    };
  }

  // Run all validations
  const frontmatterResult = validateFrontmatter(post.frontmatter);
  const structureResult = validateStructure(post.content);
  const voiceResult = validateBrandVoice(post.content);
  const seoResult = validateSEO(post.frontmatter, post.content);
  const imagesResult = await validateImages(post.frontmatter);
  const linksResult = validateLinks(slug, post.content);

  // Combine results
  const allIssues = [
    ...frontmatterResult.issues,
    ...structureResult.issues,
    ...voiceResult.issues,
    ...seoResult.issues,
    ...imagesResult.issues,
    ...linksResult.issues,
  ];

  const allWarnings = [
    ...frontmatterResult.warnings,
    ...structureResult.warnings,
    ...voiceResult.warnings,
    ...seoResult.warnings,
    ...imagesResult.warnings,
    ...linksResult.warnings,
  ];

  // Calculate overall score (weighted average)
  const guidelines = loadGuidelines();
  const weights = guidelines.scoring.weights;
  const totalWeight =
    weights.technical_depth + weights.voice_alignment + weights.structure + weights.seo_readiness;

  const overallScore = Math.round(
    (structureResult.score * weights.structure +
      voiceResult.score * weights.voice_alignment +
      seoResult.score * weights.seo_readiness +
      frontmatterResult.score * weights.technical_depth) /
      totalWeight
  );

  return {
    passed: allIssues.length === 0,
    score: overallScore,
    issues: allIssues,
    warnings: allWarnings,
    metrics: {
      wordCount: structureResult.metrics.wordCount,
      headingCount: structureResult.metrics.headingCount,
      codeBlockCount: structureResult.metrics.codeBlockCount,
      passiveVoicePercentage: voiceResult.metrics.passiveVoicePercentage,
      avgSentenceLength: voiceResult.metrics.avgSentenceLength,
    },
    breakdown: {
      frontmatter: frontmatterResult,
      structure: structureResult,
      voice: voiceResult,
      seo: seoResult,
      images: imagesResult,
      links: linksResult,
    },
  };
}

// Re-export Post types for convenience
export type { Post, PostFrontmatter };
