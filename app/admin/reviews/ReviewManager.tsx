"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";

type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
};

export default function ReviewManager() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<"all" | Review["status"]>("pending");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/reviews", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load feedback.");
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load feedback.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadReviews(); }, [loadReviews]);

  const visibleReviews = useMemo(
    () => filter === "all" ? reviews : reviews.filter((review) => review.status === filter),
    [filter, reviews],
  );

  async function updateReview(review: Review, action: "approved" | "rejected" | "delete") {
    if (action === "delete" && !window.confirm("Permanently remove this feedback?")) return;
    setBusyId(review.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/reviews/${review.id}`, {
        method: action === "delete" ? "DELETE" : "PATCH",
        ...(action !== "delete" ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: action }) } : {}),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update feedback.");
      setNotice(action === "delete" ? "Feedback removed." : `Feedback ${action}.`);
      await loadReviews();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update feedback.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <section className="space-y-5">
      {error && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}
      {notice && <p role="status" className="rounded-xl bg-green-50 p-4 text-sm text-green-800">{notice}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-gallery-border bg-white p-4 shadow-card">
        <label className="flex items-center gap-3 text-sm font-medium" htmlFor="review-status-filter">
          Show
          <select id="review-status-filter" value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} className="rounded-lg border border-gallery-border bg-soft-cream px-3 py-2 text-ink">
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All feedback</option>
          </select>
        </label>
        <button type="button" onClick={() => void loadReviews()} disabled={loading} className="rounded-full border border-gallery-border px-4 py-2 text-sm font-medium transition hover:bg-soft-pink disabled:opacity-50">{loading ? "Refreshing…" : "Refresh"}</button>
      </div>

      {loading ? (
        <p role="status" className="rounded-2xl bg-white p-12 text-center text-sm text-gray-600">Loading feedback…</p>
      ) : visibleReviews.length === 0 ? (
        <div className="rounded-card border border-gallery-border bg-white p-12 text-center shadow-card">
          <h2 className="font-display text-lg font-medium">No {filter === "all" ? "feedback" : `${filter} feedback`} yet</h2>
          <p className="mt-2 text-sm text-muted">New customer submissions will appear here for moderation.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleReviews.map((review) => (
            <article key={review.id} className="rounded-card border border-gallery-border bg-white p-5 shadow-card sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                <h2 className="font-display font-medium">{review.name}</h2>
                  <p className="mt-1 text-xs text-gray-500">{new Date(review.createdAt).toLocaleString("en-IN")}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${review.status === "approved" ? "bg-green-50 text-green-700" : review.status === "rejected" ? "bg-gray-100 text-gray-600" : "bg-amber-50 text-amber-800"}`}>{review.status}</span>
              </div>
              <div className="mt-3 flex gap-1 text-amber-600" aria-label={`${review.rating} out of 5 stars`}>
                {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={17} fill={star <= review.rating ? "currentColor" : "none"} />)}
              </div>
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-muted">{review.comment}</p>
              <div className="mt-5 flex flex-wrap gap-2 border-t border-gallery-border pt-4">
                {review.status !== "approved" && <button type="button" disabled={busyId === review.id} onClick={() => void updateReview(review, "approved")} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-50">Approve</button>}
                {review.status !== "rejected" && <button type="button" disabled={busyId === review.id} onClick={() => void updateReview(review, "rejected")} className="rounded-full border border-gallery-border px-4 py-2 text-sm font-medium transition hover:bg-soft-pink disabled:opacity-50">Reject</button>}
                <button type="button" disabled={busyId === review.id} onClick={() => void updateReview(review, "delete")} className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50">Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
