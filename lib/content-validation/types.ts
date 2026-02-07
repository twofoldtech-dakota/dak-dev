/**
 * Content validation types
 */

export interface ValidationIssue {
  type: 'error' | 'warning';
  category: 'frontmatter' | 'structure' | 'seo' | 'voice' | 'images' | 'links';
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
    seo_strategy?: {
      keyword_requirements: {
        max_keyword_density_percent: number;
        min_keyword_density_percent: number;
      };
      internal_linking: {
        min_internal_links_per_post: number;
        max_internal_links_per_post: number;
      };
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
