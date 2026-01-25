import { getAllProducts } from '@/lib/products';
import { ProductCardList } from '@/components/ui/ProductCard';

/**
 * ProductsShowcase section for the homepage
 * Displays tools and products in a grid with neo-brutalist styling
 */
export async function ProductsShowcase() {
  const products = await getAllProducts();

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 border-b-4 border-text">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 flex items-end justify-between border-b-4 border-text pb-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-2">
              Products & Tools
            </h2>
            <p className="text-lg text-muted">
              Things I've built and tools I maintain
            </p>
          </div>
        </div>

        {/* Products Grid */}
        <ProductCardList products={products} />
      </div>
    </section>
  );
}
