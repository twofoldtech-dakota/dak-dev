import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Image specifications from brand guidelines
export const IMAGE_SPECS = {
  thumbnail: { width: 800, height: 450, maxSizeKB: 500 },
  hero: { width: 1600, height: 900, maxSizeKB: 1000 },
} as const;

export type ImageType = keyof typeof IMAGE_SPECS;

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  sizeKB: number;
  aspectRatio: string;
}

export interface ImageSpec {
  width: number;
  height: number;
  maxSizeKB: number;
}

export interface ValidationIssue {
  type: 'error' | 'warning';
  category: 'images';
  field: string;
  message: string;
  suggestion?: string;
}

export interface ProcessedImage {
  type: ImageType;
  path: string;
  blurDataURL: string;
  metadata: ImageMetadata;
}

/**
 * Fetch image from URL or read from local path
 */
export async function loadImage(source: string): Promise<Buffer> {
  // Check if it's a URL
  if (source.startsWith('http://') || source.startsWith('https://')) {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  // Local file
  const absolutePath = path.isAbsolute(source) ? source : path.join(process.cwd(), source);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Image file not found: ${absolutePath}`);
  }
  return fs.readFileSync(absolutePath);
}

/**
 * Resize and optimize image for web
 */
export async function processImage(
  buffer: Buffer,
  width: number,
  height: number,
  quality: number = 85
): Promise<Buffer> {
  return sharp(buffer)
    .resize(width, height, {
      fit: 'cover',
      position: 'center',
    })
    .jpeg({
      quality,
      mozjpeg: true,
    })
    .toBuffer();
}

/**
 * Generate base64 blur placeholder (tiny, heavily blurred)
 */
export async function generateBlurPlaceholder(buffer: Buffer): Promise<string> {
  // Create a tiny 10px wide version with heavy blur
  const blurBuffer = await sharp(buffer)
    .resize(10, 10, {
      fit: 'cover',
    })
    .blur(1)
    .jpeg({
      quality: 50,
    })
    .toBuffer();

  const base64 = blurBuffer.toString('base64');
  return `data:image/jpeg;base64,${base64}`;
}

/**
 * Get image metadata (dimensions, format, size)
 */
export async function getImageMetadata(imagePath: string): Promise<ImageMetadata> {
  const absolutePath = path.isAbsolute(imagePath) ? imagePath : path.join(process.cwd(), imagePath);
  const stats = fs.statSync(absolutePath);
  const sizeKB = Math.round(stats.size / 1024);

  const metadata = await sharp(absolutePath).metadata();

  const width = metadata.width || 0;
  const height = metadata.height || 0;
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  const aspectRatio = `${width / divisor}:${height / divisor}`;

  return {
    width,
    height,
    format: metadata.format || 'unknown',
    sizeKB,
    aspectRatio,
  };
}

/**
 * Validate image meets specification
 */
export async function validateImageSpec(imagePath: string, spec: ImageSpec): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];

  try {
    const metadata = await getImageMetadata(imagePath);

    // Check dimensions
    if (metadata.width !== spec.width || metadata.height !== spec.height) {
      issues.push({
        type: 'error',
        category: 'images',
        field: path.basename(imagePath),
        message: `Incorrect dimensions: ${metadata.width}x${metadata.height} (expected ${spec.width}x${spec.height})`,
        suggestion: `Run npm run images:process to resize to ${spec.width}x${spec.height}`,
      });
    }

    // Check file size
    if (metadata.sizeKB > spec.maxSizeKB) {
      issues.push({
        type: 'warning',
        category: 'images',
        field: path.basename(imagePath),
        message: `Large file size: ${metadata.sizeKB}KB (recommended max: ${spec.maxSizeKB}KB)`,
        suggestion: 'Consider optimizing the image to reduce file size',
      });
    }

    // Check format (should be JPEG)
    if (metadata.format !== 'jpeg' && metadata.format !== 'jpg') {
      issues.push({
        type: 'warning',
        category: 'images',
        field: path.basename(imagePath),
        message: `Non-JPEG format: ${metadata.format} (JPEG recommended for consistency)`,
        suggestion: 'Run npm run images:process to convert to JPEG',
      });
    }
  } catch (error) {
    issues.push({
      type: 'error',
      category: 'images',
      field: path.basename(imagePath),
      message: `Failed to validate image: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }

  return issues;
}

/**
 * Process a source image into both thumbnail and hero versions
 */
export async function processPostImages(
  slug: string,
  sourceBuffer: Buffer
): Promise<{ thumbnail: ProcessedImage; hero: ProcessedImage }> {
  const outputDir = path.join(process.cwd(), 'public', 'images', 'posts', slug);

  // Ensure directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  // Process thumbnail
  const thumbnailSpec = IMAGE_SPECS.thumbnail;
  const thumbnailBuffer = await processImage(sourceBuffer, thumbnailSpec.width, thumbnailSpec.height);
  const thumbnailPath = path.join(outputDir, 'thumbnail.jpg');
  fs.writeFileSync(thumbnailPath, thumbnailBuffer);
  const thumbnailBlur = await generateBlurPlaceholder(thumbnailBuffer);
  const thumbnailMetadata = await getImageMetadata(thumbnailPath);

  // Process hero
  const heroSpec = IMAGE_SPECS.hero;
  const heroBuffer = await processImage(sourceBuffer, heroSpec.width, heroSpec.height);
  const heroPath = path.join(outputDir, 'hero.jpg');
  fs.writeFileSync(heroPath, heroBuffer);
  const heroBlur = await generateBlurPlaceholder(heroBuffer);
  const heroMetadata = await getImageMetadata(heroPath);

  return {
    thumbnail: {
      type: 'thumbnail',
      path: `/images/posts/${slug}/thumbnail.jpg`,
      blurDataURL: thumbnailBlur,
      metadata: thumbnailMetadata,
    },
    hero: {
      type: 'hero',
      path: `/images/posts/${slug}/hero.jpg`,
      blurDataURL: heroBlur,
      metadata: heroMetadata,
    },
  };
}

/**
 * Get the output directory for post images
 */
export function getPostImageDir(slug: string): string {
  return path.join(process.cwd(), 'public', 'images', 'posts', slug);
}

/**
 * Check if post images exist
 */
export function postImagesExist(slug: string): { thumbnail: boolean; hero: boolean } {
  const dir = getPostImageDir(slug);
  return {
    thumbnail: fs.existsSync(path.join(dir, 'thumbnail.jpg')),
    hero: fs.existsSync(path.join(dir, 'hero.jpg')),
  };
}
