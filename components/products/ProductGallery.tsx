"use client";

import { ProductImage } from "@/components/products/ProductImage";
import { cn } from "@/lib/cn";
import { useState } from "react";

type GalleryProduct = { name: string; images: string[] };

export function ProductGallery({ product }: { product: GalleryProduct }) {
  const [active, setActive] = useState(0);
  const images = product.images.length ? product.images : ["/images/placeholders/craft.svg"];

  return (
    <div className="min-w-0">
      <div className="relative aspect-[4/5] overflow-hidden rounded-card border border-gallery-border bg-soft-cream">
        <ProductImage
          src={images[active]}
          alt={`${product.name} image ${active + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="p-5 sm:p-8"
        />
      </div>
      {images.length > 1 ? (
        <div role="group" className="mt-4 flex gap-3 overflow-x-auto pb-1" aria-label={`${product.name} image thumbnails`}>
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                "relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:h-24 sm:w-24",
                active === index ? "border-primary ring-2 ring-primary/15" : "border-gallery-border hover:border-primary/40",
              )}
              aria-label={`View product image ${index + 1}`}
              aria-pressed={active === index}
            >
              <ProductImage src={image} alt="" fill objectFit="cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
