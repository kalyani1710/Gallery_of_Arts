
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Product = {
  _id: string;
  name: string;
  slug: string;
  category: string;
  shopCategory: string;
  subCategory?: string;
  price: number;
  stock: number;
  image: string;
  images?: string[];
  description: string;
  featured: boolean;
  active: boolean;
  collectionSlugs: string[];
};

type AdminCollection = { _id: string; name: string; slug: string; published: boolean };

type ProductForm = Omit<Product, "_id" | "images"> & { images: string[] };

const emptyForm: ProductForm = {
  name: "",
  slug: "",
  category: "Keychains",
  shopCategory: "Keychains",
  subCategory: "",
  price: 50,
  stock: 20,
  image: "/images/products/keychains/keychain.png",
  images: ["/images/products/keychains/keychain.png"],
  description: "",
  featured: false,
  active: true,
  collectionSlugs: [],
};

const shopCategories = [
  "All",
  "Combo",
  "Keychains",
  "Accessories",
  "Home Decor",
  "Pooja Decor",
];

const subCategories = [
  "",
  "Hair Clips",
  "Hair Belts",
  "Hair Bun Sticks",
  "Bracelets",
];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_PRODUCT_IMAGES = 10;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<AdminCollection[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [collectionsError, setCollectionsError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadFailed, setImageUploadFailed] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [imageUploadError, setImageUploadError] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/products", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load products.");
      }

      setProducts(data.products || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load products.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCollections = useCallback(async () => {
    setCollectionsLoading(true);
    setCollectionsError("");
    try {
      const response = await fetch("/api/admin/collections", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load collections.");
      setCollections(data.collections || []);
    } catch (cause) {
      setCollectionsError(cause instanceof Error ? cause.message : "Could not load collections.");
    } finally {
      setCollectionsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
    void loadCollections();
  }, [loadProducts, loadCollections]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return products;

    return products.filter((product) =>
      [
        product.name,
        product.slug,
        product.category,
        product.shopCategory,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [products, search]);

  function startNewProduct() {
    if (uploadingImage) return;
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setNotice("");
    setImageUploadError("");
    setImageUploadFailed(false);
    setShowForm(true);
  }

  function startEditing(product: Product) {
    if (uploadingImage) return;
    const mainImage = product.image || product.images?.[0] || "";
    const images = [...new Set([mainImage, ...(Array.isArray(product.images) ? product.images : [])].filter(Boolean))];
    setForm({
      name: product.name,
      slug: product.slug,
      category: product.category,
      shopCategory: product.shopCategory,
      subCategory: product.subCategory || "",
      price: product.price,
      stock: product.stock,
      image: mainImage,
      images,
      description: product.description,
      featured: product.featured,
      active: product.active,
      collectionSlugs: Array.isArray(product.collectionSlugs) ? product.collectionSlugs : [],
    });

    setEditingId(product._id);
    setError("");
    setNotice("");
    setImageUploadError("");
    setImageUploadFailed(false);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadProductImages(files: File[]) {
    setImageUploadError("");
    if (files.some((file) => !allowedImageTypes.has(file.type))) {
      setImageUploadError("Use a JPG, PNG, or WebP image.");
      return;
    }
    if (files.some((file) => file.size === 0 || file.size > MAX_IMAGE_BYTES)) {
      setImageUploadError("Each image must be between 1 byte and 5 MB.");
      return;
    }
    if (form.images.length + files.length > MAX_PRODUCT_IMAGES) {
      setImageUploadError(`A product can have at most ${MAX_PRODUCT_IMAGES} images.`);
      return;
    }

    setUploadingImage(true);
    setImageUploadProgress(0);
    try {
      for (const [index, file] of files.entries()) {
        const data = await new Promise<{ secureUrl?: string; error?: string }>((resolve, reject) => {
          const request = new XMLHttpRequest();
          request.open("POST", "/api/admin/product-image-upload");
          request.responseType = "json";
          request.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const currentProgress = (index + event.loaded / event.total) / files.length;
              setImageUploadProgress(Math.min(99, Math.round(currentProgress * 100)));
            }
          };
          request.onload = () => {
            const result = (request.response || {}) as { secureUrl?: string; error?: string };
            if (request.status < 200 || request.status >= 300) {
              reject(new Error(result.error || `Could not upload ${file.name}.`));
            } else {
              resolve(result);
            }
          };
          request.onerror = () => reject(new Error(`Upload failed for ${file.name}. Check your connection and retry.`));
          const body = new FormData();
          body.append("file", file);
          request.send(body);
        });

        if (!data.secureUrl) throw new Error(data.error || `The server did not return a URL for ${file.name}.`);
        setForm((current) => {
          const shouldPromoteUpload = !editingId && (!current.image || current.image === emptyForm.image);
          const previousImages = shouldPromoteUpload
            ? current.images.filter((image) => image !== emptyForm.image)
            : current.images;
          const uniqueImages = [...new Set([...previousImages, data.secureUrl!])];
          const images = shouldPromoteUpload
            ? [data.secureUrl!, ...uniqueImages.filter((image) => image !== data.secureUrl)]
            : uniqueImages;
          return { ...current, image: images[0], images };
        });
      }
      setImageUploadProgress(100);
      setImageUploadFailed(false);
    } catch (cause) {
      setImageUploadError(cause instanceof Error ? cause.message : "Could not upload this image.");
      setImageUploadFailed(true);
    } finally {
      setUploadingImage(false);
    }
  }

  function makeMainImage(index: number) {
    setForm((current) => {
      const images = [current.images[index], ...current.images.filter((_, imageIndex) => imageIndex !== index)];
      return { ...current, image: images[0], images };
    });
  }

  function moveImage(index: number, offset: -1 | 1) {
    const destination = index + offset;
    if (destination < 0 || destination >= form.images.length) return;
    setForm((current) => {
      const images = [...current.images];
      [images[index], images[destination]] = [images[destination], images[index]];
      return { ...current, image: images[0], images };
    });
  }

  function removeImage(index: number) {
    if (form.images.length <= 1) {
      setImageUploadError("Keep at least one product image. You can replace it with another image.");
      return;
    }
    setForm((current) => {
      const images = current.images.filter((_, imageIndex) => imageIndex !== index);
      return { ...current, image: images[0], images };
    });
  }

  function updateMainImage(value: string) {
    setForm((current) => {
      const images = value ? [value, ...current.images.filter((image) => image !== value)] : current.images;
      return { ...current, image: value, images };
    });
  }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (uploadingImage || imageUploadFailed) return;
    setSaving(true);
    setError("");
    setNotice("");

    const payload = {
      ...form,
      name: form.name.trim(),
      slug: form.slug.trim() || makeSlug(form.name),
      price: Number(form.price),
      stock: Number(form.stock),
      subCategory: form.subCategory || "",
      image: form.images[0] || form.image,
      images: form.images,
    };

    try {
      const response = await fetch(
        editingId
          ? `/api/admin/products/${editingId}`
          : "/api/admin/products",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not save product.");
      }

      setNotice(editingId ? "Product updated successfully." : "Product added successfully.");
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save product.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/admin/products/${product._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not delete product.");
      }

      setNotice(`${product.name} was deleted.`);
      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete product.",
      );
    }
  }

  async function toggleActive(product: Product) {
    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/admin/products/${product._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: product.name,
          slug: product.slug,
          category: product.category,
          shopCategory: product.shopCategory,
          subCategory: product.subCategory || "",
          price: product.price,
          stock: product.stock,
          image: product.image,
          images: product.images?.length ? product.images : [product.image],
          description: product.description,
          featured: product.featured,
          active: !product.active,
          collectionSlugs: product.collectionSlugs || [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not update product status.");
      }

      setNotice(
        `${product.name} is now ${product.active ? "hidden" : "visible"} in the product records.`,
      );
      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update product.",
      );
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-gallery-border bg-soft-cream px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-card border border-gallery-border bg-white p-5 shadow-card">
          <p className="text-sm text-muted">Total products</p>
          <p className="mt-2 font-display text-3xl font-medium">{products.length}</p>
        </div>
        <div className="rounded-card border border-gallery-border bg-white p-5 shadow-card">
          <p className="text-sm text-muted">Visible products</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-700">
            {products.filter((product) => product.active).length}
          </p>
        </div>
        <div className="rounded-card border border-gallery-border bg-white p-5 shadow-card">
          <p className="text-sm text-muted">Low stock (5 or fewer)</p>
          <p className="mt-2 text-3xl font-semibold text-amber-700">
            {products.filter((product) => product.stock <= 5).length}
          </p>
        </div>
      </section>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {notice && (
        <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          {notice}
        </div>
      )}

      <section className="overflow-hidden rounded-card border border-gallery-border bg-white shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gallery-border p-5 md:p-6">
          <div>
            <h2 className="font-display text-xl font-medium">Your products</h2>
            <p className="mt-1 text-sm text-muted">
              Manage your handmade product catalogue.
            </p>
          </div>

          <button
            type="button"
            disabled={uploadingImage}
            onClick={startNewProduct}
            className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Add product
          </button>
        </div>

        {showForm && (
          <form onSubmit={saveProduct} className="border-b border-gallery-border bg-soft-cream/60 p-5 md:p-7">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-medium">
                  {editingId ? "Edit product" : "Add a new product"}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  Use an image path that already exists in your public folder.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm font-medium">
                Product name *
                <input
                  required
                  maxLength={120}
                  className={inputClass}
                  value={form.name}
                  onChange={(event) => {
                    const name = event.target.value;
                    setForm((current) => ({
                      ...current,
                      name,
                      slug: makeSlug(name),
                    }));
                  }}
                  placeholder="e.g. Pink Flower Keychain"
                />
              </label>

              <label className="text-sm font-medium">
                Product slug *
                <input
                  required
                  maxLength={140}
                  className={inputClass}
                  value={form.slug}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      slug: makeSlug(event.target.value),
                    }))
                  }
                  placeholder="pink-flower-keychain"
                />
              </label>

              <label className="text-sm font-medium">
                Price (₹) *
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass}
                  value={form.price}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      price: Number(event.target.value),
                    }))
                  }
                />
              </label>

              <label className="text-sm font-medium">
                Stock quantity *
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  className={inputClass}
                  value={form.stock}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      stock: Number(event.target.value),
                    }))
                  }
                />
              </label>

              <label className="text-sm font-medium">
                Shop category *
                <select
                  required
                  className={inputClass}
                  value={form.shopCategory}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      shopCategory: event.target.value,
                      category: event.target.value,
                    }))
                  }
                >
                  {shopCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium">
                Accessory type (optional)
                <select
                  className={inputClass}
                  value={form.subCategory || ""}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      subCategory: event.target.value,
                    }))
                  }
                >
                  {subCategories.map((category) => (
                    <option key={category || "none"} value={category}>
                      {category || "No subcategory"}
                    </option>
                  ))}
                </select>
              </label>

              <fieldset className="rounded-xl border border-[#EAE3ED] bg-white p-4 text-sm md:col-span-2">
                <legend className="px-1 font-semibold">Collections (optional)</legend>
                <label className="block font-medium" htmlFor="product-collections">
                  Add this product to a collection
                </label>
                <select
                  id="product-collections"
                  aria-describedby="product-collections-help"
                  disabled={collectionsLoading || !!collectionsError || collections.length === 0}
                  value=""
                  onChange={(event) => {
                    const slug = event.target.value;
                    if (!slug) return;
                    setForm((current) => ({
                      ...current,
                      collectionSlugs: [...new Set([...current.collectionSlugs, slug])],
                    }));
                  }}
                  className={inputClass}
                >
                  <option value="">
                    {collectionsLoading ? "Loading collections…" : collectionsError ? "Collections could not be loaded" : collections.length === 0 ? "No collections available" : "Choose a collection…"}
                  </option>
                  {collections.filter((collection) => !form.collectionSlugs.includes(collection.slug)).map((collection) => (
                    <option key={collection._id} value={collection.slug}>
                      {collection.name}{collection.published ? "" : " (unpublished)"}
                    </option>
                  ))}
                </select>
                <div id="product-collections-help" className="mt-3">
                  {collectionsLoading ? (
                    <p role="status" className="text-gray-500">Loading collections…</p>
                  ) : collectionsError ? (
                    <div className="flex flex-wrap items-center gap-3" role="alert">
                      <p className="text-rose-700">{collectionsError}</p>
                      <button type="button" onClick={() => void loadCollections()} className="font-semibold text-pink-600 underline">Retry</button>
                    </div>
                  ) : collections.length === 0 ? (
                    <p className="text-gray-600">Create a collection before assigning products. <Link href="/admin/collections" className="font-semibold text-pink-600 underline">Manage collections</Link>.</p>
                  ) : null}
                </div>
                {form.collectionSlugs.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-2" aria-label="Selected collections">
                    {form.collectionSlugs.map((slug) => {
                      const collection = collections.find((item) => item.slug === slug);
                      return (
                        <li key={slug} className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-3 py-1.5 text-sm text-[#49333C]">
                          <span>{collection?.name || slug}</span>
                          <button
                            type="button"
                            aria-label={`Remove ${collection?.name || slug} collection`}
                            onClick={() => setForm((current) => ({
                              ...current,
                              collectionSlugs: current.collectionSlugs.filter((item) => item !== slug),
                            }))}
                            className="font-bold text-pink-700 hover:text-pink-900"
                          >
                            ×
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </fieldset>

              <label className="text-sm font-medium md:col-span-2">
                <span className="block">Upload Image</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploadingImage}
                  onChange={(event) => {
                    const files = Array.from(event.currentTarget.files || []);
                    event.currentTarget.value = "";
                    if (files.length) void uploadProductImages(files);
                  }}
                  className="mt-2 block w-full rounded-xl border border-gallery-border bg-white px-4 py-3 text-sm text-ink file:mr-4 file:rounded-full file:border-0 file:bg-soft-pink file:px-4 file:py-2 file:font-medium file:text-primary disabled:opacity-60"
                  aria-describedby="product-image-upload-help product-image-upload-status"
                />
                <span id="product-image-upload-help" className="mt-2 block text-xs font-normal text-muted">
                  Select one or more JPG, PNG, or WebP files · up to 5 MB each · maximum {MAX_PRODUCT_IMAGES} images.
                </span>
                {uploadingImage && (
                  <div id="product-image-upload-status" className="mt-3" role="status" aria-live="polite">
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>Uploading image…</span><span>{imageUploadProgress}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-soft-cream" role="progressbar" aria-label="Image upload progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={imageUploadProgress}>
                      <div className="h-full rounded-full bg-primary transition-[width] duration-200" style={{ width: `${imageUploadProgress}%` }} />
                    </div>
                  </div>
                )}
                {imageUploadError && <p id="product-image-upload-status" role="alert" className="mt-2 text-sm text-rose-700">{imageUploadError}</p>}
              </label>

              <label className="text-sm font-medium md:col-span-2">
                Main image URL or local path *
                <input
                  required
                  maxLength={500}
                  disabled={uploadingImage}
                  className={inputClass}
                  value={form.image}
                  onChange={(event) => updateMainImage(event.target.value)}
                  placeholder="/images/products/keychains/keychain.png or Cloudinary URL"
                />
                <span className="mt-2 block text-xs font-normal text-muted">
                  The main image appears on product cards, in the cart, and first in the customer gallery. Existing local paths remain supported.
                </span>
              </label>

              {form.images.length > 0 && (
                <div className="md:col-span-2">
                  <p className="mb-3 text-sm font-medium">Product image gallery · {form.images.length}</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {form.images.map((image, index) => (
                      <div key={`${image}-${index}`} className={`overflow-hidden rounded-xl border bg-white ${index === 0 ? "border-primary ring-2 ring-primary/15" : "border-gallery-border"}`}>
                        <div className="relative aspect-square bg-soft-cream">
                          <Image src={image} alt={`Product image ${index + 1}`} fill sizes="(max-width: 640px) 50vw, 180px" className="object-contain p-2" unoptimized />
                        </div>
                        <div className="space-y-2 p-2">
                          <span className={`block text-center text-xs font-medium ${index === 0 ? "text-primary" : "text-muted"}`}>
                            {index === 0 ? "Main image" : `Image ${index + 1}`}
                          </span>
                          {index !== 0 && (
                            <button type="button" disabled={uploadingImage} onClick={() => makeMainImage(index)} className="w-full rounded-full bg-soft-pink px-2 py-1.5 text-xs font-medium text-primary disabled:opacity-50">
                              Make main
                            </button>
                          )}
                          <div className="flex items-center justify-center gap-1">
                            <button type="button" disabled={uploadingImage || index === 0} onClick={() => moveImage(index, -1)} aria-label={`Move image ${index + 1} earlier`} className="rounded-full border border-gallery-border px-2 py-1 text-xs disabled:opacity-40">←</button>
                            <button type="button" disabled={uploadingImage || index === form.images.length - 1} onClick={() => moveImage(index, 1)} aria-label={`Move image ${index + 1} later`} className="rounded-full border border-gallery-border px-2 py-1 text-xs disabled:opacity-40">→</button>
                            <button type="button" disabled={uploadingImage} onClick={() => removeImage(index)} aria-label={`Remove image ${index + 1}`} className="rounded-full border border-red-200 px-2 py-1 text-xs text-red-700 disabled:opacity-40">Remove</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <label className="text-sm font-medium md:col-span-2">
                Description
                <textarea
                  rows={4}
                  maxLength={2000}
                  className={inputClass}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Describe your handmade creation..."
                />
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-gallery-border p-4 text-sm">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      featured: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-primary"
                />
                Mark as featured
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-gallery-border p-4 text-sm">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      active: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-primary"
                />
                Product is active
              </label>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving || uploadingImage || imageUploadFailed}
                className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : editingId ? "Save changes" : "Add product"}
              </button>
              <button
                type="button"
                disabled={uploadingImage}
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                className="rounded-full border border-gallery-border bg-white px-6 py-3 text-sm font-medium transition hover:bg-soft-pink disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="border-b border-gallery-border p-5">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products by name or category..."
            className="w-full rounded-xl border border-gallery-border bg-soft-cream px-4 py-3 text-sm text-ink outline-none focus:border-primary md:max-w-md"
          />
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-gray-500">
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-semibold">No products found</p>
            <p className="mt-2 text-sm text-gray-500">
              Add a product, or try a different search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-soft-cream text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-4 font-semibold">Product</th>
                  <th className="px-5 py-4 font-semibold">Category</th>
                  <th className="px-5 py-4 font-semibold">Price</th>
                  <th className="px-5 py-4 font-semibold">Stock</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gallery-border">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="transition hover:bg-soft-cream/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gallery-border bg-white">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div>
                          <p className="font-medium text-ink">
                            {product.name}
                          </p>
                          <p className="mt-1 text-xs text-muted">
                            {product.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {product.shopCategory || product.category}
                      {product.subCategory && (
                        <span className="mt-1 block text-xs text-muted">
                          {product.subCategory}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-semibold">
                      ₹{product.price.toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-4">
                      <span className={product.stock <= 5 ? "font-semibold text-amber-700" : "text-gray-600"}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        product.active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {product.active ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(product)}
                          className="rounded-full border border-gallery-border px-3 py-2 text-xs font-medium transition hover:bg-soft-pink"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void toggleActive(product)}
                          className="rounded-full border border-gallery-border px-3 py-2 text-xs font-medium transition hover:bg-soft-cream"
                        >
                          {product.active ? "Hide" : "Show"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteProduct(product)}
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-center text-xs text-gray-400">
        Gallery of Arts · Product management
      </p>
    </div>
  );
}
