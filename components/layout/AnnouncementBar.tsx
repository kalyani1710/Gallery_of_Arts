"use client";

import { readStorage, writeStorage } from "@/lib/storage";
import { siteConfig } from "@/config/site";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!readStorage("goa-announcement-dismissed", false));
  }, []);

  if (!visible) return null;

  return (
    <div className="bg-primary px-4 py-2 text-center text-xs text-white md:text-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-3">
        <p>{siteConfig.announcement}</p>
        <button
          type="button"
          aria-label="Dismiss announcement"
          onClick={() => {
            writeStorage("goa-announcement-dismissed", true);
            setVisible(false);
          }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
