import { notFound } from "next/navigation";
import AddStoreProductToCart from "@/components/products/AddStoreProductToCart";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ScrollReveal } from "@/components/motion/Reveal";
import { getPublicProductBySlug } from "@/lib/catalog";

export const runtime = "nodejs";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);
  if (!product) notFound();

  return (
    <main className="min-h-screen bg-gallery-paper">
      <div className="page-container-narrow section-space">
        <div className="grid gap-8 rounded-card border border-gallery-border bg-white p-4 shadow-card sm:p-6 md:grid-cols-2 md:gap-12 md:p-10">
          <ProductGallery product={product} />
          <ScrollReveal className="flex flex-col justify-center" delay={0.08}>
            <section>
              <p className="editorial-eyebrow">{product.shopCategory}</p>
              <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-ink md:text-5xl">{product.name}</h1>
              <p className="mt-5 font-serif text-3xl font-semibold text-primary">₹{product.price}</p>
              <p className="mt-5 whitespace-pre-line leading-7 text-muted">{product.description}</p>
              <p className={`mt-4 inline-flex rounded-full px-3 py-1.5 text-sm ${product.stock > 0 ? "bg-[#EEF3EA] text-[#58734F]" : "bg-soft-pink text-primary-dark"}`}>
                {product.stock > 0 ? `${product.stock} available` : "Currently out of stock"}
              </p>
              <div className="mt-7">
                <AddStoreProductToCart product={product} />
              </div>
            </section>
          </ScrollReveal>
        </div>
      </div>
    </main>
  );
}
