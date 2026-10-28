
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Eye, EyeOff, UserRound, Mail, LockKeyhole } from "lucide-react";
import { ScrollReveal } from "@/components/motion/Reveal";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 12) {
      setError("Please use a password with at least 12 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        setError(result.message || "Unable to create your account.");
        return;
      }

      setSuccess("Your account is ready! Redirecting...");
      router.push("/account");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gallery-paper px-4 py-12 text-ink md:py-20">
      <ScrollReveal className="mx-auto max-w-5xl">
      <div className="grid overflow-hidden rounded-card border border-gallery-border bg-white shadow-card md:grid-cols-2">
        <section className="flex flex-col justify-center bg-soft-pink p-8 md:p-12">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
            <Heart size={28} />
          </div>
          <p className="editorial-eyebrow mb-3">
            Gallery of Arts
          </p>
          <h1 className="mb-5 font-display text-3xl font-medium leading-tight md:text-4xl">
            Handmade happiness starts here.
          </h1>
          <p className="max-w-sm leading-7 text-muted">
            Create an account to keep track of your custom craft orders and
            stay connected with our handmade creations.
          </p>
          <div className="mt-10 rounded-card border border-white/80 bg-white/60 p-5">
            <p className="font-display italic leading-7 text-muted">
              “Handmade Happiness, One Twist at a Time.”
            </p>
          </div>
        </section>

        <section className="p-7 md:p-12">
          <h2 className="font-display text-2xl font-medium text-ink">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-muted">
            Join our handmade community.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-ink">
                Full name
              </label>
              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={100}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-gallery-border bg-soft-cream py-3 pl-10 pr-4 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-ink">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gallery-border bg-soft-cream py-3 pl-10 pr-4 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-ink">
                Password
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={12}
                  maxLength={72}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 12 characters"
                  className="w-full rounded-xl border border-gallery-border bg-soft-cream py-3 pl-10 pr-12 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-ink">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={72}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Enter your password again"
                className="w-full rounded-xl border border-gallery-border bg-soft-cream px-4 py-3 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            {success && (
              <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-primary px-4 py-3.5 font-medium text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>

          <p className="mt-5 text-center text-xs leading-5 text-gray-400">
            Your account details are used to manage your Gallery of Arts orders.
          </p>
        </section>
      </div>
      </ScrollReveal>
    </main>
  );
}
