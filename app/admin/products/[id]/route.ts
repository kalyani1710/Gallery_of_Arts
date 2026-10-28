
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireOwner } from "@/lib/permissions";

export const runtime = "nodejs";

type Context = {
  params: Promise<{ id: string }>;
};

function cleanText(value: unknown, maxLength = 200) {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

export async function PATCH(request: Request, context: Context) {
  try {
    const owner = await requireOwner();

    if (!owner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product ID." }, { status: 400 });
    }

    const body = await request.json();
    const name = cleanText(body.name, 120);
    const slug = cleanText(body.slug, 140).toLowerCase();
    const category = cleanText(body.category, 80);
    const image = cleanText(body.image, 500);
    const description = cleanText(body.description, 2000);
    const price = Number(body.price);
    const stock = Number(body.stock);

    if (
      !name ||
      !slug ||
      !category ||
      !image ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(stock) ||
      stock < 0 ||
      !/^\/images\/[a-zA-Z0-9/_\-.]+$/.test(image)
    ) {
      return NextResponse.json(
        { error: "Check the product details, price, stock and image path." },
        { status: 400 },
      );
    }

    const db = await getDb();
    const collection = db.collection("products");
    const productId = new ObjectId(id);

    const duplicate = await collection.findOne({
      slug,
      _id: { $ne: productId },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "Another product already uses this slug." },
        { status: 409 },
      );
    }

    const result = await collection.updateOne(
      { _id: productId },
      {
        $set: {
          name,
          slug,
          category,
          price,
          stock,
          image,
          description,
          shopCategory: cleanText(body.shopCategory || category, 80),
          subCategory: cleanText(body.subCategory, 80),
          featured: body.featured === true,
          active: body.active !== false,
          updatedAt: new Date().toISOString(),
        },
      },
    );

    if (!result.matchedCount) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to update product." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const owner = await requireOwner();

    if (!owner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product ID." }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection("products").deleteOne({
      _id: new ObjectId(id),
    });

    if (!result.deletedCount) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to delete product." },
      { status: 500 },
    );
  }
}
