import { getAllProducts } from '@/lib/products';
import { ProductCardList } from '@/components/ui/ProductCard';
import { PageTransition } from '@/components/ui/PageTransition';
import { JsonLd } from '@/components/seo/JsonLd';
import { generateBreadcrumbSchema } from '@/lib/schema';

export const metadata = {
  title: 'Tools | Dakota Smith',
  description:
    'Open-source tools and products for AI-assisted development — orchestration systems, Claude Code plugins, MCP servers, and more.',
};

export default async function ToolsPage() {
  const products = await getAllProducts();
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Tools' },
  ]);

  return (
    <PageTransition className="min-h-screen py-16">
      <JsonLd data={breadcrumbSchema} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-16 border-b-4 border-text pb-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Tools</h1>
          <p className="text-lg text-muted">
            Open-source products and tools I&apos;ve built for AI-assisted development.
          </p>
        </header>

        {/* Products Grid */}
        {products.length > 0 ? (
          <ProductCardList products={products} />
        ) : (
          <div className="border-4 border-text p-12 text-center">
            <p className="text-2xl font-semibold mb-2">No tools yet</p>
            <p className="text-muted">Check back soon.</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
