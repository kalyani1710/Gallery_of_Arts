"use client";

import { Button } from "@/components/ui/Button";
import { ProductImage } from "@/components/products/ProductImage";
import { useCart } from "@/context/CartProvider";
import { useUI } from "@/context/UIProvider";
import { formatPrice } from "@/lib/format";
import { X } from "lucide-react";

export function QuickView() {
  const { quickViewProduct, setQuickViewProduct, setCartOpen } = useUI();
  const { addItem } = useCart();

  if (!quickViewProduct) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/40 p-4 md:items-center" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-card bg-cream p-5 shadow-card animate-pop">
        <div className="flex justify-end">
          <button type="button" aria-label="Close quick view" onClick={() => setQuickViewProduct(null)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="relative aspect-square rounded-card bg-soft-cream">
            <ProductImage src={quickViewProduct.images[0]} alt={quickViewProduct.name} fill className="p-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted">{quickViewProduct.category}</p>
            <h2 className="mt-2 font-display text-3xl text-primary">{quickViewProduct.name}</h2>
            <p className="mt-2 text-xl font-semibold text-ink">{formatPrice(quickViewProduct.price)}</p>
            <p className="mt-4 text-muted">{quickViewProduct.shortDescription}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  if (addItem(quickViewProduct)) {
                    setQuickViewProduct(null);
                    setCartOpen(true);
                  }
                }}
              >
                Add to Cart
              </Button>
              <Button href={`/product/${quickViewProduct.slug}`} variant="ghost">
                View product
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
