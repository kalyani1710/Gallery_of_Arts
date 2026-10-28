import { siteConfig } from "@/config/site";

export function formatPrice(amount: number) {
  return `${siteConfig.currencySymbol}${amount.toLocaleString("en-IN")}`;
}
