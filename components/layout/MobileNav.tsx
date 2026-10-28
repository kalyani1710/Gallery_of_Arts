"use client";

import { Logo } from "@/components/ui/Logo";
import { navLinks, shopDropdown, siteConfig } from "@/config/site";
import { useUI } from "@/context/UIProvider";
import { X } from "lucide-react";
import Link from "next/link";

export function MobileNav() {
  const { mobileOpen, setMobileOpen } = useUI();
  if (!mobileOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-cream p-5 lg:hidden">
      <div className="flex items-center justify-between">
        <Logo />
        <button type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)}>
          <X />
        </button>
      </div>
      <nav className="mt-8 space-y-4" aria-label="Mobile">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} className="block font-display text-2xl text-primary" onClick={() => setMobileOpen(false)}>
            {link.label}
          </Link>
        ))}
        <p className="pt-4 text-xs uppercase tracking-widest text-muted">Shop</p>
        {shopDropdown.map((item) => (
          <Link key={item.href} href={item.href} className="block text-ink" onClick={() => setMobileOpen(false)}>
            {item.label}
          </Link>
        ))}
        <Link href="/contact" className="block pt-4 text-ink" onClick={() => setMobileOpen(false)}>
          Contact
        </Link>
        <p className="text-sm text-muted">{siteConfig.slogan}</p>
      </nav>
    </div>
  );
}
