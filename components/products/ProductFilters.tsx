"use client";

import { categories } from "@/data/categories";
import { cn } from "@/lib/cn";
import type { ProductSort } from "@/lib/products";

export function ProductFilters({
  category,
  minPrice,
  maxPrice,
  sort,
  onChange,
}: {
  category: string;
  minPrice: string;
  maxPrice: string;
  sort: ProductSort;
  onChange: (next: { category?: string; minPrice?: string; maxPrice?: string; sort?: ProductSort }) => void;
}) {
  return (
    <aside className="rounded-card bg-white p-5 shadow-soft">
      <h2 className="font-display text-xl text-primary">Filter</h2>
      <div className="mt-4">
        <p className="text-xs uppercase tracking-widest text-muted">Category</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChange({ category: "all" })}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm",
              category === "all" ? "bg-primary text-white" : "bg-soft-cream text-ink",
            )}
          >
            All
          </button>
          {categories
            .filter((item) => item.slug !== "custom")
            .map((item) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => onChange({ category: item.slug })}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm",
                  category === item.slug ? "bg-primary text-white" : "bg-soft-cream text-ink",
                )}
              >
                {item.name}
              </button>
            ))}
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <label className="text-sm text-muted">
          Min ₹
          <input
            type="number"
            min={0}
            value={minPrice}
            onChange={(event) => onChange({ minPrice: event.target.value })}
            className="mt-1 w-full rounded-xl border border-primary/10 px-3 py-2 text-ink"
          />
        </label>
        <label className="text-sm text-muted">
          Max ₹
          <input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(event) => onChange({ maxPrice: event.target.value })}
            className="mt-1 w-full rounded-xl border border-primary/10 px-3 py-2 text-ink"
          />
        </label>
      </div>
      <label className="mt-5 block text-sm text-muted">
        Sort by
        <select
          value={sort}
          onChange={(event) => onChange({ sort: event.target.value as ProductSort })}
          className="mt-1 w-full rounded-xl border border-primary/10 px-3 py-2 text-ink"
        >
          <option value="featured">Featured</option>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="best-selling">Best selling</option>
        </select>
      </label>
    </aside>
  );
}
