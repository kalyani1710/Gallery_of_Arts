
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET() {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });

    return NextResponse.json({
      ok: true,
      message: "MongoDB connection successful",
    });
  } catch (error) {
    console.error("MongoDB connection test failed:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "MongoDB connection failed. Check server logs.",
      },
      { status: 500 }
    );
  }
}
