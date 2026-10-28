
"use client";

export type CartLine = {
  productId: string;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
};

const CART_KEY = "gallery-of-arts-cart";
const CART_EVENT = "gallery-cart-updated";

export function getCart(): CartLine[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? (JSON.parse(saved) as CartLine[]) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartLine[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function addToCart(item: Omit<CartLine, "quantity">) {
  const cart = getCart();
  const existing = cart.find((line) => line.productId === item.productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }

  saveCart(cart);
}

export function removeFromCart(productId: string) {
  saveCart(getCart().filter((item) => item.productId !== productId));
}

export function updateCartQuantity(productId: string, quantity: number) {
  if (quantity < 1) {
    removeFromCart(productId);
    return;
  }

  saveCart(
    getCart().map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    )
  );
}

export function cartUpdatedEvent() {
  return CART_EVENT;
}
