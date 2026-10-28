import { ScrollReveal } from "@/components/motion/Reveal";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gallery-paper text-ink">
      <section className="page-container-narrow section-space text-center">
        <ScrollReveal>
        <p className="editorial-eyebrow">Our story</p>
        <h1 className="mt-4 font-display text-4xl font-medium tracking-tight md:text-5xl">
          About Gallery of Arts
        </h1>

        <p className="mt-8 text-lg leading-8 text-muted">
          Gallery of Arts is a handmade craft brand dedicated to creating
          beautiful flowers, keychains, home décor items, customized gifts,
          and artistic creations that bring joy to every occasion.
        </p>

        <p className="mt-6 text-lg leading-8 text-muted">
          Every product is crafted with creativity, attention to detail,
          and passion for handmade artistry.
        </p>
        </ScrollReveal>
      </section>
    </main>
  );
}
