
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireOwner } from "@/lib/permissions";
import { normalizeProductImages } from "@/lib/product-image";

export const runtime = "nodejs";

type Context = {
  params: Promise<{ id: string }>;
};

function cleanText(value: unknown, maxLength = 200) {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

async function checkedCollectionSlugs(db: Awaited<ReturnType<typeof getDb>>, value: unknown) {
  if (!Array.isArray(value) || value.length > 20 || value.some((slug) => typeof slug !== "string")) return null;
  const slugs = [...new Set(value.map((slug) => cleanText(slug, 140).toLowerCase()))];
  if (slugs.some((slug) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))) return null;
  if (slugs.length) {
    const existing = await db.collection("collections").countDocuments({ slug: { $in: slugs } });
    if (existing !== slugs.length) return null;
  }
  return slugs;
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
      stock < 0
    ) {
      return NextResponse.json(
        { error: "Check the product details, price, stock and main image." },
        { status: 400 },
      );
    }

    const db = await getDb();
    const collection = db.collection("products");
    const productId = new ObjectId(id);
    const existingProduct = await collection.findOne({ _id: productId }, { projection: { image: 1, images: 1 } });
    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }
    const existingImages = Array.isArray(existingProduct.images) ? existingProduct.images : [];
    const preservedImages = image === existingProduct.image
      ? existingImages
      : existingImages.filter((existingImage) => existingImage !== existingProduct.image);
    const images = normalizeProductImages(
      image,
      body.images === undefined ? preservedImages : body.images,
    );
    if (!images) {
      return NextResponse.json({ error: "Add up to 10 valid local image paths or secure Cloudinary image URLs." }, { status: 400 });
    }
    const collectionSlugs = body.collectionSlugs === undefined
      ? undefined
      : await checkedCollectionSlugs(db, body.collectionSlugs);
    if (body.collectionSlugs !== undefined && !collectionSlugs) {
      return NextResponse.json({ error: "Select only existing collections." }, { status: 400 });
    }

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

    const setFields: Record<string, unknown> = {
          name,
          slug,
          category,
          price,
          stock,
          image,
          images,
          description,
          shopCategory: cleanText(body.shopCategory || category, 80),
          subCategory: cleanText(body.subCategory, 80),
          featured: body.featured === true,
          active: body.active !== false,
          updatedAt: new Date().toISOString(),
    };
    if (collectionSlugs) setFields.collectionSlugs = collectionSlugs;
    const result = await collection.updateOne({ _id: productId }, { $set: setFields });

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
