import Link from "next/link";
import { notFound } from "next/navigation";
import CollectionCover from "@/components/collections/CollectionCover";
import ShopProductCard from "@/components/shop/ShopProductCard";
import { getPublicCollectionBySlug } from "@/lib/catalog";

export const runtime = "nodejs";

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let result: Awaited<ReturnType<typeof getPublicCollectionBySlug>>;
  try {
    result = await getPublicCollectionBySlug(slug);
  } catch (error) {
    console.error(`Could not load collection ${slug}:`, error);
    return (
      <main className="min-h-screen bg-gallery-paper px-6 py-16">
        <section className="mx-auto max-w-4xl rounded-card border border-gallery-border bg-white p-10 text-center shadow-card">
          <h1 className="font-serif text-2xl font-semibold text-ink">Collection temporarily unavailable</h1>
          <p role="alert" className="mt-3 text-muted">Please try again shortly.</p>
          <Link href="/collections" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-dark">All collections</Link>
        </section>
      </main>
    );
  }
  if (!result) notFound();

  const { collection, products } = result;
  return (
    <main className="min-h-screen bg-gallery-paper">
      <section className="page-container section-space">
        <Link href="/collections" className="inline-flex min-h-11 items-center text-sm font-medium text-primary transition hover:text-primary-dark">← All collections</Link>
        <header className="mx-auto mb-12 mt-5 max-w-4xl overflow-hidden rounded-card border border-gallery-border bg-white shadow-card">
          <div className="relative aspect-[3/1] min-h-40 bg-soft-cream">
            <CollectionCover src={collection.coverImage} alt={collection.name} />
          </div>
          <div className="p-7 text-center sm:p-10">
            <p className="editorial-eyebrow">A Gallery of Arts collection</p>
            <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-ink md:text-5xl">{collection.name}</h1>
            {collection.description && <p className="mx-auto mt-4 max-w-2xl leading-7 text-muted">{collection.description}</p>}
            <p className="mt-4 text-sm text-muted">{products.length} {products.length === 1 ? "product" : "products"}</p>
          </div>
        </header>

        {products.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => <ShopProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="rounded-card border border-gallery-border bg-white p-10 text-center shadow-card">
            <h2 className="font-serif text-xl font-semibold text-ink">No products in this collection yet</h2>
            <p className="mt-3 text-muted">Check back later, or browse the full shop.</p>
            <Link href="/shop" className="mt-5 inline-flex rounded-full bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-dark">Browse the shop</Link>
          </div>
        )}
      </section>
    </main>
  );
}
