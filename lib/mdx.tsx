import React from 'react';
import { MDXRemote, MDXRemoteProps } from 'next-mdx-remote/rsc';

// Custom MDX components for enhanced rendering
const components = {
  h1: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h1 className="text-4xl font-bold mb-4 text-text" {...props} />
  ),
  h2: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h2 className="text-3xl font-semibold mb-3 mt-8 text-text" {...props} />
  ),
  h3: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h3 className="text-2xl font-semibold mb-2 mt-6 text-text" {...props} />
  ),
  p: (props: React.HTMLProps<HTMLParagraphElement>) => (
    <p className="mb-4 text-muted leading-relaxed" {...props} />
  ),
  a: (props: React.HTMLProps<HTMLAnchorElement>) => (
    <a className="text-text underline hover:no-underline" {...props} />
  ),
  code: (props: React.HTMLProps<HTMLElement>) => (
    <code className="bg-surface px-1 py-0.5 rounded text-sm font-mono" {...props} />
  ),
  pre: (props: React.HTMLProps<HTMLPreElement>) => (
    <pre className="bg-surface p-4 rounded overflow-x-auto mb-4" {...props} />
  ),
  ul: (props: React.HTMLProps<HTMLUListElement>) => (
    <ul className="list-disc list-inside mb-4 text-muted" {...props} />
  ),
  ol: ({ type, ...props }: React.HTMLProps<HTMLOListElement>) => (
    <ol className="list-decimal list-inside mb-4 text-muted" {...props} />
  ),
};

interface MDXContentProps {
  content: string;
}

export function MDXContent({ content }: MDXContentProps) {
  return <MDXRemote source={content} components={components} />;
}
