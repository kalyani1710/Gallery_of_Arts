"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartProvider";
import { useUI } from "@/context/UIProvider";
import type { StoreProduct } from "@/types";
import { motion, useReducedMotion } from "motion/react";

export default function ShopProductCard({ product }: { product: StoreProduct }) {
  const reduceMotion = useReducedMotion();
  const { addItem } = useCart();
  const { setCartOpen } = useUI();

  return (
    <motion.article
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-gallery-border/70 bg-white shadow-card transition-shadow hover:shadow-xl"
      whileHover={reduceMotion ? undefined : { y: -5 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Link href={`/product/${product.slug}`} className="relative block h-72 bg-[#FFF9F5]">
        {product.images[0] ? (
          <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.03]" />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">Image unavailable</div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="mb-2 text-sm text-primary">{product.shopCategory}</p>
        <h3 className="mb-2 min-h-14 line-clamp-2 text-xl font-semibold text-ink">
          <Link href={`/product/${product.slug}`} className="hover:text-pink-600">{product.name}</Link>
        </h3>
        {product.description && <p className="mb-4 line-clamp-2 text-sm text-gray-600">{product.description}</p>}
        <p className="mb-4 text-2xl font-bold text-ink">₹{product.price}</p>
        <button
          type="button"
          disabled={product.stock < 1}
          onClick={() => {
            if (addItem(product)) setCartOpen(true);
          }}
          className="mt-auto w-full rounded-full bg-primary py-3 text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {product.stock < 1 ? "Out of Stock" : "Add To Cart"}
        </button>
      </div>
    </motion.article>
  );
}
