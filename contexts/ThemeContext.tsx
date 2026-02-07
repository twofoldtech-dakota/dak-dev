'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'theme-preference';

/**
 * Detects the system's preferred color scheme
 * Returns 'dark' as default if matchMedia is unavailable
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  try {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return isDark ? 'dark' : 'light';
  } catch {
    return 'dark';
  }
}

/**
 * Resolves the actual theme to apply based on user preference
 */
function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
}

/**
 * Applies the theme to the document by setting class on html element
 */
function applyTheme(theme: ResolvedTheme) {
  if (typeof document === 'undefined') {
    return;
  }

  const html = document.documentElement;

  // Add transition class for smooth theme switching
  html.classList.add('theme-transitioning');

  // Remove both classes first
  html.classList.remove('light', 'dark');

  // Add the current theme class
  html.classList.add(theme);

  // Remove transition class after animation completes
  setTimeout(() => {
    html.classList.remove('theme-transitioning');
  }, 300);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Default to 'dark' for SSR, will be hydrated on client
  const [theme, setThemeState] = useState<Theme>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');

  // Initialize theme on mount (anti_001: use useEffect for side effects)
  useEffect(() => {
    // Read from localStorage
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const initialTheme = stored || 'dark';

    setThemeState(initialTheme);
    const resolved = resolveTheme(initialTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);

    // Listen for system theme changes when in system mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = () => {
      setThemeState(current => {
        if (current === 'system') {
          const newResolved = getSystemTheme();
          setResolvedTheme(newResolved);
          applyTheme(newResolved);
        }
        return current;
      });
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);

    // Persist to localStorage
    localStorage.setItem(STORAGE_KEY, newTheme);

    // Resolve and apply the theme
    const resolved = resolveTheme(newTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 * Returns { theme, setTheme, resolvedTheme }
 */
export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
