/**
 * Centralized type exports
 *
 * Import types from here for consistency:
 *   import type { Post, PostFrontmatter, SearchIndexItem } from '@/types';
 */

// Post types
export type { Post, PostFrontmatter } from '@/lib/posts';

// Search types
export type { SearchIndexItem } from '@/lib/search';

// Validation types
export type {
  ValidationResult,
  ValidationIssue,
  BrandGuidelines,
} from '@/lib/content-validation';
