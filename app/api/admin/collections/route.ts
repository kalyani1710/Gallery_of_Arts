import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireOwner } from "@/lib/permissions";
import { isValidProductImage } from "@/lib/product-image";

export const runtime = "nodejs";

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function validSlug(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function isDuplicate(error: unknown) {
  return (error as { code?: number })?.code === 11000;
}

export async function GET() {
  try {
    if (!(await requireOwner())) return NextResponse.json({ error: "Owner access required." }, { status: 403 });
    const db = await getDb();
    const collections = await db.collection("collections").find({}).sort({ createdAt: -1, name: 1 }).toArray();
    const result = await Promise.all(collections.map(async (collection) => ({
      ...collection,
      _id: collection._id.toString(),
      productCount: await db.collection("products").countDocuments({ collectionSlugs: collection.slug }),
    })));
    return NextResponse.json({ collections: result }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Could not load collections:", error);
    return NextResponse.json({ error: "Unable to load collections." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await requireOwner())) return NextResponse.json({ error: "Owner access required." }, { status: 403 });
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Invalid collection details." }, { status: 400 });
    const input = body as Record<string, unknown>;
    const name = text(input.name, 120);
    const slug = text(input.slug, 140).toLowerCase();
    const description = text(input.description, 2000);
    const coverImage = text(input.coverImage, 500);
    if (name.length < 2 || !validSlug(slug) || (coverImage && !isValidProductImage(coverImage)) || (input.published !== undefined && typeof input.published !== "boolean")) {
      return NextResponse.json({ error: "Enter a collection name, a valid lowercase slug, and a valid local or Cloudinary cover image." }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection("collections");
    await collection.createIndex({ slug: 1 }, { unique: true, name: "unique_collection_slug" });
    const now = new Date().toISOString();
    const document = { name, slug, description, coverImage, published: input.published === true, createdAt: now, updatedAt: now };
    const inserted = await collection.insertOne(document);
    return NextResponse.json({ collection: { ...document, _id: inserted.insertedId.toString(), productCount: 0 } }, { status: 201 });
  } catch (error) {
    if (isDuplicate(error)) return NextResponse.json({ error: "A collection already uses that slug." }, { status: 409 });
    console.error("Could not create collection:", error);
    return NextResponse.json({ error: "Unable to create collection." }, { status: 500 });
  }
}
