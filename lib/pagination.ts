import { Post } from './posts';

export const POSTS_PER_PAGE = 12;

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  posts: Post[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Get paginated posts for a specific page number
 */
export function getPaginatedPosts(posts: Post[], page: number = 1): PaginationData {
  const totalPosts = posts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const currentPage = Math.max(1, Math.min(page, totalPages));

  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const paginatedPosts = posts.slice(startIndex, endIndex);

  return {
    currentPage,
    totalPages,
    totalPosts,
    posts: paginatedPosts,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}

/**
 * Generate array of page numbers for pagination UI
 */
export function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = [];

  // Always show first page
  pages.push(1);

  // Calculate range around current page
  const rangeStart = Math.max(2, currentPage - 1);
  const rangeEnd = Math.min(totalPages - 1, currentPage + 1);

  // Add ellipsis after first page if needed
  if (rangeStart > 2) {
    pages.push('ellipsis');
  }

  // Add pages around current page
  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  // Add ellipsis before last page if needed
  if (rangeEnd < totalPages - 1) {
    pages.push('ellipsis');
  }

  // Always show last page if there's more than one page
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}
