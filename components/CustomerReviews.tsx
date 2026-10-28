"use client";

import { useState, type FormEvent } from "react";
import { Heart, MessageCircle, Send, Sparkles, Star } from "lucide-react";
import type { SiteReview } from "@/lib/reviews";

export default function CustomerReviews({
  initialReviews,
  loadError = false,
}: {
  initialReviews: SiteReview[];
  loadError?: boolean;
}) {
  const [reviews] = useState(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!name.trim() || comment.trim().length < 5 || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      setError("Enter your name, write at least 5 characters, and select a rating.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, comment, rating }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Your feedback could not be submitted.");
      setName("");
      setComment("");
      setRating(0);
      setShowForm(false);
      setMessage(data.message || "Thank you. Your feedback was submitted for review.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your feedback could not be submitted. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="reviews" className="relative isolate overflow-hidden bg-[#FAF7F3] px-4 py-16 sm:px-6 md:py-24">
      <div className="pointer-events-none absolute -left-28 top-20 -z-10 h-72 w-72 rounded-full bg-[#F3DFE5]/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-10 -z-10 h-72 w-72 rounded-full bg-[#F1E5D3]/70 blur-3xl" />
      <div className="mx-auto max-w-7xl">
        <header className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E9D8D5] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#9B596D] shadow-sm">
            <Heart size={14} /> Words from our customers
          </span>
          <h2 className="mt-5 font-serif text-3xl font-semibold tracking-tight text-[#30242A] sm:text-4xl md:text-5xl">
            Made with love.<span className="mt-1 block italic text-[#A75D76]">Loved by you.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#75666A] sm:text-base">Share your experience and help others discover our handmade creations.</p>
        </header>

        <div className="mb-10 rounded-3xl border border-[#E9DFD8] bg-white px-5 py-8 text-center shadow-sm sm:px-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FAEFF1] text-[#A75D76]"><Sparkles size={23} /></div>
          <h3 className="mt-4 font-serif text-2xl font-semibold text-[#30242A]">How was your experience?</h3>
          {reviews.length > 0 ? (
            <p className="mt-3 text-sm text-[#817277]">Approved customer average: {average.toFixed(1)} / 5 from {reviews.length} {reviews.length === 1 ? "review" : "reviews"}</p>
          ) : (
            <p className="mt-3 text-sm text-[#817277]">{loadError ? "Approved feedback is temporarily unavailable." : "No published reviews yet. You can be the first to share feedback."}</p>
          )}
          <div className="mt-5 flex justify-center gap-2" role="group" aria-label="Select a rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => { setRating(star); setShowForm(true); }} aria-label={`${star} out of 5 stars`} aria-pressed={rating === star} className="rounded-lg p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A75D76]">
                <Star size={30} fill={star <= rating ? "currentColor" : "none"} className={star <= rating ? "text-[#C2934C]" : "text-[#D8CBC5]"} />
              </button>
            ))}
          </div>
          <button type="button" onClick={() => { setShowForm((current) => !current); setError(""); }} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#A75D76] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#89475F]">
            <MessageCircle size={16} /> {showForm ? "Close feedback form" : "Write a review"}
          </button>
        </div>

        {message && <p role="status" className="mb-5 rounded-2xl border border-[#E6D4D5] bg-white px-5 py-3 text-sm text-[#805263]">{message}</p>}
        {error && <p role="alert" className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-800">{error}</p>}

        {showForm && (
          <form onSubmit={submitReview} className="mb-10 rounded-3xl border border-[#E9DFD8] bg-white p-6 shadow-sm sm:p-9">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A75D76]">Share your experience</p>
              <h3 className="mt-2 font-serif text-2xl font-semibold text-[#30242A]">Tell us your story</h3>
              <p className="mt-2 text-sm text-[#817277]">Feedback is reviewed before it appears publicly. Reviews are not marked as verified purchases.</p>
            </div>
            <label htmlFor="customer-review-name" className="block text-sm font-medium text-[#49383D]">Your display name</label>
            <input id="customer-review-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={80} minLength={2} required autoComplete="name" placeholder="Enter your name" className="mt-2 w-full rounded-xl border border-[#E6DCD6] bg-[#FFFEFC] px-4 py-3.5 text-sm outline-none focus:border-[#A75D76] focus:ring-4 focus:ring-[#F6E9ED]" />
            <label className="mt-5 block text-sm font-medium text-[#49383D]">Your rating</label>
            <div className="mt-2 flex items-center gap-2" role="group" aria-label="Your rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)} aria-label={`Rate ${star} out of 5 stars`} aria-pressed={rating === star} className="rounded-lg p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#A75D76]">
                  <Star size={27} fill={star <= rating ? "currentColor" : "none"} className={star <= rating ? "text-[#C2934C]" : "text-[#D8CBC5]"} />
                </button>
              ))}
              <span className="text-sm text-[#817277]">{rating ? `${rating} out of 5` : "Choose a rating"}</span>
            </div>
            <label htmlFor="customer-review-comment" className="mt-5 block text-sm font-medium text-[#49383D]">Your feedback</label>
            <textarea id="customer-review-comment" value={comment} onChange={(event) => setComment(event.target.value)} maxLength={2000} minLength={5} required rows={4} placeholder="What would you like others to know?" className="mt-2 w-full resize-y rounded-xl border border-[#E6DCD6] bg-[#FFFEFC] px-4 py-3.5 text-sm leading-6 outline-none focus:border-[#A75D76] focus:ring-4 focus:ring-[#F6E9ED]" />
            <button type="submit" disabled={submitting || rating === 0} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#A75D76] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#89475F] disabled:cursor-not-allowed disabled:opacity-50">
              {submitting ? "Submitting…" : "Submit for review"} <Send size={15} />
            </button>
          </form>
        )}

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <article key={review.id} className="flex h-full flex-col rounded-3xl border border-[#E9DFD8] bg-white p-6 shadow-sm sm:p-7">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FAEFF1] font-serif text-lg font-semibold text-[#A75D76]" aria-hidden="true">{review.name.charAt(0).toUpperCase()}</div>
                  <div className="text-right">
                    <div className="flex justify-end gap-0.5 text-[#C2934C]" aria-label={`${review.rating} out of 5 stars`}>
                      {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={15} fill={star <= review.rating ? "currentColor" : "none"} />)}
                    </div>
                    <time className="mt-2 block text-xs text-[#9A8988]" dateTime={review.createdAt}>{new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</time>
                  </div>
                </div>
                <p className="mt-5 flex-1 whitespace-pre-wrap break-words text-sm leading-7 text-[#5F5054]">{review.comment}</p>
                <p className="mt-5 border-t border-[#F0E7E1] pt-4 font-semibold text-[#30242A]">{review.name}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#DCC9C3] bg-white/80 px-6 py-12 text-center">
            <Heart size={25} className="mx-auto text-[#A75D76]" />
            <h3 className="mt-4 font-serif text-xl font-semibold text-[#30242A]">Customer stories are on their way</h3>
            <p className="mt-2 text-sm leading-6 text-[#817277]">{loadError ? "Approved feedback is temporarily unavailable. Please try again later." : "Approved feedback will appear here."}</p>
          </div>
        )}
      </div>
    </section>
  );
}
