import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getPublicProducts } from "@/lib/catalog";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const idsParam = url.searchParams.get("ids");

    if (idsParam === null) {
      return NextResponse.json({ products: await getPublicProducts() });
    }

    const ids = [...new Set(idsParam.split(",").filter(Boolean))];
    if (ids.length > 50 || ids.some((id) => id.length > 64 || !ObjectId.isValid(id))) {
      return NextResponse.json({ error: "Invalid product list." }, { status: 400 });
    }

    return NextResponse.json({ products: await getPublicProducts(ids) });
  } catch (error) {
    console.error("Public product catalogue request failed:", error);
    return NextResponse.json(
      { error: "Unable to load products right now." },
      { status: 500 },
    );
  }
}
