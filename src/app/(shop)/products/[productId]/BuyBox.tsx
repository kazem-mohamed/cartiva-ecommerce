"use client";

import { ArrowLeftRight, Heart, Share2, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useChrome } from "@/ds/chrome/ChromeProvider";
import { useCommerce } from "@/ds/commerce/CommerceProvider";
import { QuantityStepper } from "@/ds/commerce/QuantityStepper";
import { Swatches } from "@/ds/commerce/Swatches";
import { unitPrice, type Product } from "@/ds/commerce/types";
import { Button } from "@/ds/ui/Button";
import { formatEGP, Price } from "@/ds/ui/Price";

const quiet =
  "inline-flex h-11 items-center gap-2 rounded-pill px-3 t-label text-fg-2 hover:bg-raised hover:text-fg active:scale-[.97] " +
  "disabled:opacity-50 [&_svg]:size-[18px] [&_svg]:transition-[fill,color] [&_svg]:duration-(--dur-hover)";

export function BuyBox({ product, siblings, reviewCount }: { product: Product; siblings: Product[]; reviewCount: number }) {
  const router = useRouter();
  const { addToBag, pending, wishlist, toggleWishlist, compare, toggleCompare } = useCommerce();
  const { setPillAction } = useChrome();
  const [qty, setQty] = useState(1);
  const [buying, setBuying] = useState(false);

  const stock = product.quantity ?? 0;
  const soldOut = product.quantity === 0;
  const max = Math.max(1, Math.min(stock || 20, 20));
  const adding = pending.has(product._id);
  const saved = wishlist.has(product._id);
  const comparing = compare.includes(product._id);

  const add = () => addToBag(product, { count: qty });
  async function buyNow() {
    setBuying(true);
    const ok = await addToBag(product, { count: qty, quiet: true });
    if (ok) router.push("/checkout");
    else setBuying(false);
  }
  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: product.title, url }).catch(() => {});
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied.");
    } catch {
      toast.error("Couldn't copy the link.");
    }
  }

  // Phones: once the buy buttons scroll away, the floating pill becomes "Add to bag".
  const cta = useRef<HTMLDivElement>(null);
  const [ctaInView, setCtaInView] = useState(true);
  useEffect(() => {
    const el = cta.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setCtaInView(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The pill holds a stable handler; the latest `add` (current qty) is read at click time.
  const addRef = useRef(add);
  useLayoutEffect(() => {
    addRef.current = add;
  });
  const total = formatEGP(unitPrice(product) * qty);
  useEffect(() => {
    setPillAction(
      ctaInView
        ? null
        : { label: soldOut ? "Sold out" : "Add to bag", price: soldOut ? undefined : total, onClick: () => addRef.current(), busy: adding, disabled: soldOut },
    );
  }, [ctaInView, soldOut, total, adding, setPillAction]);
  useEffect(() => () => setPillAction(null), [setPillAction]);

  return (
    <div className="grid content-start gap-8 lg:pt-2">
      <div className="grid gap-3">
        {product.brand?._id && (
          <Link href={`/brand/${product.brand._id}`} className="justify-self-start t-label text-fg-2 hover:text-fg">
            {product.brand.name}
          </Link>
        )}
        {/* Catalogue titles run from "Woman Shawl" to 60-character model names; long ones step down a size. */}
        <h1 className={cn("text-balance", product.title.length > 32 ? "t-h2" : "t-h1")}>{product.title}</h1>
        {!!product.ratingsQuantity && !!product.ratingsAverage && (
          <a href="#reviews" className="inline-flex items-center gap-1.5 justify-self-start t-caption t-num text-fg-2 hover:text-fg">
            <Star aria-hidden size={14} strokeWidth={1.5} className="fill-current" />
            {product.ratingsAverage.toFixed(1)}
            <span aria-hidden>·</span>
            <span className="underline decoration-line-strong underline-offset-4">
              {product.ratingsQuantity} {product.ratingsQuantity === 1 ? "rating" : "ratings"}
              {reviewCount > 0 && `, ${reviewCount} written`}
            </span>
          </a>
        )}
      </div>

      <div className="grid gap-2">
        <Price size="lg" price={product.price} priceAfterDiscount={product.priceAfterDiscount} />
        <p className={cn("t-caption", soldOut || stock > 5 ? "text-fg-3" : "text-fg")}>
          {soldOut ? "Sold out" : stock <= 5 ? `Only ${stock} left` : "In stock"}
          {!!product.sold && <span className="text-fg-3 t-num"> · {product.sold.toLocaleString("en-US")} sold</span>}
        </p>
      </div>

      <Swatches current={product} siblings={siblings} />

      <div ref={cta} className="grid gap-3">
        {!soldOut && (
          <div className="flex items-center justify-between gap-4 pb-2">
            <QuantityStepper value={qty} onChange={setQty} max={max} busy={adding || buying} label={`Quantity of ${product.title}`} />
            <p className="t-caption text-fg-3">
              Total <span className="t-num text-fg">{total}</span>
            </p>
          </div>
        )}
        <Button size="lg" fullWidth onClick={add} disabled={soldOut} loading={adding && !buying} loadingLabel="Adding to bag">
          {soldOut ? "Sold out" : "Add to bag"}
        </Button>
        {!soldOut && (
          <Button size="lg" variant="secondary" fullWidth onClick={buyNow} loading={buying} loadingLabel="Going to checkout">
            Buy now
          </Button>
        )}
      </div>

      <div className="-mx-3 flex flex-wrap items-center gap-1">
        <button type="button" className={quiet} aria-pressed={saved} disabled={pending.has(`wish:${product._id}`)} onClick={() => toggleWishlist(product._id)}>
          <Heart aria-hidden strokeWidth={1.5} className={saved ? "fill-current text-fg" : undefined} />
          {saved ? "Saved" : "Save"}
        </button>
        <button type="button" className={quiet} aria-pressed={comparing} onClick={() => toggleCompare(product._id)}>
          <ArrowLeftRight aria-hidden strokeWidth={1.5} className={comparing ? "text-fg" : undefined} />
          {comparing ? "Comparing" : "Compare"}
        </button>
        <button type="button" className={quiet} onClick={share}>
          <Share2 aria-hidden strokeWidth={1.5} />
          Share
        </button>
      </div>

      <p className="border-t border-line pt-6 t-caption text-fg-3">Pay by card (Stripe) or cash on delivery. Prices in Egyptian pounds.</p>
    </div>
  );
}
