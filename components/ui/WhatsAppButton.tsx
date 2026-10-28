"use client";

import { createWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";
import { MessageCircle } from "lucide-react";

export function WhatsAppButton({
  message,
  label = "Order on WhatsApp",
  className,
  compact = false,
}: {
  message: string;
  label?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <a
      href={createWhatsAppUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-medium text-white transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        compact && "px-3",
        className,
      )}
    >
      <MessageCircle className="h-4 w-4" aria-hidden />
      {label}
    </a>
  );
}
