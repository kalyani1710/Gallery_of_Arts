import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { requireOwner } from "@/lib/permissions";
import { ScrollReveal } from "@/components/motion/Reveal";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const owner = await requireOwner();
  if (!owner) redirect("/account");

  return (
    <>
      <header className="border-b border-gallery-border bg-white text-ink shadow-sm">
        <div className="page-container flex min-h-16 items-center justify-between gap-4 py-3">
          <p className="font-display text-base font-semibold tracking-wide sm:text-lg">Gallery of Arts <span className="ml-2 font-sans text-xs font-medium uppercase tracking-[0.18em] text-muted">Admin</span></p>
          <LogoutButton
            label="Logout"
            className="rounded-full border border-primary/20 px-4 py-2 text-sm font-medium text-primary transition hover:border-primary/40 hover:bg-soft-pink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
        <nav aria-label="Admin navigation" className="page-container flex gap-2 overflow-x-auto pb-3">
          {[
            ["Dashboard", "/admin"],
            ["Products", "/admin/products"],
            ["Collections", "/admin/collections"],
            ["Orders", "/admin/orders"],
            ["Reviews", "/admin/reviews"],
            ["Shipping", "/admin/shipping"],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="shrink-0 rounded-full px-3 py-2 text-sm font-medium text-muted transition hover:bg-soft-pink hover:text-primary">
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <ScrollReveal>{children}</ScrollReveal>
    </>
  );
}
