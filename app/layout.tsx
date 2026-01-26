import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import { MotionConfig } from 'framer-motion';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ThemeProvider } from '@/contexts/ThemeContext';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://your-domain.vercel.app'),
  title: {
    default: 'Dakota Smith - Software Engineer & Tech Writer',
    template: '%s | Dakota Smith',
  },
  description:
    'High-performance personal blog featuring engineering projects, web development insights, and technical tutorials. Built with Next.js and optimized for accessibility.',
  keywords: [
    'Dakota Smith',
    'software engineering',
    'web development',
    'Next.js',
    'React',
    'TypeScript',
    'tech blog',
    'engineering blog',
  ],
  authors: [{ name: 'Dakota Smith', url: 'https://github.com/twofoldtech-dakota' }],
  creator: 'Dakota Smith',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.vercel.app',
    siteName: 'Dakota Smith Blog',
    title: 'Dakota Smith - Software Engineer & Tech Writer',
    description:
      'High-performance personal blog featuring engineering projects, web development insights, and technical tutorials.',
    images: [
      {
        url: '/api/og?title=Dakota%20Smith%20-%20Software%20Engineer%20%26%20Tech%20Writer',
        width: 1200,
        height: 630,
        alt: 'Dakota Smith Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dakota Smith - Software Engineer & Tech Writer',
    description:
      'High-performance personal blog featuring engineering projects and web development insights.',
    images: [
      '/api/og?title=Dakota%20Smith%20-%20Software%20Engineer%20%26%20Tech%20Writer',
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Icons generated via app/icon.tsx and app/apple-icon.tsx
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} dark`} suppressHydrationWarning>
      <head>
        {/* FOUC prevention: Apply theme class before CSS loads */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  try {
    var theme = localStorage.getItem('theme-preference') || 'dark';
    var resolved = theme;

    if (theme === 'system') {
      var isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      resolved = isDark ? 'dark' : 'light';
    }

    document.documentElement.classList.add(resolved);
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
            `.trim(),
          }}
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Dakota Smith Blog RSS Feed"
          href="/feed.xml"
        />
      </head>
      <body className="antialiased font-sans min-h-screen flex flex-col">
        <ThemeProvider>
          <MotionConfig reducedMotion="user">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </MotionConfig>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
