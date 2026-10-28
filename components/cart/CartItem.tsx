"use client";

import { ProductImage } from "@/components/products/ProductImage";
import { useCart } from "@/context/CartProvider";
import { formatPrice } from "@/lib/format";
import { Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

export function CartItemRow({
  productId,
  quantity,
  name,
  price,
  image,
  slug,
  stock,
}: {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  image: string;
  slug: string;
  stock: number;
}) {
  const { setQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-3 border-b border-primary/10 py-4">
      <Link href={`/product/${slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-soft-cream">
        <ProductImage src={image} alt={name} fill className="p-2" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/product/${slug}`} className="font-medium text-ink hover:text-primary">
          {name}
        </Link>
        <p className="text-sm text-muted">{formatPrice(price)} each</p>
        <div className="mt-2 flex items-center gap-2">
          <button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} className="rounded-full border p-1 disabled:cursor-not-allowed disabled:opacity-40" onClick={() => setQuantity(productId, quantity - 1)}>
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-6 text-center text-sm">{quantity}</span>
          <button type="button" aria-label="Increase quantity" disabled={quantity >= stock} className="rounded-full border p-1 disabled:cursor-not-allowed disabled:opacity-40" onClick={() => setQuantity(productId, quantity + 1)}>
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button type="button" aria-label="Remove from cart" className="ml-2 text-muted hover:text-primary" onClick={() => removeItem(productId)}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="font-semibold text-primary">{formatPrice(price * quantity)}</p>
    </div>
  );
}
