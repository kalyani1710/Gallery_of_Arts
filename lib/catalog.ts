import "server-only";

import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { ProductCategory, StoreCollection, StoreProduct } from "@/types";

type ProductDocument = {
  _id: ObjectId;
  name?: string;
  slug?: string;
  category?: string;
  shopCategory?: string;
  subCategory?: string;
  price?: number;
  stock?: number;
  image?: string;
  images?: string[];
  description?: string;
  shortDescription?: string;
  active?: boolean;
  collectionSlugs?: string[];
  featured?: boolean;
  createdAt?: Date | string;
  [key: string]: unknown;
};

function toStoreProduct(document: ProductDocument): StoreProduct {
  const shopCategory = document.shopCategory || document.category || "Custom";
  const sourceCategory = document.category || shopCategory;
  const category: ProductCategory =
    sourceCategory === "Home Decor" ? "Home Décor" :
    sourceCategory === "Pooja Decor" ? "Pooja Décor" :
    sourceCategory === "Accessories" ? "Hair Accessories" :
    sourceCategory === "Keychain" ? "Keychains" :
    ["Flowers", "Keychains", "Hair Accessories", "Home Décor", "Pooja Décor", "Festival", "Gifts", "Custom"].includes(sourceCategory)
      ? sourceCategory as ProductCategory
      : "Custom";
  const name = document.name || "Handmade product";
  const description = document.description || "A handmade creation from Gallery of Arts.";
  const savedImages = Array.isArray(document.images)
    ? document.images.filter((image): image is string => typeof image === "string")
    : [];
  const images = [...new Set([
    ...(typeof document.image === "string" && document.image ? [document.image] : []),
    ...savedImages,
  ])];
  const createdAt = document.createdAt instanceof Date
    ? document.createdAt.toISOString()
    : typeof document.createdAt === "string"
      ? document.createdAt
      : new Date(0).toISOString();

  return {
    id: document._id.toString(),
    name,
    slug: document.slug || document._id.toString(),
    category,
    categorySlug: category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    price: typeof document.price === "number" ? document.price : 0,
    description,
    shortDescription: document.shortDescription || description,
    images,
    colors: Array.isArray(document.colors) ? document.colors : [],
    sizes: Array.isArray(document.sizes) ? document.sizes : [],
    stock: typeof document.stock === "number" ? document.stock : 0,
    featured: document.featured === true,
    bestSeller: document.bestSeller === true,
    customizable: document.customizable === true,
    tags: Array.isArray(document.tags) ? document.tags : [],
    material: typeof document.material === "string" ? document.material : "",
    approximateSize: typeof document.approximateSize === "string" ? document.approximateSize : "",
    handmadeDetails: typeof document.handmadeDetails === "string" ? document.handmadeDetails : "",
    collectionSlugs: Array.isArray(document.collectionSlugs) ? document.collectionSlugs : [],
    createdAt,
    rating: typeof document.rating === "number" ? document.rating : 0,
    reviewCount: typeof document.reviewCount === "number" ? document.reviewCount : 0,
    reviews: Array.isArray(document.reviews) ? document.reviews : [],
    seoTitle: typeof document.seoTitle === "string" ? document.seoTitle : name,
    seoDescription: typeof document.seoDescription === "string" ? document.seoDescription : description,
    active: document.active === true,
    shopCategory,
    ...(typeof document.subCategory === "string" && document.subCategory
      ? { subCategory: document.subCategory }
      : {}),
  };
}

type CollectionDocument = {
  _id: ObjectId;
  name: string;
  slug: string;
  description: string;
  coverImage?: string;
  published: boolean;
  createdAt?: Date | string;
};

export async function getPublicProducts(ids?: string[]): Promise<StoreProduct[]> {
  const db = await getDb();
  const collection = db.collection<ProductDocument>("products");

  if (ids) {
    const objectIds = ids
      .filter((id) => ObjectId.isValid(id))
      .map((id) => new ObjectId(id));
    if (objectIds.length === 0) return [];

    const documents = await collection
      .find({ _id: { $in: objectIds }, active: true })
      .toArray();
    return documents.map(toStoreProduct);
  }

  const documents = await collection
    .find({ active: true })
    .sort({ createdAt: -1 })
    .limit(500)
    .toArray();
  return documents.map(toStoreProduct);
}

export async function getPublicProductBySlug(slug: string): Promise<StoreProduct | null> {
  const db = await getDb();
  const document = await db.collection<ProductDocument>("products").findOne({ slug, active: true });
  return document ? toStoreProduct(document) : null;
}

function toStoreCollection(document: CollectionDocument, productCount?: number): StoreCollection {
  return {
    id: document._id.toString(),
    name: document.name,
    slug: document.slug,
    description: document.description || "",
    coverImage: document.coverImage || "",
    published: document.published === true,
    ...(productCount === undefined ? {} : { productCount }),
  };
}

export async function getPublicCollections(): Promise<StoreCollection[]> {
  const db = await getDb();
  const collections = await db.collection<CollectionDocument>("collections")
    .find({ published: true })
    .sort({ createdAt: -1, name: 1 })
    .toArray();
  if (collections.length === 0) return [];

  const slugs = collections.map((collection) => collection.slug);
  const counts = await db.collection("products").aggregate<{ _id: string; count: number }>([
    { $match: { active: true, collectionSlugs: { $in: slugs } } },
    { $unwind: "$collectionSlugs" },
    { $match: { collectionSlugs: { $in: slugs } } },
    { $group: { _id: { product: "$_id", slug: "$collectionSlugs" } } },
    { $group: { _id: "$_id.slug", count: { $sum: 1 } } },
  ]).toArray();
  const countBySlug = new Map(counts.map((entry) => [entry._id, entry.count]));
  return collections.map((collection) => toStoreCollection(collection, countBySlug.get(collection.slug) || 0));
}

export async function getPublicCollectionBySlug(slug: string): Promise<{ collection: StoreCollection; products: StoreProduct[] } | null> {
  const db = await getDb();
  const collection = await db.collection<CollectionDocument>("collections").findOne({ slug, published: true });
  if (!collection) return null;

  const documents = await db.collection<ProductDocument>("products")
    .find({ active: true, collectionSlugs: slug })
    .sort({ createdAt: -1 })
    .toArray();
  return {
    collection: toStoreCollection(collection, documents.length),
    products: documents.map(toStoreProduct),
  };
}
