import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireOwner } from "@/lib/permissions";
import { isValidProductImage } from "@/lib/product-image";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };
type CollectionAuthorization =
  | { ok: true; id: ObjectId }
  | { ok: false; response: NextResponse };

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function validSlug(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function isDuplicate(error: unknown) {
  return (error as { code?: number })?.code === 11000;
}

async function authorizedCollectionId(context: Context): Promise<CollectionAuthorization> {
  if (!(await requireOwner())) return { ok: false, response: NextResponse.json({ error: "Owner access required." }, { status: 403 }) };
  const { id } = await context.params;
  if (!ObjectId.isValid(id)) return { ok: false, response: NextResponse.json({ error: "Invalid collection ID." }, { status: 400 }) };
  return { ok: true, id: new ObjectId(id) };
}

export async function PATCH(request: Request, context: Context) {
  try {
    const authorization = await authorizedCollectionId(context);
    if (!authorization.ok) return authorization.response;
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
    const current = await collection.findOne({ _id: authorization.id });
    if (!current) return NextResponse.json({ error: "Collection not found." }, { status: 404 });
    const duplicate = await collection.findOne({ slug, _id: { $ne: authorization.id } });
    if (duplicate) return NextResponse.json({ error: "A collection already uses that slug." }, { status: 409 });

    if (current.slug !== slug) {
      await db.collection("products").updateMany(
        { collectionSlugs: current.slug },
        [{ $set: {
          collectionSlugs: {
            $map: {
              input: { $ifNull: ["$collectionSlugs", []] },
              as: "collectionSlug",
              in: { $cond: [{ $eq: ["$$collectionSlug", current.slug] }, slug, "$$collectionSlug"] },
            },
          },
          updatedAt: new Date().toISOString(),
        } }],
      );
    }

    await collection.updateOne({ _id: authorization.id }, { $set: {
      name, slug, description, coverImage, published: input.published === true, updatedAt: new Date().toISOString(),
    } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isDuplicate(error)) return NextResponse.json({ error: "A collection already uses that slug." }, { status: 409 });
    console.error("Could not update collection:", error);
    return NextResponse.json({ error: "Unable to update collection." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const authorization = await authorizedCollectionId(context);
    if (!authorization.ok) return authorization.response;
    const db = await getDb();
    const collection = db.collection("collections");
    const current = await collection.findOne({ _id: authorization.id });
    if (!current) return NextResponse.json({ error: "Collection not found." }, { status: 404 });

    await db.collection("products").updateMany(
      { collectionSlugs: current.slug },
      { $pull: { collectionSlugs: current.slug } },
    );
    await collection.deleteOne({ _id: authorization.id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Could not delete collection:", error);
    return NextResponse.json({ error: "Unable to delete collection." }, { status: 500 });
  }
}
