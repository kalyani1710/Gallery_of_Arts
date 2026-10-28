"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_SHIPPING_SETTINGS, type ShippingSettings } from "@/lib/shipping";

function isShippingSettings(value: unknown): value is ShippingSettings {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const settings = value as Record<string, unknown>;
  return typeof settings.standardCharge === "number"
    && Number.isFinite(settings.standardCharge)
    && settings.standardCharge >= 0
    && typeof settings.freeShippingThreshold === "number"
    && Number.isFinite(settings.freeShippingThreshold)
    && settings.freeShippingThreshold >= 0
    && typeof settings.freeShippingEnabled === "boolean";
}

export default function ShippingSettingsForm() {
  const [settings, setSettings] = useState<ShippingSettings>({ ...DEFAULT_SHIPPING_SETTINGS });
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const loadInFlight = useRef(false);
  const saveInFlight = useRef(false);

  const loadSettings = useCallback(async () => {
    if (loadInFlight.current) return;
    loadInFlight.current = true;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/shipping-settings", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load shipping settings.");
      if (!isShippingSettings(data.settings)) throw new Error("The server returned invalid shipping settings. Please retry.");
      setSettings(data.settings);
      setLoaded(true);
    } catch (cause) {
      setLoaded(false);
      setError(cause instanceof Error ? cause.message : "Could not load shipping settings.");
    } finally {
      loadInFlight.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saveInFlight.current) return;
    saveInFlight.current = true;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/shipping-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save shipping settings.");
      if (!isShippingSettings(data.settings)) throw new Error("The server saved the settings but returned an invalid response. Reload the page to confirm the current values.");
      setSettings(data.settings);
      setLoaded(true);
      setNotice("Shipping settings saved. New orders will use these values; existing orders are unchanged.");
      window.dispatchEvent(new Event("gallery-shipping-settings-changed"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save shipping settings.");
    } finally {
      saveInFlight.current = false;
      setSaving(false);
    }
  }

  const inputClass = "mt-2 w-full rounded-xl border border-gallery-border bg-soft-cream px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/10";

  return (
    <form onSubmit={saveSettings} className="rounded-card border border-gallery-border bg-white p-6 shadow-card sm:p-8">
      {error && <p role="alert" className="mb-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}
      {notice && <p role="status" className="mb-5 rounded-xl bg-green-50 p-4 text-sm text-green-800">{notice}</p>}
      {loading ? (
        <p role="status" className="py-8 text-center text-sm text-gray-600">Loading shipping settings…</p>
      ) : !loaded ? (
        <div className="py-8 text-center">
          <p className="text-sm text-gray-600">Shipping settings could not be loaded, so they cannot be edited safely.</p>
          <button type="button" onClick={() => void loadSettings()} disabled={loading} className="mt-4 rounded-full border border-gallery-border px-4 py-2 text-sm font-medium transition hover:bg-soft-pink disabled:opacity-60">Retry loading</button>
        </div>
      ) : (
        <>
          <label className="block text-sm font-medium">
            Standard shipping charge (₹)
            <input type="number" min="0" max="1000000" step="0.01" required value={settings.standardCharge} onChange={(event) => setSettings((current) => ({ ...current, standardCharge: Number(event.target.value) }))} className={inputClass} />
          </label>
          <label className="mt-5 block text-sm font-medium">
            Free-shipping threshold (₹)
            <input type="number" min="0" max="1000000" step="0.01" required value={settings.freeShippingThreshold} onChange={(event) => setSettings((current) => ({ ...current, freeShippingThreshold: Number(event.target.value) }))} disabled={!settings.freeShippingEnabled} className={`${inputClass} disabled:bg-gray-100`} />
          </label>
          <label className="mt-6 flex items-start gap-3 rounded-xl border border-gallery-border p-4 text-sm">
            <input type="checkbox" checked={settings.freeShippingEnabled} onChange={(event) => setSettings((current) => ({ ...current, freeShippingEnabled: event.target.checked }))} className="mt-0.5 h-4 w-4 accent-primary" />
            <span><span className="font-semibold">Enable free shipping threshold</span><span className="mt-1 block text-muted">When enabled, orders at or above the threshold have no shipping charge.</span></span>
          </label>
          <div className="mt-6 rounded-xl bg-soft-cream p-4 text-sm text-muted">
            {settings.freeShippingEnabled
              ? `Orders under ₹${settings.freeShippingThreshold.toFixed(2)} are charged ₹${settings.standardCharge.toFixed(2)} shipping; orders at or above the threshold ship free.`
              : `All non-empty orders are charged ₹${settings.standardCharge.toFixed(2)} shipping.`}
          </div>
          <button type="submit" disabled={saving || loading || !loaded} className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-dark disabled:cursor-wait disabled:opacity-60">{saving ? "Saving…" : "Save Shipping Settings"}</button>
        </>
      )}
    </form>
  );
}
