
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  House,
  ShoppingBag,
  UserRound,
  ShieldCheck,
  Package,
  Clock3,
  CheckCircle2,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { ScrollReveal } from "@/components/motion/Reveal";

type OrderDocument = {
  _id: ObjectId;
  userId?: string;
  name?: string;
  productType?: string;
  details?: string;
  status?: string;
  createdAt?: Date;
};

export const runtime = "nodejs";

function getStatusStyle(status: string) {
  const value = status.toLowerCase();

  if (value.includes("complete") || value.includes("delivered")) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
  }

  if (value.includes("progress") || value.includes("process")) {
    return "bg-blue-50 text-blue-700 ring-blue-600/20";
  }

  if (value.includes("cancel")) {
    return "bg-red-50 text-red-700 ring-red-600/20";
  }

  return "bg-amber-50 text-amber-700 ring-amber-600/20";
}

export default async function AccountPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const db = await getDb();

  const orders = await db
    .collection<OrderDocument>("custom_orders")
    .find({ userId: session.userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  const isOwner = session.role === "owner";

  const completedOrders = orders.filter((order) => {
    const status = (order.status || "").toLowerCase();
    return status.includes("complete") || status.includes("delivered");
  }).length;

  const pendingOrders = orders.filter((order) => {
    const status = (order.status || "pending").toLowerCase();
    return (
      status.includes("pending") ||
      status.includes("progress") ||
      status.includes("process")
    );
  }).length;

  const quickLinks = [
    {
      title: "Explore the shop",
      description: "Discover handmade gifts and accessories.",
      href: "/shop",
      icon: ShoppingBag,
      label: "Shop now",
    },
    {
      title: "Back to home",
      description: "Explore the latest from Gallery of Arts.",
      href: "/",
      icon: House,
      label: "Visit home",
    },
  ];

  return (
    <main className="min-h-screen bg-gallery-paper text-ink">
      <ScrollReveal className="page-container section-space">
        {/* Welcome banner */}
        <section className="relative isolate overflow-hidden rounded-card border border-gallery-border bg-soft-pink p-6 shadow-card sm:p-9 lg:p-12">
          <div className="pointer-events-none absolute -right-12 -top-20 -z-10 h-64 w-64 rounded-full border border-[#DCAEB8]/50" />
          <div className="pointer-events-none absolute -bottom-28 right-28 -z-10 h-72 w-72 rounded-full border border-[#DCAEB8]/40" />

          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                YOUR ACCOUNT
              </p>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                Welcome back, {session.name}!
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-muted sm:text-base">
                Keep track of your handmade requests, explore something new,
                and stay connected with Gallery of Arts.
              </p>
              {isOwner && (
                <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-3 py-1.5 text-sm text-primary">
                  <ShieldCheck size={16} />
                  Administrator account
                </span>
              )}
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-white transition hover:bg-primary-dark"
            >
              Discover handmade pieces
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>

        {/* Overview cards */}
        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-card border border-gallery-border bg-white p-6 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted">
                Custom requests
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-soft-pink text-primary">
                <Package size={20} />
              </span>
            </div>
            <p className="mt-4 font-display text-4xl font-semibold text-ink">{orders.length}</p>
            <p className="mt-1 text-sm text-muted">
              Requests submitted by you
            </p>
          </article>

          <article className="rounded-card border border-gallery-border bg-white p-6 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted">
                In progress
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-soft-cream text-[#9B7042]">
                <Clock3 size={20} />
              </span>
            </div>
            <p className="mt-4 font-display text-4xl font-semibold text-ink">{pendingOrders}</p>
            <p className="mt-1 text-sm text-muted">
              Waiting or being prepared
            </p>
          </article>

          <article className="rounded-card border border-gallery-border bg-white p-6 shadow-card sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted">
                Completed
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-soft-cream text-[#58734F]">
                <CheckCircle2 size={20} />
              </span>
            </div>
            <p className="mt-4 font-display text-4xl font-semibold text-ink">{completedOrders}</p>
            <p className="mt-1 text-sm text-muted">
              Completed custom requests
            </p>
          </article>
        </section>

        {/* Shortcuts */}
        <section className="mt-12">
          <div className="mb-5">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
              Quick access
            </h2>
            <p className="mt-1 text-sm text-muted">
              Everything you need, in one place.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {quickLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex items-center gap-4 rounded-card border border-gallery-border bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-[#D9A0B4] hover:shadow-[0_18px_45px_rgba(185,77,118,0.10)] sm:p-6"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-soft-pink text-primary">
                    <Icon size={23} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{item.title}</span>
                    <span className="mt-1 block text-sm leading-6 text-muted">
                      {item.description}
                    </span>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                      {item.label}
                      <ArrowUpRight
                        size={15}
                        className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Profile */}
        <section className="mt-12 rounded-card border border-gallery-border bg-white p-6 shadow-card sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-soft-pink text-primary">
                <UserRound size={23} />
              </span>
              <div>
                <h2 className="font-display text-2xl font-semibold text-ink">Profile information</h2>
                <p className="mt-1 text-sm text-muted">
                  Your registered account details.
                </p>
              </div>
            </div>

            {isOwner && (
              <span className="rounded-full bg-soft-pink px-3 py-1.5 text-xs font-semibold text-primary">
                ADMINISTRATOR
              </span>
            )}
          </div>

          <div className="mt-6 grid gap-5 border-t border-gallery-border pt-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Full name
              </p>
              <p className="mt-2 font-medium text-ink">{session.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Email address
              </p>
              <p className="mt-2 break-all font-medium text-ink">{session.email}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Account type
              </p>
              <p className="mt-2 font-medium text-ink">
                {isOwner ? "Administrator" : "Customer"}
              </p>
            </div>
          </div>
        </section>

        {/* Customer's own custom requests */}
        <section className="mt-12">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                YOUR REQUESTS
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
                My Custom Orders
              </h2>
              <p className="mt-2 text-sm text-muted">
                Track the progress of your personal handmade requests.
              </p>
            </div>

            <Link
              href="/custom-orders"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-primary-dark"
            >
              New custom request
              <ArrowRight size={16} />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-card border border-dashed border-gallery-border bg-white px-5 py-12 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-soft-pink text-primary">
                <Package size={26} />
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold text-ink">
                Your handmade journey starts here
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted">
                You haven't submitted a custom request yet. Tell us what
                you'd love to create, and keep track of its progress here.
              </p>
              <Link
                href="/custom-orders"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-primary-dark"
              >
                Create your first request
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const status = order.status || "Pending";

                return (
                  <article
                    key={order._id.toString()}
                    className="rounded-card border border-gallery-border bg-white p-5 shadow-card transition hover:border-[#D9A0B4] hover:shadow-md sm:p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-soft-pink text-primary">
                          <Package size={20} />
                        </span>
                        <div>
                          <h3 className="font-semibold">
                            {order.productType || "Custom handmade order"}
                          </h3>
                          <p className="mt-1 text-xs text-muted">
                            Order reference: {order._id.toString()}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${getStatusStyle(status)}`}
                      >
                        {status}
                      </span>
                    </div>

                    {order.details && (
                      <p className="mt-5 whitespace-pre-wrap border-t border-gallery-border pt-4 text-sm leading-7 text-muted">
                        {order.details}
                      </p>
                    )}

                    {order.createdAt && (
                      <p className="mt-4 text-xs text-muted">
                        Submitted on{" "}
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer className="mt-14 border-t border-gallery-border py-6 text-sm text-muted">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <div>
              <p className="font-semibold text-ink">Gallery of Arts</p>
              <p className="mt-1 text-xs">Handmade Happiness, One Twist at a Time.</p>
            </div>
            <nav aria-label="Account footer" className="flex flex-wrap justify-center gap-x-5 gap-y-2">
              <Link href="/" className="transition hover:text-primary">Home</Link>
              <Link href="/collections" className="transition hover:text-primary">Collections</Link>
              <Link href="/gallery" className="transition hover:text-primary">Gallery</Link>
              <Link href="/contact" className="transition hover:text-primary">Contact</Link>
            </nav>
          </div>
          <p className="mt-5 border-t border-gallery-border pt-4 text-center text-xs">© {new Date().getFullYear()} Gallery of Arts. All rights reserved.</p>
        </footer>
      </ScrollReveal>
    </main>
  );
}
