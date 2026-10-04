"use client";

import { Check, ChevronDown, RotateCcw } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCommerce } from "@/ds/commerce/CommerceProvider";
import { EmptyState } from "@/ds/commerce/EmptyState";
import { listOrders, type Order } from "@/ds/data/account";
import { Button, ButtonLink } from "@/ds/ui/Button";
import { PageIntro } from "@/ds/ui/PageIntro";
import { formatEGP } from "@/ds/ui/Price";
import { ProductShot } from "@/ds/ui/ProductShot";

const crumbs = [{ href: "/", label: "Home" }];
const date = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const when = (v?: string) => {
  const d = v ? new Date(v) : null;
  return d && !Number.isNaN(d.getTime()) ? date.format(d) : null;
};

/**
 * The API tracks exactly two facts about an order after it's placed: paid, and
 * delivered. Three steps, no invented "shipped" or "out for delivery".
 */
function Timeline({ order }: { order: Order }) {
  const cash = order.paymentMethodType !== "card";
  const steps = [
    { label: "Placed", done: true, note: when(order.createdAt) },
    {
      label: "Paid",
      done: !!order.isPaid,
      note: order.isPaid ? when(order.paidAt) : cash ? "On delivery" : "Pending",
    },
    {
      label: "Delivered",
      done: !!order.isDelivered,
      note: order.isDelivered ? when(order.deliveredAt) : "Not yet",
    },
  ];
  const reached = steps.filter((s) => s.done).length;
  return (
    <ol className="grid grid-cols-3" aria-label={`Order status: ${steps[reached - 1].label}`}>
      {steps.map((s, i) => (
        <li key={s.label} className="relative grid justify-items-start gap-2 pr-4" aria-current={i === reached - 1 ? "step" : undefined}>
          {i < steps.length - 1 && (
            <span aria-hidden className="absolute top-[11px] right-0 left-7 h-px bg-line">
              <span
                className="block h-full origin-left bg-fg transition-transform duration-(--dur-light) ease-light"
                style={{ transform: `scaleX(${steps[i + 1].done ? 1 : 0})` }}
              />
            </span>
          )}
          <span
            aria-hidden
            className={cn(
              "grid size-6 place-items-center rounded-full border",
              s.done ? "border-fg bg-fg text-canvas" : "border-line-strong text-transparent",
            )}
          >
            <Check size={14} strokeWidth={2.25} />
          </span>
          <span className="grid gap-0.5">
            <span className={cn("t-label", !s.done && "text-fg-3")}>
              {s.label}
              <span className="sr-only">{s.done ? " — done" : " — not yet"}</span>
            </span>
            {s.note && <span className="t-caption t-num text-fg-3">{s.note}</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}

function OrderCard({ order }: { order: Order }) {
  const { addToBag, openBag } = useCommerce();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const items = (order.cartItems ?? []).filter((it) => it.product?._id);
  const key = String(order._id ?? order.id);
  const label = order.id != null ? `#${order.id}` : `#${key.slice(-6).toUpperCase()}`;
  const units = items.reduce((s, it) => s + (it.count ?? 1), 0);

  async function reorder() {
    setBusy(true);
    let added = 0;
    // One at a time: the API mutates a single cart, and parallel writes would race.
    for (const it of items) {
      const p = it.product!;
      const ok = await addToBag(
        {
          _id: p._id!,
          title: p.title ?? "Product",
          imageCover: p.imageCover ?? "",
          price: it.price ?? 0,
        },
        { count: it.count ?? 1, quiet: true },
      );
      if (ok) added++;
      else break;
    }
    setBusy(false);
    if (added) {
      toast(added === items.length ? "Everything from that order is in your bag." : `${added} of ${items.length} items added to your bag.`);
      openBag();
    }
  }

  return (
    <li className="grid gap-8 rounded-card border border-line p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-4">
        <div className="grid gap-1">
          <h2 className="t-h3 t-num">Order {label}</h2>
          <p className="t-caption text-fg-3">
            {when(order.createdAt) ?? "Date unknown"} · {order.paymentMethodType === "card" ? "Card" : "Cash on delivery"} · {units}{" "}
            {units === 1 ? "item" : "items"}
          </p>
        </div>
        <p className="t-h3 t-num">{formatEGP(order.totalOrderPrice ?? 0)}</p>
      </div>

      <Timeline order={order} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <ul className="flex items-center gap-2" aria-label="Items in this order">
          {items.slice(0, 5).map((it) => (
            <li key={it.product!._id}>
              <Link href={`/products/${it.product!._id}`} aria-label={it.product!.title} className="group block rounded-card">
                <ProductShot src={it.product!.imageCover ?? ""} alt="" sizes="48px" className="w-12" />
              </Link>
            </li>
          ))}
          {items.length > 5 && <li className="t-caption t-num text-fg-3">+{items.length - 5}</li>}
        </ul>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="text"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls={`order-${key}`}
            trailingIcon={
              <ChevronDown aria-hidden strokeWidth={1.5} className={cn("transition-transform duration-(--dur-state)", open && "rotate-180")} />
            }
          >
            {open ? "Hide details" : "Details"}
          </Button>
          {items.length > 0 && (
            <Button
              variant="secondary"
              onClick={reorder}
              loading={busy}
              loadingLabel="Adding to bag"
              leadingIcon={<RotateCcw aria-hidden strokeWidth={1.5} />}
            >
              Reorder
            </Button>
          )}
        </div>
      </div>

      {/* Opens by unfolding, not by popping in. -mt-8 cancels the card's gap so nothing jumps at height 0. */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="details"
            id={`order-${key}`}
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="-mt-8 overflow-hidden"
          >
            <div className="mt-8 grid gap-8 border-t border-line pt-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-16">
              <ul className="grid gap-4">
                {items.map((it) => (
                  <li key={it.product!._id} className="flex items-center gap-4">
                    <ProductShot src={it.product!.imageCover ?? ""} alt="" sizes="56px" className="w-14 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${it.product!._id}`}
                        className="line-clamp-1 pb-0.5 t-body underline-reveal underline-offset-4 hover:decoration-line-strong"
                      >
                        {it.product!.title}
                      </Link>
                      <p className="t-caption t-num text-fg-3">
                        {it.count ?? 1} × {formatEGP(it.price ?? 0)}
                      </p>
                    </div>
                    <p className="shrink-0 t-body t-num">{formatEGP((it.price ?? 0) * (it.count ?? 1))}</p>
                  </li>
                ))}
              </ul>
              {order.shippingAddress && (
                <dl className="grid content-start gap-1">
                  <dt className="t-caption text-fg-3">Delivering to</dt>
                  <dd className="t-body">{[order.shippingAddress.details, order.shippingAddress.city].filter(Boolean).join(", ")}</dd>
                  {order.shippingAddress.phone && <dd className="t-body t-num text-fg-2">{order.shippingAddress.phone}</dd>}
                </dl>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export function OrdersView() {
  const { data: session, status } = useSession();
  const token = session?.accessToken ?? null;
  const userId = session?.user?.id ?? null;
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!token || !userId) return;
    let live = true;
    listOrders(token, userId)
      .then((list) => {
        if (!live) return;
        setOrders(list);
        setError(null);
      })
      .catch((e: Error) => live && setError(e.message));
    return () => {
      live = false;
    };
  }, [token, userId, attempt]);

  if (status === "unauthenticated") {
    return (
      <>
        <PageIntro crumbs={crumbs} title="Your orders" />
        <EmptyState
          className="py-10"
          title="Sign in to see your orders."
          action={<ButtonLink href="/login?callbackUrl=/orders">Sign in</ButtonLink>}
        />
      </>
    );
  }

  if (status === "authenticated" && !userId) {
    return (
      <>
        <PageIntro crumbs={crumbs} title="Your orders" />
        <EmptyState
          className="py-10"
          title="We couldn't identify your account."
          body="Sign out and back in, and your orders will load."
          action={<ButtonLink href="/login?callbackUrl=/orders">Sign in again</ButtonLink>}
        />
      </>
    );
  }

  if (error && !orders) {
    return (
      <>
        <PageIntro crumbs={crumbs} title="Your orders" />
        <EmptyState
          className="py-10"
          title="Your orders didn't load."
          body={error}
          action={
            <Button
              onClick={() => {
                setError(null);
                setAttempt((n) => n + 1);
              }}
            >
              Try again
            </Button>
          }
        />
      </>
    );
  }

  if (!orders) {
    return (
      <>
        <PageIntro crumbs={crumbs} title="Your orders" />
        <ul role="status" aria-label="Loading your orders" className="grid gap-5">
          {[0, 1].map((i) => (
            <li key={i} className="skeleton h-72 rounded-card" />
          ))}
        </ul>
      </>
    );
  }

  if (!orders.length) {
    return (
      <>
        <PageIntro crumbs={crumbs} title="Your orders" />
        <EmptyState
          className="py-10"
          title="No orders yet."
          body="When you place one, it shows up here with its status."
          action={<ButtonLink href="/products">Browse products</ButtonLink>}
        />
      </>
    );
  }

  return (
    <>
      <PageIntro crumbs={crumbs} title="Your orders">
        <span className="t-num">
          {orders.length} {orders.length === 1 ? "order" : "orders"}
        </span>
      </PageIntro>
      <ul className="enter grid gap-5">
        {orders.map((o) => (
          <OrderCard key={String(o._id ?? o.id)} order={o} />
        ))}
      </ul>
    </>
  );
}
