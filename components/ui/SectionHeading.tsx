import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" ? "mx-auto text-center" : "text-left")}>
      {eyebrow ? (
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.22em] text-secondary">{eyebrow}</p>
      ) : null}
      <h2 className="font-display text-3xl text-primary md:text-4xl">{title}</h2>
      {description ? <p className="mt-3 text-muted">{description}</p> : null}
    </div>
  );
}
