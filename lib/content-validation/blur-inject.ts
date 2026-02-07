/**
 * Blur placeholder injection
 *
 * Auto-injects blur placeholder base64 data into MDX frontmatter,
 * eliminating manual copy-paste from process-images output.
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { generateBlurPlaceholder } from '../image-utils';

interface BlurInjectResult {
  updated: boolean;
  thumbnailInjected: boolean;
  heroInjected: boolean;
  errors: string[];
}

/**
 * Inject blur placeholder data into a post's frontmatter
 *
 * Uses gray-matter's stringify to safely round-trip MDX content.
 * Only writes if changes are needed.
 */
export async function injectBlurPlaceholders(slug: string): Promise<BlurInjectResult> {
  const result: BlurInjectResult = {
    updated: false,
    thumbnailInjected: false,
    heroInjected: false,
    errors: [],
  };

  const postPath = path.join(process.cwd(), 'content/posts', `${slug}.mdx`);
  if (!fs.existsSync(postPath)) {
    result.errors.push(`Post file not found: ${postPath}`);
    return result;
  }

  const fileContents = fs.readFileSync(postPath, 'utf8');
  const { data, content } = matter(fileContents);
  let needsWrite = false;

  // Inject thumbnail blur
  if (data.thumbnail && !data.thumbnailBlur) {
    const thumbnailPath = path.join(process.cwd(), 'public', data.thumbnail);
    if (fs.existsSync(thumbnailPath)) {
      try {
        const imageBuffer = fs.readFileSync(thumbnailPath);
        data.thumbnailBlur = await generateBlurPlaceholder(imageBuffer);
        result.thumbnailInjected = true;
        needsWrite = true;
      } catch (err) {
        result.errors.push(
          `Failed to generate thumbnail blur: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    } else {
      result.errors.push(`Thumbnail image not found: ${thumbnailPath}`);
    }
  }

  // Inject hero blur
  if (data.hero && !data.heroBlur) {
    const heroPath = path.join(process.cwd(), 'public', data.hero);
    if (fs.existsSync(heroPath)) {
      try {
        const imageBuffer = fs.readFileSync(heroPath);
        data.heroBlur = await generateBlurPlaceholder(imageBuffer);
        result.heroInjected = true;
        needsWrite = true;
      } catch (err) {
        result.errors.push(
          `Failed to generate hero blur: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    } else {
      result.errors.push(`Hero image not found: ${heroPath}`);
    }
  }

  if (needsWrite) {
    const updated = matter.stringify(content, data);
    fs.writeFileSync(postPath, updated, 'utf8');
    result.updated = true;
  }

  return result;
}
