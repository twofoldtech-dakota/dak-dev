'use client';

import { useState, useEffect, useRef } from 'react';

export function CodeBlockWrapper({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Find all pre elements and add copy buttons
    if (!preRef.current) return;

    const preElements = preRef.current.querySelectorAll('pre');

    preElements.forEach((pre) => {
      // Check if copy button already exists
      if (pre.querySelector('.copy-button-wrapper')) return;

      // Extract language from data attribute or class
      const code = pre.querySelector('code');
      const language =
        pre.getAttribute('data-language') ||
        code?.getAttribute('data-language') ||
        code?.className?.match(/language-(\w+)/)?.[1] ||
        'text';

      // Create wrapper for language badge and copy button
      const wrapper = document.createElement('div');
      wrapper.className = 'copy-button-wrapper';
      wrapper.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem 1rem;
        background-color: #333333;
        border-bottom: 2px solid #f5f5f5;
      `;

      // Language badge
      const badge = document.createElement('span');
      badge.textContent = language.toUpperCase();
      badge.style.cssText = `
        font-size: 0.75rem;
        font-weight: 600;
        color: #f5f5f5;
        letter-spacing: 0.05em;
        font-family: var(--font-sans);
      `;

      // Copy button
      const button = document.createElement('button');
      button.textContent = 'COPY';
      button.className = 'copy-code-button';
      button.setAttribute('aria-label', 'Copy code to clipboard');
      button.style.cssText = `
        padding: 0.25rem 0.75rem;
        font-size: 0.75rem;
        font-weight: 600;
        color: #0a0a0a;
        background-color: #f5f5f5;
        border: 2px solid #0a0a0a;
        cursor: pointer;
        transition: background-color 0.2s;
        font-family: var(--font-sans);
      `;

      button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = '#a9a9a9';
      });

      button.addEventListener('mouseleave', () => {
        if (button.textContent !== 'COPIED!') {
          button.style.backgroundColor = '#f5f5f5';
        }
      });

      button.addEventListener('click', async () => {
        const codeElement = pre.querySelector('code');
        if (!codeElement) return;

        // Get text content, excluding line numbers and other UI elements
        const codeText = codeElement.textContent || '';

        try {
          await navigator.clipboard.writeText(codeText);
          button.textContent = 'COPIED!';
          button.style.backgroundColor = '#a8e6a3';
          setTimeout(() => {
            button.textContent = 'COPY';
            button.style.backgroundColor = '#f5f5f5';
          }, 2000);
        } catch (error) {
          console.error('Failed to copy code:', error);
        }
      });

      wrapper.appendChild(badge);
      wrapper.appendChild(button);

      // Make the pre element position relative
      pre.style.position = 'relative';
      pre.style.paddingTop = '3rem';

      // Insert wrapper at the beginning of pre
      pre.insertBefore(wrapper, pre.firstChild);
    });
  }, [children]);

  return <div ref={preRef}>{children}</div>;
}
