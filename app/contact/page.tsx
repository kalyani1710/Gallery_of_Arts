"use client";

import { ScrollReveal } from "@/components/motion/Reveal";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gallery-paper text-ink">
      <section className="page-container section-space">
        <ScrollReveal>
        <p className="editorial-eyebrow text-center">We’re here to help</p>
        <h1 className="mt-4 text-center font-display text-4xl font-medium tracking-tight md:text-5xl">
          Contact Us
        </h1>

        <p className="mt-4 text-center text-muted">
          We'd love to hear from you.
        </p>
        </ScrollReveal>

        <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-12">

          <ScrollReveal className="h-full">
          <div className="h-full rounded-card border border-gallery-border bg-white p-6 shadow-card md:p-8">

            <h2 className="mb-6 font-display text-2xl font-medium">
              Contact Information
            </h2>

            <div className="space-y-5">

              <div>
                <p className="font-medium text-ink">Email</p>
                <p className="text-muted">support@galleryofarts.com</p>
              </div>

              <div>
                <p className="font-medium text-ink">Phone</p>
                <p className="text-muted">+91 9876543210</p>
              </div>

              <div>
                <p className="font-medium text-ink">Address</p>
                <p className="text-muted">Pune, Maharashtra, India</p>
              </div>

              <div>
                <p className="font-medium text-ink">Hours</p>
                <p className="text-muted">Mon - Sat : 9 AM - 7 PM</p>
              </div>

            </div>
          </div>
          </ScrollReveal>

          <ScrollReveal delay={0.08} className="h-full">
          <form className="h-full rounded-card border border-gallery-border bg-white p-6 shadow-card md:p-8">

            <div className="grid gap-5">

              <input
                type="text"
                placeholder="Your Name"
                className="rounded-xl border border-gallery-border bg-soft-cream p-4 text-ink outline-none transition placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/10"
              />

              <input
                type="email"
                placeholder="Email"
                className="rounded-xl border border-gallery-border bg-soft-cream p-4 text-ink outline-none transition placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/10"
              />

              <input
                type="text"
                placeholder="Subject"
                className="rounded-xl border border-gallery-border bg-soft-cream p-4 text-ink outline-none transition placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/10"
              />

              <textarea
                rows={6}
                placeholder="Message"
                className="rounded-xl border border-gallery-border bg-soft-cream p-4 text-ink outline-none transition placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/10"
              />

              <button
                className="rounded-full bg-primary py-4 font-medium text-white transition hover:bg-primary-dark"
              >
                Send Message
              </button>

            </div>

          </form>
          </ScrollReveal>

        </div>

      </section>

    </main>
  );
}
