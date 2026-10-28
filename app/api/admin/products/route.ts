
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireOwner } from "@/lib/permissions";
import { normalizeProductImages } from "@/lib/product-image";

export const runtime = "nodejs";

function cleanText(value: unknown, maxLength = 200) {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

async function checkedCollectionSlugs(db: Awaited<ReturnType<typeof getDb>>, value: unknown) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 20 || value.some((slug) => typeof slug !== "string")) return null;
  const slugs = [...new Set(value.map((slug) => cleanText(slug, 140).toLowerCase()))];
  if (slugs.some((slug) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))) return null;
  if (slugs.length) {
    const existing = await db.collection("collections").countDocuments({ slug: { $in: slugs } });
    if (existing !== slugs.length) return null;
  }
  return slugs;
}

export async function GET() {
  try {
    const owner = await requireOwner();

    if (!owner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = await getDb();
    const products = await db
      .collection("products")
      .find({})
      .sort({ createdAt: -1 })
      .limit(1000)
      .toArray();

    return NextResponse.json({
      products: products.map((product) => ({
        ...product,
        _id: product._id.toString(),
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to load products." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const owner = await requireOwner();

    if (!owner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
        { error: "Enter a name, slug, category, image, valid price and stock." },
        { status: 400 },
      );
    }

    const images = normalizeProductImages(image, body.images);
    if (!images) {
      return NextResponse.json(
        { error: "Add up to 10 valid local image paths or secure Cloudinary image URLs." },
        { status: 400 },
      );
    }

    const db = await getDb();
    const collection = db.collection("products");
    const collectionSlugs = await checkedCollectionSlugs(db, body.collectionSlugs);
    if (!collectionSlugs) return NextResponse.json({ error: "Select only existing collections." }, { status: 400 });

    const existing = await collection.findOne({ slug });

    if (existing) {
      return NextResponse.json(
        { error: "A product with this slug already exists." },
        { status: 409 },
      );
    }

    const now = new Date().toISOString();

    const product = {
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
      collectionSlugs,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(product);

    return NextResponse.json(
      { product: { ...product, _id: result.insertedId.toString() } },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to create product." },
      { status: 500 },
    );
  }
}
