import { NextResponse } from "next/server";
import { getShippingSettings } from "@/lib/shipping-settings";

export const runtime = "nodejs";

function safeLogDetails(error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown database error";
  return {
    name: error instanceof Error ? error.name : "UnknownError",
    message: message.replace(/mongodb(?:\+srv)?:\/\/\S+/gi, "[redacted MongoDB URI]"),
  };
}

export async function GET() {
  try {
    const settings = await getShippingSettings();
    return NextResponse.json({ settings }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Could not load shipping settings from MongoDB:", safeLogDetails(error));
    return NextResponse.json({ error: "Could not load shipping settings from the database. Please retry." }, {
      status: 500,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
