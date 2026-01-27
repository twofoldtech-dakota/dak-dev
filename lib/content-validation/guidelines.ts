/**
 * Guidelines loading with caching
 */

import fs from 'fs';
import path from 'path';
import type { BrandGuidelines } from './types';

// Cache the guidelines at module level to avoid repeated file reads
let cachedGuidelines: BrandGuidelines | null = null;

/**
 * Load brand guidelines from file
 * Results are cached for performance
 */
export function loadGuidelines(): BrandGuidelines {
  if (cachedGuidelines) {
    return cachedGuidelines;
  }

  const guidelinesPath = path.join(process.cwd(), '.content/brand/guidelines.json');
  const content = fs.readFileSync(guidelinesPath, 'utf8');
  cachedGuidelines = JSON.parse(content);

  return cachedGuidelines!;
}

/**
 * Clear the cached guidelines
 * Useful for testing or when guidelines file is updated
 */
export function clearGuidelinesCache(): void {
  cachedGuidelines = null;
}
