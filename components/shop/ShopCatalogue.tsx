"use client";

import { useState } from "react";
import ShopProductCard from "@/components/shop/ShopProductCard";
import type { StoreProduct } from "@/types";

const baseCategories = ["All Products", "Combo", "Keychains", "Accessories", "Home Decor", "Pooja Decor"];
const accessorySubCategories = ["Hair Clips", "Hair Belts", "Hair Bun Sticks", "Bracelets"];

export default function ShopCatalogue({ products, initialCategory }: { products: StoreProduct[]; initialCategory?: string }) {
  const categories = [...new Set([
    ...baseCategories,
    ...products.map((product) => product.shopCategory),
  ])];
  const [selectedCategory, setSelectedCategory] = useState(() => categories.includes(initialCategory || "") ? initialCategory! : "All Products");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const filteredProducts = products.filter((product) => {
    const categoryMatches = selectedCategory === "All Products" || product.shopCategory === selectedCategory;
    const subCategoryMatches = !selectedSubCategory || product.subCategory === selectedSubCategory;
    return categoryMatches && subCategoryMatches;
  });

  return (
    <main className="min-h-screen bg-gallery-paper">
      <section className="page-container section-space">
        <header className="mx-auto mb-12 max-w-2xl text-center">
          <p className="editorial-eyebrow">Made slowly, made with love</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-ink sm:text-5xl">Shop Handmade Crafts</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted sm:text-base">
            Discover handmade pipe cleaner creations crafted with love.
          </p>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10">
          <aside className="h-fit rounded-card border border-gallery-border bg-white p-5 shadow-card lg:sticky lg:top-28">
            <h2 className="mb-5 font-serif text-xl font-semibold text-ink">Categories</h2>
            <ul className="space-y-3">
              {categories.map((category) => (
                <li key={category}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category);
                      setSelectedSubCategory("");
                    }}
                    className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${selectedCategory === category ? "bg-primary text-white shadow-sm" : "text-muted hover:bg-soft-pink hover:text-primary"}`}
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>
            {selectedCategory === "Accessories" && (
              <div className="mt-6 border-t border-gallery-border pt-6">
                <h3 className="mb-3 text-sm font-semibold text-ink">Accessory Types</h3>
                <ul className="space-y-2">
                  {accessorySubCategories.map((subCategory) => (
                    <li key={subCategory}>
                      <button
                        type="button"
                        onClick={() => setSelectedSubCategory(subCategory)}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${selectedSubCategory === subCategory ? "bg-primary text-white" : "text-muted hover:bg-soft-pink hover:text-primary"}`}
                      >
                        {subCategory}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          <div>
            <h2 className="mb-6 flex items-baseline gap-3 font-serif text-2xl font-semibold text-ink">
              {selectedCategory} <span className="font-sans text-sm font-normal text-muted">{filteredProducts.length} pieces</span>
            </h2>
            {filteredProducts.length ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => <ShopProductCard key={product.id} product={product} />)}
              </div>
            ) : (
              <div className="rounded-card border border-gallery-border bg-white px-6 py-20 text-center text-muted shadow-card">
                <p className="font-serif text-xl text-ink">No pieces in this selection yet</p>
                <p className="mt-2 text-sm">Choose another category to continue exploring.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
