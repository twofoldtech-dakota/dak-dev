'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export interface CodeBlockProps {
  children: string;
  className?: string;
  highlightedHtml?: string;
  language?: string;
  highlightLines?: number[];
  isDiff?: boolean;
  showLineNumbers?: boolean;
}

/**
 * Advanced code block component with neo-brutalist styling
 * Features: line numbers, copy button, diff support, line highlighting
 */
export function CodeBlock({
  children,
  className = '',
  highlightedHtml,
  language = 'text',
  highlightLines = [],
  isDiff = false,
  showLineNumbers = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  // Extract language from className (e.g., "language-javascript")
  const langMatch = className.match(/language-(\w+)/);
  const displayLang = langMatch ? langMatch[1] : language;

  // Get clean code content for copying
  const codeContent = typeof children === 'string' ? children.trim() : '';

  const handleCopy = async () => {
    try {
      // Remove diff markers and get clean code
      const cleanCode = codeContent
        .split('\n')
        .map(line => {
          // Remove leading +/- if in diff mode
          if (isDiff && (line.startsWith('+') || line.startsWith('-'))) {
            return line.slice(1);
          }
          return line;
        })
        .join('\n');

      await navigator.clipboard.writeText(cleanCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  // Split code into lines for processing
  const lines = codeContent.split('\n');

  return (
    <div className="relative group my-6">
      {/* Language badge and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface border-2 border-b-0 border-text">
        <span className="text-xs font-semibold text-text uppercase tracking-wider">
          {displayLang}
        </span>
        <motion.button
          onClick={handleCopy}
          aria-label={copied ? 'Code copied' : 'Copy code to clipboard'}
          className={`px-3 py-1 text-xs font-semibold border-2 border-background
                     focus:outline-none focus:ring-2 focus:ring-text focus:ring-offset-2
                     focus:ring-offset-surface transition-colors ${
                       copied ? 'bg-accent text-background' : 'bg-text text-background hover:bg-muted'
                     }`}
          animate={copied ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.2 }}
        >
          {copied ? 'COPIED!' : 'COPY'}
        </motion.button>
      </div>

      {/* Code container */}
      <div className="relative bg-background border-2 border-text overflow-hidden">
        <div className="overflow-x-auto">
          {highlightedHtml ? (
            // Use pre-highlighted HTML from Shiki
            <div
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
              className="shiki-wrapper"
            />
          ) : (
            // Fallback rendering
            <div className="flex">
              {/* Line numbers gutter */}
              {showLineNumbers && (
                <div
                  className="flex-shrink-0 px-4 py-4 text-right border-r-2 border-surface select-none"
                  aria-hidden="true"
                >
                  {lines.map((_, i) => {
                    const lineNum = i + 1;
                    const isHighlighted = highlightLines.includes(lineNum);
                    return (
                      <div
                        key={lineNum}
                        className={`font-mono text-xs leading-6 ${
                          isHighlighted ? 'text-text font-bold' : 'text-muted'
                        }`}
                      >
                        {lineNum}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Code content */}
              <div className="flex-1 px-4 py-4">
                <pre className="font-mono text-sm leading-6">
                  <code className="text-text">
                    {lines.map((line, i) => {
                      const lineNum = i + 1;
                      const isHighlighted = highlightLines.includes(lineNum);
                      const isDiffLine = isDiff && (line.startsWith('+') || line.startsWith('-'));
                      const isAddition = line.startsWith('+');
                      const isRemoval = line.startsWith('-');

                      return (
                        <div
                          key={i}
                          className={`${
                            isHighlighted ? 'bg-[#1A1A1A] border-l-4 border-[#FFB86C] pl-2 -ml-2' : ''
                          } ${
                            isDiffLine
                              ? isAddition
                                ? 'bg-[#0A3A0A] border-l-4 border-[#A8E6A3] pl-2 -ml-2'
                                : 'bg-[#3A0A0A] border-l-4 border-[#FF5555] pl-2 -ml-2'
                              : ''
                          }`}
                        >
                          {isDiffLine && (
                            <span
                              className={`inline-block w-4 ${
                                isAddition ? 'text-[#A8E6A3]' : 'text-[#FF5555]'
                              }`}
                              aria-label={isAddition ? 'Added line' : 'Removed line'}
                            >
                              {isAddition ? '+' : '-'}
                            </span>
                          )}
                          <span>{isDiffLine ? line.slice(1) : line}</span>
                        </div>
                      );
                    })}
                  </code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
