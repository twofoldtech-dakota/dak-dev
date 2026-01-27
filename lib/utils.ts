/**
 * Shared utility functions
 */

/**
 * Convert text to a URL-friendly slug
 * Used for generating heading IDs, URL slugs, etc.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Format a date string for display
 */
export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Check if code is running on the server
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Check if code is running on the client
 */
export function isClient(): boolean {
  return typeof window !== 'undefined';
}
