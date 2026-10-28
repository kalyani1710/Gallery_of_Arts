import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/permissions";

export const runtime = "nodejs";

export default async function AdminDashboardPage() {
  const owner = await requireOwner();
  if (!owner) redirect("/account");

  return (
    <main className="min-h-screen bg-gallery-paper text-ink">
      <div className="page-container section-space max-w-5xl">
        <header className="mb-9">
          <p className="editorial-eyebrow">
            Gallery of Arts
          </p>
          <h1 className="mt-3 font-display text-3xl font-medium md:text-4xl">Admin dashboard</h1>
          <p className="mt-2 text-sm text-muted">
            Manage your products and customer requests.
          </p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2">
          <Link
            href="/admin/products"
            className="rounded-card border border-gallery-border bg-white p-6 shadow-card transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
          >
            <h2 className="font-display text-xl font-medium">Product management</h2>
            <p className="mt-2 text-sm text-muted">
              Add products, update prices and stock, or hide items from the shop.
            </p>
            <span className="mt-5 inline-block text-sm font-medium text-primary">
              Manage products →
            </span>
          </Link>

          <Link
            href="/admin/collections"
            className="rounded-card border border-gallery-border bg-white p-6 shadow-card transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
          >
            <h2 className="font-display text-xl font-medium">Collection management</h2>
            <p className="mt-2 text-sm text-muted">
              Create, publish and organize the collections shown to customers.
            </p>
            <span className="mt-5 inline-block text-sm font-medium text-primary">
              Manage collections →
            </span>
          </Link>

          <Link
            href="/admin/orders"
            className="rounded-card border border-gallery-border bg-white p-6 shadow-card transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
          >
            <h2 className="font-display text-xl font-medium">Store & custom orders</h2>
            <p className="mt-2 text-sm text-muted">
              Review checkout orders and custom requests, then update their status.
            </p>
            <span className="mt-5 inline-block text-sm font-medium text-primary">
              Manage orders →
            </span>
          </Link>

          <Link
            href="/admin/reviews"
            className="rounded-card border border-gallery-border bg-white p-6 shadow-card transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
          >
            <h2 className="font-display text-xl font-medium">Customer reviews</h2>
            <p className="mt-2 text-sm text-muted">
              Approve, reject or remove feedback before it appears on the homepage.
            </p>
            <span className="mt-5 inline-block text-sm font-medium text-primary">
              Moderate reviews →
            </span>
          </Link>

          <Link
            href="/admin/shipping"
            className="rounded-card border border-gallery-border bg-white p-6 shadow-card transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
          >
            <h2 className="font-display text-xl font-medium">Shipping settings</h2>
            <p className="mt-2 text-sm text-muted">
              Change the standard charge and free-shipping threshold for new orders.
            </p>
            <span className="mt-5 inline-block text-sm font-medium text-primary">
              Manage shipping →
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
