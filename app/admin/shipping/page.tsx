import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/permissions";
import ShippingSettingsForm from "./ShippingSettingsForm";

export const runtime = "nodejs";

export default async function AdminShippingPage() {
  let owner: Awaited<ReturnType<typeof requireOwner>>;
  try {
    owner = await requireOwner();
  } catch (error) {
    console.error(
      "Could not verify owner access for shipping settings:",
      error instanceof Error ? error.name : "UnknownError",
    );

    return (
        <main className="min-h-screen bg-gallery-paper px-4 py-10 text-ink md:px-8">
        <div className="mx-auto max-w-3xl rounded-card border border-rose-200 bg-white p-6 shadow-card sm:p-8">
          <h1 className="font-display text-2xl font-medium">Shipping settings are unavailable</h1>
          <p className="mt-2 text-sm text-muted">We could not verify admin access. Check the database connection, then retry.</p>
          <Link href="/admin/shipping" className="mt-5 inline-flex rounded-full border border-gallery-border px-4 py-2 text-sm font-medium transition hover:bg-soft-pink">Retry</Link>
        </div>
      </main>
    );
  }

  if (!owner) redirect("/account");

  return (
    <main className="min-h-screen bg-gallery-paper text-ink">
      <div className="page-container-narrow section-space max-w-3xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="editorial-eyebrow">Gallery of Arts</p>
            <h1 className="mt-3 font-display text-3xl font-medium md:text-4xl">Shipping Settings</h1>
            <p className="mt-2 text-sm text-muted">Set the delivery charge and free-shipping offer for new orders.</p>
          </div>
          <Link href="/admin" className="rounded-full border border-gallery-border bg-white px-4 py-3 text-sm font-medium transition hover:bg-soft-pink">Admin dashboard</Link>
        </header>
        <ShippingSettingsForm />
      </div>
    </main>
  );
}
