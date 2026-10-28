import { Button } from "@/components/ui/Button";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { siteConfig } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { cartOrderMessage } from "@/lib/whatsapp";

export function CartSummary({
  subtotal,
  shipping,
  total,
  itemLines,
}: {
  subtotal: number;
  shipping: number;
  total: number;
  itemLines: { name: string; quantity: number; price: number }[];
}) {
  return (
    <aside className="rounded-card bg-white p-6 shadow-soft">
      <h2 className="font-display text-2xl text-primary">Order summary</h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Shipping</dt>
          <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
        </div>
        <div className="flex justify-between border-t border-primary/10 pt-3 text-base font-semibold">
          <dt>Total</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-muted">{siteConfig.shipping.disclaimer}</p>
      <p className="mt-1 text-xs text-muted">
        Free shipping above {formatPrice(siteConfig.shipping.freeAbove)}. Standard shipping {formatPrice(siteConfig.shipping.standard)}.
      </p>
      <div className="mt-5 space-y-3">
        <Button href="/checkout" className="w-full">
          Checkout
        </Button>
        <WhatsAppButton
          className="w-full"
          label="Place Order on WhatsApp"
          message={cartOrderMessage({ items: itemLines, subtotal, shipping, total })}
        />
      </div>
    </aside>
  );
}
