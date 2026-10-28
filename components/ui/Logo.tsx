import { cn } from "@/lib/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span aria-hidden className="relative grid h-9 w-9 place-items-center rounded-full bg-soft-pink">
        <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none">
          <circle cx="16" cy="16" r="4" fill="#E8B86D" />
          <ellipse cx="16" cy="8" rx="4.5" ry="6" fill="#D98BA8" />
          <ellipse cx="16" cy="24" rx="4.5" ry="6" fill="#7C3F5D" />
          <ellipse cx="8" cy="16" rx="6" ry="4.5" fill="#D98BA8" />
          <ellipse cx="24" cy="16" rx="6" ry="4.5" fill="#7C3F5D" />
        </svg>
      </span>
      <span className="font-display text-xl tracking-wide text-primary md:text-[1.35rem]">
        Gallery of Art
      </span>
    </span>
  );
}
