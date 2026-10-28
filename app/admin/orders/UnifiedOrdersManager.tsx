"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

export type UnifiedOrder = {
  id: string;
  type: "store" | "custom";
  customer: { name: string; email: string; phone: string; address: string };
  createdAt: string | null;
  status: string;
  total: number | null;
  items?: { name: string; quantity: number; price: number }[];
  customDetails?: {
    productType: string;
    quantity: number | null;
    preferredColors: string;
    budget: string;
    occasion: string;
    requiredDate: string;
    details: string;
  };
};

const storeStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
const customStatuses = ["pending", "in-progress", "completed"];
const statusLabels: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  "in-progress": "In progress",
  completed: "Completed",
};

function displayDate(value: string | null) {
  return value ? new Date(value).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "Date unavailable";
}

export default function UnifiedOrdersManager({
  initialOrders,
  loadError = "",
}: {
  initialOrders: UnifiedOrder[];
  loadError?: string;
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const visibleOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesType = typeFilter === "all" || order.type === typeFilter;
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const searchable = [order.id, order.customer.name, order.customer.email, order.customer.phone, order.customer.address, order.customDetails?.productType, order.customDetails?.details]
        .filter(Boolean).join(" ").toLowerCase();
      return matchesType && matchesStatus && (!query || searchable.includes(query));
    });
  }, [orders, search, statusFilter, typeFilter]);

  async function updateStatus(order: UnifiedOrder, status: string) {
    setBusyId(order.id);
    setError("");
    setMessage("");
    try {
      const query = order.type === "store" ? "?type=shop" : "";
      const response = await fetch(`/api/admin/orders/${order.id}${query}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not update order status.");
      setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status } : item));
      setMessage(`Order ${order.id} updated to ${statusLabels[status] || status}.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update order status.");
    } finally {
      setBusyId("");
    }
  }

  async function deleteCustomOrder(order: UnifiedOrder) {
    if (!window.confirm(`Delete custom order ${order.id}? This cannot be undone.`)) return;
    setBusyId(order.id);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not delete custom order.");
      setOrders((current) => current.filter((item) => item.id !== order.id));
      setMessage("Custom order deleted.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete custom order.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <section className="overflow-hidden rounded-card border border-gallery-border bg-white shadow-card">
      <div className="grid gap-4 border-b border-gallery-border p-5 md:grid-cols-3">
        <label className="text-sm font-medium text-ink">
          Order type
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="mt-2 w-full rounded-xl border border-gallery-border bg-soft-cream px-3 py-3 text-ink">
            <option value="all">All Orders</option><option value="store">Store Orders</option><option value="custom">Custom Orders</option>
          </select>
        </label>
        <label className="text-sm font-medium text-ink">
          Order status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="mt-2 w-full rounded-xl border border-gallery-border bg-soft-cream px-3 py-3 text-ink">
            <option value="all">All Statuses</option>
            {[...new Set([...storeStatuses, ...customStatuses])].map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-ink">
          Search orders
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Order ID, name, email, phone…" className="mt-2 w-full rounded-xl border border-gallery-border bg-soft-cream px-3 py-3 text-ink outline-none focus:border-primary" />
        </label>
      </div>

      <div className="border-b border-gallery-border px-5 py-3 text-sm text-muted">{visibleOrders.length} of {orders.length} orders</div>
      {loadError && <p role="alert" className="border-b border-rose-100 bg-rose-50 px-5 py-3 text-sm text-rose-800">{loadError}</p>}
      {error && <p role="alert" className="border-b border-rose-100 bg-rose-50 px-5 py-3 text-sm text-rose-800">{error}</p>}
      {message && <p role="status" className="border-b border-green-100 bg-green-50 px-5 py-3 text-sm text-green-800">{message}</p>}

      {visibleOrders.length === 0 ? (
        <p className="px-6 py-14 text-center text-sm text-gray-500">{loadError ? "Orders are unavailable until the database connection is restored." : orders.length ? "No orders match these filters." : "No store or custom orders have been placed yet."}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-soft-cream text-xs uppercase tracking-wide text-muted">
              <tr><th className="px-5 py-4">Order ID</th><th className="px-5 py-4">Customer</th><th className="px-5 py-4">Type</th><th className="px-5 py-4">Date</th><th className="px-5 py-4">Total</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-gallery-border">
              {visibleOrders.map((order) => (
                <tr key={`${order.type}-${order.id}`} className="align-top">
                  <td className="max-w-44 break-all px-5 py-4 font-mono text-xs">{order.id}</td>
                  <td className="max-w-56 px-5 py-4">
                    <p className="font-medium text-ink">{order.customer.name || "Name unavailable"}</p>
                    <p className="mt-1 break-all text-xs text-gray-500">{order.customer.email}</p>
                    {order.customer.phone && <p className="mt-1 text-xs text-gray-500">{order.customer.phone}</p>}
                  </td>
                  <td className="px-5 py-4"><span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${order.type === "store" ? "bg-pink-50 text-pink-700" : "bg-violet-50 text-violet-700"}`}>{order.type === "store" ? "Store order" : "Custom order"}</span></td>
                  <td className="whitespace-nowrap px-5 py-4 text-muted">{displayDate(order.createdAt)}</td>
                  <td className="whitespace-nowrap px-5 py-4 font-semibold">{order.total === null ? "—" : formatPrice(order.total)}</td>
                  <td className="px-5 py-4">
                    <select value={order.status} disabled={busyId === order.id} onChange={(event) => void updateStatus(order, event.target.value)} className="rounded-lg border border-gallery-border bg-soft-cream px-2 py-2 text-ink disabled:opacity-50" aria-label={`Status for ${order.type} order ${order.id}`}>
                      {(order.type === "store" ? storeStatuses : customStatuses).map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
                    </select>
                    {busyId === order.id && <span role="status" className="mt-1 block text-xs text-gray-500">Saving…</span>}
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/admin/orders/${order.type}/${order.id}`} className="inline-flex rounded-full border border-gallery-border px-3 py-2 text-xs font-semibold text-primary transition hover:bg-soft-pink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">View Details</Link>
                    <details>
                      <summary className="cursor-pointer font-medium text-primary">Details</summary>
                      <div className="mt-3 min-w-56 space-y-2 rounded-xl bg-soft-cream p-3 text-xs text-muted">
                        {order.type === "store" ? (
                          <>
                            <p className="font-semibold text-gray-800">Items</p>
                            {order.items?.map((item, index) => <p key={`${item.name}-${index}`}>{item.name} × {item.quantity} — {formatPrice(item.price * item.quantity)}</p>)}
                            <p className="border-t pt-2">Delivery: {[order.customer.address].filter(Boolean).join(", ") || "Not provided"}</p>
                          </>
                        ) : (
                          <>
                            <p><strong>Requested:</strong> {order.customDetails?.productType || "Custom handmade order"}</p>
                            <p><strong>Quantity:</strong> {order.customDetails?.quantity ?? "—"}</p>
                            <p><strong>Colors:</strong> {order.customDetails?.preferredColors || "Not specified"}</p>
                            <p><strong>Budget:</strong> {order.customDetails?.budget || "Not specified"}</p>
                            <p><strong>Occasion:</strong> {order.customDetails?.occasion || "Not specified"}</p>
                            <p><strong>Required date:</strong> {order.customDetails?.requiredDate || "Not specified"}</p>
                            <p className="whitespace-pre-wrap"><strong>Details:</strong> {order.customDetails?.details || "No additional details"}</p>
                          </>
                        )}
                      </div>
                    </details>
                    {order.type === "custom" && <button type="button" disabled={busyId === order.id} onClick={() => void deleteCustomOrder(order)} className="mt-3 text-xs font-medium text-red-700 underline disabled:opacity-50">Delete</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
