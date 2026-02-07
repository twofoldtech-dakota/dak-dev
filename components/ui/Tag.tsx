'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface TagProps {
  tag: string;
  interactive?: boolean;
  className?: string;
}

/**
 * Tag component for blog post categories
 * Can be interactive (link) or static (display only)
 */
export function Tag({ tag, interactive = true, className = '' }: TagProps) {
  const baseStyles = 'inline-block px-3 py-1 text-sm font-semibold border-2 border-text transition-all duration-200';
  const interactiveStyles = 'hover:bg-text hover:text-background hover:border-accent hover:shadow-[0_0_12px_var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background';
  const staticStyles = 'bg-transparent text-text';

  const classNames = [
    baseStyles,
    interactive ? interactiveStyles : staticStyles,
    className,
  ].join(' ');

  // Generate slug from tag (lowercase, replace spaces with hyphens)
  const tagSlug = tag.toLowerCase().replace(/\s+/g, '-');

  if (interactive) {
    return (
      <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Link href={`/blog/tags/${tagSlug}`} className={classNames}>
          #{tag}
        </Link>
      </motion.span>
    );
  }

  return <span className={classNames}>#{tag}</span>;
}

interface TagListProps {
  tags: string[];
  interactive?: boolean;
  className?: string;
}

/**
 * TagList component for displaying multiple tags
 */
export function TagList({ tags, interactive = true, className = '' }: TagListProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag) => (
        <Tag key={tag} tag={tag} interactive={interactive} />
      ))}
    </div>
  );
}
