"use client";

import { useCart } from "@/context/CartProvider";
import { useUI } from "@/context/UIProvider";
import type { StoreProduct } from "@/types";
import { useState } from "react";

export default function AddStoreProductToCart({ product }: { product: StoreProduct }) {
  const { addItem } = useCart();
  const { setCartOpen } = useUI();
  const maxQuantity = Math.min(product.stock, 1000);
  const [quantity, setQuantity] = useState(1);

  function changeQuantity(value: number) {
    if (!Number.isFinite(value)) return;
    setQuantity(Math.max(1, Math.min(maxQuantity || 1, Math.floor(value))));
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-sm font-medium text-[#49333C]">
        Quantity
        <input
          type="number"
          min={1}
          max={maxQuantity || 1}
          step={1}
          value={quantity}
          disabled={product.stock < 1}
          onChange={(event) => changeQuantity(Number(event.target.value))}
          className="w-20 rounded-xl border border-[#E8DCD6] px-3 py-2 text-center disabled:bg-gray-100"
        />
      </label>
      <button
        type="button"
        disabled={product.stock < 1}
        onClick={() => {
          if (addItem(product, quantity)) setCartOpen(true);
        }}
        className="w-full rounded-full bg-pink-500 px-8 py-4 font-semibold text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto"
      >
        {product.stock < 1 ? "Out of Stock" : "Add To Cart"}
      </button>
    </div>
  );
}
