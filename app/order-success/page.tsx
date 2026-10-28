import Link from "next/link";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { ScrollReveal } from "@/components/motion/Reveal";

type SavedOrder = {
  _id: ObjectId;
  userId: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: string;
};

export default async function OrderSuccess({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  let order: SavedOrder | null = null;
  let lookupFailed = false;
  const session = await getSession();

  if (session && id && ObjectId.isValid(id)) {
    try {
      const db = await getDb();
      order = await db.collection<SavedOrder>("orders").findOne({
        _id: new ObjectId(id),
        userId: session.userId,
      });
    } catch (error) {
      console.error("Could not verify saved order:", error);
      lookupFailed = true;
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gallery-paper px-4 py-12 text-ink">
      <ScrollReveal className="w-full max-w-2xl">
      <section className="w-full rounded-card border border-gallery-border bg-white p-8 text-center shadow-card md:p-10">
        {order ? (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Order saved</p>
            <h1 className="mt-3 font-display text-4xl font-medium text-ink">Thank you for your order</h1>
            <p className="mt-3 text-muted">Your order has been saved successfully.</p>
            <p className="mt-5 break-all rounded-xl bg-soft-cream p-4 text-sm text-muted">Order ID: {order._id.toString()}</p>
            <ul className="mt-5 space-y-2 text-left text-sm text-muted">
              {order.items.map((item, index) => <li key={`${item.name}-${index}`} className="flex justify-between gap-3"><span>{item.name} × {item.quantity}</span><span>{formatPrice(item.price * item.quantity)}</span></li>)}
            </ul>
            <p className="mt-5 border-t border-gallery-border pt-4 text-lg font-semibold text-ink">Total: {formatPrice(order.total)}</p>
            <p className="mt-2 text-sm text-gray-500">Status: {order.status}</p>
          </>
        ) : (
          <>
            <h1 className="font-display text-3xl font-medium text-ink">{lookupFailed ? "Order confirmation is temporarily unavailable" : "We couldn’t confirm this order"}</h1>
            <p className="mt-3 text-muted">{lookupFailed ? "The order could not be checked right now. Please try again shortly." : "No saved order was found for this confirmation link. Your order has not been confirmed."}</p>
          </>
        )}
        <Link href="/shop" className="mt-8 inline-flex min-h-11 items-center rounded-full bg-primary px-7 py-3 font-medium text-white transition hover:bg-primary-dark">Continue shopping</Link>
      </section>
      </ScrollReveal>
    </main>
  );
}
