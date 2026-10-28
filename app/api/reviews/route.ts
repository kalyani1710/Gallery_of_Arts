import { NextResponse } from "next/server";
import { getApprovedSiteReviews } from "@/lib/reviews";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  try {
    return NextResponse.json({ reviews: await getApprovedSiteReviews() }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Could not load public reviews:", error);
    return NextResponse.json({ error: "Reviews are temporarily unavailable." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Enter your name, rating and feedback." }, { status: 400 });
    }
    const input = body as Record<string, unknown>;
    const name = cleanText(input.name);
    const comment = cleanText(input.comment);
    const rating = input.rating;
    if (name.length < 2 || name.length > 80 || comment.length < 5 || comment.length > 2000 || typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Enter a name, write at least 5 characters, and select 1–5 stars." }, { status: 400 });
    }

    const now = new Date().toISOString();
    await (await getDb()).collection("reviews").insertOne({
      scope: "site",
      productId: null,
      name,
      comment,
      rating,
      status: "pending",
      verifiedPurchase: false,
      createdAt: now,
      updatedAt: now,
    });
    return NextResponse.json({ message: "Thank you. Your feedback was submitted for review." }, { status: 201 });
  } catch (error) {
    console.error("Could not save customer feedback:", error);
    return NextResponse.json({ error: "Your feedback could not be saved. Please try again." }, { status: 500 });
  }
}
