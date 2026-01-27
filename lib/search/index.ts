/**
 * Search module - unified exports
 *
 * For client-side code, import from here:
 *   import { searchPosts, SearchIndexItem } from '@/lib/search';
 *
 * For server-side index generation:
 *   import { generateSearchIndex } from '@/lib/search/index-generator';
 */

export type { SearchIndexItem } from './types';
export { searchPosts, getMatchScore } from './search';
