import "server-only";

import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export type SiteReview = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type ReviewDocument = {
  _id: ObjectId;
  scope?: string;
  productId?: string | null;
  name?: string;
  rating?: number;
  comment?: string;
  status?: "pending" | "approved" | "rejected";
  createdAt?: Date | string;
};

function toSiteReview(document: ReviewDocument): SiteReview {
  const createdAt = document.createdAt instanceof Date
    ? document.createdAt.toISOString()
    : typeof document.createdAt === "string" ? document.createdAt : new Date(0).toISOString();
  return {
    id: document._id.toString(),
    name: document.name || "Customer",
    rating: typeof document.rating === "number" ? document.rating : 0,
    comment: document.comment || "",
    createdAt,
  };
}

export async function getApprovedSiteReviews(limit = 30): Promise<SiteReview[]> {
  const db = await getDb();
  const reviews = await db.collection<ReviewDocument>("reviews")
    .find({ scope: "site", status: "approved", productId: null })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return reviews.map(toSiteReview);
}

export async function getAdminSiteReviews(limit = 500) {
  const db = await getDb();
  const reviews = await db.collection<ReviewDocument>("reviews")
    .find({ scope: "site", productId: null })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return reviews.map((review) => ({ ...toSiteReview(review), status: review.status || "pending" }));
}
