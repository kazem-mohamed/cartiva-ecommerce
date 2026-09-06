"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/component/ui/Button";
import { addToCart, updateCartQuantity, notifyCartUpdate } from "@/lib/cart";

/**
 * Quantity + purchase actions, sharing one piece of state.
 *
 * The count is a real number input — the engine's Input Types rule — so a
 * shopper wanting twelve types twelve instead of clicking eleven times.
 * The +/- controls remain the primary affordance and the digit rolls in
 * the direction it was pushed, which is the one authored moment here.
 *
 * The API has no "add N" call: POST /cart adds a single unit, so a
 * quantity means add once then PUT the count. Two requests by necessity.
 */
export default function ProductPurchase({
  productId,
  stock,
  soldOut,
  unitPrice,
}: {
  productId: string;
  stock: number;
  soldOut: boolean;
  unitPrice: number;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = session?.accessToken ?? "";

  const [qty, setQty] = useState(1);
  const [dir, setDir] = useState<"up" | "down" | null>(null);
  const [busy, setBusy] = useState<null | "cart" | "buy">(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const max = Math.max(1, Math.min(stock || 1, 20));
  const egp = new Intl.NumberFormat("en-EG");

  /** Roll direction drives the animation; the key restarts it each time. */
  function change(next: number, direction: "up" | "down") {
    const clamped = Math.min(max, Math.max(1, next));
    if (clamped === qty) return;
    setDir(direction);
    setQty(clamped);
  }

  function handleTyped(raw: string) {
    const n = parseInt(raw.replace(/[^\d]/g, ""), 10);
    if (Number.isNaN(n)) return;
    change(n, n > qty ? "up" : "down");
  }

  async function pushToCart() {
    await addToCart(productId, token);
    if (qty > 1) await updateCartQuantity(productId, qty, token);
    notifyCartUpdate();
  }

  async function handleAdd() {
    if (soldOut || busy) return;
    if (status !== "authenticated") {
      toast.error("Sign in to add items to your cart.");
      return;
    }
    setBusy("cart");
    try {
      await pushToCart();
      toast.success(qty === 1 ? "Added to cart." : `Added ${qty} to cart.`);
    } catch {
      toast.error("Could not add to cart. Try again.");
    } finally {
      setBusy(null);
    }
  }

  async function handleBuyNow() {
    if (soldOut || busy) return;
    if (status !== "authenticated") {
      toast.error("Sign in to check out.");
      return;
    }
    setBusy("buy");
    try {
      await pushToCart();
      router.push("/checkout");
    } catch {
      toast.error("Could not start checkout. Try again.");
      setBusy(null);
    }
  }

  const stepper = (label: string, onClick: () => void, disabled: boolean, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="qty-btn grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink hover:bg-sunk disabled:opacity-25 disabled:hover:bg-transparent"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
        {icon}
      </svg>
    </button>
  );

  return (
    <div>
      {/* Quantity, total and stock sit on one line — the stepper is a
          control, not a display, so it stays close to text-input scale. */}
      <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
        <div className="flex items-center gap-3.5">
          <label htmlFor="qty" className="label text-ink-muted">
            Qty
          </label>

          <div className="qty-group flex items-center rounded-full p-1">
            {stepper("Decrease quantity", () => change(qty - 1, "down"), qty <= 1 || !!busy, <path d="M5 12h14" />)}

            <div className="relative grid h-9 w-11 shrink-0 place-items-center overflow-hidden">
              <span
                key={qty}
                data-dir={dir ?? undefined}
                aria-hidden="true"
                className="qty-roll font-display tabular text-[16px] font-semibold leading-none"
              >
                {qty}
              </span>
              {/* The real control, laid over the animated digit — typeable
                  and screen-reader addressable. */}
              <input
                ref={inputRef}
                id="qty"
                type="number"
                inputMode="numeric"
                min={1}
                max={max}
                value={qty}
                onChange={(e) => handleTyped(e.target.value)}
                onFocus={() => inputRef.current?.select()}
                aria-describedby="qty-stock"
                className="qty-input absolute inset-0 h-full w-full cursor-text bg-transparent text-center font-display text-[16px] font-semibold text-transparent caret-gold outline-none"
              />
            </div>

            {stepper("Increase quantity", () => change(qty + 1, "up"), qty >= max || !!busy, <path d="M12 5v14M5 12h14" />)}
          </div>
        </div>

        {/* Running total — same line, subordinate to the price above it */}
        {!soldOut && (
          <p className="flex items-baseline gap-2 text-[14px] font-light text-ink-muted">
            <span className="label">Total</span>
            <span className="font-display tabular text-[19px] font-semibold text-ink">
              {egp.format(unitPrice * qty)}
            </span>
            <span className="text-[11.5px]">EGP</span>
          </p>
        )}

        {/* Stock note joins the same row instead of stacking below it */}
        {!soldOut && stock > 0 && stock <= 20 && (
          <p id="qty-stock" className="flex items-center gap-2.5 text-[12.5px] font-light text-ink-muted">
            <span aria-hidden="true" className="h-1 w-14 overflow-hidden rounded-full bg-sunk">
              <span
                className="block h-full rounded-full bg-gold transition-[width] duration-[420ms] ease-[var(--ease)]"
                style={{ width: `${(qty / stock) * 100}%` }}
              />
            </span>
            <span className="tabular">{stock}</span> in stock
          </p>
        )}
      </div>

      {(soldOut || stock > 20) && (
        <p id="qty-stock" className="sr-only">
          Maximum {max} per order
        </p>
      )}

      <div className="mt-7 flex flex-wrap gap-3">
        <Button
          variant="primary"
          onClick={handleAdd}
          disabled={soldOut}
          loading={busy === "cart"}
          className="flex-1 min-w-[200px]"
        >
          {soldOut ? "Sold out" : "Add to cart"}
        </Button>
        <Button
          variant="secondary"
          onClick={handleBuyNow}
          disabled={soldOut}
          loading={busy === "buy"}
          className="flex-1 min-w-[200px]"
        >
          Buy now
        </Button>
      </div>
    </div>
  );
}
