export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-card border border-primary/10 bg-white px-6 py-16 text-center shadow-soft">
      <p className="font-display text-2xl text-primary">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-muted">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
