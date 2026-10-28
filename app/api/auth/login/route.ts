
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { createSession, verifyPassword } from "@/lib/auth";

export const runtime = "nodejs";

type UserDocument = {
  _id: import("mongodb").ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: "customer" | "owner";
};

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { ok: false, message: "Invalid request data." },
        { status: 400 }
      );
    }

    const input = body as Record<string, unknown>;
    const email =
      typeof input.email === "string"
        ? input.email.trim().toLowerCase()
        : "";
    const password =
      typeof input.password === "string" ? input.password : "";

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !password ||
      password.length > 72
    ) {
      return NextResponse.json(
        { ok: false, message: "Please enter a valid email and password." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const user = await db.collection<UserDocument>("users").findOne({
      email,
    });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json(
        { ok: false, message: "Incorrect email or password." },
        { status: 401 }
      );
    }

    await createSession({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      ok: true,
      role: user.role,
      message: "You have signed in successfully.",
    });
  } catch (error) {
    console.error("Customer login failed:", error);

    return NextResponse.json(
      { ok: false, message: "Unable to sign in. Please try again." },
      { status: 500 }
    );
  }
}
