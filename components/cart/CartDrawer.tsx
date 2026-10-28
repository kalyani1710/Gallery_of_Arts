"use client";

import { CartItemRow } from "@/components/cart/CartItem";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCart } from "@/context/CartProvider";
import { useUI } from "@/context/UIProvider";
import { formatPrice } from "@/lib/format";
import { X } from "lucide-react";

export function CartDrawer() {
  const { lines, count, subtotal } = useCart();
  const { cartOpen, setCartOpen } = useUI();

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-ink/40" role="dialog" aria-label="Shopping cart">
      <div className="flex h-full w-full max-w-md flex-col bg-cream shadow-card animate-pop">
        <div className="flex items-center justify-between border-b border-primary/10 px-5 py-4">
          <h2 className="font-display text-2xl text-primary">Cart ({count})</h2>
          <button type="button" aria-label="Close cart" onClick={() => setCartOpen(false)}>
            <X />
          </button>
        </div>
        <div className="flex-1 overflow-auto px-5">
          {lines.length === 0 ? (
            <div className="py-10">
              <EmptyState
                title="Your cart is empty"
                description="Add a handmade piece and it will wait here for you."
                action={<Button href="/shop">Continue shopping</Button>}
              />
            </div>
          ) : (
            lines.map((line) => (
              <CartItemRow
                key={line.product.id}
                productId={line.product.id}
                quantity={line.item.quantity}
                name={line.product.name}
                price={line.product.price}
                image={line.product.images[0]}
                slug={line.product.slug}
                stock={line.product.stock}
              />
            ))
          )}
        </div>
        {lines.length ? (
          <div className="border-t border-primary/10 p-5">
            <div className="mb-3 flex justify-between font-semibold">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <Button href="/cart" className="w-full" onClick={() => setCartOpen(false)}>
              View cart & checkout
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
