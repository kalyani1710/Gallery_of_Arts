
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartProvider";
import { formatPrice } from "@/lib/format";
import { submitOrder } from "@/lib/api";
import type { CheckoutDetails } from "@/types";
import { ScrollReveal } from "@/components/motion/Reveal";

const initialDetails: CheckoutDetails = {
  name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  notes: "",
};
const CHECKOUT_KEY_STORAGE = "gallery-checkout-idempotency";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, lines, subtotal, shipping, total, clear, productsLoading, productsError, refreshProducts, shippingSettings, shippingSettingsLoading, shippingSettingsError: shippingLoadError, refreshShippingSettings } = useCart();
  const [customer, setCustomer] =
    useState<CheckoutDetails>(initialDetails);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const idempotencyKey = useRef<string | null>(null);

  function updateField(
    field: keyof CheckoutDetails,
    value: string
  ) {
    setCustomer((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError("");

    if (items.length === 0) {
      setError("Your cart is empty. Please add a product first.");
      return;
    }

    if (productsLoading || productsError || lines.length !== items.length) {
      setError(productsError || (productsLoading
        ? "Product availability is still being checked. Please wait and try again."
        : "One or more products are unavailable. Return to your cart and remove them before checkout."));
      return;
    }

    if (shippingSettingsLoading || shippingLoadError || shipping === null || total === null) {
      setError("Current shipping charges could not be loaded. Retry loading them before placing your order.");
      return;
    }

    setLoading(true);

    try {
      let checkoutKey = idempotencyKey.current;
      if (!checkoutKey) {
        try {
          checkoutKey = sessionStorage.getItem(CHECKOUT_KEY_STORAGE);
        } catch {
          // The in-memory key still prevents duplicate submits in this page session.
        }
        checkoutKey ||= crypto.randomUUID();
        idempotencyKey.current = checkoutKey;
        try {
          sessionStorage.setItem(CHECKOUT_KEY_STORAGE, checkoutKey);
        } catch {
          // Continue with the in-memory key when browser storage is unavailable.
        }
      }

      const result = await submitOrder({
        customer,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        idempotencyKey: checkoutKey,
      });

      if (!result.ok || !result.id) {
        throw new Error("We could not create your order.");
      }

      try {
        sessionStorage.removeItem(CHECKOUT_KEY_STORAGE);
      } catch {
        // A completed order remains idempotent if the key cannot be cleared.
      }
      clear();

      router.push(`/order-success?id=${encodeURIComponent(result.id)}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gallery-paper px-6 py-20 text-ink">
        <ScrollReveal className="mx-auto max-w-xl">
        <div className="rounded-card border border-gallery-border bg-white p-10 text-center shadow-card">
          <h1 className="font-display text-3xl font-medium">
            Your cart is empty
          </h1>
          <p className="mt-3 text-muted">
            Add your favourite handmade crafts before checkout.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex min-h-11 items-center rounded-full bg-primary px-7 py-3 font-medium text-white transition hover:bg-primary-dark"
          >
            Explore the Shop
          </Link>
        </div>
        </ScrollReveal>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gallery-paper text-ink">
      <section className="page-container section-space">
        <ScrollReveal>
        <p className="editorial-eyebrow">
          Gallery of Arts
        </p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight md:text-5xl">
          Checkout
        </h1>
        <p className="mt-3 text-muted">
          Almost there! Add your delivery details below.
        </p>
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
        <form
          onSubmit={handleSubmit}
          className="mt-10 grid gap-8 lg:grid-cols-3"
        >
          <div className="space-y-7 lg:col-span-2">
            <section className="rounded-card border border-gallery-border bg-white p-6 shadow-card md:p-8">
              <h2 className="font-display text-2xl font-medium text-ink">
                Delivery Details
              </h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {(
                  [
                    ["name", "Full name"],
                    ["phone", "Phone number"],
                    ["email", "Email address"],
                    ["address", "House / street address"],
                    ["city", "City"],
                    ["state", "State"],
                    ["pincode", "PIN code"],
                  ] as [keyof CheckoutDetails, string][]
                ).map(([field, label]) => (
                  <label
                    key={field}
                    className={
                      field === "address"
                        ? "sm:col-span-2"
                        : "block"
                    }
                  >
                    <span className="mb-2 block text-sm font-medium text-ink">
                      {label}
                    </span>
                    <input
                      required
                      type={field === "email" ? "email" : "text"}
                      autoComplete={
                        field === "name"
                          ? "name"
                          : field === "phone"
                            ? "tel"
                            : field === "email"
                              ? "email"
                              : field === "address"
                                ? "street-address"
                                : "off"
                      }
                      value={customer[field] ?? ""}
                      onChange={(event) =>
                        updateField(field, event.target.value)
                      }
                      className="w-full rounded-xl border border-gallery-border bg-soft-cream px-4 py-3 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </label>
                ))}

                <label className="sm:col-span-2">
                  <span className="mb-2 block text-sm font-medium text-[#49333C]">
                    Order notes (optional)
                  </span>
                  <textarea
                    rows={3}
                    value={customer.notes ?? ""}
                    onChange={(event) =>
                      updateField("notes", event.target.value)
                    }
                    placeholder="Any delivery instructions?"
                    className="w-full rounded-xl border border-gallery-border bg-soft-cream px-4 py-3 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </label>
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-card border border-gallery-border bg-white p-6 shadow-card md:p-8">
            <h2 className="font-display text-2xl font-medium text-ink">
              Your Order
            </h2>

            <div className="mt-6 space-y-4">
              {productsError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">Could not verify your products. {productsError} <button type="button" onClick={() => void refreshProducts()} className="ml-1 font-semibold underline">Retry</button></p>}
              {lines.map(({ item, product }) => (
                <div
                  key={item.productId}
                  className="flex justify-between gap-4 text-sm"
                >
                  <span className="text-muted">
                    {product.name} × {item.quantity}
                  </span>
                  <span className="shrink-0 font-medium text-ink">
                    {formatPrice(product.price * item.quantity)}
                  </span>
                </div>
              ))}

              <div className="flex justify-between border-t pt-4">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingSettingsLoading ? "Loading…" : shipping === null ? "Unavailable" : shipping > 0 ? formatPrice(shipping) : "Free"}</span>
              </div>
              {shippingSettings?.freeShippingEnabled && <p className="text-right text-xs text-gray-500">Free shipping on orders of {formatPrice(shippingSettings.freeShippingThreshold)} or more.</p>}
              {shippingLoadError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{shippingLoadError} <button type="button" onClick={() => void refreshShippingSettings()} className="font-semibold underline">Retry</button></p>}

              <div className="flex justify-between border-t border-gallery-border pt-4 text-lg font-semibold text-ink">
                <span>Total</span>
                <span>{total === null ? "—" : formatPrice(total)}</span>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700"
              >
                {error}
                {error.toLowerCase().includes("sign in") && (
                  <Link
                    href="/login?redirect=%2Fcheckout"
                    className="ml-1 font-semibold underline"
                  >
                    Sign in
                  </Link>
                )}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || productsLoading || !!productsError || lines.length !== items.length || shippingSettingsLoading || !!shippingLoadError || shipping === null}
              className="mt-7 w-full rounded-full bg-primary py-4 font-medium text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>

            <p className="mt-5 text-xs leading-5 text-gray-500">
              This places your order request; payment is not collected on this page.
            </p>
          </aside>
        </form>
        </ScrollReveal>
      </section>
    </main>
  );
}
