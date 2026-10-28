export default function AdminOrdersLoading() {
  return (
    <main className="min-h-screen bg-gallery-paper text-ink" aria-busy="true">
      <div className="page-container section-space">
        <h1 className="font-display text-3xl font-medium">Order Management</h1>
        <p role="status" className="mt-4 rounded-card border border-gallery-border bg-white p-6 text-sm text-muted shadow-card">Loading store and custom orders…</p>
      </div>
    </main>
  );
}
