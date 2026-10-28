"use client";

import { Button } from "@/components/ui/Button";
import { WishlistButton } from "@/components/products/WishlistButton";
import { ProductImage } from "@/components/products/ProductImage";
import { useCart } from "@/context/CartProvider";
import { useUI } from "@/context/UIProvider";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types";
import { Star } from "lucide-react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

export function ProductCard({ product, showQuickView = true }: { product: Product; showQuickView?: boolean }) {
  const reduceMotion = useReducedMotion();
  const { addItem } = useCart();
  const { setQuickViewProduct, setCartOpen } = useUI();

  return (
    <motion.article
      className="group flex h-full flex-col overflow-hidden rounded-card border border-gallery-border/70 bg-white shadow-card transition-shadow duration-300 hover:shadow-xl"
      whileHover={reduceMotion ? undefined : { y: -5 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-soft-cream">
        <ProductImage
          src={product.images[0]}
          alt={product.name}
          fill
          className="p-4 motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {product.bestSeller ? (
            <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink">
              Best seller
            </span>
          ) : null}
          {product.customizable ? (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
              Customisable
            </span>
          ) : null}
        </div>
        <WishlistButton productId={product.id} className="absolute right-3 top-3" />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{product.category}</p>
        <Link href={`/product/${product.slug}`} className="mt-1 font-display text-lg leading-snug text-ink hover:text-primary">
          {product.name}
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{product.shortDescription}</p>
        {product.reviewCount > 0 && product.rating > 0 && (
          <div className="mt-2 flex items-center gap-1 text-accent" aria-label={`${product.rating.toFixed(1)} out of 5 from ${product.reviewCount} reviews`}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={`h-3.5 w-3.5 ${index < Math.round(product.rating) ? "fill-current" : "text-soft-lavender"}`}
              />
            ))}
            <span className="ml-1 text-xs text-muted">{product.rating.toFixed(1)} ({product.reviewCount})</span>
          </div>
        )}
        <div className="mt-3 flex items-end gap-2">
          <p className="text-lg font-semibold text-primary">{formatPrice(product.price)}</p>
          {product.compareAtPrice ? (
            <p className="text-sm text-muted line-through">{formatPrice(product.compareAtPrice)}</p>
          ) : null}
          {product.priceNote ? <p className="text-xs text-muted">{product.priceNote}</p> : null}
        </div>
        <div className={`mt-auto grid gap-2 pt-4 ${showQuickView ? "grid-cols-2" : "grid-cols-1"}`}>
          <Button
            disabled={product.stock < 1}
            className="px-3 text-xs disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => {
              if (addItem(product)) setCartOpen(true);
            }}
          >
            {product.stock < 1 ? "Out of Stock" : "Add to Cart"}
          </Button>
          {showQuickView && (
            <Button variant="ghost" className="px-3 text-xs" onClick={() => setQuickViewProduct(product)}>
              Quick View
            </Button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
