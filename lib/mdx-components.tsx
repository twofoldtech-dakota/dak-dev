import { MDXComponents } from 'mdx/types';
import { CodeBlock } from '@/components/blog/CodeBlock';
import { parseCodeMetadata } from './shiki';

/**
 * Custom MDX components for enhanced rendering
 */
export function getMDXComponents(): MDXComponents {
  return {
    // Override code blocks to use our custom CodeBlock component
    pre: ({ children, ...props }: any) => {
      // Extract code element from children
      const codeElement = children?.props;
      if (!codeElement) return <pre {...props}>{children}</pre>;

      const { children: code, className } = codeElement;
      const codeString = typeof code === 'string' ? code.trim() : '';

      // Parse language and metadata from className
      // Format: language-javascript or language-typescript
      const langMatch = className?.match(/language-(\w+)/);
      const language = langMatch?.[1] || 'text';

      // For now, we'll parse metadata from the raw code string if it has markers
      // MDX doesn't easily pass the meta string, so we'll look for patterns
      const firstLine = codeString.split('\n')[0] || '';
      let metadata = { language, highlightLines: [] as number[], isDiff: false };

      // Check if the code appears to be diff format
      if (codeString.includes('\n+') || codeString.includes('\n-')) {
        metadata.isDiff = true;
      }

      return (
        <CodeBlock
          className={className}
          language={metadata.language}
          highlightLines={metadata.highlightLines}
          isDiff={metadata.isDiff}
        >
          {codeString}
        </CodeBlock>
      );
    },

    // Override inline code
    code: ({ children, ...props }: any) => {
      return (
        <code
          className="px-1.5 py-0.5 text-sm font-mono bg-[#333333] text-[#A8E6A3] border border-[#666666] rounded-none"
          {...props}
        >
          {children}
        </code>
      );
    },
  };
}
