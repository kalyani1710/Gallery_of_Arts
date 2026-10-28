"use client";

import Link from "next/link";
import { getShippingAmount } from "@/lib/shipping";
import type { ShippingSettings } from "@/lib/shipping";
import { readStorage, writeStorage } from "@/lib/storage";
import type { CartItem, Product, StoreProduct } from "@/types";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const KEY = "goa-cart";
const MAX_LINE_QUANTITY = 1000;
const accountCartKey = (userId: string) => `${KEY}:${userId}`;
type CartProduct = Product | StoreProduct;
type CartNotice = { kind: "success" | "error"; message: string };

function normalizeCartItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];

  const combined = new Map<string, CartItem>();
  for (const candidate of value) {
    if (!candidate || typeof candidate !== "object") continue;
    const row = candidate as Record<string, unknown>;
    if (typeof row.productId !== "string" || !row.productId.trim()) continue;

    const parsedQuantity = typeof row.quantity === "number" || typeof row.quantity === "string"
      ? Number(row.quantity)
      : NaN;
    const quantity = Number.isSafeInteger(parsedQuantity) && parsedQuantity > 0
      ? Math.min(parsedQuantity, MAX_LINE_QUANTITY)
      : 1;
    const productId = row.productId.trim();
    const existing = combined.get(productId);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, MAX_LINE_QUANTITY);
    } else {
      combined.set(productId, {
        productId,
        quantity,
        ...(typeof row.color === "string" ? { color: row.color } : {}),
      });
    }
  }
  return [...combined.values()];
}

interface CartContextValue {
  items: CartItem[];
  addItem: (product: CartProduct, quantity?: number, color?: string) => boolean;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  syncCartOwner: () => Promise<void>;
  count: number;
  lines: Array<{ item: CartItem; product: StoreProduct; lineTotal: number }>;
  subtotal: number;
  shipping: number | null;
  total: number | null;
  shippingSettings: ShippingSettings | null;
  shippingSettingsLoading: boolean;
  shippingSettingsError: string;
  refreshShippingSettings: () => Promise<void>;
  productsLoading: boolean;
  productsError: string;
  refreshProducts: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [items, setItems] = useState<CartItem[]>([]);
  const itemsRef = useRef<CartItem[]>([]);
  const [products, setProducts] = useState<Record<string, StoreProduct>>({});
  const [cartLoaded, setCartLoaded] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState("");
  const [cartOwnerRevision, setCartOwnerRevision] = useState(0);
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings | null>(null);
  const [shippingSettingsLoading, setShippingSettingsLoading] = useState(true);
  const [shippingSettingsError, setShippingSettingsError] = useState("");
  const [notice, setNotice] = useState<CartNotice | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestNumber = useRef(0);
  const ownerSyncRequest = useRef(0);
  const userIdRef = useRef<string | null | undefined>(undefined);

