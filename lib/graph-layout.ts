import type { Pattern, RelationshipType } from './patterns';

export interface GraphNode {
  slug: string;
  name: string;
  number: string;
  chapter: number;
  x: number;
  y: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  type: RelationshipType;
}

const COLUMN_COUNT = 6;
const SVG_WIDTH = 1200;
const SVG_HEIGHT = 900;
const TOP_PADDING = 80;
const BOTTOM_PADDING = 40;
const SIDE_PADDING = 70;
const NODE_WIDTH = 150;
const NODE_HEIGHT = 62;

export function computeGraphLayout(patterns: Pattern[]): {
  nodes: GraphNode[];
  edges: GraphEdge[];
  width: number;
  height: number;
} {
  const columnWidth =
    (SVG_WIDTH - SIDE_PADDING * 2) / COLUMN_COUNT;

  // Group patterns by chapter
  const byChapter = new Map<number, Pattern[]>();
  for (const p of patterns) {
    const ch = p.frontmatter.chapter;
    if (!byChapter.has(ch)) byChapter.set(ch, []);
    byChapter.get(ch)!.push(p);
  }

  // Compute max patterns in any single chapter for vertical spacing
  let maxInColumn = 0;
  for (const group of byChapter.values()) {
    if (group.length > maxInColumn) maxInColumn = group.length;
  }

  const availableHeight = SVG_HEIGHT - TOP_PADDING - BOTTOM_PADDING;
  const verticalSpacing = maxInColumn > 1
    ? Math.min(100, availableHeight / maxInColumn)
    : availableHeight / 2;

  // Place nodes
  const nodes: GraphNode[] = [];
  for (let col = 0; col < COLUMN_COUNT; col++) {
    const chapter = col + 1;
    const group = byChapter.get(chapter) || [];
    const colCenterX = SIDE_PADDING + columnWidth * col + columnWidth / 2;

    // Center group vertically
    const totalGroupHeight = (group.length - 1) * verticalSpacing;
    const startY = TOP_PADDING + (availableHeight - totalGroupHeight) / 2;

    group.forEach((p, i) => {
      nodes.push({
        slug: p.frontmatter.slug,
        name: p.frontmatter.name,
        number: p.frontmatter.number,
        chapter,
        x: colCenterX,
        y: startY + i * verticalSpacing,
      });
    });
  }

  // Build node lookup
  const nodeMap = new Map<string, GraphNode>();
  for (const n of nodes) nodeMap.set(n.slug, n);

  // Collect edges (deduplicated)
  const edgeSet = new Set<string>();
  const edges: GraphEdge[] = [];

  for (const p of patterns) {
    const rels = p.frontmatter.relatedPatterns || [];
    for (const rel of rels) {
      if (!nodeMap.has(rel.slug)) continue;
      const key = [p.frontmatter.slug, rel.slug].sort().join('::') + '::' + rel.type;
      if (edgeSet.has(key)) continue;
      edgeSet.add(key);
      edges.push({
        from: p.frontmatter.slug,
        to: rel.slug,
        type: rel.type,
      });
    }
  }

  return { nodes, edges, width: SVG_WIDTH, height: SVG_HEIGHT };
}

export { NODE_WIDTH, NODE_HEIGHT, COLUMN_COUNT, SIDE_PADDING, SVG_WIDTH, TOP_PADDING };
