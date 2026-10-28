import { siteConfig } from "@/config/site";

export type ShippingSettings = {
  standardCharge: number;
  freeShippingThreshold: number;
  freeShippingEnabled: boolean;
};

export const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  standardCharge: siteConfig.shipping.standard,
  freeShippingThreshold: siteConfig.shipping.freeAbove,
  freeShippingEnabled: true,
};

export function getShippingAmount(subtotal: number, settings: ShippingSettings = DEFAULT_SHIPPING_SETTINGS) {
  if (subtotal <= 0) return 0;
  if (settings.freeShippingEnabled && subtotal >= settings.freeShippingThreshold) return 0;
  return settings.standardCharge;
}
