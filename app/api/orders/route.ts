import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { ObjectId, type Db } from "mongodb";
import { getDb, getMongoClient } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { getShippingAmount } from "@/lib/shipping";
import type { ShippingSettings } from "@/lib/shipping";
import { getShippingSettings } from "@/lib/shipping-settings";
import type { CheckoutDetails } from "@/types";

export const runtime = "nodejs";

type ProductDocument = { _id: ObjectId; name: string; price: number; stock: number; active: boolean; image?: string };
type OrderItem = { productId: string; name: string; quantity: number; price: number; image?: string };
type OrderDocument = {
  _id: ObjectId; userId: string; customer: CheckoutDetails; items: OrderItem[];
  subtotal: number; shipping: number; total: number; status: string; createdAt: Date; updatedAt: Date;
};

class OrderError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cleanField(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function idempotentOrderId(userId: string, key: string) {
  return new ObjectId(createHash("sha256").update(`${userId}:${key}`).digest("hex").slice(0, 24));
}

function isDuplicateKey(error: unknown) {
  return (error as { code?: number })?.code === 11000;
}

function transactionsUnsupported(error: unknown) {
  const issue = error as { code?: number; message?: string };
  const message = issue.message?.toLowerCase() || "";
  return issue.code === 20 || message.includes("transaction numbers are only allowed on a replica set member or mongos") || message.includes("transactions are not supported");
}

function validateProducts(documents: ProductDocument[], quantities: Map<string, number>) {
  const products = new Map(documents.map((product) => [product._id.toString(), product]));
  if (products.size !== quantities.size) throw new OrderError("A product in your cart is no longer available.", 409);
  const items: OrderItem[] = [];
  for (const [productId, quantity] of quantities) {
    const product = products.get(productId)!;
    if (!Number.isFinite(product.price) || product.price < 0 || !Number.isInteger(product.stock) || product.stock < 0) {
      throw new OrderError(`${product.name || "A product"} has invalid price or stock information. Please contact the shop.`, 409);
    }
    if (product.stock < quantity) {
      throw new OrderError(product.stock === 0 ? `${product.name} is out of stock.` : `Only ${product.stock} unit(s) of ${product.name} are currently available.`, 409);
    }
    items.push({ productId, name: product.name, quantity, price: product.price, ...(typeof product.image === "string" ? { image: product.image } : {}) });
  }
  return { products, items };
}

function makeOrder(id: ObjectId, userId: string, customer: CheckoutDetails, items: OrderItem[], shippingSettings: ShippingSettings): OrderDocument {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = getShippingAmount(subtotal, shippingSettings);
  const now = new Date();
  return { _id: id, userId, customer, items, subtotal, shipping, total: subtotal + shipping, status: "pending", createdAt: now, updatedAt: now };
}

async function createWithCompensation(db: Db, id: ObjectId, userId: string, customer: CheckoutDetails, quantities: Map<string, number>, shippingSettings: ShippingSettings) {
  const productsCollection = db.collection<ProductDocument>("products");
  const ordersCollection = db.collection<OrderDocument>("orders");
  const ids = [...quantities.keys()].map((key) => new ObjectId(key));
  const docs = await productsCollection.find({ _id: { $in: ids }, active: true }).toArray();
  const { products, items } = validateProducts(docs, quantities);
  const reserved: Array<{ id: ObjectId; quantity: number }> = [];

  const rollback = async () => {
    const failures: string[] = [];
    for (const row of [...reserved].reverse()) {
      try {
        const restored = await productsCollection.updateOne({ _id: row.id }, { $inc: { stock: row.quantity }, $set: { updatedAt: new Date() } });
        if (restored.matchedCount !== 1) failures.push(row.id.toString());
      } catch {
        failures.push(row.id.toString());
      }
    }
    if (failures.length) throw new Error(`Could not restore stock for product(s): ${failures.join(", ")}.`);
  };

  try {
    for (const [productId, quantity] of quantities) {
      const product = products.get(productId)!;
      const productObjectId = new ObjectId(productId);
      const updated = await productsCollection.updateOne(
        { _id: productObjectId, active: true, price: product.price, stock: { $gte: quantity } },
        { $inc: { stock: -quantity }, $set: { updatedAt: new Date() } },
      );
      if (updated.matchedCount !== 1) {
        const current = await productsCollection.findOne({ _id: productObjectId });
        if (!current || current.active !== true) throw new OrderError("A product in your cart is no longer available.", 409);
        if (typeof current.stock === "number" && current.stock < quantity) {
          throw new OrderError(current.stock === 0 ? `${current.name} is out of stock.` : `Only ${current.stock} unit(s) of ${current.name} are currently available.`, 409);
        }
        throw new OrderError(`${product.name} price or availability changed. Refresh your cart and try again.`, 409);
      }
      reserved.push({ id: productObjectId, quantity });
    }

    const inserted = await ordersCollection.insertOne(makeOrder(id, userId, customer, items, shippingSettings));
    if (!inserted.acknowledged) throw new Error("MongoDB did not acknowledge the order write.");
    return { id: inserted.insertedId, duplicate: false };
  } catch (error) {
    if (isDuplicateKey(error)) {
      await rollback();
      const duplicate = await ordersCollection.findOne({ _id: id, userId });
      if (duplicate) return { id, duplicate: true };
      throw error;
    }
    const saved = await ordersCollection.findOne({ _id: id, userId }).catch(() => null);
    if (saved) return { id, duplicate: true };
    await rollback();
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ ok: false, message: "Please sign in before placing your order." }, { status: 401 });

    const body: unknown = await request.json();
    if (!isRecord(body) || !isRecord(body.customer) || !Array.isArray(body.items)) {
      return NextResponse.json({ ok: false, message: "Please provide valid customer and order details." }, { status: 400 });
    }
    if (typeof body.idempotencyKey !== "string" || !/^[a-f0-9-]{36}$/i.test(body.idempotencyKey)) {
      return NextResponse.json({ ok: false, message: "Checkout could not be verified. Refresh checkout and try again." }, { status: 400 });
    }

    const customerInput = body.customer;
    const customer: CheckoutDetails = {
      name: cleanField(customerInput.name, 100), phone: cleanField(customerInput.phone, 30), email: session.email,
      address: cleanField(customerInput.address, 300), city: cleanField(customerInput.city, 100),
      state: cleanField(customerInput.state, 100), pincode: cleanField(customerInput.pincode, 20), notes: cleanField(customerInput.notes, 1000),
    };
    if (!customer.name || !customer.phone || !customer.address || !customer.city || !customer.state || !customer.pincode || body.items.length === 0 || body.items.length > 50) {
      return NextResponse.json({ ok: false, message: "Please provide valid customer and order details." }, { status: 400 });
    }

    const quantities = new Map<string, number>();
    for (const raw of body.items) {
      if (!isRecord(raw)) throw new OrderError("An item or quantity is invalid.", 400);
      const { productId, quantity } = raw;
      if (typeof productId !== "string" || !ObjectId.isValid(productId) || !Number.isSafeInteger(quantity) || (quantity as number) < 1 || (quantity as number) > 1000) {
        throw new OrderError("Each product quantity must be a positive whole number.", 400);
      }
      const combined = (quantities.get(productId) || 0) + (quantity as number);
      if (combined > 1000) throw new OrderError("The requested quantity is too large.", 400);
      quantities.set(productId, combined);
    }

    const id = idempotentOrderId(session.userId, body.idempotencyKey);
    const db = await getDb();
    const orders = db.collection<OrderDocument>("orders");
    const previous = await orders.findOne({ _id: id, userId: session.userId });
    if (previous) return NextResponse.json({ ok: true, id: previous._id.toString(), duplicate: true });

    const shippingSettings = await getShippingSettings();

    const mongoSession = (await getMongoClient()).startSession();
    let transactionsNotSupported = false;
    let duplicateOrder = false;
    try {
      await mongoSession.withTransaction(async () => {
        const prior = await orders.findOne({ _id: id, userId: session.userId }, { session: mongoSession });
        if (prior) { duplicateOrder = true; return; }

        const productsCollection = db.collection<ProductDocument>("products");
        const ids = [...quantities.keys()].map((key) => new ObjectId(key));
        const docs = await productsCollection.find({ _id: { $in: ids }, active: true }, { session: mongoSession }).toArray();
        const { products, items } = validateProducts(docs, quantities);
        for (const [productId, quantity] of quantities) {
          const product = products.get(productId)!;
          const updated = await productsCollection.updateOne(
            { _id: new ObjectId(productId), active: true, price: product.price, stock: { $gte: quantity } },
            { $inc: { stock: -quantity }, $set: { updatedAt: new Date() } },
            { session: mongoSession },
          );
          if (updated.matchedCount !== 1) throw new OrderError(`${product.name} stock or price changed. Refresh your cart and try again.`, 409);
        }
        const inserted = await orders.insertOne(makeOrder(id, session.userId, customer, items, shippingSettings), { session: mongoSession });
        if (!inserted.acknowledged) throw new Error("MongoDB did not acknowledge the order write.");
      });
    } catch (error) {
      if (transactionsUnsupported(error)) transactionsNotSupported = true;
      else if (isDuplicateKey(error)) {
        const duplicate = await orders.findOne({ _id: id, userId: session.userId });
        if (duplicate) return NextResponse.json({ ok: true, id: duplicate._id.toString(), duplicate: true });
        throw error;
      } else throw error;
    } finally {
      await mongoSession.endSession();
    }

    if (transactionsNotSupported) {
      console.warn("MongoDB transactions are unavailable; using atomic stock updates with compensating rollback.");
      const result = await createWithCompensation(db, id, session.userId, customer, quantities, shippingSettings);
      return NextResponse.json({ ok: true, id: result.id.toString(), duplicate: result.duplicate }, { status: result.duplicate ? 200 : 201 });
    }
    return NextResponse.json({ ok: true, id: id.toString(), duplicate: duplicateOrder }, { status: duplicateOrder ? 200 : 201 });
  } catch (error) {
    if (error instanceof OrderError) return NextResponse.json({ ok: false, message: error.message }, { status: error.status });
    console.error("Create shop order failed:", error);
    return NextResponse.json({ ok: false, message: "Unable to place your order right now. No order was confirmed; please try again." }, { status: 500 });
  }
}
