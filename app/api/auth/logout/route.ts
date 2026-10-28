
import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth";

export async function POST() {
  try {
    await deleteSession();

    return NextResponse.json({
      ok: true,
      message: "You have signed out successfully.",
    });
  } catch (error) {
    console.error("Logout failed:", error);

    return NextResponse.json(
      { ok: false, message: "Unable to sign out. Please try again." },
      { status: 500 }
    );
  }
}
