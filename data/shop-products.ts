
import type { Product } from "@/types";

export interface ShopProduct extends Product {
  shopCategory: string;
  subCategory?: string;
  priceLabel: string;
}

const handmadeDetails =
  "Handmade with pipe cleaners (fuzzy wires). Colours and shapes may vary slightly because each piece is crafted by hand.";

function makeShopProduct(
  id: number,
  name: string,
  image: string,
  price: number,
  shopCategory: string,
  options: { slug?: string; subCategory?: string } = {},
): ShopProduct {
  const slug =
    options.slug ??
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const category =
    shopCategory === "Home Decor" ? "Home Décor" :
    shopCategory === "Pooja Decor" ? "Pooja Décor" :
    shopCategory === "Accessories" ? "Hair Accessories" :
    "Keychains";

  return {
    id: `shop-${id}`,
    name,
    slug,
    category,
    categorySlug:
      category === "Home Décor" ? "home-decor" :
      category === "Pooja Décor" ? "pooja" :
      category === "Hair Accessories" ? "hair-accessories" :
      "keychains",
    price,
    description: `${name}, handmade with pipe cleaners. A colourful choice for gifting and everyday décor.`,
    shortDescription: name,
    images: [image],
    colors: ["As shown", "Custom"],
    sizes: ["One size"],
    stock: 20,
    featured: false,
    bestSeller: false,
    customizable: true,
    tags: [name.toLowerCase(), shopCategory.toLowerCase(), "handmade", "pipe cleaner", "gift"],
    material: "Pipe cleaners / fuzzy wires",
    approximateSize: "Please refer to the product image",
    handmadeDetails,
    collectionSlugs: [],
    createdAt: "2026-10-16",
    rating: 0,
    reviewCount: 0,
    reviews: [],
    seoTitle: `${name} | Handmade Craft | Gallery of Arts`,
    seoDescription: `Shop ${name}, a handmade pipe-cleaner creation from Gallery of Arts.`,
    shopCategory,
    subCategory: options.subCategory,
    priceLabel: `₹${price}`,
  };
}

export const shopProducts: ShopProduct[] = [
  makeShopProduct(1, "Blue Evil Eye Keychain", "/images/products/keychains/keychain.png", 50, "Keychains"),
  makeShopProduct(2, "Flower Fridge Magnet", "/images/products/home-decor/fridge-magnet.png", 99, "Home Decor"),
  makeShopProduct(3, "Red & White Floral Pooja Haar", "/images/products/pooja/pooja-haar-3.png", 150, "Pooja Decor"),
  makeShopProduct(4, "Orange & White Floral Pooja Haar", "/images/products/pooja/pooja-haar-1.png", 150, "Pooja Decor"),
  makeShopProduct(18, "Pink Floral Desk Decor", "/images/products/home-decor/pink-floral-desk-decor.png", 120, "Home Decor", { slug: "pink-floral-desk-decor" }),
  makeShopProduct(5, "Pink & White Floral Pooja Haar", "/images/products/pooja/pooja-haar-4.png", 150, "Pooja Decor"),
  makeShopProduct(6, "Red & Yellow Floral Pooja Haar", "/images/products/pooja/pooja-haar-2.png", 150, "Pooja Decor"),
  makeShopProduct(7, "Pink Flower Keychain", "/images/products/keychains/flower-keychain.png", 50, "Keychains"),
  makeShopProduct(8, "Mini Hat Keychain", "/images/products/keychains/hat-keychain.png", 50, "Keychains", { slug: "hat-keychain" }),
  makeShopProduct(9, "Ice Cream Keychain", "/images/products/keychains/icecream-keychain.png", 50, "Keychains", { slug: "icecream-keychain" }),
  makeShopProduct(10, "Mini Basket Keychain", "/images/products/keychains/basket-keychain.png", 50, "Keychains", { slug: "basket-keychain" }),
  makeShopProduct(11, "Pink Cherry Keychain", "/images/products/keychains/pink-cherry-keychain.png", 30, "Keychains", { slug: "pink-cherry-keychain" }),
  makeShopProduct(12, "Letter P Keychain", "/images/products/keychains/letter-p-keychain.png", 50, "Keychains", { slug: "letter-p-keychain" }),
  makeShopProduct(13, "Sunflower Hair Bun Stick", "/images/products/hair-accessories/sunflower-bun-stick.png", 120, "Accessories", { subCategory: "Hair Bun Sticks" }),
  makeShopProduct(14, "Red Floral Hair Belt", "/images/products/hair-accessories/red-floral-hair-belt.png", 120, "Accessories", { slug: "red-floral-hair-belt", subCategory: "Hair Belts" }),
  makeShopProduct(15, "Pastel Floral Hair Belt", "/images/products/hair-accessories/pastel-floral-hair-belt.png", 120, "Accessories", { slug: "pastel-floral-hair-belt", subCategory: "Hair Belts" }),
];

export function getShopProductByCartId(id: string): Product | undefined {
  return shopProducts.find((product) => product.id === id);
}
