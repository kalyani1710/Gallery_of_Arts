"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton({
  label = "Sign out",
  className = "rounded-xl border border-[#E0C7CD] px-4 py-2.5 text-sm font-semibold text-[#893D51] transition hover:bg-white",
}: {
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function logout() {
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Unable to sign out. Please try again.");
      window.dispatchEvent(new Event("gallery-auth-changed"));
      router.push("/");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign out. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={() => void logout()} disabled={loading} className={`${className} disabled:cursor-wait disabled:opacity-70`}>
        {loading ? "Logging out…" : label}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-rose-700">{error}</p>}
    </div>
  );
}
