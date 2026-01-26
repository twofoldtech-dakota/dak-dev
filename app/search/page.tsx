import { Metadata } from 'next';
import { SearchContent } from './SearchContent';

// SEO metadata with noindex
export const metadata: Metadata = {
  title: 'Search | Dakota Smith',
  description: 'Search blog posts',
  robots: {
    index: false,
    follow: true,
  },
};

export default function SearchPage() {
  return <SearchContent />;
}
