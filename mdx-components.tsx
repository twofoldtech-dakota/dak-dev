import type { MDXComponents } from 'mdx/types';

/**
 * Custom MDX components for the application
 * These components are used to override default MDX elements
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Custom inline code styling
    code: ({ children, ...props }) => {
      // Check if this is part of a pre block (will be handled by rehype-pretty-code)
      if (props.className?.includes('language-')) {
        return <code {...props}>{children}</code>;
      }

      // Inline code styling
      return (
        <code
          className="px-1.5 py-0.5 text-sm font-mono bg-surface text-accent border border-muted rounded-none"
          {...props}
        >
          {children}
        </code>
      );
    },
    ...components,
  };
}
