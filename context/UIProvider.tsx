"use client";

import type { Product } from "@/types";
import { createContext, useContext, useMemo, useState } from "react";

interface UIContextValue {
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const value = useMemo(
    () => ({
      searchOpen,
      setSearchOpen,
      cartOpen,
      setCartOpen,
      mobileOpen,
      setMobileOpen,
      quickViewProduct,
      setQuickViewProduct,
    }),
    [searchOpen, cartOpen, mobileOpen, quickViewProduct],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be used within UIProvider");
  return context;
}
