
"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Search, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartProvider";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

type HeaderProps = { session: { role: "customer" | "owner" } | null };

export default function Header({ session }: HeaderProps) {
  const [currentSession, setCurrentSession] = useState(session);
  const [open, setOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { count } = useCart();

  useEffect(() => {
    let active = true;
    void fetch("/api/auth/session", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not refresh session");
        return response.json() as Promise<{ role: "customer" | "owner" | null }>;
      })
      .then((data) => {
        if (active) setCurrentSession(data.role ? { role: data.role } : null);
      })
      .catch(() => {
        // Keep the server-rendered session if the status request is unavailable.
      });
    return () => { active = false; };
  }, [pathname]);

  if (pathname?.startsWith("/admin")) return null;

  async function logout() {
    setLogoutError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Unable to sign out. Please try again.");
      setCurrentSession(null);
      window.dispatchEvent(new Event("gallery-auth-changed"));
      router.refresh();
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : "Unable to sign out. Please try again.");
    }
  }

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/collections", label: "Collections" },
    { href: "/custom-orders", label: "Custom Orders" },
    { href: "/gallery", label: "Gallery" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-pink-100 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Brand */}
          <Link
            href="/"
            className="flex shrink-0 items-center"
            aria-label="Gallery of Arts home"
            onClick={() => setOpen(false)}
          >
            <Image
              src="/images/branding/art_logo.webp"
              alt="Gallery of Arts"
              width={2058}
              height={764}
              priority
              className="h-10 w-auto object-contain sm:h-12 lg:h-14"
            />
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-6 font-medium lg:flex xl:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap text-gray-700 transition hover:text-pink-600"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right-side actions */}
          <div className="flex shrink-0 items-center gap-3">
            {currentSession ? (
              <>
                <Link href={currentSession.role === "owner" ? "/admin" : "/account"} className="hidden rounded-full px-3 py-2 font-medium text-pink-600 transition hover:bg-pink-50 sm:inline-flex">
                  {currentSession.role === "owner" ? "Admin Dashboard" : "My Account"}
                </Link>
                <button type="button" onClick={() => void logout()} className="hidden rounded-full bg-pink-600 px-4 py-2 font-medium text-white transition hover:bg-pink-700 sm:inline-flex">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="hidden rounded-full px-3 py-2 font-medium text-pink-600 transition hover:bg-pink-50 sm:inline-flex">Login</Link>
                <Link href="/register" className="hidden rounded-full bg-pink-600 px-4 py-2 font-medium text-white transition hover:bg-pink-700 sm:inline-flex">Register</Link>
              </>
            )}

            <Link
              href="/shop"
              aria-label="Search and shop"
              className="hidden text-gray-700 transition hover:text-pink-600 sm:inline-flex"
            >
              <Search size={20} />
            </Link>

            <Link
              href="/account"
              aria-label="My account"
              className="text-gray-700 transition hover:text-pink-600"
            >
              <Heart size={20} />
            </Link>

            <Link
              href="/cart"
              aria-label={`Shopping cart, ${count} ${count === 1 ? "item" : "items"}`}
              className="relative text-gray-700 transition hover:text-pink-600"
            >
              <ShoppingBag size={20} />
              {count > 0 && (
                <motion.span
                  key={count}
                  aria-hidden="true"
                  initial={reduceMotion ? false : { scale: 0.65, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 28 }}
                  className="absolute -right-2 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-pink-600 px-1 text-[10px] font-bold leading-none text-white"
                >
                  {count > 99 ? "99+" : count}
                </motion.span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              type="button"
              className="rounded-lg p-2 text-gray-700 transition hover:bg-pink-50 lg:hidden"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.nav
              initial={reduceMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
              className="overflow-hidden border-t border-pink-100 py-4 lg:hidden"
            >
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 font-medium text-gray-700 transition hover:bg-pink-50 hover:text-pink-600"
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-pink-100 pt-4">
                  {currentSession ? (
                    <>
                      <Link href={currentSession.role === "owner" ? "/admin" : "/account"} onClick={() => setOpen(false)} className="rounded-full border border-pink-200 px-4 py-3 text-center font-medium text-pink-600 transition hover:bg-pink-50">
                        {currentSession.role === "owner" ? "Admin Dashboard" : "My Account"}
                      </Link>
                      <button type="button" onClick={() => void logout()} className="rounded-full bg-pink-600 px-4 py-3 text-center font-medium text-white transition hover:bg-pink-700">Logout</button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setOpen(false)} className="rounded-full border border-pink-200 px-4 py-3 text-center font-medium text-pink-600 transition hover:bg-pink-50">Login</Link>
                      <Link href="/register" onClick={() => setOpen(false)} className="rounded-full bg-pink-600 px-4 py-3 text-center font-medium text-white transition hover:bg-pink-700">Register</Link>
                    </>
                  )}
                </div>
                {logoutError && <p role="alert" className="mt-3 text-sm text-rose-700">{logoutError}</p>}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
