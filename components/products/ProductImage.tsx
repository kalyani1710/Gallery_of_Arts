"use client";

import { cn } from "@/lib/cn";
import Image from "next/image";
import { useState } from "react";

export function ProductImage({
  src,
  alt,
  className,
  fill = false,
  sizes,
  priority = false,
  objectFit = "contain",
}: {
  src?: string;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  objectFit?: "contain" | "cover";
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={`${alt}: image unavailable`}
        className={cn("flex items-center justify-center bg-soft-cream text-xs text-muted", fill && "absolute inset-0", className)}
      >
        Image unavailable
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : 800}
      height={fill ? undefined : 1000}
      sizes={sizes || "(max-width: 768px) 50vw, 25vw"}
      priority={priority}
      className={cn(objectFit === "contain" ? "object-contain" : "object-cover", className)}
      onError={() => setFailed(true)}
    />
  );
}
