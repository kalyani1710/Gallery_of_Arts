"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ScrollReveal } from "@/components/motion/Reveal";
const initialForm = {
  name: "",
  phone: "",
  email: "",
  productType: "",
  preferredColors: "",
  quantity: "1",
  budget: "",
  occasion: "",
  requiredDate: "",
  details: "",
};
const maxReferenceImageBytes = 5 * 1024 * 1024;
const allowedReferenceImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const inputClass =
  "w-full rounded-xl border border-gallery-border bg-soft-cream px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/10";

export default function CustomOrdersPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [referenceImage, setReferenceImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUploadError, setImageUploadError] = useState("");
  const [imageUploadFailed, setImageUploadFailed] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    const checkSession = () => {
      void fetch("/api/auth/session", { cache: "no-store" })
        .then((response) => response.json())
        .then((data: { userId?: unknown }) => { if (active) setSignedIn(typeof data.userId === "string"); })
        .catch(() => { if (active) setSignedIn(false); });
    };
    checkSession();
    window.addEventListener("focus", checkSession);
    return () => { active = false; window.removeEventListener("focus", checkSession); };
  }, []);

  function uploadReferenceImage(file: File) {
    setImageUploadError("");
    setUploadProgress(0);
    if (!allowedReferenceImageTypes.has(file.type)) {
      setImageUploadError("Use a JPG, PNG, or WebP image.");
      setImageUploadFailed(true);
      return;
    }
    if (file.size === 0 || file.size > maxReferenceImageBytes) {
      setImageUploadError("Choose an image between 1 byte and 5 MB.");
      setImageUploadFailed(true);
      return;
    }

    setUploadingImage(true);
    setImageUploadFailed(false);
    const body = new FormData();
    body.set("file", file);
    const request = new XMLHttpRequest();
    request.open("POST", "/api/custom-orders/reference-image-upload");
    request.responseType = "json";
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) setUploadProgress(Math.round((event.loaded / event.total) * 100));
    });
    request.addEventListener("load", () => {
      const result = (request.response || {}) as { secureUrl?: unknown; error?: unknown };
      if (request.status < 200 || request.status >= 300 || typeof result.secureUrl !== "string") {
        setImageUploadError(typeof result.error === "string" ? result.error : "The reference image could not be uploaded. Please retry.");
        setImageUploadFailed(true);
      } else {
        setReferenceImage(result.secureUrl);
        setUploadProgress(100);
      }
      setUploadingImage(false);
    });
    request.addEventListener("error", () => {
      setImageUploadError("Could not reach the image upload service. Check your connection and retry.");
      setImageUploadFailed(true);
      setUploadingImage(false);
    });
    request.send(body);
  }
  function updateField(
    field: keyof typeof initialForm,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (uploadingImage || imageUploadFailed) {
      setMessage(uploadingImage ? "Wait for the reference image upload to finish." : "The reference image upload failed. Retry or clear it before submitting.");
      setSuccess(false);
      return;
    }
    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const response = await fetch("/api/custom-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
          referenceImage,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Could not submit your request."
        );
      }

      setSuccess(true);
setMessage("Your custom order was submitted successfully! Redirecting...");

