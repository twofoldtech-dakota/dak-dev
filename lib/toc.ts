export interface TocItem {
  id: string;
  text: string;
  level: number;
}

/**
 * Extract table of contents from MDX content
 * Parses h2 and h3 headings
 */
export function extractTableOfContents(content: string): TocItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const toc: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();

    // Generate ID from heading text (slugify)
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    toc.push({ id, text, level });
  }

  return toc;
}
