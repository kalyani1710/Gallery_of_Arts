import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireOwner } from "@/lib/permissions";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };
type ReviewAuthorization =
  | { ok: true; id: ObjectId }
  | { ok: false; response: NextResponse };

async function authorizeReview(context: Context): Promise<ReviewAuthorization> {
  if (!(await requireOwner())) return { ok: false, response: NextResponse.json({ error: "Owner access required." }, { status: 403 }) };
  const { id } = await context.params;
  if (!ObjectId.isValid(id)) return { ok: false, response: NextResponse.json({ error: "Invalid review ID." }, { status: 400 }) };
  return { ok: true, id: new ObjectId(id) };
}

export async function PATCH(request: Request, context: Context) {
  try {
    const auth = await authorizeReview(context);
    if (!auth.ok) return auth.response;
    const body: unknown = await request.json();
    const status = body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>).status
      : undefined;
    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json({ error: "Choose approved or rejected." }, { status: 400 });
    }
    const result = await (await getDb()).collection("reviews").updateOne(
      { _id: auth.id, scope: "site", productId: null },
      { $set: { status, updatedAt: new Date().toISOString() } },
    );
    if (!result.matchedCount) return NextResponse.json({ error: "Review not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Could not moderate review:", error);
    return NextResponse.json({ error: "Unable to update review." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const auth = await authorizeReview(context);
    if (!auth.ok) return auth.response;
    const result = await (await getDb()).collection("reviews").deleteOne(
      { _id: auth.id, scope: "site", productId: null },
    );
    if (!result.deletedCount) return NextResponse.json({ error: "Review not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Could not delete review:", error);
    return NextResponse.json({ error: "Unable to delete review." }, { status: 500 });
  }
}
