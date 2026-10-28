import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { isValidProductImage } from "@/lib/product-image";
import type { CustomOrder } from "@/types";

export const runtime = "nodejs";

type CustomOrderDocument = CustomOrder & {
  referenceImage?: string;
  userId: string;
  status: "pending" | "in-progress" | "completed";
  createdAt: Date;
};

function cleanText(value: unknown, maxLength = 1000): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export async function POST(request: Request) {
  try {
    // Only signed-in customers can submit account-linked orders.
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { ok: false, message: "Please sign in before submitting a custom order." },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { ok: false, message: "Invalid request data." },
        { status: 400 }
      );
    }

    const input = body as Record<string, unknown>;
    const referenceImage = cleanText(input.referenceImage, 500);
    if (referenceImage && !isValidProductImage(referenceImage)) {
      return NextResponse.json({ ok: false, message: "Upload a valid reference image before submitting your request." }, { status: 400 });
    }

    const quantityValue = input.quantity;
    const quantity =
      typeof quantityValue === "number" || typeof quantityValue === "string"
        ? Number(quantityValue)
        : NaN;

    const order: CustomOrder = {
      name: session.name,
      email: session.email,
      phone: cleanText(input.phone, 30),
      productType: cleanText(input.productType, 100),
      preferredColors: cleanText(input.preferredColors, 200),
      quantity,
      budget: cleanText(input.budget, 100),
      occasion: cleanText(input.occasion, 100),
      requiredDate: cleanText(input.requiredDate, 30),
      details: cleanText(input.details, 3000),
    };

    if (
      !order.productType ||
      !order.details ||
      !Number.isInteger(order.quantity) ||
      order.quantity < 1 ||
      order.quantity > 1000
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Please provide the product type, order details, and a quantity between 1 and 1000.",
        },
        { status: 400 }
      );
    }

    const document: CustomOrderDocument = {
      ...order,
      ...(referenceImage ? { referenceImage } : {}),
      userId: session.userId,
      status: "pending",
      createdAt: new Date(),
    };

    const db = await getDb();

    const result = await db
      .collection<CustomOrderDocument>("custom_orders")
      .insertOne(document);

    return NextResponse.json(
      {
        ok: true,
        id: result.insertedId.toString(),
        message: "Your custom order request has been saved.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Custom order submission failed:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "We could not save your request. Please try again.",
      },
      { status: 500 }
    );
  }
}
