export type ProductCategory =
  | "Flowers"
  | "Keychains"
  | "Hair Accessories"
  | "Home Décor"
  | "Pooja Décor"
  | "Festival"
  | "Gifts"
  | "Custom";

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  sample: true;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  categorySlug: string;
  price: number;
  compareAtPrice?: number;
  priceNote?: string;
  description: string;
  shortDescription: string;
  images: string[];
  colors: string[];
  sizes: string[];
  stock: number;
  featured: boolean;
  bestSeller: boolean;
  customizable: boolean;
  tags: string[];
  material: string;
  approximateSize: string;
  handmadeDetails: string;
  collectionSlugs: string[];
  createdAt: string;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  seoTitle: string;
  seoDescription: string;
}

export type StoreProduct = Pick<
  Product,
  | "id"
  | "name"
  | "slug"
  | "category"
  | "categorySlug"
  | "price"
  | "description"
  | "shortDescription"
  | "images"
  | "colors"
  | "sizes"
  | "stock"
  | "featured"
  | "bestSeller"
  | "customizable"
  | "tags"
  | "material"
  | "approximateSize"
  | "handmadeDetails"
  | "collectionSlugs"
  | "createdAt"
  | "rating"
  | "reviewCount"
  | "reviews"
  | "seoTitle"
  | "seoDescription"
> & {
  active: boolean;
  shopCategory: string;
  subCategory?: string;
};

export interface Category {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  description: string;
  href: string;
  accent: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  bannerAccent: string;
  productIds: string[];
}

export interface StoreCollection {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  published: boolean;
  productCount?: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
  color?: string;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  color?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  customer: CheckoutDetails;
  subtotal: number;
  shipping: number;
  total: number;
  status: "pending" | "placed-via-whatsapp";
  createdAt: string;
}

export interface CheckoutDetails {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  notes?: string;
}

export interface CustomOrder {
  name: string;
  phone: string;
  email: string;
  productType: string;
  preferredColors: string;
  quantity: number;
  budget: string;
  occasion: string;
  requiredDate: string;
  details: string;
  referenceImage?: string;
}

export interface Tutorial {
  id: string;
  title: string;
  slug: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  materials: string[];
  description: string;
  youtubeUrl: string;
  thumbnail: string;
}

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  productSlug?: string;
}
