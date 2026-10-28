
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireOwner } from "@/lib/permissions";
import UnifiedOrdersManager, { type UnifiedOrder } from "./UnifiedOrdersManager";

export const runtime = "nodejs";

type Order = {
  _id: ObjectId;
  name?: string;
  email?: string;
  phone?: string;
  productType?: string;
  preferredColors?: string;
  quantity?: number;
  budget?: string;
  occasion?: string;
  requiredDate?: string;
  details?: string;
  status?: string;
  createdAt?: Date;
};

type ShopOrderDocument = {
  _id: ObjectId;
  customer?: { name?: string; email?: string; phone?: string; address?: string; city?: string; state?: string; pincode?: string };
  items?: { name?: string; quantity?: number; price?: number }[];
  subtotal?: number;
  shipping?: number;
  total?: number;
  status?: string;
  createdAt?: Date | string;
};

export default async function AdminOrdersPage() {
  const owner = await requireOwner();

  if (!owner) redirect("/account");

  let orders: UnifiedOrder[] = [];
  let ordersError = "";
  try {
    const db = await getDb();
    const [customDocuments, storeDocuments] = await Promise.all([
      db.collection<Order>("custom_orders").find({}).sort({ createdAt: -1 }).limit(200).toArray(),
      db.collection<ShopOrderDocument>("orders").find({}).sort({ createdAt: -1 }).limit(200).toArray(),
    ]);

    orders = [
      ...storeDocuments.map((order): UnifiedOrder => ({
        id: order._id.toString(),
        type: "store",
        customer: {
          name: order.customer?.name || "",
          email: order.customer?.email || "",
          phone: order.customer?.phone || "",
          address: [order.customer?.address, order.customer?.city, order.customer?.state, order.customer?.pincode].filter(Boolean).join(", "),
        },
        items: (order.items || []).map((item) => ({
          name: item.name || "Product",
          quantity: typeof item.quantity === "number" ? item.quantity : 0,
          price: typeof item.price === "number" ? item.price : 0,
        })),
        total: typeof order.total === "number" ? order.total : 0,
        status: order.status || "pending",
        createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : null,
      })),
      ...customDocuments.map((order): UnifiedOrder => ({
        id: order._id.toString(),
        type: "custom",
        customer: { name: order.name || "", email: order.email || "", phone: order.phone || "", address: "" },
        total: null,
        status: order.status || "pending",
        createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : null,
        customDetails: {
          productType: order.productType || "",
          quantity: order.quantity ?? null,
          preferredColors: order.preferredColors || "",
          budget: order.budget || "",
          occasion: order.occasion || "",
          requiredDate: order.requiredDate || "",
          details: order.details || "",
        },
      })),
    ].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  } catch (error) {
    console.error("Could not load admin orders:", error);
    ordersError = "Orders could not be loaded. Check the database connection and try again.";
  }

  const pending = orders.filter((order) => order.status === "pending").length;
  const inProgress = orders.filter((order) => order.status === "in-progress" || order.status === "processing").length;
  const completed = orders.filter((order) => order.status === "completed" || order.status === "delivered").length;

  return (
    <main className="min-h-screen bg-gallery-paper text-ink">
      <div className="page-container section-space">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="editorial-eyebrow">
              Gallery of Arts
            </p>
            <h1 className="mt-3 font-display text-3xl font-medium md:text-4xl">
              Order Management
            </h1>
            <p className="mt-2 text-sm text-muted">
              Review store orders and custom creation requests.
            </p>
          </div>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "New orders", count: pending, color: "text-amber-700" },
            { label: "In progress", count: inProgress, color: "text-blue-700" },
            { label: "Completed", count: completed, color: "text-green-700" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-card border border-gallery-border bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-lg"
            >
              <p className="text-sm text-muted">{item.label}</p>
              <p className={`mt-3 text-3xl font-semibold ${item.color}`}>
                {item.count}
              </p>
            </div>
          ))}
        </section>

        <UnifiedOrdersManager initialOrders={orders} loadError={ordersError} />

        <p className="mt-8 text-center text-xs text-muted">
          Gallery of Arts · Order management
        </p>
      </div>
    </main>
  );
}
