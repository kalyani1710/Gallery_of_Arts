import Link from "next/link";
import { getPublicCollections } from "@/lib/catalog";
import CollectionCover from "@/components/collections/CollectionCover";
import { RevealItem, StaggerReveal } from "@/components/motion/Reveal";

export const runtime = "nodejs";

export default async function CollectionsIndexPage() {
  const collections = await getPublicCollections().catch((error) => {
    console.error("Could not load published collections:", error);
    return null;
  });

  return (
    <main className="min-h-screen bg-gallery-paper">
      <section className="page-container section-space">
        <header className="mx-auto mb-12 max-w-2xl text-center">
          <p className="editorial-eyebrow">Made for every occasion</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-ink md:text-5xl">Collections</h1>
          <p className="mt-4 leading-7 text-muted">Explore thoughtfully grouped handmade gifts, décor and accessories.</p>
        </header>

        {collections === null ? (
          <p role="alert" className="rounded-card border border-gallery-border bg-white p-10 text-center text-muted shadow-card">Collections are temporarily unavailable. Please try again shortly.</p>
        ) : collections.length ? (
          <StaggerReveal className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <RevealItem key={collection.id} className="h-full">
                <Link href={`/collections/${collection.slug}`} className="group block h-full overflow-hidden rounded-card border border-gallery-border bg-white shadow-card transition-shadow hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                  <div className="relative aspect-[4/3] bg-soft-cream">
                    <CollectionCover src={collection.coverImage} alt={collection.name} />
                  </div>
                  <div className="p-6">
                    <h2 className="font-serif text-xl font-semibold text-ink transition-colors group-hover:text-primary">{collection.name}</h2>
                    <p className="mt-3 line-clamp-3 leading-7 text-muted">{collection.description || "Explore products in this collection."}</p>
                    <p className="mt-4 text-sm text-muted">{collection.productCount || 0} {collection.productCount === 1 ? "product" : "products"}</p>
                    <span className="mt-4 inline-block text-sm font-semibold text-primary">Explore collection <span aria-hidden="true">→</span></span>
                  </div>
                </Link>
              </RevealItem>
            ))}
          </StaggerReveal>
        ) : (
          <div className="rounded-card border border-gallery-border bg-white p-10 text-center shadow-card">
            <h2 className="font-serif text-xl font-semibold text-ink">No published collections yet</h2>
            <p className="mt-3 text-muted">New collections will appear here when they are published.</p>
            <Link href="/shop" className="mt-6 inline-flex rounded-full bg-primary px-7 py-3 font-semibold text-white transition hover:bg-primary-dark">Browse the shop</Link>
          </div>
        )}
      </section>
    </main>
  );
}
