import type { ThemeRegistration } from 'shiki';

/**
 * Custom neo-brutalist dark theme for Shiki syntax highlighting
 * Based on Tokyo Night Dark with adjustments for #0A0A0A background
 * and high WCAG AA contrast ratios
 */
export const neoBrutalistTheme: ThemeRegistration = {
  name: 'neo-brutalist-dark',
  type: 'dark',
  colors: {
    // Editor colors
    'editor.background': '#0A0A0A',
    'editor.foreground': '#F5F5F5',
    'editorLineNumber.foreground': '#666666',
    'editorLineNumber.activeForeground': '#A9A9A9',
    'editor.selectionBackground': '#333333',
    'editor.lineHighlightBackground': '#1A1A1A',

    // UI colors
    'activityBar.background': '#0A0A0A',
    'sideBar.background': '#0A0A0A',
    'terminal.background': '#0A0A0A',
  },
  tokenColors: [
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: {
        foreground: '#7A7A7A',
        fontStyle: 'italic',
      },
    },
    {
      scope: ['string', 'string.quoted'],
      settings: {
        foreground: '#A8E6A3', // Soft green for strings
      },
    },
    {
      scope: ['constant.numeric', 'constant.language', 'constant.character'],
      settings: {
        foreground: '#FFB86C', // Orange for numbers/constants
      },
    },
    {
      scope: ['keyword', 'storage.type', 'storage.modifier'],
      settings: {
        foreground: '#FF79C6', // Pink for keywords
        fontStyle: 'bold',
      },
    },
    {
      scope: ['keyword.control', 'keyword.operator'],
      settings: {
        foreground: '#FF79C6',
      },
    },
    {
      scope: ['entity.name.function', 'support.function'],
      settings: {
        foreground: '#8BE9FD', // Cyan for functions
      },
    },
    {
      scope: ['entity.name.type', 'entity.name.class', 'support.class'],
      settings: {
        foreground: '#FFD493', // Light orange for classes/types
      },
    },
    {
      scope: ['variable', 'variable.parameter'],
      settings: {
        foreground: '#F5F5F5', // White for variables
      },
    },
    {
      scope: ['variable.language'],
      settings: {
        foreground: '#BD93F9', // Purple for this/self/etc
        fontStyle: 'italic',
      },
    },
    {
      scope: ['entity.name.tag'],
      settings: {
        foreground: '#FF79C6', // Pink for HTML/JSX tags
      },
    },
    {
      scope: ['entity.other.attribute-name'],
      settings: {
        foreground: '#A8E6A3', // Green for attributes
      },
    },
    {
      scope: ['markup.heading'],
      settings: {
        foreground: '#BD93F9',
        fontStyle: 'bold',
      },
    },
    {
      scope: ['markup.bold'],
      settings: {
        foreground: '#FFB86C',
        fontStyle: 'bold',
      },
    },
    {
      scope: ['markup.italic'],
      settings: {
        foreground: '#F5F5F5',
        fontStyle: 'italic',
      },
    },
    {
      scope: ['markup.inline.raw', 'markup.fenced_code'],
      settings: {
        foreground: '#A8E6A3',
      },
    },
    {
      scope: ['punctuation'],
      settings: {
        foreground: '#D4D4D4',
      },
    },
    {
      scope: ['invalid'],
      settings: {
        foreground: '#FF5555',
        fontStyle: 'bold',
      },
    },
  ],
};
