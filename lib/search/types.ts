/**
 * Search module types
 * Shared between server and client code
 */

export interface SearchIndexItem {
  slug: string;
  title: string;
  excerpt: string;
  contentPreview: string;
  tags: string[];
  keywords: string[];
  date: string;
}