  const showNotice = useCallback((nextNotice: CartNotice) => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    setNotice(nextNotice);
    noticeTimer.current = setTimeout(() => setNotice(null), 4500);
  }, []);

  const commitItems = useCallback((update: CartItem[] | ((current: CartItem[]) => CartItem[])) => {
    const nextItems = typeof update === "function" ? update(itemsRef.current) : update;
    itemsRef.current = nextItems;
    setItems(nextItems);
  }, []);

  const syncCartOwner = useCallback(async () => {
    const requestId = ++ownerSyncRequest.current;
    let nextUserId: string | null;
    try {
      const response = await fetch("/api/auth/session", { cache: "no-store" });
      if (!response.ok) return;
      const session = await response.json() as { userId?: string | null };
      if (requestId !== ownerSyncRequest.current) return;
      nextUserId = typeof session.userId === "string" ? session.userId : null;
    } catch {
      return;
    }

    if (!cartLoaded) {
      const stored = readStorage<unknown>(KEY, []);
      const active = Array.isArray(stored)
        ? (nextUserId === null ? normalizeCartItems(stored) : [])
        : stored && typeof stored === "object"
          ? (() => {
              const saved = stored as { ownerId?: unknown; items?: unknown };
              return saved.ownerId === nextUserId || (nextUserId !== null && saved.ownerId === null)
                ? normalizeCartItems(saved.items)
                : [];
            })()
          : [];
      const account = nextUserId
        ? normalizeCartItems(readStorage<unknown>(accountCartKey(nextUserId), []))
        : [];
      const restored = normalizeCartItems([...account, ...active, ...itemsRef.current]);
      userIdRef.current = nextUserId;
      itemsRef.current = restored;
      setItems(restored);
      setProductsLoading(restored.length > 0);
      setProductsError("");
      setCartOwnerRevision((revision) => revision + 1);
      if (nextUserId) {
        writeStorage(accountCartKey(nextUserId), restored);
        window.localStorage.removeItem(KEY);
      } else {
        writeStorage(KEY, { ownerId: null, items: restored });
      }
      setCartLoaded(true);
      return;
    }

    if (userIdRef.current === nextUserId) return;

    const previousUserId = userIdRef.current;
    if (previousUserId) writeStorage(accountCartKey(previousUserId), itemsRef.current);
    requestNumber.current += 1;

    const active = readStorage<unknown>(KEY, []);
    const activeItems = active && typeof active === "object" && !Array.isArray(active)
      ? (active as { ownerId?: unknown; items?: unknown })
      : null;
    const guestItems = previousUserId === null && nextUserId !== null
      ? itemsRef.current
      : [];
    const savedAccountItems = nextUserId
      ? normalizeCartItems(readStorage<unknown>(accountCartKey(nextUserId), []))
      : [];
    const legacyAccountItems = nextUserId && activeItems?.ownerId === nextUserId
      ? normalizeCartItems(activeItems.items)
      : [];
    const restored = nextUserId
      ? normalizeCartItems([...savedAccountItems, ...legacyAccountItems, ...guestItems])
      : [];
    userIdRef.current = nextUserId;
    itemsRef.current = restored;
    setItems(restored);
    setProductsLoading(restored.length > 0);
    setProductsError("");
    setCartOwnerRevision((revision) => revision + 1);
    if (nextUserId) {
      writeStorage(accountCartKey(nextUserId), restored);
      window.localStorage.removeItem(KEY);
    } else {
      if (activeItems?.ownerId === null) {
        const remainingGuestItems = normalizeCartItems(activeItems.items);
        itemsRef.current = remainingGuestItems;
        setItems(remainingGuestItems);
        writeStorage(KEY, { ownerId: null, items: remainingGuestItems });
      } else {
        writeStorage(KEY, { ownerId: null, items: [] });
      }
    }
  }, [cartLoaded]);

  useEffect(() => {
    void syncCartOwner();
  }, [pathname, syncCartOwner]);

  useEffect(() => {
    const handleAuthChange = () => void syncCartOwner();
    window.addEventListener("gallery-auth-changed", handleAuthChange);
    return () => window.removeEventListener("gallery-auth-changed", handleAuthChange);
  }, [syncCartOwner]);

  useEffect(() => {
    if (!cartLoaded) return;
    const ownerId = userIdRef.current;
    if (ownerId) writeStorage(accountCartKey(ownerId), items);
    else writeStorage(KEY, { ownerId: null, items });
  }, [cartLoaded, items]);

  useEffect(() => () => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
  }, []);

  const refreshProducts = useCallback(async () => {
    const ids = [...new Set(itemsRef.current.map((item) => item.productId))];
    const requestId = ++requestNumber.current;
    if (ids.length === 0) {
      setProducts({});
      setProductsError("");
      setProductsLoading(false);
      return;
    }

    setProductsLoading(true);
    setProductsError("");
    try {
      const response = await fetch(`/api/products?ids=${encodeURIComponent(ids.join(","))}`, { cache: "no-store" });
      const data: { products?: StoreProduct[]; error?: string } = await response.json();
      if (!response.ok || !Array.isArray(data.products)) {
        throw new Error(data.error || "Could not refresh cart products.");
      }
      if (requestId !== requestNumber.current) return;

      const refreshed = Object.fromEntries(data.products.map((product) => [product.id, product]));
      setProducts(refreshed);
      let wasAdjusted = false;
      let wasRemoved = false;
      const available = new Map(data.products.map((product) => [product.id, product]));
      commitItems((current) => current.flatMap((item) => {
        const product = available.get(item.productId);
        if (!product) return [item];
        if (product.stock <= 0) {
          wasRemoved = true;
          return [];
        }
        if (item.quantity > product.stock) {
          wasAdjusted = true;
          return [{ ...item, quantity: Math.min(product.stock, MAX_LINE_QUANTITY) }];
        }
        return [item];
      }));
      if (wasRemoved) {
        showNotice({ kind: "error", message: "An out-of-stock item was removed from your cart." });
      } else if (wasAdjusted) {
        showNotice({ kind: "error", message: "A cart quantity was reduced to match current stock." });
      }
    } catch (error) {
      console.error("Could not refresh cart products:", error);
      if (requestId === requestNumber.current) {
        setProductsError(error instanceof Error ? error.message : "Could not verify product availability.");
      }
    } finally {
      if (requestId === requestNumber.current) setProductsLoading(false);
    }
  }, [commitItems, showNotice]);

  const refreshShippingSettings = useCallback(async () => {
    setShippingSettingsLoading(true);
    setShippingSettingsError("");
    try {
      const response = await fetch("/api/shipping-settings", { cache: "no-store" });
      const data = await response.json() as { settings?: ShippingSettings; error?: string };
      const settings = data.settings;
      if (!response.ok || !settings || typeof settings.standardCharge !== "number" || typeof settings.freeShippingThreshold !== "number" || typeof settings.freeShippingEnabled !== "boolean") {
        throw new Error(data.error || "Shipping settings are temporarily unavailable.");
      }
      setShippingSettings(settings);
    } catch (error) {
      setShippingSettings(null);
      setShippingSettingsError(error instanceof Error ? error.message : "Shipping settings are temporarily unavailable.");
    } finally {
      setShippingSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshShippingSettings();
  }, [pathname, refreshShippingSettings]);

  useEffect(() => {
    const handleSettingsChanged = () => void refreshShippingSettings();
    window.addEventListener("gallery-shipping-settings-changed", handleSettingsChanged);
    return () => window.removeEventListener("gallery-shipping-settings-changed", handleSettingsChanged);
  }, [refreshShippingSettings]);

  const itemIdsKey = [...new Set(items.map((item) => item.productId))].sort().join(",");
  useEffect(() => {
    if (cartLoaded && itemIdsKey) void refreshProducts();
  }, [cartLoaded, itemIdsKey, cartOwnerRevision, refreshProducts]);

  const value = useMemo(() => {
    const addItem = (product: CartProduct, requestedQuantity = 1, color?: string) => {
      const stock = product.stock;
      if (
        !Number.isInteger(requestedQuantity) || requestedQuantity < 1 ||
        requestedQuantity > MAX_LINE_QUANTITY || !Number.isInteger(stock) || stock < 1
      ) {
        showNotice({ kind: "error", message: stock < 1 ? "This product is out of stock." : "Choose a valid quantity." });
        return false;
      }

      const currentItem = itemsRef.current.find((item) => item.productId === product.id);
      const nextQuantity = (currentItem?.quantity || 0) + requestedQuantity;
      if (nextQuantity > stock || nextQuantity > MAX_LINE_QUANTITY) {
        showNotice({ kind: "error", message: `Only ${stock} unit${stock === 1 ? " is" : "s are"} currently available.` });
        return false;
      }

      setProducts((current) => ({ ...current, [product.id]: product as StoreProduct }));
      commitItems((current) => {
        const existing = current.find((item) => item.productId === product.id);
        if (existing) {
          return current.map((item) => item.productId === product.id
            ? { ...item, quantity: item.quantity + requestedQuantity, color: color || item.color }
            : item);
        }
        return [...current, { productId: product.id, quantity: requestedQuantity, ...(color ? { color } : {}) }];
      });
      showNotice({ kind: "success", message: "Added to cart successfully." });
      return true;
    };

    const removeItem = (productId: string) => {
      commitItems((current) => current.filter((item) => item.productId !== productId));
      setProducts((current) => {
        const next = { ...current };
        delete next[productId];
        return next;
      });
    };

    const setQuantity = (productId: string, quantity: number) => {
      if (!Number.isInteger(quantity) || quantity < 1) return;
      const product = products[productId];
      if (!product) {
        showNotice({ kind: "error", message: "We could not verify this product's stock. Please refresh the cart." });
        return;
      }
      if (quantity > product.stock || quantity > MAX_LINE_QUANTITY) {
        showNotice({ kind: "error", message: `Only ${product.stock} unit${product.stock === 1 ? " is" : "s are"} currently available.` });
        return;
      }
      commitItems((current) => current.map((item) => item.productId === productId ? { ...item, quantity } : item));
    };

    const lines = items
      .map((item) => {
        const product = products[item.productId];
        if (!product) return null;
        return { item, product, lineTotal: product.price * item.quantity };
      })
      .filter((line): line is NonNullable<typeof line> => Boolean(line));
    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const shipping = shippingSettings ? getShippingAmount(subtotal, shippingSettings) : null;

    return {
      items,
      addItem,
      removeItem,
      setQuantity,
      clear: () => {
        commitItems([]);
        setProducts({});
        const ownerId = userIdRef.current;
        if (ownerId) writeStorage(accountCartKey(ownerId), []);
        else writeStorage(KEY, { ownerId: null, items: [] });
      },
      syncCartOwner,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      lines,
      subtotal,
      shipping,
      total: shipping === null ? null : subtotal + shipping,
      shippingSettings,
      shippingSettingsLoading,
      shippingSettingsError,
      refreshShippingSettings,
      productsLoading,
      productsError,
      refreshProducts,
    };
  }, [items, products, productsLoading, productsError, refreshProducts, commitItems, showNotice, shippingSettings, shippingSettingsLoading, shippingSettingsError, refreshShippingSettings, syncCartOwner]);

  return (
    <CartContext.Provider value={value}>
      {children}
      {notice && (
        <div
          role={notice.kind === "error" ? "alert" : "status"}
          aria-live={notice.kind === "error" ? "assertive" : "polite"}
          className={`fixed bottom-5 right-5 z-[100] flex max-w-sm items-center gap-4 rounded-2xl px-5 py-4 text-sm text-white shadow-xl ${notice.kind === "success" ? "bg-emerald-700" : "bg-[#7A3947]"}`}
        >
          <span className="flex-1">{notice.message}</span>
          {notice.kind === "success" && <Link href="/cart" className="shrink-0 font-semibold underline">View Cart</Link>}
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss notification" className="text-lg leading-none">×</button>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
