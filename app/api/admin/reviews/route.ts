import { NextResponse } from "next/server";
import { getAdminSiteReviews } from "@/lib/reviews";
import { requireOwner } from "@/lib/permissions";

export const runtime = "nodejs";

export async function GET() {
  try {
    if (!(await requireOwner())) return NextResponse.json({ error: "Owner access required." }, { status: 403 });
    return NextResponse.json({ reviews: await getAdminSiteReviews() }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Could not load review moderation queue:", error);
    return NextResponse.json({ error: "Unable to load reviews." }, { status: 500 });
  }
}
