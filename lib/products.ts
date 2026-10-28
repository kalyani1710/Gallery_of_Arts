import { collections } from "@/data/collections";
import { products } from "@/data/products";
import type { Product } from "@/types";
import { getShopProductByCartId } from "@/data/shop-products";

export type ProductSort =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "best-selling";

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getProductById(id: string) {
  return (
    products.find((product) => product.id === id) ??
    getShopProductByCartId(id)
  );
}

export function getRelatedProducts(product: Product, limit = 4) {
  return products
    .filter(
      (item) =>
        item.id !== product.id &&
        (item.categorySlug === product.categorySlug ||
          item.tags.some((tag) => product.tags.includes(tag))),
    )
    .slice(0, limit);
}

export function getBestSellers() {
  return products.filter((product) => product.bestSeller);
}

export function getFeaturedProducts() {
  return products.filter((product) => product.featured);
}

export function getProductsByCollection(slug: string) {
  const collection = collections.find((item) => item.slug === slug);
  if (!collection) return [];
  return collection.productIds
    .map((id) => getProductById(id))
    .filter((item): item is Product => Boolean(item));
}

export function searchProducts(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter((product) => {
    const haystack = [
      product.name,
      product.category,
      product.shortDescription,
      ...product.tags,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function filterAndSortProducts(input: {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
}) {
  let list = input.query ? searchProducts(input.query) : [...products];

  if (input.category && input.category !== "all") {
    list = list.filter((product) => product.categorySlug === input.category);
  }

  if (typeof input.minPrice === "number") {
    list = list.filter((product) => product.price >= input.minPrice!);
  }

  if (typeof input.maxPrice === "number") {
    list = list.filter((product) => product.price <= input.maxPrice!);
  }

  switch (input.sort) {
    case "newest":
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "price-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "best-selling":
      list.sort((a, b) => Number(b.bestSeller) - Number(a.bestSeller) || b.rating - a.rating);
      break;
    default:
      list.sort((a, b) => Number(b.featured) - Number(a.featured) || Number(b.bestSeller) - Number(a.bestSeller));
  }

  return list;
}
