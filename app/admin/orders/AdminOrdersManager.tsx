
"use client";

import { useState } from "react";

type AdminOrder = {
  id: string;
  name: string;
  email: string;
  phone: string;
  productType: string;
  preferredColors: string;
  quantity: number | null;
  budget: string;
  occasion: string;
  requiredDate: string;
  details: string;
  status: string;
  createdAt: string | null;
};

type Props = {
  initialOrders: AdminOrder[];
};

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];

export default function AdminOrdersManager({ initialOrders }: Props) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState("all");
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");

  const visibleOrders =
    filter === "all"
      ? orders
      : orders.filter((order) => (order.status || "pending") === filter);

  async function updateStatus(id: string, status: string) {
    setBusyId(id);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update order.");
      }

      setOrders((current) =>
        current.map((order) =>
          order.id === id ? { ...order, status } : order
        )
      );
      setMessage("Order status updated.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setBusyId("");
    }
  }

  async function deleteOrder(order: AdminOrder) {
    const confirmed = window.confirm(
      `Delete the order "${order.productType}" from ${order.name}? This cannot be undone.`
    );

    if (!confirmed) return;

    setBusyId(order.id);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete order.");
      }

      setOrders((current) =>
        current.filter((item) => item.id !== order.id)
      );
      setMessage("Order deleted.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setBusyId("");
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[#EAE4EC] bg-white shadow-[0_12px_35px_rgba(52,40,65,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EEE8F0] p-6">
        <div>
          <h2 className="text-xl font-semibold">Customer orders</h2>
          <p className="mt-1 text-sm text-gray-500">
            {visibleOrders.length} orders displayed
          </p>
        </div>

        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="rounded-xl border border-[#E4DCE8] bg-white px-4 py-3 text-sm outline-none focus:border-[#9B6683]"
          aria-label="Filter orders by status"
        >
          <option value="all">All orders</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {message && (
        <p
          role="status"
          className="border-b border-[#EEE8F0] bg-[#FFF9F5] px-6 py-3 text-sm text-[#893D51]"
        >
          {message}
        </p>
      )}

      {visibleOrders.length === 0 ? (
        <div className="px-6 py-16 text-center text-sm text-gray-500">
          No orders match this filter.
        </div>
      ) : (
        <div className="divide-y divide-[#F0EBF1]">
          {visibleOrders.map((order) => (
            <article key={order.id} className="p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-[#302C3B]">
                    {order.productType || "Custom handmade order"}
                  </h3>
                  <p className="mt-1 break-all text-xs text-gray-400">
                    Order ID: {order.id}
                  </p>
                </div>

                <select
                  value={order.status || "pending"}
                  disabled={busyId === order.id}
                  onChange={(event) =>
                    updateStatus(order.id, event.target.value)
                  }
                  className="rounded-xl border border-[#E4DCE8] bg-white px-3 py-2 text-sm disabled:opacity-50"
                  aria-label={`Status for order ${order.id}`}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-xs text-gray-400">Customer</p>
                  <p className="mt-1 font-medium">
                    {order.name || "Not provided"}
                  </p>
                  <p className="break-all text-gray-500">{order.email}</p>
                  {order.phone && (
                    <p className="mt-1 text-gray-500">{order.phone}</p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-gray-400">Order preferences</p>
                  <p className="mt-1">Quantity: {order.quantity ?? "—"}</p>
                  <p className="mt-1 text-gray-500">
                    Colors: {order.preferredColors || "Not specified"}
                  </p>
                  <p className="mt-1 text-gray-500">
                    Budget: {order.budget || "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Occasion and date</p>
                  <p className="mt-1">{order.occasion || "Not specified"}</p>
                  <p className="mt-1 text-gray-500">
                    Requested: {order.requiredDate || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-[#FAF8FB] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Customer's description
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {order.details || "No additional details"}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-gray-400">
                  Submitted:{" "}
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-IN")
                    : "Date unavailable"}
                </p>

                <button
                  type="button"
                  disabled={busyId === order.id}
                  onClick={() => deleteOrder(order)}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                >
                  {busyId === order.id ? "Please wait..." : "Delete order"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
