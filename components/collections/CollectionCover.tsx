"use client";

import Image from "next/image";
import { useState } from "react";

export default function CollectionCover({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <div role="img" aria-label={`${alt}: cover image unavailable`} className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#F7E1E8] to-[#FFF5E6] text-sm text-[#795D69]">Collection cover</div>;
  }
  return <Image src={src} alt={alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.03]" onError={() => setFailed(true)} />;
}
