import "server-only";

import { getDb } from "@/lib/mongodb";
import { DEFAULT_SHIPPING_SETTINGS, type ShippingSettings } from "@/lib/shipping";

type ShippingSettingsDocument = ShippingSettings & {
  _id: string;
  updatedAt?: string;
};

export async function getShippingSettings(): Promise<ShippingSettings> {
  const db = await getDb();
  const saved = await db.collection<ShippingSettingsDocument>("site_settings").findOne({ _id: "shipping" });

  if (!saved) return DEFAULT_SHIPPING_SETTINGS;

  return {
    standardCharge: saved.standardCharge,
    freeShippingThreshold: saved.freeShippingThreshold,
    freeShippingEnabled: saved.freeShippingEnabled,
  };
}

export async function saveShippingSettings(settings: ShippingSettings): Promise<void> {
  const db = await getDb();
  await db.collection<ShippingSettingsDocument>("site_settings").updateOne(
    { _id: "shipping" },
    { $set: { ...settings, updatedAt: new Date().toISOString() } },
    { upsert: true },
  );
}
