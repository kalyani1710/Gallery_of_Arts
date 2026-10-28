import { FaInstagram,FaYoutube } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import CustomerReviews from "@/components/CustomerReviews";
import CollectionCover from "@/components/collections/CollectionCover";
import { ProductGrid } from "@/components/products/ProductGrid";
import { getPublicCollections, getPublicProducts } from "@/lib/catalog";
import { getApprovedSiteReviews } from "@/lib/reviews";
import type { SiteReview } from "@/lib/reviews";
import { ScrollReveal } from "@/components/motion/Reveal";


import {
  Heart,
  Flower2,
  Palette,
  Gift,
  House,
  ShoppingBag,
  Sparkles,
  Play,
  Grid3X3
} from "lucide-react";


export const runtime = "nodejs";

export default async function HomePage() {
  const [productsResult, collectionsResult, reviewsResult] = await Promise.allSettled([
    getPublicProducts(),
    getPublicCollections(),
    getApprovedSiteReviews(),
  ]);
  const featuredProducts = productsResult.status === "fulfilled"
    ? productsResult.value.filter((product) => product.featured).slice(0, 4)
    : null;
  const collections = collectionsResult.status === "fulfilled"
    ? collectionsResult.value.slice(0, 3)
    : null;
  const reviews: SiteReview[] = reviewsResult.status === "fulfilled" ? reviewsResult.value : [];

  return (
    <main className="min-h-screen bg-[#FFF9F5]">

      {/* HERO */}

     

{/* PREMIUM HERO SECTION */}
<section
  className="relative isolate min-h-[680px] h-[90vh] overflow-hidden bg-cover bg-center"
  style={{
    backgroundImage: "url('/banner/hero-floral.png')",
  }}
>
  {/* Warm cinematic overlay */}
  <div className="absolute inset-0 -z-0 bg-gradient-to-r from-[#24151b]/80 via-[#35202a]/45 to-transparent" />

  {/* Soft pink glow */}
  <div className="absolute inset-0 -z-0 bg-[radial-gradient(ellipse_at_75%_25%,rgba(255,213,195,0.16),transparent_45%)]" />

  {/* Hero content */}
  <div className="page-container relative z-10 mx-auto flex min-h-[680px] h-full items-center pt-24 pb-20 md:px-10 md:pt-28">
    <ScrollReveal className="max-w-3xl">
      {/* Eyebrow badge */}
      <div className="inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/15 px-5 py-2.5 text-sm tracking-wide text-white shadow-lg backdrop-blur-md">
        <span className="text-xl text-pink-200">✿</span>
        <span>Handmade <span className="text-pink-200">•</span> Creative <span className="text-pink-200">•</span> Unique</span>
      </div>

      {/* Main heading */}
      <h1 className="mt-8 text-5xl font-semibold leading-[1.08] tracking-tight text-white drop-shadow-lg sm:text-6xl md:text-7xl lg:text-8xl">
        Handmade
        <br />
        Creations
        <span className="mt-2 block font-serif italic font-normal text-[#ff9bb5]">
          That Bring Joy
          <span className="ml-2 inline-block text-4xl">♡</span>
        </span>
      </h1>

      {/* Description */}
      <p className="mt-7 max-w-xl text-base leading-8 text-white/90 sm:text-lg md:text-xl">
        Discover handcrafted pipe cleaner flowers, keychains,
        bag charms, home décor and custom gifts made with
        creativity and care.
      </p>

      {/* Call-to-action buttons */}
      <div className="mt-9 flex flex-wrap items-center gap-4">
        <Link
          href="/shop"
          className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#f34f86] to-[#ff9db4] px-8 py-4 font-semibold text-white shadow-[0_10px_35px_rgba(243,79,134,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(243,79,134,0.5)]"
        >
          Shop Collection
          <span className="text-xl transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </Link>

        <Link
          href="/custom-orders"
          className="inline-flex items-center justify-center rounded-full border border-white/80 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white hover:text-[#35202a]"
        >
          Custom Orders
        </Link>
      </div>

      {/* Small brand detail */}
      <div className="mt-10 flex items-center gap-3 text-sm text-white/75">
        <span className="h-px w-10 bg-pink-200/80" />
        Thoughtfully handmade, beautifully gifted.
      </div>
    </ScrollReveal>
  </div>

  {/* Bottom fade */}
  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#24151b]/20 to-transparent" />
</section>


    
{/* TRUST BADGES */}
<section className="bg-white py-5 md:py-6">
  <div className="mx-auto max-w-7xl px-4 sm:px-6">
    <div className="flex flex-row flex-wrap items-center justify-center gap-x-8 gap-y-4 md:gap-x-12">

      <div className="flex items-center gap-2.5 whitespace-nowrap text-sm text-[#59434B]">
        <Heart size={19} strokeWidth={1.6} className="shrink-0 text-[#B94D76]" />
        <span>Handmade with Love</span>
      </div>

      <div className="flex items-center gap-2.5 whitespace-nowrap text-sm text-[#59434B]">
        <Gift size={19} strokeWidth={1.6} className="shrink-0 text-[#B94D76]" />
        <span>Perfect for Gifting</span>
      </div>

      <div className="flex items-center gap-2.5 whitespace-nowrap text-sm text-[#59434B]">
        <Palette size={19} strokeWidth={1.6} className="shrink-0 text-[#B94D76]" />
        <span>Custom Creations</span>
      </div>

      <div className="flex items-center gap-2.5 whitespace-nowrap text-sm text-[#59434B]">
        <ShoppingBag size={19} strokeWidth={1.6} className="shrink-0 text-[#B94D76]" />
        <span>Easy Online Ordering</span>
      </div>

    </div>
  </div>
</section>
      {/* SHOP BY CATEGORY */}
      <section className="bg-[#FFF9F5] pt-12 pb-6 md:pt-16 md:pb-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <p className="editorial-eyebrow">
              Made with Love
            </p>

            <h2 className="mt-3 text-3xl font-bold text-[#35202A] md:text-5xl">
              Shop Our Handmade Creations
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-gray-600 md:text-lg">
              From cute flower charms to thoughtful handmade gifts,
              find something special for yourself or someone you love.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {/* FLOWER KEYCHAINS */}
            <Link
              href="/shop?category=Keychains"
              className="group overflow-hidden rounded-3xl bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src="/images/products/homepage/categories/flower-keychains.jpg"
                  alt="Handmade pipe cleaner flower keychains"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <h3 className="text-2xl font-semibold">Flower Keychains</h3>
                  <p className="mt-2 text-sm text-white/90">
                    Tiny handmade blooms to carry everywhere.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 font-semibold">
                    Shop Now <span>→</span>
                  </span>
                </div>
              </div>
            </Link>

            {/* BAG CHARMS */}
            <Link
              href="/shop?category=Accessories"
              className="group overflow-hidden rounded-3xl bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src="/images/products/homepage/categories/bag-charms.jpg"
                  alt="Handmade floral bag charms"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <h3 className="text-2xl font-semibold">Bag Charms</h3>
                  <p className="mt-2 text-sm text-white/90">
                    Add a little handmade personality to your bag.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 font-semibold">
                    Shop Now <span>→</span>
                  </span>
                </div>
              </div>
            </Link>

            {/* MINI FLOWER POTS */}
            <Link
              href={{ pathname: "/shop", query: { category: "Home Decor" } }}
              className="group overflow-hidden rounded-3xl bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src="/images/products/homepage/categories/mini-flower-pots.jpg"
                  alt="Mini handmade pipe cleaner flower pots"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <h3 className="text-2xl font-semibold">Mini Flower Pots</h3>
                  <p className="mt-2 text-sm text-white/90">
                    Little floral decorations for desks and gifts.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 font-semibold">
                    Shop Now <span>→</span>
                  </span>
                </div>
              </div>
            </Link>

            {/* HOME DECOR */}
            <Link
              href={{ pathname: "/shop", query: { category: "Home Decor" } }}
              className="group overflow-hidden rounded-3xl bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src="/images/products/homepage/categories/home-decor.jpg"
                  alt="Handmade floral home decor and lotus tealight holders"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <h3 className="text-2xl font-semibold">Home Décor</h3>
                  <p className="mt-2 text-sm text-white/90">
                    Handmade details for a warm, beautiful home.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 font-semibold">
                    Shop Now <span>→</span>
                  </span>
                </div>
              </div>
            </Link>

          </div>

          {/* VIEW ALL PRODUCTS */}
          <div className="mt-10 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-pink-600 px-8 py-4 font-semibold text-white transition hover:bg-pink-700"
            >
              View All Products <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* LIVE FEATURED PRODUCTS */}
      <section className="bg-white px-6 py-14 md:py-20">
        <div className="mx-auto max-w-7xl">
          <header className="mb-9 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-600">Handpicked for you</p>
              <h2 className="mt-2 text-3xl font-bold text-[#35202A] md:text-4xl">Featured creations</h2>
            </div>
            <Link href="/shop" className="font-semibold text-pink-600 hover:underline">Shop all products →</Link>
          </header>
          {featuredProducts === null ? (
            <p role="alert" className="rounded-2xl bg-[#FFF9F5] p-8 text-center text-gray-600">Featured products are temporarily unavailable. Please visit the shop.</p>
          ) : featuredProducts.length > 0 ? (
            <ProductGrid products={featuredProducts} />
          ) : (
            <div className="rounded-2xl bg-[#FFF9F5] p-8 text-center">
              <p className="text-gray-600">There are no featured products right now.</p>
              <Link href="/shop" className="mt-4 inline-flex font-semibold text-pink-600 hover:underline">Browse the shop →</Link>
            </div>
          )}
        </div>
      </section>

      {/* PUBLISHED COLLECTIONS */}
      <section className="bg-[#FFF9F5] px-6 py-14 md:py-20">
        <div className="mx-auto max-w-7xl">
          <header className="mb-9 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-600">Find something special</p>
              <h2 className="mt-2 text-3xl font-bold text-[#35202A] md:text-4xl">Explore our collections</h2>
            </div>
            <Link href="/collections" className="font-semibold text-pink-600 hover:underline">View all collections →</Link>
          </header>
          {collections === null ? (
            <p role="alert" className="rounded-2xl bg-white p-8 text-center text-gray-600">Collections are temporarily unavailable. Please try again shortly.</p>
          ) : collections.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <Link key={collection.id} href={`/collections/${collection.slug}`} className="group overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative aspect-[4/3] bg-[#F8EFEA]"><CollectionCover src={collection.coverImage} alt={collection.name} /></div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-[#49333C] group-hover:text-pink-600">{collection.name}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">{collection.description || "Explore products in this collection."}</p>
                    <p className="mt-3 text-xs text-gray-500">{collection.productCount || 0} {(collection.productCount || 0) === 1 ? "product" : "products"}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-8 text-center">
              <p className="text-gray-600">No published collections yet.</p>
              <Link href="/collections" className="mt-4 inline-flex font-semibold text-pink-600 hover:underline">Explore collections →</Link>
            </div>
          )}
        </div>
      </section>
  
{/* WHY CHOOSE GALLERY OF ARTS */}

<section className="relative overflow-hidden bg-[#FFF9F5] pt-6 pb-10 md:pt-8 md:pb-14">
  <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-pink-100/50 blur-3xl" />
  <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-amber-100/40 blur-3xl" />

  <div className="relative mx-auto max-w-7xl px-6">
    <div className="mx-auto mb-8 max-w-2xl text-center md:mb-10">
      <span className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-pink-700">
        <Sparkles size={15} />
        The Gallery of Arts Difference
      </span>

      <h2 className="mt-5 font-serif text-3xl font-semibold tracking-tight text-[#35202A] sm:text-4xl md:text-5xl">
        Little Things,
        <span className="block italic text-[#C6537D]">
          Made Special
        </span>
      </h2>

      <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#75646A] sm:text-base">
        Discover thoughtful handmade creations that add colour,
        charm and a personal touch to everyday moments.
      </p>
    </div>

    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {[
        {
          title: "Made with Love",
          description:
            "Thoughtfully handmade, with care in every little detail.",
          icon: Heart,
          bg: "bg-[#F9E5EC]",
          iconColor: "text-[#B94D76]",
        },
        {
          title: "Unique Designs",
          description:
            "Colourful pipe-cleaner creations with their own character.",
          icon: Flower2,
          bg: "bg-[#F6EEDB]",
          iconColor: "text-[#97753C]",
        },
        {
          title: "Perfect for Gifting",
          description:
            "Creative little gifts for birthdays and special moments.",
          icon: Gift,
          bg: "bg-[#E8EFE4]",
          iconColor: "text-[#547651]",
        },
        {
          title: "Creative Home Décor",
          description:
            "Bring handmade colour and personality into your space.",
          icon: House,
          bg: "bg-[#E9EDF7]",
          iconColor: "text-[#61749E]",
        },
      ].map((item) => {
        const Icon = item.icon;

        return (
          <article
            key={item.title}
            className="group rounded-3xl border border-[#EFE4E3] bg-white/90 p-7 shadow-[0_4px_20px_rgba(53,32,42,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(53,32,42,0.09)]"
          >
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.bg} transition duration-300 group-hover:scale-105`}
            >
              <Icon
                size={27}
                strokeWidth={1.6}
                className={item.iconColor}
              />
            </div>

            <h3 className="mt-6 text-lg font-semibold text-[#35202A]">
              {item.title}
            </h3>

            <p className="mt-3 text-sm leading-7 text-[#75646A]">
              {item.description}
            </p>

            <div className="mt-5 h-px w-10 bg-[#E8A4BA] transition-all duration-300 group-hover:w-16" />
          </article>
        );
      })}
    </div>
</div>
</section>

{/* CUSTOMER REVIEWS */}
<CustomerReviews initialReviews={reviews} loadError={reviewsResult.status === "rejected"} />


{/* FOOTER */}
<footer className="border-t border-[#EEDFE1] bg-[#FFF9F5] text-[#49333C]">
  <div className="mx-auto max-w-7xl px-6 pt-10 pb-5 md:pt-12">

    
    {/* Social Media Showcase */}
    <div className="mx-auto mb-10 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">

      {/* YouTube Card */}
      <a
        href="https://www.youtube.com/@Gallery-of-art-DIY1?sub_confirmation=1"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Subscribe to Gallery of Arts on YouTube"
        className="group relative isolate overflow-hidden rounded-3xl border border-[#F0D9DE] bg-white transition-all duration-500 hover:-translate-y-1.5 hover:border-[#D9A0B4] hover:shadow-[0_18px_45px_rgba(185,77,118,0.12)]"
      >
        {/* Decorative background */}
        <div className="absolute -right-10 -top-10 -z-10 h-40 w-40 rounded-full bg-[#FBE9EC] transition-transform duration-700 group-hover:scale-150" />
        <div className="absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 bg-[#D94343] transition-transform duration-500 group-hover:scale-x-100" />

        <div className="p-6 sm:p-7">
          <div className="flex items-center justify-between">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF0F0] text-[#D94343] shadow-sm transition duration-300 group-hover:rotate-[-5deg] group-hover:scale-110">
              <FaYoutube size={31} strokeWidth={1.8} />
            </div>

            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#F0D9DE] text-[#806A72] transition-all duration-300 group-hover:border-[#D94343] group-hover:bg-[#D94343] group-hover:text-white">
              <span className="text-lg" aria-hidden="true">↗</span>
            </span>
          </div>

          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.22em] text-[#C45B68]">
            Watch • Learn • Create
          </p>

          <h3 className="mt-2 font-serif text-2xl font-semibold text-[#49333C]">
            Our Creative World
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-6 text-[#806A72]">
            Watch beautiful pipe-cleaner crafts, DIY tutorials and handmade
            decorations come to life.
          </p>

          <div className="mt-6 flex items-center gap-3 border-t border-[#F2E5E7] pt-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D94343] text-white">
              <FaYoutube size={19} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#49333C]">
                Gallery of Arts
              </p>
              <p className="mt-0.5 text-xs text-[#806A72]">
                Subscribe to our channel
              </p>
            </div>
          </div>
        </div>
      </a>

      {/* Instagram Card */}
      <a
        href="https://www.instagram.com/reel/DcINNfRq9O4/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Follow Gallery of Arts on Instagram"
        className="group relative isolate overflow-hidden rounded-3xl border border-[#F0D9DE] bg-white transition-all duration-500 hover:-translate-y-1.5 hover:border-[#D9A0B4] hover:shadow-[0_18px_45px_rgba(185,77,118,0.12)]"
      >
        {/* Decorative background */}
        <div className="absolute -right-10 -top-10 -z-10 h-40 w-40 rounded-full bg-[#F7E5F0] transition-transform duration-700 group-hover:scale-150" />
        <div className="absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 bg-gradient-to-r from-[#F5A623] via-[#D94B91] to-[#7655C9] transition-transform duration-500 group-hover:scale-x-100" />

        <div className="p-6 sm:p-7">
          <div className="flex items-center justify-between">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFF0D9] via-[#F9E3EF] to-[#E9E2FF] text-[#B94D76] shadow-sm transition duration-300 group-hover:rotate-[5deg] group-hover:scale-110">
              <FaInstagram size={31} strokeWidth={1.8} />
            </div>

            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#F0D9DE] text-[#806A72] transition-all duration-300 group-hover:border-[#B94D76] group-hover:bg-[#B94D76] group-hover:text-white">
              <span className="text-lg" aria-hidden="true">↗</span>
            </span>
          </div>

          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.22em] text-[#B94D76]">
            Inspiration • Creativity
          </p>

          <h3 className="mt-2 font-serif text-2xl font-semibold text-[#49333C]">
            Little Things, Made with Love
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-6 text-[#806A72]">
            Explore handmade creations, fresh craft ideas and little
            behind-the-scenes moments.
          </p>

          <div className="mt-6 flex items-center gap-3 border-t border-[#F2E5E7] pt-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#F5A623] via-[#D94B91] to-[#7655C9] text-white">
              <FaInstagram size={19} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#49333C]">
                Gallery of Arts
              </p>
              <p className="mt-0.5 text-xs text-[#806A72]">
                Follow us for more inspiration
              </p>
            </div>
          </div>
        </div>
      </a>
    </div>


    {/* Navigation and contact */}
    <div className="grid grid-cols-1 gap-8 border-t border-[#EADBDD] py-7 sm:grid-cols-2 md:grid-cols-3">

      {/* Explore */}
      <div>
        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">
          Explore
        </h4>

        <ul className="space-y-3 text-sm text-[#806A72]">
          <li>
            <Link href="/shop" className="transition hover:text-[#B94D76]">
              Shop All
            </Link>
          </li>
          <li>
            <Link href="/custom-orders" className="transition hover:text-[#B94D76]">
              Custom Orders
            </Link>
          </li>
          <li>
            <Link href="/collections" className="transition hover:text-[#B94D76]">
              Collections
            </Link>
          </li>
          <li>
            <Link href="/gallery" className="transition hover:text-[#B94D76]">
              Gallery
            </Link>
          </li>

        </ul>
      </div>

      {/* Customer care */}
      <div>
        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">
          Customer Care
        </h4>

        <ul className="space-y-3 text-sm text-[#806A72]">
          <li>
            <Link href="/contact" className="transition hover:text-[#B94D76]">
              Contact Us
            </Link>
          </li>
          <li>
            <Link href="/account" className="transition hover:text-[#B94D76]">
              My Account
            </Link>
          </li>
          <li>
            <Link href="/cart" className="transition hover:text-[#B94D76]">
              Shopping Cart
            </Link>
          </li>
        </ul>
      </div>

      {/* Contact */}
      <div>
        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">
          Get in Touch
        </h4>

        <p className="text-sm leading-6 text-[#806A72]">
          Have a question or a special idea?
          We would love to hear from you.
        </p>

        <a
          href="mailto:galleryofarts@gmail.com"
          className="mt-3 inline-block break-all text-sm font-medium text-[#B94D76] hover:underline"
        >
          galleryofarts@gmail.com
        </a>

        <p className="mt-2 text-sm text-[#806A72]">
          Made with love in India
        </p>
      </div>
    </div>

    {/* Bottom bar */}
    <div className="flex flex-col items-center justify-between gap-3 border-t border-[#EADBDD] pt-5 text-center text-xs text-[#806A72] md:flex-row md:text-left">
      <p>
        © {new Date().getFullYear()} Gallery of Arts. All rights reserved.
      </p>

      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
        <Link href="/about" className="hover:text-[#B94D76]">About</Link>
        <Link href="/contact" className="hover:text-[#B94D76]">Contact</Link>
      </div>
    </div>

  </div>
</footer>
    </main>
  );
}
