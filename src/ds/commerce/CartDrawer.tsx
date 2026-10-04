"use client";

import { Heart, Trash2, X } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ButtonLink } from "../ui/Button";
import { Chip } from "../ui/Chip";
import { IconButton } from "../ui/IconButton";
import { formatEGP } from "../ui/Price";
import { ProductShot } from "../ui/ProductShot";
import { Sheet } from "../ui/Sheet";
import { useCommerce } from "./CommerceProvider";
import { EmptyState } from "./EmptyState";
import { QuantityStepper } from "./QuantityStepper";
import type { CartLine } from "./types";

function Line({ line }: { line: CartLine }) {
  const { setQuantity, removeLine, moveToWishlist, pending, lastAdded, closeBag, signedIn } = useCommerce();
  const reduce = useReducedMotion();
  const busy = pending.has(line.productId);
  return (
    <motion.li
      layout={!reduce}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, x: 24, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="flex gap-4 py-5"
    >
      <Link href={`/products/${line.productId}`} onClick={closeBag} className="shrink-0" tabIndex={-1} aria-hidden>
        <ProductShot src={line.image} alt="" sizes="88px" className="w-[88px]" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            {line.brand && <p className="t-caption text-fg-3">{line.brand}</p>}
            <h3 className="mt-0.5 line-clamp-2 pb-0.5 text-[0.9375rem] leading-snug font-[420]">
              <Link href={`/products/${line.productId}`} onClick={closeBag} className="underline-reveal underline-offset-4 hover:decoration-line-strong">
                {line.title}
              </Link>
            </h3>
          </div>
          <IconButton
            label={`Remove ${line.title} from your bag`}
            icon={<Trash2 strokeWidth={1.5} aria-hidden />}
            onClick={() => removeLine(line)}
            disabled={busy}
            className="-mr-2 -mt-2"
          />
        </div>
        {lastAdded === line.productId && <Chip className="mt-2 w-fit">Just added</Chip>}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
          <QuantityStepper
            size="sm"
            value={line.count}
            busy={busy}
            label={`Quantity of ${line.title}`}
            onChange={(n) => setQuantity(line.productId, n)}
          />
          <p className="t-label t-num">
            {formatEGP(line.price * line.count)}
            {line.count > 1 && <span className="block text-right t-caption text-fg-3">{formatEGP(line.price)} each</span>}
          </p>
        </div>
        {signedIn && (
          <button
            type="button"
            onClick={() => moveToWishlist(line)}
            className="mt-3 inline-flex w-fit items-center gap-1.5 t-caption text-fg-2 underline decoration-line-strong underline-offset-4 hover:text-fg"
          >
            <Heart aria-hidden size={14} strokeWidth={1.5} />
            Move to wishlist
          </button>
        )}
      </div>
    </motion.li>
  );
}

/** The bag, one gesture away from anywhere. Opens by itself when something is added. */
export function CartDrawer() {
  const { bagOpen, closeBag, cart, cartStatus, signedIn } = useCommerce();
  const hasLines = cart.lines.length > 0;

  return (
    <Sheet open={bagOpen} onClose={closeBag} labelledBy="bag-title">
      <div className="flex items-center gap-3 border-b border-line px-6 py-4">
        <h2 id="bag-title" className="t-h3">
          Your bag
        </h2>
        {cart.units > 0 && (
          <span className="t-label t-num text-fg-3">
            {cart.units} {cart.units === 1 ? "item" : "items"}
          </span>
        )}
        <IconButton label="Close bag" icon={<X strokeWidth={1.5} aria-hidden />} onClick={closeBag} className="-mr-2 ml-auto" data-autofocus />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6">
        {!signedIn ? (
          <EmptyState
            compact
            className="py-10"
            title="Sign in to see your bag."
            body="Your bag is saved to your account, so it follows you between devices."
            action={
              <ButtonLink href="/login" variant="secondary" onClick={closeBag}>
                Sign in
              </ButtonLink>
            }
          />
        ) : cartStatus === "loading" && !hasLines ? (
          <ul aria-label="Loading your bag" className="divide-y divide-line">
            {[0, 1].map((i) => (
              <li key={i} className="flex gap-4 py-5">
                <div className="skeleton aspect-[11/15] w-[88px] rounded-card" />
                <div className="grid flex-1 content-start gap-2 pt-1">
                  <div className="skeleton h-3 w-16 rounded-pill" />
                  <div className="skeleton h-4 w-4/5 rounded-pill" />
                </div>
              </li>
            ))}
          </ul>
        ) : !hasLines ? (
          <EmptyState
            compact
            className="py-10"
            title="Your bag is empty."
            body="Most wanted is a good place to start."
            action={
              <ButtonLink href="/products" variant="secondary" onClick={closeBag}>
                Browse products
              </ButtonLink>
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            <AnimatePresence initial={false}>
              {cart.lines.map((line) => (
                <Line key={line.productId} line={line} />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {signedIn && hasLines && (
        <footer className="grid gap-3 border-t border-line px-6 pt-5 pb-6">
          <div className="flex items-baseline justify-between">
            <span className="t-label text-fg-2">Subtotal</span>
            <span className="t-h3 t-num">{formatEGP(cart.totalAfterDiscount ?? cart.subtotal)}</span>
          </div>
          {cart.totalAfterDiscount !== null && (
            <p className="t-caption text-fg-3 t-num">
              Coupon applied — was {formatEGP(cart.subtotal)}.
            </p>
          )}
          <p className="t-caption text-fg-3">Pay by card or cash on delivery at checkout.</p>
          <ButtonLink href="/checkout" size="lg" fullWidth onClick={closeBag}>
            Checkout
          </ButtonLink>
          <ButtonLink href="/cart" variant="secondary" fullWidth onClick={closeBag}>
            View bag
          </ButtonLink>
        </footer>
      )}
    </Sheet>
  );
}
