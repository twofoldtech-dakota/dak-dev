import fs from 'fs';
import path from 'path';
import { getPostBySlug, type PostFrontmatter, type Post } from './posts';

// Types
export interface ValidationIssue {
  type: 'error' | 'warning';
  category: 'frontmatter' | 'structure' | 'seo' | 'voice' | 'images';
  field?: string;
  message: string;
  suggestion?: string;
  line?: number;
}

export interface ValidationResult {
  passed: boolean;
  score: number;
  issues: ValidationIssue[];
  warnings: ValidationIssue[];
  metrics: {
    wordCount: number;
    headingCount: number;
    codeBlockCount: number;
    passiveVoicePercentage: number;
    avgSentenceLength: number;
  };
}

export interface BrandGuidelines {
  validation_rules: {
    title: {
      min_length: number;
      max_length: number;
      must_start_with_capital: boolean;
      forbidden_words: string[];
    };
    excerpt: {
      min_length: number;
      max_length: number;
      must_contain_action_verb: boolean;
    };
    structure: {
      min_word_count: number;
      max_word_count: number;
      min_headings: number;
      require_introduction: boolean;
      require_conclusion: boolean;
    };
    seo: {
      min_keywords: number;
      max_keywords: number;
      min_tags: number;
      max_tags: number;
    };
    tone: {
      forbidden_phrases: string[];
      preferred_phrases: string[];
      max_passive_voice_percentage: number;
      max_sentence_length: number;
    };
    code_blocks: {
      require_language_identifier: boolean;
      encourage_line_highlighting: boolean;
      max_lines_without_comment: number;
    };
    images: {
      thumbnail: { required: boolean; width: number; height: number };
      hero: { required: boolean; width: number; height: number };
    };
  };
  scoring: {
    weights: {
      technical_depth: number;
      voice_alignment: number;
      structure: number;
      seo_readiness: number;
    };
    thresholds: {
      publish_ready: number;
      needs_minor_edits: number;
      needs_major_revision: number;
    };
  };
}

// Load guidelines
function loadGuidelines(): BrandGuidelines {
  const guidelinesPath = path.join(process.cwd(), '.content/brand/guidelines.json');
  const content = fs.readFileSync(guidelinesPath, 'utf8');
  return JSON.parse(content);
}

// Validate frontmatter
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

  // Images validation
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

// Validate structure
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

// Validate brand voice
export function validateBrandVoice(content: string): ValidationResult {
  const guidelines = loadGuidelines();
  const rules = guidelines.validation_rules.tone;
  const issues: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  // Remove code blocks for text analysis
  const textContent = content.replace(/```[\s\S]*?```/g, '');

  // Check forbidden phrases
  for (const phrase of rules.forbidden_phrases) {
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
    const matches = textContent.match(regex);
    if (matches) {
      warnings.push({
        type: 'warning',
        category: 'voice',
        message: `Forbidden phrase found: "${phrase}" (${matches.length}x)`,
        suggestion: 'Replace with more direct, confident language',
      });
    }
  }

  // Passive voice detection (simplified)
  const passivePatterns = [
    /\b(was|were|been|being)\s+\w+ed\b/gi,
    /\b(is|are)\s+being\s+\w+ed\b/gi,
    /\b(has|have|had)\s+been\s+\w+ed\b/gi,
  ];

  let passiveCount = 0;
  for (const pattern of passivePatterns) {
    const matches = textContent.match(pattern);
    if (matches) {
      passiveCount += matches.length;
    }
  }

  // Calculate sentences
  const sentences = textContent.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const sentenceCount = sentences.length;
  const passiveVoicePercentage = sentenceCount > 0 ? (passiveCount / sentenceCount) * 100 : 0;

  if (passiveVoicePercentage > rules.max_passive_voice_percentage) {
    warnings.push({
      type: 'warning',
      category: 'voice',
      message: `High passive voice usage: ${passiveVoicePercentage.toFixed(1)}% (max: ${rules.max_passive_voice_percentage}%)`,
      suggestion: 'Convert passive sentences to active voice',
    });
  }

  // Sentence length analysis
  let longSentenceCount = 0;
  let totalWords = 0;
  for (const sentence of sentences) {
    const wordCount = sentence.trim().split(/\s+/).length;
    totalWords += wordCount;
    if (wordCount > rules.max_sentence_length) {
      longSentenceCount++;
    }
  }

  const avgSentenceLength = sentenceCount > 0 ? totalWords / sentenceCount : 0;

  if (longSentenceCount > 3) {
    warnings.push({
      type: 'warning',
      category: 'voice',
      message: `${longSentenceCount} sentences exceed ${rules.max_sentence_length} words`,
      suggestion: 'Break long sentences into shorter, clearer ones',
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
      passiveVoicePercentage,
      avgSentenceLength,
    },
  };
}

// Validate SEO
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

// Validate images
export function validateImages(frontmatter: PostFrontmatter): ValidationResult {
  const issues: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  // Check if image files exist
  const publicDir = path.join(process.cwd(), 'public');

  if (frontmatter.thumbnail) {
    const thumbnailPath = path.join(publicDir, frontmatter.thumbnail);
    if (!fs.existsSync(thumbnailPath)) {
      warnings.push({
        type: 'warning',
        category: 'images',
        field: 'thumbnail',
        message: `Thumbnail image not found: ${frontmatter.thumbnail}`,
        suggestion: 'Add thumbnail image (800x450) to the specified path',
      });
    }
  }

  if (frontmatter.hero) {
    const heroPath = path.join(publicDir, frontmatter.hero);
    if (!fs.existsSync(heroPath)) {
      warnings.push({
        type: 'warning',
        category: 'images',
        field: 'hero',
        message: `Hero image not found: ${frontmatter.hero}`,
        suggestion: 'Add hero image (1600x900) to the specified path',
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

// Main validation function
export async function validatePost(slug: string): Promise<ValidationResult & { breakdown: Record<string, ValidationResult> }> {
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
  const imagesResult = validateImages(post.frontmatter);

  // Combine results
  const allIssues = [
    ...frontmatterResult.issues,
    ...structureResult.issues,
    ...voiceResult.issues,
    ...seoResult.issues,
    ...imagesResult.issues,
  ];

  const allWarnings = [
    ...frontmatterResult.warnings,
    ...structureResult.warnings,
    ...voiceResult.warnings,
    ...seoResult.warnings,
    ...imagesResult.warnings,
  ];

  // Calculate overall score (weighted average)
  const guidelines = loadGuidelines();
  const weights = guidelines.scoring.weights;
  const totalWeight = weights.technical_depth + weights.voice_alignment + weights.structure + weights.seo_readiness;

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
    },
  };
}

// Export for use in validation script
export { type Post, type PostFrontmatter };