setTimeout(() => {
  router.push("/account");
  router.refresh();
}, 1000);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gallery-paper py-12 text-ink md:py-20">
      <div className="page-container-narrow">
        <ScrollReveal>
        <div className="mb-10 text-center">
          <p className="editorial-eyebrow mb-3">
            Made just for you
          </p>

          <h1 className="font-display text-4xl font-medium tracking-tight md:text-5xl">
            Custom Orders
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted md:text-lg">
            Have a special idea in mind? Tell us about your
            dream handmade creation, and Gallery of Arts will
            help bring it to life.
          </p>
        </div>
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-card border border-gallery-border bg-white p-5 shadow-card md:p-10"
        >
          <section>
            <h2 className="mb-5 font-display text-xl font-medium text-ink">
              Your Details
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-ink">
                  Full Name *
                </label>
                <input
                  required
                  maxLength={100}
                  autoComplete="name"
                  className={inputClass}
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-ink">
                  Email Address *
                </label>
                <input
                  required
                  type="email"
                  maxLength={254}
                  autoComplete="email"
                  className={inputClass}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-ink">
                  Phone Number
                </label>
                <input
                  type="tel"
                  maxLength={30}
                  autoComplete="tel"
                  className={inputClass}
                  placeholder="Enter your phone number"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </div>
            </div>
          </section>

          <div className="h-px bg-[#F0E3DC]" />

          <section>
            <h2 className="mb-5 font-display text-xl font-medium text-ink">
              Your Handmade Creation
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-ink">
                  Product Type *
                </label>
                <input
                  required
                  maxLength={100}
                  className={inputClass}
                  placeholder="e.g. Flower bouquet, keychain, toran"
                  value={form.productType}
                  onChange={(e) =>
                    updateField("productType", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-ink">
                  Preferred Colours
                </label>
                <input
                  maxLength={200}
                  className={inputClass}
                  placeholder="e.g. Pink, white and gold"
                  value={form.preferredColors}
                  onChange={(e) =>
                    updateField("preferredColors", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-ink">
                  Quantity *
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  max="1000"
                  step="1"
                  className={inputClass}
                  value={form.quantity}
                  onChange={(e) => updateField("quantity", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-ink">
                  Budget
                </label>
                <input
                  maxLength={100}
                  className={inputClass}
                  placeholder="e.g. ₹500–₹1,000"
                  value={form.budget}
                  onChange={(e) => updateField("budget", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-ink">
                  Occasion
                </label>
                <input
                  maxLength={100}
                  className={inputClass}
                  placeholder="e.g. Birthday, Diwali, wedding"
                  value={form.occasion}
                  onChange={(e) => updateField("occasion", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Required By
                </label>
                <input
                  type="date"
                  min={new Date().toLocaleDateString("en-CA")}
                  className={inputClass}
                  value={form.requiredDate}
                  onChange={(e) =>
                    updateField("requiredDate", e.target.value)
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Describe Your Idea *
                </label>
                <textarea
                  required
                  maxLength={3000}
                  rows={6}
                  className={inputClass}
                  placeholder="Describe the design, size, materials, or any special details you would like..."
                  value={form.details}
                  onChange={(e) => updateField("details", e.target.value)}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Share as many details as you can so we understand your idea.
                </p>
              </div>
              <div className="md:col-span-2 rounded-xl border border-gallery-border bg-soft-cream p-5">
                <p className="text-sm font-medium text-ink">Reference image (optional)</p>
                <p className="mt-1 text-xs text-muted">Upload a JPG, PNG, or WebP image up to 5 MB to show us your inspiration.</p>
                {!signedIn && <p className="mt-2 text-xs text-muted">Uploading a reference image requires an account. <Link href="/login?redirect=%2Fcustom-orders" target="_blank" className="font-semibold text-primary underline">Sign in</Link>, then return to this form.</p>}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center rounded-full border border-gallery-border bg-white px-5 py-3 text-sm font-medium text-ink transition hover:bg-soft-pink has-[:disabled]:cursor-wait has-[:disabled]:opacity-60">
                    {uploadingImage ? `Uploading… ${uploadProgress}%` : referenceImage ? "Replace reference image" : "Upload reference image"}
                    <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingImage || loading} className="sr-only" onChange={(event) => {
                      const file = event.currentTarget.files?.[0];
                      event.currentTarget.value = "";
                      if (file) uploadReferenceImage(file);
                    }} />
                  </label>
                  {(referenceImage || imageUploadFailed) && <button type="button" disabled={uploadingImage} onClick={() => {
                    setReferenceImage("");
                    setImageUploadError("");
                    setImageUploadFailed(false);
                    setUploadProgress(0);
                  }} className="rounded-full border border-gallery-border bg-white px-5 py-3 text-sm font-medium transition hover:bg-soft-pink disabled:opacity-50">{referenceImage ? "Remove image" : "Clear failed upload"}</button>}
                </div>
                {uploadingImage && <progress aria-label="Reference image upload progress" max={100} value={uploadProgress} className="mt-3 h-2 w-full accent-primary" />}
                {imageUploadError && <p role="alert" className="mt-3 text-sm text-rose-700">{imageUploadError}</p>}
                {referenceImage && <div className="relative mt-4 h-48 w-full max-w-sm overflow-hidden rounded-xl border border-gallery-border bg-white"><Image src={referenceImage} alt="Uploaded custom order reference" fill sizes="384px" unoptimized className="object-contain" /></div>}
              </div>
            </div>
          </section>

          {message && (
            <div
              role="status"
              aria-live="polite"
              className={`rounded-xl p-4 text-sm ${
                success
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

            <button
            type="submit"
            disabled={loading || uploadingImage || imageUploadFailed}
            className="w-full rounded-full bg-primary px-8 py-4 font-medium text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Submitting Request..." : uploadingImage ? "Uploading Reference Image…" : "Submit Custom Order"}
          </button>

          <p className="text-center text-xs leading-5 text-gray-500">
            Fields marked with * are required. We will use your
            details to respond to your custom order enquiry.
          </p>
        </form>
        </ScrollReveal>
      </div>
    </main>
  );
}
