import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { formatPrice } from "@/lib/format";
import { getDb } from "@/lib/mongodb";
import { requireOwner } from "@/lib/permissions";
import { isValidProductImage } from "@/lib/product-image";

export const runtime = "nodejs";

type PageProps = { params: Promise<{ type: string; id: string }> };

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function text(value: unknown, fallback = "Not provided") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function dateLabel(value: unknown) {
  if (!(typeof value === "string" || value instanceof Date)) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
}

function validReferenceImage(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 2000) return null;
  if (isValidProductImage(value)) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function Field({ label, value }: { label: string; value: unknown }) {
  const display = typeof value === "number" ? String(value) : text(value);
  return <div><dt className="text-xs font-medium uppercase tracking-wide text-muted">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm text-ink">{display}</dd></div>;
}

function OptionalText({ label, value }: { label: string; value: unknown }) {
  if (typeof value !== "string" || !value.trim()) return null;
  return <div><p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p><p className="mt-1 whitespace-pre-wrap break-words text-sm text-ink">{value}</p></div>;
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const owner = await requireOwner();
  if (!owner) redirect("/account");

  const { type, id } = await params;
  if ((type !== "store" && type !== "custom") || !ObjectId.isValid(id)) notFound();

  const db = await getDb();
  const order = await db.collection(type === "store" ? "orders" : "custom_orders").findOne({ _id: new ObjectId(id) });
  if (!order) notFound();

  const customer = record(order.customer);
  const status = text(order.status, "Pending");
  const date = dateLabel(order.createdAt);
  const storeItems = type === "store" && Array.isArray(order.items) ? order.items.map(record) : [];
  const missingImageIds = [...new Set(storeItems
    .filter((item) => !isValidProductImage(typeof item.image === "string" ? item.image : "") && typeof item.productId === "string" && ObjectId.isValid(item.productId))
    .map((item) => item.productId as string))].map((productId) => new ObjectId(productId));
  const currentProductImages = missingImageIds.length
    ? await db.collection("products").find({ _id: { $in: missingImageIds } }, { projection: { image: 1 } }).toArray()
    : [];
  const fallbackImages = new Map(currentProductImages.map((product) => [product._id.toString(), typeof product.image === "string" ? product.image : ""]));
  const referenceImage = validReferenceImage(order.referenceImage ?? order.referenceImageUrl);
  const fullAddress = [customer.address, customer.city, customer.state, customer.pincode].filter((part) => typeof part === "string" && part.trim()).join(", ");
  const discount = typeof order.discount === "number" ? order.discount : typeof order.discountAmount === "number" ? order.discountAmount : null;

  return (
    <main className="min-h-screen bg-gallery-paper text-ink">
      <div className="page-container section-space">
        <Link href="/admin/orders" className="inline-flex min-h-11 items-center text-sm font-medium text-primary transition hover:text-primary-dark">← Back to Order Management</Link>
        <header className="mt-5 flex flex-wrap items-start justify-between gap-4 rounded-card border border-gallery-border bg-white p-6 shadow-card sm:p-8">
          <div>
            <p className="editorial-eyebrow">{type === "store" ? "Store order" : "Custom artwork order"}</p>
            <h1 className="mt-2 font-display text-2xl font-medium md:text-3xl">Order Details</h1>
            <p className="mt-2 break-all font-mono text-xs text-muted">{id}</p>
            <p className="mt-2 text-sm text-muted">{date}</p>
          </div>
          <span className="rounded-full bg-soft-cream px-4 py-2 text-sm font-semibold capitalize text-ink">{status.replace(/-/g, " ")}</span>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-card border border-gallery-border bg-white p-6 shadow-card">
            <h2 className="font-display text-xl font-medium">Customer</h2>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Name" value={type === "store" ? customer.name : order.name} />
              <Field label="Email" value={type === "store" ? customer.email : order.email} />
              <Field label="Phone" value={type === "store" ? customer.phone : order.phone} />
              {type === "store" && <Field label="Shipping address" value={fullAddress} />}
              {type === "custom" && <Field label="Address" value={order.address} />}
            </dl>
          </section>

          {type === "store" ? (
            <section className="rounded-card border border-gallery-border bg-white p-6 shadow-card">
              <h2 className="font-display text-xl font-medium">Payment and delivery</h2>
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Payment method" value={order.paymentMethod || "Not recorded by checkout"} />
                <Field label="Payment status" value={order.paymentStatus || "Not recorded"} />
                <Field label="Order status" value={status} />
                <Field label="Tracking" value={order.trackingNumber || order.trackingCode} />
                <Field label="Delivery date" value={order.deliveryDate} />
                <Field label="Delivery address" value={order.deliveryAddress || fullAddress} />
                <OptionalText label="Customer notes" value={customer.notes} />
                <OptionalText label="Internal notes" value={order.internalNotes} />
              </dl>
            </section>
          ) : (
            <section className="rounded-card border border-gallery-border bg-white p-6 shadow-card">
              <h2 className="font-display text-xl font-medium">Artwork requirements</h2>
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Product type" value={order.productType} />
                <Field label="Quantity" value={order.quantity} />
                <Field label="Preferred colors" value={order.preferredColors} />
                <Field label="Budget" value={order.budget} />
                <Field label="Occasion" value={order.occasion} />
                <Field label="Required by" value={order.requiredDate} />
                <Field label="Status" value={status} />
                {typeof order.total === "number" && <Field label="Quoted total" value={formatPrice(order.total)} />}
                {typeof order.quotedPrice === "number" && <Field label="Quoted price" value={formatPrice(order.quotedPrice)} />}
                <Field label="Payment method" value={order.paymentMethod} />
                <Field label="Payment status" value={order.paymentStatus} />
                <Field label="Delivery details" value={order.deliveryAddress || order.deliveryDetails} />
                <Field label="Tracking" value={order.trackingNumber || order.trackingCode} />
                <OptionalText label="Delivery notes" value={order.deliveryNotes} />
                <OptionalText label="Internal notes" value={order.internalNotes} />
              </dl>
              <div className="mt-5 border-t border-gallery-border pt-5">
                <OptionalText label="Submitted requirements" value={order.details} />
              </div>
              {referenceImage && (
                <div className="mt-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">Reference image</p>
                  <a href={referenceImage} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-medium text-primary underline">Open full-size image</a>
                  {/* Custom orders historically may contain external reference URLs. */}
                  <img src={referenceImage} alt="Customer reference artwork" className="mt-3 max-h-96 max-w-full rounded-xl border border-gallery-border object-contain" />
                </div>
              )}
              {!referenceImage && <p className="mt-5 text-sm text-muted">No reference image was saved with this request.</p>}
            </section>
          )}
        </div>

        {type === "store" && (
          <section className="mt-6 rounded-card border border-gallery-border bg-white p-6 shadow-card">
            <h2 className="font-display text-xl font-medium">Purchased products</h2>
            {storeItems.length ? (
              <div className="mt-5 divide-y divide-gallery-border">
                {storeItems.map((item, index) => {
                  const snapshot = typeof item.image === "string" && isValidProductImage(item.image) ? item.image : "";
                  const fallback = typeof item.productId === "string" ? fallbackImages.get(item.productId) || "" : "";
                  const image = snapshot || (isValidProductImage(fallback) ? fallback : "");
                  const quantity = typeof item.quantity === "number" ? item.quantity : null;
                  const price = typeof item.price === "number" ? item.price : null;
                  return (
                    <article key={`${String(item.productId || item.name)}-${index}`} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
                      <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-soft-cream sm:w-24">
                        {image ? <Image src={image} alt={text(item.name, "Purchased product")} fill sizes="96px" unoptimized className="object-cover" /> : <div className="flex h-full items-center justify-center px-2 text-center text-xs text-muted">Image unavailable</div>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium">{text(item.name, "Product details unavailable")}</h3>
                        <p className="mt-1 text-sm text-muted">Quantity: {quantity ?? "—"}</p>
                        <p className="mt-1 text-sm text-muted">Unit price: {price === null ? "—" : formatPrice(price)}</p>
                        {fallback && !snapshot && <p className="mt-1 text-xs text-muted">Current product image; historical image was not saved on this order.</p>}
                      </div>
                      <p className="font-semibold">{price !== null && quantity !== null ? formatPrice(price * quantity) : "—"}</p>
                    </article>
                  );
                })}
              </div>
            ) : <p className="mt-4 text-sm text-muted">No item details were saved with this order.</p>}

            <dl className="ml-auto mt-5 max-w-sm space-y-3 border-t border-gallery-border pt-5 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-muted">Subtotal</dt><dd>{typeof order.subtotal === "number" ? formatPrice(order.subtotal) : "Not recorded"}</dd></div>
              {discount !== null && <div className="flex justify-between gap-4"><dt className="text-muted">Discount</dt><dd>{formatPrice(discount)}</dd></div>}
              <div className="flex justify-between gap-4"><dt className="text-muted">Shipping</dt><dd>{typeof order.shipping === "number" ? order.shipping === 0 ? "Free" : formatPrice(order.shipping) : "Not recorded"}</dd></div>
              <div className="flex justify-between gap-4 border-t border-gallery-border pt-3 text-base font-semibold"><dt>Total</dt><dd>{typeof order.total === "number" ? formatPrice(order.total) : "Not recorded"}</dd></div>
            </dl>
            <div className="mt-5 space-y-3 border-t border-gallery-border pt-5">
              <OptionalText label="Customer notes" value={customer.notes} />
              <OptionalText label="Internal notes" value={order.internalNotes} />
            </div>
          </section>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/admin/orders" className="inline-flex min-h-11 items-center rounded-full border border-gallery-border px-5 py-3 text-sm font-medium transition hover:bg-soft-pink">Back to orders</Link>
          <Link href="/admin/orders" className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-primary-dark">Manage order status</Link>
        </div>
      </div>
    </main>
  );
}
