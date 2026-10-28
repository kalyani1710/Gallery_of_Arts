
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireOwner } from "@/lib/permissions";

export const runtime = "nodejs";

type CustomOrderStatus = "pending" | "in-progress" | "completed";
type StoreOrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const owner = await requireOwner();

    if (!owner) {
      return NextResponse.json(
        { ok: false, message: "Owner access required." },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { ok: false, message: "Invalid order ID." },
        { status: 400 }
      );
    }

    const body: unknown = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { ok: false, message: "Invalid request data." },
        { status: 400 }
      );
    }

    const status = (body as Record<string, unknown>).status;
    const isStoreOrder = new URL(request.url).searchParams.get("type") === "shop";
    const allowedStatuses: (CustomOrderStatus | StoreOrderStatus)[] = isStoreOrder ? [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ] : [
      "pending",
      "in-progress",
      "completed",
    ];

    if (
      typeof status !== "string" ||
      !allowedStatuses.includes(status as CustomOrderStatus | StoreOrderStatus)
    ) {
      return NextResponse.json(
        { ok: false, message: "Invalid order status." },
        { status: 400 }
      );
    }

    const db = await getDb();

    const result = await db.collection(isStoreOrder ? "orders" : "custom_orders").updateOne(
      { _id: new ObjectId(id) },
      { $set: isStoreOrder ? { status, updatedAt: new Date() } : { status } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { ok: false, message: "Order not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Order status updated successfully.",
    });
  } catch (error) {
    console.error("Admin order update failed:", error);

    return NextResponse.json(
      { ok: false, message: "Unable to update the order." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const owner = await requireOwner();

    if (!owner) {
      return NextResponse.json(
        { ok: false, message: "Owner access required." },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { ok: false, message: "Invalid order ID." },
        { status: 400 }
      );
    }

    const db = await getDb();

    const result = await db.collection("custom_orders").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { ok: false, message: "Order not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Order deleted successfully.",
    });
  } catch (error) {
    console.error("Admin order deletion failed:", error);

    return NextResponse.json(
      { ok: false, message: "Unable to delete the order." },
      { status: 500 }
    );
  }
}
