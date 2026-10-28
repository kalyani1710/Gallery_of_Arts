import { ProductCard } from "@/components/products/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { RevealItem, StaggerReveal } from "@/components/motion/Reveal";
import type { Product } from "@/types";

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return (
      <EmptyState
        title="No products found"
        description="Try another category, a wider price range, or a different search word."
        action={<Button href="/shop">Browse all handmade pieces</Button>}
      />
    );
  }

  return (
    <StaggerReveal className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <RevealItem key={product.id} className="h-full">
          <ProductCard product={product} />
        </RevealItem>
      ))}
    </StaggerReveal>
  );
}
