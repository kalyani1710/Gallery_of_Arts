import type { CheckoutDetails, CustomOrder } from "@/types";

/**
 * Thin client API layer. Today these hit local Next.js routes.
 * Later they can point to Django/FastAPI without rewriting forms.
 */
export async function submitCustomOrder(payload: CustomOrder & { imageName?: string }) {
  const response = await fetch("/api/custom-orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Could not submit custom order.");
  return response.json() as Promise<{ ok: boolean; id: string }>;
}

export async function submitContact(payload: {
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Could not send message.");
  return response.json() as Promise<{ ok: boolean }>;
}

export async function submitNewsletter(email: string) {
  const response = await fetch("/api/newsletter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) throw new Error("Could not subscribe.");
  return response.json() as Promise<{ ok: boolean }>;
}

export async function submitOrder(payload: {
  customer: CheckoutDetails;
  items: { productId: string; quantity: number; color?: string }[];
  idempotencyKey: string;
}) {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null) as { error?: string; message?: string } | null;
    throw new Error(data?.message || data?.error || "Could not prepare order. Please try again.");
  }
  return response.json() as Promise<{ ok: boolean; id: string }>;
}
