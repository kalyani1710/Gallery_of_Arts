import ShopCatalogue from "@/components/shop/ShopCatalogue";
import { getPublicProducts } from "@/lib/catalog";

export const runtime = "nodejs";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  try {
    const products = await getPublicProducts();
    return <ShopCatalogue products={products} initialCategory={category} />;
  } catch (error) {
    console.error("Could not render the shop catalogue:", error);
    return (
      <main className="min-h-screen bg-gallery-paper">
        <section className="page-container py-16">
          <div className="mx-auto max-w-3xl rounded-card border border-gallery-border bg-white p-10 text-center shadow-card">
            <h1 className="font-serif text-4xl font-semibold text-ink">Shop Handmade Crafts</h1>
            <p role="alert" className="mt-5 text-muted">
              The product catalogue is temporarily unavailable. Please try again shortly.
            </p>
          </div>
        </section>
      </main>
    );
  }
}
