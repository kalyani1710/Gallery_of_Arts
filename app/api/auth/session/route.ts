import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  return NextResponse.json(
    { role: session?.role ?? null, userId: session?.userId ?? null },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
