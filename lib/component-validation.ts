import fs from 'fs';
import path from 'path';
import { validateBrandVoice, type ValidationIssue } from './content-validation';

// Types
export type ComponentCategory = 'page' | 'layout' | 'section' | 'blog' | 'ui';

export interface ExtractedString {
  value: string;
  line: number;
  type: 'jsx-text' | 'string-literal' | 'template-literal' | 'metadata';
}

export interface ComponentScanResult {
  file: string;
  relativePath: string;
  category: ComponentCategory;
  strings: ExtractedString[];
  issues: ComponentValidationIssue[];
  score: number;
  passed: boolean;
}

export interface ComponentValidationIssue {
  type: 'error' | 'warning';
  category: 'voice' | 'accessibility' | 'consistency';
  message: string;
  suggestion?: string;
  line?: number;
  text?: string;
}

// Component file patterns for each category
const COMPONENT_PATTERNS: Record<ComponentCategory, RegExp[]> = {
  page: [/^app\/.*\/page\.tsx$/, /^app\/page\.tsx$/],
  layout: [/^components\/layout\//, /^app\/.*\/layout\.tsx$/, /^app\/layout\.tsx$/],
  section: [/^components\/home\//, /^components\/blog\/(?!CodeBlock|MdxComponents)/],
  blog: [/^components\/blog\//],
  ui: [/^components\/ui\//],
};

// Files to exclude from scanning
const EXCLUDE_PATTERNS = [
  /route\.tsx$/,        // API routes
  /icon\.tsx$/,         // Icon generators
  /apple-icon\.tsx$/,   // Apple icon generators
  /JsonLd\.tsx$/,       // JSON-LD structured data (not user-facing text)
  /CodeBlock\.tsx$/,    // Code block styling (no user-facing text)
  /CodeBlockWrapper\.tsx$/, // Code block wrapper
  /MdxComponents\.tsx$/, // MDX component mappings
  /PageTransition\.tsx$/, // Animation wrapper
  /TestPostList\.tsx$/, // Test component
  /components-demo\//,  // Demo pages
];

/**
 * Determine the category of a component file
 */
function categorizeComponent(filePath: string): ComponentCategory | null {
  const relativePath = filePath.replace(process.cwd() + '/', '');

  // Check exclusions first
  for (const pattern of EXCLUDE_PATTERNS) {
    if (pattern.test(relativePath)) {
      return null;
    }
  }

  // Check each category
  for (const [category, patterns] of Object.entries(COMPONENT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(relativePath)) {
        return category as ComponentCategory;
      }
    }
  }

  return null;
}

/**
 * Extract text strings from a TSX file
 */
function extractStrings(content: string, filePath: string): ExtractedString[] {
  const strings: ExtractedString[] = [];
  const lines = content.split('\n');

  // Track if we're inside a code block or non-text context
  const inCodeBlock = false;
  let inImport = false;
  let inClassNames = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Skip import statements
    if (line.trim().startsWith('import ')) {
      inImport = true;
    }
    if (inImport && (line.includes(';') || line.includes("'"))) {
      inImport = false;
      continue;
    }
    if (inImport) continue;

    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
      continue;
    }

    // Skip className strings
    if (line.includes('className=')) {
      inClassNames = true;
    }
    if (inClassNames && (line.includes('`') || line.includes('"') || line.includes("'"))) {
      inClassNames = !line.match(/className=["'`][^"'`]*["'`]/);
      continue;
    }

    // Extract metadata strings (title, description, etc.)
    const metadataMatch = line.match(/(title|description|name|alt|label|placeholder|content|ariaLabel)\s*[:=]\s*["'`]([^"'`]+)["'`]/i);
    if (metadataMatch) {
      const value = metadataMatch[2].trim();
      if (value.length > 3 && !isCodeOrPath(value)) {
        strings.push({
          value,
          line: lineNumber,
          type: 'metadata',
        });
      }
    }

    // Extract JSX text content (text between tags)
    const jsxTextMatches = line.matchAll(/>([^<>{]+)</g);
    for (const match of jsxTextMatches) {
      const value = match[1].trim();
      // Filter out whitespace-only, single characters, and code patterns
      if (value.length > 2 && !isCodeOrPath(value) && !/^\s*$/.test(value)) {
        strings.push({
          value,
          line: lineNumber,
          type: 'jsx-text',
        });
      }
    }

    // Extract string literals in JSX expressions
    const stringLiteralMatches = line.matchAll(/\{["']([^"']+)["']\}/g);
    for (const match of stringLiteralMatches) {
      const value = match[1].trim();
      if (value.length > 3 && !isCodeOrPath(value)) {
        strings.push({
          value,
          line: lineNumber,
          type: 'string-literal',
        });
      }
    }

    // Extract template literal content that looks like user text
    const templateMatches = line.matchAll(/`([^`]+)`/g);
    for (const match of templateMatches) {
      const value = match[1].trim();
      // Skip CSS/className strings, paths, and code
      if (
        value.length > 10 &&
        !isCodeOrPath(value) &&
        !value.includes('${') &&
        !value.includes('px') &&
        !value.includes('rem')
      ) {
        strings.push({
          value,
          line: lineNumber,
          type: 'template-literal',
        });
      }
    }
  }

  // Deduplicate strings
  const seen = new Set<string>();
  return strings.filter((s) => {
    const key = `${s.value}-${s.line}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Check if a string looks like code, a path, or technical content
 */
function isCodeOrPath(value: string): boolean {
  // Skip paths
  if (value.startsWith('/') || value.startsWith('./') || value.startsWith('../')) {
    return true;
  }

  // Skip URLs
  if (value.startsWith('http') || value.includes('://')) {
    return true;
  }

  // Skip CSS-like strings
  if (/^[\d.]+(?:px|rem|em|%|vh|vw|s|ms)$/.test(value)) {
    return true;
  }

  // Skip code patterns
  if (value.includes('===') || value.includes('!==') || value.includes('=>')) {
    return true;
  }

  // Skip variable interpolation patterns
  if (/^\$\{/.test(value) || /\$\{.*\}/.test(value)) {
    return true;
  }

  // Skip tailwind classes
  if (/^(?:flex|grid|block|inline|hidden|p-|m-|w-|h-|text-|bg-|border)/.test(value)) {
    return true;
  }

  // Skip icon names and technical identifiers
  if (/^[a-z]+(?:Icon|Loader|Spinner|Component)$/i.test(value)) {
    return true;
  }

  return false;
}

/**
 * Validate extracted strings against brand voice guidelines
 */
function validateComponentStrings(strings: ExtractedString[]): ComponentValidationIssue[] {
  const issues: ComponentValidationIssue[] = [];

  for (const str of strings) {
    // Only validate strings that are long enough to be prose
    if (str.value.length < 15) continue;

    const result = validateBrandVoice(str.value);

    for (const warning of result.warnings) {
      issues.push({
        type: 'warning',
        category: 'voice',
        message: warning.message,
        suggestion: warning.suggestion,
        line: str.line,
        text: str.value.substring(0, 50) + (str.value.length > 50 ? '...' : ''),
      });
    }

    for (const error of result.issues) {
      issues.push({
        type: 'error',
        category: 'voice',
        message: error.message,
        suggestion: error.suggestion,
        line: str.line,
        text: str.value.substring(0, 50) + (str.value.length > 50 ? '...' : ''),
      });
    }
  }

  return issues;
}

/**
 * Scan a single component file
 */
export function scanComponent(filePath: string): ComponentScanResult | null {
  const category = categorizeComponent(filePath);

  if (!category) {
    return null; // File should be excluded
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const strings = extractStrings(content, filePath);
  const issues = validateComponentStrings(strings);

  const errorCount = issues.filter((i) => i.type === 'error').length;
  const warningCount = issues.filter((i) => i.type === 'warning').length;
  const score = Math.max(0, 100 - errorCount * 15 - warningCount * 5);

  return {
    file: filePath,
    relativePath: filePath.replace(process.cwd() + '/', ''),
    category,
    strings,
    issues,
    score,
    passed: errorCount === 0,
  };
}

/**
 * Scan all components in the project
 */
export function scanAllComponents(): ComponentScanResult[] {
  const results: ComponentScanResult[] = [];
  const cwd = process.cwd();

  // Scan app directory for pages
  const appDir = path.join(cwd, 'app');
  if (fs.existsSync(appDir)) {
    const appFiles = findTsxFiles(appDir);
    for (const file of appFiles) {
      const result = scanComponent(file);
      if (result) results.push(result);
    }
  }

  // Scan components directory
  const componentsDir = path.join(cwd, 'components');
  if (fs.existsSync(componentsDir)) {
    const componentFiles = findTsxFiles(componentsDir);
    for (const file of componentFiles) {
      const result = scanComponent(file);
      if (result) results.push(result);
    }
  }

  return results;
}

/**
 * Recursively find all .tsx files in a directory
 */
function findTsxFiles(dir: string): string[] {
  const files: string[] = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...findTsxFiles(fullPath));
    } else if (entry.name.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Get component results grouped by category
 */
export function groupResultsByCategory(results: ComponentScanResult[]): Record<ComponentCategory, ComponentScanResult[]> {
  const grouped: Record<ComponentCategory, ComponentScanResult[]> = {
    page: [],
    layout: [],
    section: [],
    blog: [],
    ui: [],
  };

  for (const result of results) {
    grouped[result.category].push(result);
  }

  // Sort each category by issue count (most issues first)
  for (const category of Object.keys(grouped) as ComponentCategory[]) {
    grouped[category].sort((a, b) => b.issues.length - a.issues.length);
  }

  return grouped;
}

/**
 * Calculate average score for a set of results
 */
export function calculateAverageScore(results: ComponentScanResult[]): number {
  if (results.length === 0) return 100;
  const total = results.reduce((sum, r) => sum + r.score, 0);
  return Math.round(total / results.length);
}

/**
 * Get issue frequency summary
 */
export function getIssueSummary(results: ComponentScanResult[]): { byCategory: Record<string, number>; bySeverity: { errors: number; warnings: number } } {
  const byCategory: Record<string, number> = {};
  let errors = 0;
  let warnings = 0;

  for (const result of results) {
    for (const issue of result.issues) {
      const key = `${issue.category}:${issue.message.split(':')[0]}`;
      byCategory[key] = (byCategory[key] || 0) + 1;

      if (issue.type === 'error') {
        errors++;
      } else {
        warnings++;
      }
    }
  }

  return {
    byCategory,
    bySeverity: { errors, warnings },
  };
}
