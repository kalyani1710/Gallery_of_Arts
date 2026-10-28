import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { CartProvider } from "@/context/CartProvider";
import { UIProvider } from "@/context/UIProvider";
import { WishlistProvider } from "@/context/WishlistProvider";
import Header from "@/components/layout/Header";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: {
    default: "Gallery of Arts",
    template: "%s | Gallery of Arts",
  },
  description:
    "Premium handmade gifts, pipe cleaner flowers, keychains, home décor and custom creations.",
  icons: {
    icon: "/images/branding/art_favicon.png",
    shortcut: "/images/branding/art_favicon.png",
    apple: "/images/branding/art_favicon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
 
return (
  <html lang="en">
    <body>
      <UIProvider>
        <CartProvider>
          <WishlistProvider>
            <Header session={session ? { role: session.role } : null} />
            {children}
          </WishlistProvider>
        </CartProvider>
      </UIProvider>
    </body>
  </html>
);

}
