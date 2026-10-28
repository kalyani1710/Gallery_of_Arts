
import "server-only";

import { ObjectId } from "mongodb";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

export async function requireOwner() {
  const session = await getSession();

  if (!session || !ObjectId.isValid(session.userId)) {
    return null;
  }

  const db = await getDb();

  const user = await db.collection("users").findOne(
    { _id: new ObjectId(session.userId) },
    { projection: { role: 1 } }
  );

  if (!user || user.role !== "owner") {
    return null;
  }

  return session;
}
