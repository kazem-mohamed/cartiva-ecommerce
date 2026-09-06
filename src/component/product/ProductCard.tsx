"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { addToCart, notifyCartUpdate } from "@/lib/cart";
import { addToWishlist, notifyWishlistUpdate, removeFromWishlist } from "@/lib/wishlist";
import { isInCompare, toggleCompare, notifyCompareUpdate, MAX_COMPARE_ITEMS } from "@/lib/compare";

export interface CardProduct {
  _id: string;
  title: string;
  price: number;
  priceAfterDiscount?: number;
  imageCover: string;
  category?: { name: string };
  brand?: { name: string };
  ratingsAverage?: number;
  ratingsQuantity?: number;
  quantity?: number;
}

const egp = new Intl.NumberFormat("en-EG");

export default function ProductCard({
  product,
  inWishlist = false,
  onWishlistChange,
  priority = false,
}: {
  product: CardProduct;
  inWishlist?: boolean;
  onWishlistChange?: (id: string, next: boolean) => void;
  priority?: boolean;
}) {
  const { data: session } = useSession();
  const token = session?.accessToken ?? null;

  const [cartBusy, setCartBusy] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);
  const [saved, setSaved] = useState(inWishlist);
  const [comparing, setComparing] = useState(() => isInCompare(product._id));

  const discounted =
    typeof product.priceAfterDiscount === "number" &&
    product.priceAfterDiscount < product.price;
  const shown = discounted ? product.priceAfterDiscount! : product.price;
  const off = discounted
    ? Math.round((1 - product.priceAfterDiscount! / product.price) * 100)
    : 0;
  const soldOut = product.quantity === 0;

  async function handleCart() {
    if (!token) return toast.error("Sign in to add items to your cart.");
    if (cartBusy || soldOut) return;
    setCartBusy(true);
    try {
      await addToCart(product._id, token);
      notifyCartUpdate();
      toast.success("Added to cart.");
    } catch {
      toast.error("Could not add to cart. Try again.");
    } finally {
      setCartBusy(false);
    }
  }

  async function handleWishlist() {
    if (!token) return toast.error("Sign in to save items.");
    if (wishBusy) return;
    setWishBusy(true);
    const next = !saved;
    try {
      if (next) await addToWishlist(product._id, token);
      else await removeFromWishlist(product._id, token);
      setSaved(next);
      onWishlistChange?.(product._id, next);
      notifyWishlistUpdate();
    } catch {
      toast.error("Could not update your saved items.");
    } finally {
      setWishBusy(false);
    }
  }

  function handleCompare() {
    const result = toggleCompare(product._id);
    if (result === "max-reached") {
      toast.error(`You can compare up to ${MAX_COMPARE_ITEMS} items.`);
      return;
    }
    setComparing(result === "added");
    notifyCompareUpdate();
  }

  return (
    <article className="bento bento-hover group flex h-full flex-col overflow-hidden p-3">
      <div className="well relative aspect-[4/5]">
        <Link href={`/products/${product._id}`} className="absolute inset-0 z-[1]">
          <span className="sr-only">{product.title}</span>
        </Link>

        {(discounted || soldOut) && (
          <span
            className={`label absolute top-3 left-3 z-[2] rounded-full px-3 py-1.5 text-[9px] ${
              soldOut ? "bg-ink/85 text-white" : "bg-gold text-white"
            }`}
          >
            {soldOut ? "Sold out" : `−${off}%`}
          </span>
        )}

        <div className="absolute top-3 right-3 z-[3] flex flex-col gap-2">
          <button
            type="button"
            onClick={handleWishlist}
            disabled={wishBusy}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${product.title} from saved` : `Save ${product.title}`}
            className={`grid h-11 w-11 place-items-center rounded-full bg-white/90 backdrop-blur-sm shadow-[0_2px_6px_rgba(12,10,9,0.08)] transition-colors duration-400 disabled:opacity-50 ${
              saved ? "text-gold" : "text-ink-muted hover:text-gold"
            }`}
          >
            <svg viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4" className="h-[17px] w-[17px]">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8Z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleCompare}
            aria-pressed={comparing}
            aria-label={comparing ? `Remove ${product.title} from compare` : `Compare ${product.title}`}
            className={`grid h-11 w-11 place-items-center rounded-full bg-white/90 backdrop-blur-sm shadow-[0_2px_6px_rgba(12,10,9,0.08)] transition-colors duration-400 ${
              comparing ? "text-gold" : "text-ink-muted hover:text-gold"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-[17px] w-[17px]">
              <path d="M4 7h11M4 17h11M18 4l3 3-3 3M18 14l3 3-3 3" />
            </svg>
          </button>
        </div>

        <Image
          src={product.imageCover}
          alt=""
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
          className="object-contain p-[11%] transition-transform duration-[900ms] ease-[var(--ease)] group-hover:scale-[1.05]"
        />
      </div>

      <div className="flex flex-1 flex-col px-2 pt-4 pb-2">
        <span className="label text-ink-muted">
          {product.category?.name ?? product.brand?.name ?? "Cartiva"}
        </span>

        <h3 className="mt-2 text-[14.5px] font-normal leading-[1.45]">
          <Link
            href={`/products/${product._id}`}
            className="transition-colors duration-300 hover:text-gold"
          >
            {product.title}
          </Link>
        </h3>

        <div className="mt-auto pt-4">
          <div className="flex items-baseline gap-2.5">
            <span className="font-display tabular text-[19px] font-semibold">
              {egp.format(shown)}
            </span>
            <span className="text-[11px] font-light text-ink-muted">EGP</span>
            {discounted && (
              <s className="tabular text-[12.5px] font-light text-ink-muted decoration-1">
                {egp.format(product.price)}
              </s>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            {typeof product.ratingsAverage === "number" ? (
              <span className="flex items-center gap-1.5 text-[11.5px] font-light text-ink-muted">
                <span aria-hidden="true" className="text-gold-mid">★</span>
                <span className="tabular">{product.ratingsAverage.toFixed(1)}</span>
                {typeof product.ratingsQuantity === "number" && (
                  <span className="tabular">({product.ratingsQuantity})</span>
                )}
              </span>
            ) : (
              <span />
            )}

            <button
              type="button"
              onClick={handleCart}
              disabled={cartBusy || soldOut}
              aria-label={soldOut ? "Sold out" : `Add ${product.title} to cart`}
              className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink transition-[background-color,color,border-color] duration-400 hover:border-vault hover:bg-vault hover:text-white disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-ink"
            >
              {cartBusy ? (
                <span className="h-4 w-4 animate-spin rounded-full border border-current border-r-transparent" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
