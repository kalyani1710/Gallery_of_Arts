
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/permissions";
import ProductManager from "./ProductManager";

export const runtime = "nodejs";

export default async function AdminProductsPage() {
  const owner = await requireOwner();

  if (!owner) {
    redirect("/account");
  }

  return (
    <main className="min-h-screen bg-gallery-paper text-ink">
      <div className="page-container section-space">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="editorial-eyebrow">
              Gallery of Arts
            </p>
            <h1 className="mt-3 font-display text-3xl font-medium md:text-4xl">
              Product Management
            </h1>
            <p className="mt-2 text-sm text-muted">
              Manage your handmade products, prices and inventory.
            </p>
          </div>

        </header>

        <ProductManager />
      </div>
    </main>
  );
}
