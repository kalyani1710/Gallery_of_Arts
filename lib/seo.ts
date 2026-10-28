import { siteConfig } from "@/config/site";
import type { Metadata } from "next";

export function createMetadata(input: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  const url = `${siteConfig.url}${input.path || ""}`;
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: url },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: siteConfig.name,
      locale: "en_IN",
      type: "website",
    },
  };
}
