"use client";

import { readStorage, writeStorage } from "@/lib/storage";
import type { WishlistItem } from "@/types";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const KEY = "goa-wishlist";

interface WishlistContextValue {
  items: WishlistItem[];
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    setItems(readStorage<WishlistItem[]>(KEY, []));
  }, []);

  useEffect(() => {
    writeStorage(KEY, items);
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      has: (productId: string) => items.some((item) => item.productId === productId),
      toggle: (productId: string) => {
        setItems((current) => {
          if (current.some((item) => item.productId === productId)) {
            return current.filter((item) => item.productId !== productId);
          }
          return [...current, { productId, addedAt: new Date().toISOString() }];
        });
      },
    }),
    [items],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
}
