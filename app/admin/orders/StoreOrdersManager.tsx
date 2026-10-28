"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";

type StoreOrder = {
  id: string;
  customer: { name: string; email: string; phone: string; address: string; city: string; state: string; pincode: string };
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  createdAt: string | null;
};

const statuses = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function StoreOrdersManager({ initialOrders }: { initialOrders: StoreOrder[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function updateStatus(id: string, status: string) {
    setBusyId(id);
    setMessage("");
    setError("");
    try {
      const response = await fetch(`/api/admin/orders/${id}?type=shop`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not update order status.");
      setOrders((current) => current.map((order) => order.id === id ? { ...order, status } : order));
      setMessage("Order status updated.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update order status.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[#EAE4EC] bg-white shadow-[0_12px_35px_rgba(52,40,65,0.06)]">
      <div className="border-b border-[#EEE8F0] p-6">
        <h2 className="text-xl font-semibold">Store orders</h2>
        <p className="mt-1 text-sm text-gray-500">Orders placed through checkout ({orders.length})</p>
      </div>
      {message && <p role="status" className="border-b border-[#EEE8F0] bg-green-50 px-6 py-3 text-sm text-green-800">{message}</p>}
      {error && <p role="alert" className="border-b border-[#EEE8F0] bg-rose-50 px-6 py-3 text-sm text-rose-800">{error}</p>}
      {orders.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-gray-500">No store orders have been placed yet.</p>
      ) : (
        <div className="divide-y divide-[#F0EBF1]">
          {orders.map((order) => (
            <article key={order.id} className="p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">Order {order.id}</h3>
                  <p className="mt-1 text-xs text-gray-500">{order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN") : "Date unavailable"}</p>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <span>Status</span>
                  <select value={order.status} disabled={busyId === order.id} onChange={(event) => void updateStatus(order.id, event.target.value)} className="rounded-xl border border-[#E4DCE8] bg-white px-3 py-2 disabled:opacity-50" aria-label={`Status for order ${order.id}`}>
                    {!statuses.some((option) => option.value === order.status) && <option value={order.status}>{order.status}</option>}
                    {statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                  </select>
                  {busyId === order.id && <span role="status" className="text-xs text-gray-500">Saving…</span>}
                </label>
              </div>
              <div className="mt-5 grid gap-5 text-sm md:grid-cols-2">
                <div>
                  <h4 className="font-semibold">Customer</h4>
                  <p className="mt-1">{order.customer.name || "Name unavailable"}</p>
                  <p className="break-all text-gray-500">{order.customer.email}</p>
                  {order.customer.phone && <p className="text-gray-500">{order.customer.phone}</p>}
                  <p className="mt-2 text-gray-600">{[order.customer.address, order.customer.city, order.customer.state, order.customer.pincode].filter(Boolean).join(", ") || "Address unavailable"}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Items</h4>
                  <ul className="mt-1 space-y-1">
                    {order.items.map((item, index) => <li key={`${item.name}-${index}`} className="flex justify-between gap-3"><span>{item.name} × {item.quantity}</span><span>{formatPrice(item.price * item.quantity)}</span></li>)}
                  </ul>
                  <div className="mt-3 space-y-1 border-t pt-2 text-gray-600">
                    <p className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></p>
                    <p className="flex justify-between"><span>Shipping</span><span>{order.shipping ? formatPrice(order.shipping) : "Free"}</span></p>
                    <p className="flex justify-between font-semibold text-[#302C3B]"><span>Total</span><span>{formatPrice(order.total)}</span></p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
