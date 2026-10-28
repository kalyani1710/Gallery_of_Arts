
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { createSession, hashPassword } from "@/lib/auth";

export const runtime = "nodejs";

type UserDocument = {
  name: string;
  email: string;
  passwordHash: string;
  role: "customer";
  createdAt: Date;
};

function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

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
    const name = cleanText(input.name, 100);
    const email = cleanText(input.email, 254).toLowerCase();
    const password =
      typeof input.password === "string" ? input.password : "";

    if (name.length < 2) {
      return NextResponse.json(
        { ok: false, message: "Please enter your full name." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { ok: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 12 || password.length > 72) {
      return NextResponse.json(
        {
          ok: false,
          message: "Your password must be between 12 and 72 characters.",
        },
        { status: 400 }
      );
    }

    const db = await getDb();
    const users = db.collection<UserDocument>("users");

    const existingUser = await users.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        {
          ok: false,
          message: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    const user: UserDocument = {
      name,
      email,
      passwordHash: await hashPassword(password),
      role: "customer",
      createdAt: new Date(),
    };

    const result = await users.insertOne(user);

    try {
      await createSession({
        userId: result.insertedId.toString(),
        name: user.name,
        email: user.email,
        role: "customer",
      });
    } catch (sessionError) {
      // Registration succeeded, but session creation failed.
      // Do not expose internal details to the browser.
      console.error("Registration session creation failed:", sessionError);

      return NextResponse.json(
        {
          ok: true,
          message: "Account created. Please sign in.",
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Your account has been created successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Customer registration failed:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "We could not create your account. Please try again.",
      },
      { status: 500 }
    );
  }
}
