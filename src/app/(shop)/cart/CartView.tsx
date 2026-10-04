"use client";

import { Heart, Trash2 } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState, type FormEvent } from "react";
import { useCommerce } from "@/ds/commerce/CommerceProvider";
import { EmptyState } from "@/ds/commerce/EmptyState";
import { ProductCard } from "@/ds/commerce/ProductCard";
import { QuantityStepper } from "@/ds/commerce/QuantityStepper";
import type { CartLine, Product } from "@/ds/commerce/types";
import { Button, ButtonLink } from "@/ds/ui/Button";
import { Field } from "@/ds/ui/Field";
import { IconButton } from "@/ds/ui/IconButton";
import { PageIntro } from "@/ds/ui/PageIntro";
import { formatEGP } from "@/ds/ui/Price";
import { ProductShot } from "@/ds/ui/ProductShot";

const crumbs = [{ href: "/", label: "Home" }];

function Line({ line }: { line: CartLine }) {
  const { setQuantity, removeLine, moveToWishlist, pending } = useCommerce();
  const reduce = useReducedMotion();
  const busy = pending.has(line.productId);
  const href = `/products/${line.productId}`;
  return (
    <motion.li
      layout={!reduce}
      initial={false}
      exit={reduce ? { opacity: 0 } : { opacity: 0, x: 32, transition: { duration: 0.24, ease: [0.4, 0, 1, 1] } }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="grid grid-cols-[auto_minmax(0,1fr)] gap-5 py-6 sm:gap-6"
    >
      <Link href={href} tabIndex={-1} aria-hidden>
        <ProductShot src={line.image} alt="" sizes="128px" className="w-24 sm:w-32" />
      </Link>
      <div className="flex min-w-0 flex-col">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            {line.brand && <p className="t-caption text-fg-3">{line.brand}</p>}
            <h2 className="mt-1 line-clamp-2 pb-0.5 t-sub">
              <Link href={href} className="underline-reveal underline-offset-4 hover:decoration-line-strong">
                {line.title}
              </Link>
            </h2>
            <p className="mt-1 t-caption t-num text-fg-3">{formatEGP(line.price)} each</p>
          </div>
          <IconButton
            label={`Remove ${line.title} from your bag`}
            icon={<Trash2 strokeWidth={1.5} aria-hidden />}
            onClick={() => removeLine(line)}
            disabled={busy}
            className="-mr-2 -mt-2"
          />
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
          <QuantityStepper value={line.count} busy={busy} label={`Quantity of ${line.title}`} onChange={(n) => setQuantity(line.productId, n)} />
          <p className="t-sub t-num">{formatEGP(line.price * line.count)}</p>
        </div>
        <button
          type="button"
          onClick={() => moveToWishlist(line)}
          disabled={busy}
          className="mt-3 inline-flex w-fit items-center gap-1.5 t-caption text-fg-2 underline decoration-line-strong underline-offset-4 hover:text-fg disabled:opacity-50"
        >
          <Heart aria-hidden size={14} strokeWidth={1.5} />
          Move to wishlist
        </button>
      </div>
    </motion.li>
  );
}

function Coupon() {
  const { applyCoupon, cart } = useCommerce();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [applied, setApplied] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await applyCoupon(code);
    setBusy(false);
    setApplied(res.ok);
    setError(res.ok ? undefined : res.message);
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-2">
      <Field
        label="Coupon code"
        value={code}
        onChange={(e) => {
          setCode(e.target.value);
          setError(undefined);
          setApplied(false);
        }}
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        error={error}
        valid={applied && cart.totalAfterDiscount !== null}
        loading={busy}
        hint={applied && cart.totalAfterDiscount !== null ? "Applied to your total." : undefined}
        end={
          <button type="submit" disabled={busy || !code.trim()} className="h-full px-4 t-label text-fg underline-reveal underline-offset-4 hover:decoration-current disabled:opacity-40">
            Apply
          </button>
        }
      />
    </form>
  );
}

function Summary() {
  const { cart } = useCommerce();
  const after = cart.totalAfterDiscount;
  return (
    <aside aria-labelledby="summary-title" className="grid gap-6 rounded-card bg-surface p-6 sm:p-8 lg:sticky lg:top-24">
      <h2 id="summary-title" className="t-h3">
        Summary
      </h2>
      <dl className="grid gap-3 t-body">
        <div className="flex justify-between gap-4">
          <dt className="text-fg-2">
            Subtotal <span className="t-num text-fg-3">({cart.units} {cart.units === 1 ? "item" : "items"})</span>
          </dt>
          <dd className="t-num">{formatEGP(cart.subtotal)}</dd>
        </div>
        {after !== null && (
          <div className="flex justify-between gap-4">
            <dt className="text-fg-2">Coupon</dt>
            <dd className="t-num">−{formatEGP(cart.subtotal - after)}</dd>
          </div>
        )}
        <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-line pt-5">
          <dt className="t-label">Total</dt>
          <dd className="t-h3 t-num">{formatEGP(after ?? cart.subtotal)}</dd>
        </div>
      </dl>
      <Coupon />
      <div className="grid gap-3">
        <ButtonLink href="/checkout" size="lg" fullWidth>
          Checkout
        </ButtonLink>
        <p className="text-center t-caption text-fg-3">Pay by card (Stripe) or cash on delivery.</p>
      </div>
    </aside>
  );
}

