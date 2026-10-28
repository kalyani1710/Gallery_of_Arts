import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/permissions";
import ReviewManager from "./ReviewManager";

export const runtime = "nodejs";

export default async function AdminReviewsPage() {
  const owner = await requireOwner();
  if (!owner) redirect("/account");

  return (
    <main className="min-h-screen bg-gallery-paper text-ink">
      <div className="page-container section-space max-w-5xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="editorial-eyebrow">Gallery of Arts</p>
            <h1 className="mt-3 font-display text-3xl font-medium md:text-4xl">Review moderation</h1>
            <p className="mt-2 text-sm text-muted">Review customer feedback before it appears publicly.</p>
          </div>
          <Link href="/admin" className="rounded-full border border-gallery-border bg-white px-4 py-3 text-sm font-medium transition hover:bg-soft-pink">Admin dashboard</Link>
        </header>
        <ReviewManager />
      </div>
    </main>
  );
}
