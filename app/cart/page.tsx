"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartProvider";
import { formatPrice } from "@/lib/format";
import { ScrollReveal, StaggerReveal, RevealItem } from "@/components/motion/Reveal";

export default function CartPage() {
  const { items, lines, subtotal, shipping, total, removeItem, setQuantity, productsLoading, productsError, refreshProducts, shippingSettings, shippingSettingsLoading, shippingSettingsError, refreshShippingSettings } = useCart();
  const resolvedIds = new Set(lines.map((line) => line.item.productId));
  const unavailableItems = productsLoading || productsError
    ? []
    : items.filter((item) => !resolvedIds.has(item.productId));

  return (
    <main className="min-h-screen bg-gallery-paper text-ink">
      <section className="page-container section-space">
        <ScrollReveal>
          <p className="editorial-eyebrow">Your selection</p>
          <h1 className="mt-3 font-display text-4xl font-medium tracking-tight md:text-5xl">Shopping Cart</h1>
        </ScrollReveal>
        {productsLoading && <p role="status" className="mt-6 text-sm text-gray-600">Refreshing product prices and availability…</p>}
        {productsError && <p role="alert" className="mt-6 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">Could not verify your products. {productsError} <button type="button" onClick={() => void refreshProducts()} className="ml-1 font-semibold underline">Retry</button></p>}

        {items.length === 0 ? (
          <ScrollReveal className="mt-10">
          <div className="rounded-card border border-gallery-border bg-white p-10 text-center shadow-card">
            <p className="font-display text-2xl text-ink">Your cart is waiting for something lovely.</p>
            <Link href="/shop" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-primary px-7 py-3 font-medium text-white transition hover:bg-primary-dark">
              Explore Handmade Crafts
            </Link>
          </div>
          </ScrollReveal>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            <StaggerReveal className="space-y-4 lg:col-span-2">
              {lines.map(({ item, product }) => (
                <RevealItem key={item.productId}>
                <div className="flex flex-col gap-4 rounded-card border border-gallery-border bg-white p-5 shadow-card sm:flex-row sm:items-center">
                  <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-2xl bg-soft-cream sm:w-28">
                    {product.images[0] && <Image src={product.images[0]} alt={product.name} fill sizes="112px" className="object-cover" />}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-[#49333C]">{product.name}</h2>
                    <p className="mt-1 text-primary">{formatPrice(product.price)} each</p>
                    <div className="mt-3 flex items-center gap-3">
                      <button type="button" aria-label={`Decrease quantity of ${product.name}`} disabled={item.quantity <= 1} onClick={() => setQuantity(item.productId, item.quantity - 1)} className="h-9 w-9 rounded-full border border-gallery-border text-ink transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-40">−</button>
                      <span>{item.quantity}</span>
                      <button type="button" aria-label={`Increase quantity of ${product.name}`} disabled={item.quantity >= product.stock} onClick={() => setQuantity(item.productId, item.quantity + 1)} className="h-9 w-9 rounded-full border border-gallery-border text-ink transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-40">+</button>
                      <button type="button" onClick={() => removeItem(item.productId)} className="ml-2 text-sm text-primary underline underline-offset-4">Remove</button>
                    </div>
                  </div>
                  <p className="font-bold">{formatPrice(product.price * item.quantity)}</p>
                </div>
                </RevealItem>
              ))}

              {unavailableItems.map((item) => (
                <div key={item.productId} role="alert" className="flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
                  <span>This item is no longer available. Remove it to continue.</span>
                  <button type="button" onClick={() => removeItem(item.productId)} className="font-semibold underline">Remove</button>
                </div>
              ))}
            </StaggerReveal>

            <ScrollReveal delay={0.08}>
            <aside className="h-fit rounded-card border border-gallery-border bg-white p-7 shadow-card">
              <h2 className="font-display text-2xl font-medium text-ink">Order Summary</h2>
              {shippingSettingsError && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{shippingSettingsError} <button type="button" onClick={() => void refreshShippingSettings()} className="font-semibold underline">Retry</button></p>}
              <div className="mt-6 space-y-4">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>{shippingSettingsLoading ? "Loading…" : shipping === null ? "Unavailable" : shipping > 0 ? formatPrice(shipping) : "Free"}</span></div>
                {shippingSettings?.freeShippingEnabled && <p className="text-right text-xs text-gray-500">Free shipping on orders of {formatPrice(shippingSettings.freeShippingThreshold)} or more.</p>}
                <div className="flex justify-between border-t border-gallery-border pt-4 text-lg font-semibold"><span>Total</span><span>{total === null ? "—" : formatPrice(total)}</span></div>
              </div>
              {shippingSettingsError && <p className="mt-3 text-xs text-gray-500">Checkout is unavailable until current shipping charges can be loaded.</p>}
              <Link
                href="/checkout"
                aria-disabled={productsLoading || !!productsError || shippingSettingsLoading || shippingSettingsError !== "" || shipping === null || unavailableItems.length > 0 || lines.length === 0}
                className={`mt-7 block w-full rounded-full py-4 text-center font-medium text-white transition ${productsLoading || !!productsError || shippingSettingsLoading || shippingSettingsError !== "" || shipping === null || unavailableItems.length > 0 || lines.length === 0 ? "pointer-events-none bg-gray-400" : "bg-primary hover:bg-primary-dark"}`}
              >
                Proceed to Checkout
              </Link>
              <Link href="/shop" className="mt-4 block text-center text-sm font-medium text-primary underline-offset-4 hover:underline">Continue Shopping</Link>
            </aside>
            </ScrollReveal>
          </div>
        )}
      </section>
    </main>
  );
}
