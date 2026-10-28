import Image from "next/image";
import Link from "next/link";
import { getPublicProducts } from "@/lib/catalog";

export default async function GalleryPage() {
  let products: Awaited<ReturnType<typeof getPublicProducts>> = [];
  let catalogueUnavailable = false;
  try {
    products = (await getPublicProducts()).filter((product) => product.images.length > 0);
  } catch (error) {
    console.error("Could not load the product gallery:", error);
    catalogueUnavailable = true;
  }

  return (
    <main className="min-h-screen bg-gallery-paper">
      <section className="page-container section-space">
        <header className="mx-auto mb-12 max-w-2xl text-center">
          <p className="editorial-eyebrow">Gallery of Arts</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-ink md:text-5xl">Our Gallery</h1>
          <p className="mt-4 leading-7 text-muted">A look at handmade florals, accessories and décor from our collection.</p>
        </header>

        {products.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Link key={product.id} href={`/product/${product.slug}`} className="group block overflow-hidden rounded-card border border-gallery-border bg-white shadow-card transition-shadow hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                <div className="relative aspect-square bg-soft-cream">
                  <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.03]" />
                </div>
                <div className="p-4">
                  <h2 className="font-serif text-lg font-semibold text-ink transition-colors group-hover:text-primary">{product.name}</h2>
                  <p className="mt-1 text-sm text-muted">{product.shopCategory}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="rounded-card border border-gallery-border bg-white p-10 text-center text-muted shadow-card">{catalogueUnavailable ? "The gallery is temporarily unavailable. Please try again shortly." : "There are no active products with gallery images yet. Browse the shop to see available handmade pieces."}</p>
        )}

        <div className="mt-10 text-center">
          <Link href="/shop" className="inline-flex min-h-11 items-center rounded-full bg-primary px-7 py-3 font-semibold text-white transition hover:bg-primary-dark">Browse the shop</Link>
        </div>
      </section>
    </main>
  );
}