function ClearBag() {
  const { clearBag } = useCommerce();
  const [asking, setAsking] = useState(false);
  if (!asking)
    return (
      <Button variant="text" onClick={() => setAsking(true)}>
        Empty bag
      </Button>
    );
  return (
    <div role="group" aria-label="Confirm emptying your bag" className="enter flex flex-wrap items-center gap-3">
      <span className="t-label text-fg-2">Remove everything?</span>
      <Button variant="danger" onClick={() => void clearBag()}>
        Empty bag
      </Button>
      <Button variant="text" onClick={() => setAsking(false)} autoFocus>
        Keep
      </Button>
    </div>
  );
}

function Suggestions({ products, title }: { products: Product[]; title: string }) {
  if (!products.length) return null;
  return (
    <section aria-labelledby="suggest-title" className="mt-24 border-t border-line pt-12">
      <h2 id="suggest-title" className="mb-10 t-h2">
        {title}
      </h2>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-5">
        {products.map((p) => (
          <li key={p._id}>
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CartView({ suggestions }: { suggestions: Product[] }) {
  const { cart, cartStatus, signedIn, refreshCart } = useCommerce();
  const inBag = new Set(cart.lines.map((l) => l.productId));
  const more = suggestions.filter((p) => !inBag.has(p._id)).slice(0, 4);

  if (!signedIn && cartStatus === "ready") {
    return (
      <>
        <PageIntro crumbs={crumbs} title="Your bag" />
        <EmptyState
          className="py-10"
          title="Sign in to see your bag."
          body="Your bag is saved to your account, so it follows you between devices."
          action={<ButtonLink href="/login?callbackUrl=/cart">Sign in</ButtonLink>}
        />
        <Suggestions products={more} title="Most wanted" />
      </>
    );
  }

  if (cartStatus === "error" && !cart.lines.length) {
    return (
      <>
        <PageIntro crumbs={crumbs} title="Your bag" />
        <EmptyState
          className="py-10"
          title="Your bag didn't load."
          body="That's on our side, not yours. Try again in a moment."
          action={<Button onClick={() => void refreshCart()}>Try again</Button>}
        />
      </>
    );
  }

  if (cartStatus !== "ready" && !cart.lines.length) {
    return (
      <>
        <PageIntro crumbs={crumbs} title="Your bag" />
        <div role="status" aria-label="Loading your bag" className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
          <ul className="divide-y divide-line">
            {[0, 1, 2].map((i) => (
              <li key={i} className="flex gap-6 py-6">
                <div className="skeleton aspect-[11/15] w-24 rounded-card sm:w-32" />
                <div className="grid flex-1 content-start gap-3 pt-1">
                  <div className="skeleton h-3 w-16 rounded-pill" />
                  <div className="skeleton h-5 w-3/5 rounded-pill" />
                  <div className="skeleton h-3 w-24 rounded-pill" />
                </div>
              </li>
            ))}
          </ul>
          <div className="skeleton h-80 rounded-card" />
        </div>
      </>
    );
  }

  if (!cart.lines.length) {
    return (
      <>
        <PageIntro crumbs={crumbs} title="Your bag" />
        <EmptyState
          className="py-10"
          title="Your bag is empty."
          body="Nothing in it yet — most wanted is a good place to start."
          action={<ButtonLink href="/products">Browse products</ButtonLink>}
        />
        <Suggestions products={more} title="Most wanted" />
      </>
    );
  }

  return (
    <>
      <PageIntro crumbs={crumbs} title="Your bag">
        <span className="t-num">
          {cart.units} {cart.units === 1 ? "item" : "items"}
        </span>
      </PageIntro>
      <div className="enter grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-16">
        <div>
          <ul className="divide-y divide-line border-y border-line">
            <AnimatePresence initial={false}>
              {cart.lines.map((line) => (
                <Line key={line.productId} line={line} />
              ))}
            </AnimatePresence>
          </ul>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <Link href="/products" className="t-label underline decoration-line-strong underline-offset-[6px] hover:decoration-current">
              Continue shopping
            </Link>
            <ClearBag />
          </div>
        </div>
        <Summary />
      </div>
      <Suggestions products={more} title="You might also like" />
    </>
  );
}
