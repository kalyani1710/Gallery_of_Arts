"use client";

import { useWishlist } from "@/context/WishlistProvider";
import { cn } from "@/lib/cn";
import { Heart } from "lucide-react";

export function WishlistButton({ productId, className }: { productId: string; className?: string }) {
  const { has, toggle } = useWishlist();
  const active = has(productId);

  return (
    <button
      type="button"
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(productId);
      }}
      className={cn(
        "grid h-10 w-10 place-items-center rounded-full bg-white/90 text-primary shadow-soft transition hover:scale-105",
        active && "text-[#c45d7a]",
        className,
      )}
    >
      <Heart className={cn("h-4 w-4", active && "fill-current")} />
    </button>
  );
}
