import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/permissions";
import { getShippingSettings, saveShippingSettings } from "@/lib/shipping-settings";

export const runtime = "nodejs";

function safeLogDetails(error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown database error";
  return {
    name: error instanceof Error ? error.name : "UnknownError",
    message: message.replace(/mongodb(?:\+srv)?:\/\/\S+/gi, "[redacted MongoDB URI]"),
  };
}

function validMoney(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1_000_000;
}

export async function GET() {
  try {
    if (!(await requireOwner())) return NextResponse.json({ error: "Owner access required." }, { status: 403 });
    const settings = await getShippingSettings();
    return NextResponse.json({ settings }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Could not load admin shipping settings from MongoDB:", safeLogDetails(error));
    return NextResponse.json({ error: "Could not load shipping settings from the database. Please retry." }, {
      status: 500,
      headers: { "Cache-Control": "no-store" },
    });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await requireOwner())) return NextResponse.json({ error: "Owner access required." }, { status: 403 });
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Enter valid shipping settings." }, { status: 400 });
    }
    const input = body as Record<string, unknown>;
    if (!validMoney(input.standardCharge) || !validMoney(input.freeShippingThreshold) || typeof input.freeShippingEnabled !== "boolean") {
      return NextResponse.json({ error: "Shipping charge and threshold must be non-negative amounts, and free shipping must be enabled or disabled." }, { status: 400 });
    }
    const settings = {
      standardCharge: Math.round(input.standardCharge * 100) / 100,
      freeShippingThreshold: Math.round(input.freeShippingThreshold * 100) / 100,
      freeShippingEnabled: input.freeShippingEnabled,
    };
    await saveShippingSettings(settings);
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    console.error("Could not save admin shipping settings to MongoDB:", safeLogDetails(error));
    return NextResponse.json({ error: "Could not save shipping settings to the database. Please retry." }, { status: 500 });
  }
}
