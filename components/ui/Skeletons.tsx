export function ProductSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-card bg-white shadow-soft">
          <div className="aspect-[4/5] animate-pulse bg-soft-pink/70" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-soft-cream" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-soft-cream" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductPageSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="aspect-square animate-pulse rounded-card bg-soft-pink/70" />
      <div className="space-y-4">
        <div className="h-8 w-2/3 animate-pulse rounded bg-soft-cream" />
        <div className="h-5 w-1/3 animate-pulse rounded bg-soft-cream" />
        <div className="h-24 animate-pulse rounded bg-soft-cream" />
      </div>
    </div>
  );
}

export function CollectionSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-56 animate-pulse rounded-card bg-soft-pink/60" />
      ))}
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-16 animate-pulse rounded-2xl bg-soft-cream" />
      ))}
    </div>
  );
}
