"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { isValidProductImage } from "@/lib/product-image";

type Collection = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  published: boolean;
  productCount: number;
};

type FormData = Omit<Collection, "_id" | "productCount">;
const blankForm: FormData = { name: "", slug: "", description: "", coverImage: "", published: false };
const MAX_COVER_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_COVER_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function makeSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function CollectionManager() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [form, setForm] = useState<FormData>(blankForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [coverUploadError, setCoverUploadError] = useState("");
  const [coverUploadFailed, setCoverUploadFailed] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadCollections = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/collections", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load collections.");
      setCollections(data.collections || []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load collections.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadCollections(); }, [loadCollections]);

  function startCreate() {
    setForm({ ...blankForm });
    setEditingId(null);
    setError("");
    setNotice("");
    setCoverUploadError("");
    setCoverUploadFailed(false);
    setUploadProgress(0);
    setFormOpen(true);
  }

  function startEdit(collection: Collection) {
    setForm({ name: collection.name, slug: collection.slug, description: collection.description, coverImage: collection.coverImage || "", published: collection.published });
    setEditingId(collection._id);
    setError("");
    setNotice("");
    setCoverUploadError("");
    setCoverUploadFailed(false);
    setUploadProgress(0);
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function uploadCover(file: File) {
    setCoverUploadError("");
    setUploadProgress(0);
    if (!ALLOWED_COVER_IMAGE_TYPES.has(file.type)) {
      setCoverUploadError("Use a JPG, PNG, or WebP image.");
      setCoverUploadFailed(true);
      return;
    }
    if (file.size === 0 || file.size > MAX_COVER_IMAGE_BYTES) {
      setCoverUploadError("Choose an image between 1 byte and 5 MB.");
      setCoverUploadFailed(true);
      return;
    }

    setUploadingCover(true);
    setCoverUploadFailed(false);
    const payload = new FormData();
    payload.set("file", file);
    const request = new XMLHttpRequest();
    request.open("POST", "/api/admin/product-image-upload");
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) setUploadProgress(Math.round((event.loaded / event.total) * 100));
    });
    request.addEventListener("load", () => {
      let data: { secureUrl?: unknown; error?: unknown } = {};
      try { data = JSON.parse(request.responseText) as typeof data; } catch { /* handled below */ }
      if (request.status < 200 || request.status >= 300 || typeof data.secureUrl !== "string" || !isValidProductImage(data.secureUrl)) {
        setCoverUploadError(typeof data.error === "string" ? data.error : "The cover image upload failed. Please retry.");
        setCoverUploadFailed(true);
      } else {
        setForm((current) => ({ ...current, coverImage: data.secureUrl as string }));
        setUploadProgress(100);
      }
      setUploadingCover(false);
    });
    request.addEventListener("error", () => {
      setCoverUploadError("Could not reach the image upload service. Check your connection and retry.");
      setCoverUploadFailed(true);
      setUploadingCover(false);
    });
    request.addEventListener("abort", () => {
      setCoverUploadError("The cover image upload was interrupted. Please retry.");
      setCoverUploadFailed(true);
      setUploadingCover(false);
    });
    request.send(payload);
  }

  async function saveCollection(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (uploadingCover || coverUploadFailed) {
      setError(uploadingCover ? "Wait for the cover image upload to finish." : "The cover image upload failed. Retry the upload or remove the cover image before saving.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(editingId ? `/api/admin/collections/${editingId}` : "/api/admin/collections", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, name: form.name.trim(), slug: form.slug.trim() || makeSlug(form.name) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save collection.");
      setNotice(editingId ? "Collection updated." : "Collection created.");
      setFormOpen(false);
      setEditingId(null);
      setForm({ ...blankForm });
      await loadCollections();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save collection.");
    } finally {
      setSaving(false);
    }
  }

  async function changePublished(collection: Collection, published: boolean) {
    setBusyId(collection._id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/collections/${collection._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...collection, published }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update collection.");
      setNotice(`${collection.name} is now ${published ? "published" : "unpublished"}.`);
      await loadCollections();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update collection.");
    } finally {
      setBusyId("");
    }
  }

  async function deleteCollection(collection: Collection) {
    if (!window.confirm(`Delete “${collection.name}”? Products will remain and be unassigned from this collection.`)) return;
    setBusyId(collection._id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/collections/${collection._id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not delete collection.");
      setNotice(`${collection.name} was deleted.`);
      if (editingId === collection._id) {
        setEditingId(null);
        setFormOpen(false);
        setForm({ ...blankForm });
      }
      await loadCollections();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete collection.");
    } finally {
      setBusyId("");
    }
  }

  const inputClass = "mt-2 w-full rounded-xl border border-gallery-border bg-soft-cream px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/10";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">Create and publish customer-facing collections. Product assignments are managed in Product Management.</p>
        <button type="button" disabled={uploadingCover} onClick={startCreate} className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-50">Add collection</button>
      </div>

      {error && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}
      {notice && <p role="status" className="rounded-xl bg-green-50 p-4 text-sm text-green-800">{notice}</p>}

      {formOpen && (
        <form onSubmit={saveCollection} className="rounded-card border border-gallery-border bg-white p-6 shadow-card">
          <h2 className="font-display text-xl font-medium">{editingId ? "Edit collection" : "New collection"}</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label className="text-sm font-medium">Collection name *
              <input required minLength={2} maxLength={120} className={inputClass} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value, ...(!editingId ? { slug: makeSlug(event.target.value) } : {}) }))} />
            </label>
            <label className="text-sm font-medium">URL slug *
              <input required maxLength={140} pattern="[a-z0-9]+(-[a-z0-9]+)*" className={inputClass} value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: makeSlug(event.target.value) }))} placeholder="summer-gifts" />
            </label>
            <label className="text-sm font-medium md:col-span-2">Description
              <textarea rows={3} maxLength={2000} className={inputClass} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            </label>
            <div className="text-sm font-medium md:col-span-2">Cover image (optional)
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center rounded-full border border-gallery-border px-5 py-3 text-sm font-medium transition hover:bg-soft-pink has-[:disabled]:cursor-wait has-[:disabled]:opacity-60">
                  {uploadingCover ? `Uploading… ${uploadProgress}%` : form.coverImage ? "Replace cover image" : "Upload cover image"}
                  <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingCover} className="sr-only" onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    event.currentTarget.value = "";
                    if (file) uploadCover(file);
                  }} />
                </label>
                {(form.coverImage || coverUploadFailed) && <button type="button" disabled={uploadingCover} onClick={() => {
                  setForm((current) => ({ ...current, coverImage: "" }));
                  setCoverUploadError("");
                  setCoverUploadFailed(false);
                  setUploadProgress(0);
                }} className="rounded-full border border-gallery-border px-5 py-3 text-sm font-medium transition hover:bg-soft-pink disabled:opacity-50">{form.coverImage ? "Remove cover" : "Clear failed upload"}</button>}
                {uploadingCover && <span role="status" className="text-sm text-muted">Uploading securely… {uploadProgress}%</span>}
              </div>
              {uploadingCover && <progress aria-label="Cover image upload progress" max={100} value={uploadProgress} className="mt-3 h-2 w-full accent-primary" />}
              {coverUploadError && <p role="alert" className="mt-2 text-sm text-rose-700">{coverUploadError}</p>}
              <label className="mt-4 block text-xs font-normal text-muted">Or use an existing local image path
              <input maxLength={500} className={inputClass} value={form.coverImage} onChange={(event) => setForm((current) => ({ ...current, coverImage: event.target.value }))} placeholder="/images/products/home-decor/example.png" />
              </label>
              <span className="mt-2 block text-xs font-normal text-muted">JPG, PNG, or WebP up to 5 MB.</span>
            </div>
            {form.coverImage && (
              <div className="md:col-span-2">
                <div className="relative h-44 w-full max-w-sm overflow-hidden rounded-xl border border-gallery-border bg-soft-cream">
                  <Image src={form.coverImage} alt="Collection cover preview" fill sizes="384px" className="object-cover" unoptimized />
                </div>
              </div>
            )}
            <label className="flex items-center gap-3 rounded-xl border border-gallery-border p-4 text-sm md:col-span-2">
              <input type="checkbox" checked={form.published} onChange={(event) => setForm((current) => ({ ...current, published: event.target.checked }))} className="h-4 w-4 accent-primary" />
              Publish this collection on the website
            </label>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="submit" disabled={saving || uploadingCover || coverUploadFailed} className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-dark disabled:cursor-wait disabled:opacity-60">{saving ? "Saving…" : uploadingCover ? "Uploading cover…" : editingId ? "Save changes" : "Create collection"}</button>
            <button type="button" disabled={uploadingCover} onClick={() => { setFormOpen(false); setEditingId(null); setForm({ ...blankForm }); setCoverUploadError(""); setCoverUploadFailed(false); setUploadProgress(0); }} className="rounded-full border border-gallery-border px-6 py-3 text-sm font-medium transition hover:bg-soft-pink disabled:opacity-50">Cancel</button>
          </div>
        </form>
      )}

      <section className="overflow-hidden rounded-card border border-gallery-border bg-white shadow-card">
        {loading ? (
          <p role="status" className="p-10 text-center text-sm text-gray-600">Loading collections…</p>
        ) : collections.length === 0 ? (
          <p className="p-10 text-center text-sm text-gray-600">No collections yet. Add one to make it available for product assignment.</p>
        ) : (
          <div className="divide-y divide-gallery-border">
            {collections.map((collection) => (
              <article key={collection._id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-soft-cream sm:w-32">
                  {collection.coverImage ? <Image src={collection.coverImage} alt={collection.name} fill sizes="128px" className="object-cover" unoptimized /> : <div className="flex h-full items-center justify-center text-xs text-gray-500">No cover image</div>}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-ink">{collection.name}</h3>
                  <p className="mt-1 text-xs text-gray-500">/collections/{collection.slug} · {collection.productCount} assigned products</p>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">{collection.description || "No description"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${collection.published ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>{collection.published ? "Published" : "Unpublished"}</span>
                  <button type="button" disabled={busyId === collection._id} onClick={() => startEdit(collection)} className="rounded-full border border-gallery-border px-3 py-2 text-sm font-medium transition hover:bg-soft-pink disabled:opacity-50">Edit</button>
                  <button type="button" disabled={busyId === collection._id} onClick={() => void changePublished(collection, !collection.published)} className="rounded-full border border-gallery-border px-3 py-2 text-sm font-medium transition hover:bg-soft-pink disabled:opacity-50">{busyId === collection._id ? "Saving…" : collection.published ? "Unpublish" : "Publish"}</button>
                  <button type="button" disabled={busyId === collection._id} onClick={() => void deleteCollection(collection)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 disabled:opacity-50">Delete</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
