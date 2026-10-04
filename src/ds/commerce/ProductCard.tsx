"use client";

import { ArrowLeftRight, Heart, Plus, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { IconButton } from "../ui/IconButton";
import { matCrop } from "../ui/matted";
import { Price } from "../ui/Price";
import { ProductShot } from "../ui/ProductShot";
import { Spinner } from "../ui/Spinner";
import { useCommerce } from "./CommerceProvider";
import type { Product } from "./types";

export type ProductCardVariant = "default" | "featured" | "compact" | "horizontal";

// Controls that only appear on hover must be permanently visible where hover doesn't exist.
const REVEAL =
  "opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 focus-visible:opacity-100 focus-visible:translate-y-0 " +
  // `translate`/`scale`, not `transform`: Tailwind v4 moves and presses with those individual properties.
  "[@media(hover:none)]:opacity-100 [@media(hover:none)]:translate-y-0 transition-[opacity,translate,background-color,scale] duration-(--dur-state) ease-light";

function Rating({ avg, count }: { avg?: number; count?: number }) {
  if (!count || !avg) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 t-caption t-num text-fg-3">
      <Star aria-hidden size={13} strokeWidth={1.5} className="fill-current text-fg-2" />
      {/* "ratings", not "reviews": the API's ratingsQuantity counts star ratings, most of which have no written review. */}
      <span>
        {avg.toFixed(1)} <span aria-hidden>·</span>
        <span className="sr-only">out of 5, from</span> {count} {count === 1 ? "rating" : "ratings"}
      </span>
    </p>
  );
}

function WishButton({ product, className }: { product: Product; className?: string }) {
  const { wishlist, toggleWishlist, pending } = useCommerce();
  const reduce = useReducedMotion();
  const saved = wishlist.has(product._id);
  return (
    <IconButton
      tone="plate"
      pressed={saved}
      disabled={pending.has(`wish:${product._id}`)}
      label={saved ? `Remove ${product.title} from wishlist` : `Save ${product.title} to wishlist`}
      onClick={() => toggleWishlist(product._id)}
      className={cn("relative z-10", className)}
      icon={
        // Keyed on state so the heart re-enters: a short settle, never a bounce.
        <motion.span
          key={String(saved)}
          initial={reduce ? false : { scale: 0.78, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="grid"
        >
          <Heart aria-hidden strokeWidth={1.5} className={saved ? "fill-current" : undefined} />
        </motion.span>
      }
    />
  );
}

export function ProductCard({
  product,
  variant = "default",
  priority,
  sizes,
  showCompare = true,
  className,
}: {
  product: Product;
  variant?: ProductCardVariant;
  priority?: boolean;
  sizes?: string;
  showCompare?: boolean;
  className?: string;
}) {
  const { addToBag, pending, compare, toggleCompare } = useCommerce();
  const href = `/products/${product._id}`;
  const busy = pending.has(product._id);
  const soldOut = product.quantity === 0;
  const comparing = compare.includes(product._id);

  const addButton = (
    <IconButton
      label={soldOut ? `${product.title} is sold out` : `Add ${product.title} to bag`}
      disabled={soldOut || busy}
      onClick={() => addToBag(product)}
      icon={busy ? <Spinner size={18} label="Adding" /> : <Plus aria-hidden strokeWidth={1.5} />}
      // Off the plate (horizontal rows) the button sits on the canvas, so it takes the raised tone.
      tone={variant === "horizontal" ? "solid" : "plate"}
      className={cn("relative z-10", variant !== "horizontal" && REVEAL)}
    />
  );

  const titleLink = (
    <Link
      href={href}
      className={cn(
        "after:absolute after:inset-0 after:rounded-card focus-visible:outline-none",
        "focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-(--focus)",
        "underline-reveal underline-offset-4 group-hover:decoration-line-strong",
      )}
    >
      {product.title}
    </Link>
  );

  if (variant === "horizontal") {
    return (
      <article className={cn("group relative flex items-center gap-4", className)}>
        <ProductShot src={product.imageCover} alt="" sizes="96px" className="w-20 shrink-0 sm:w-24" />
        <div className="min-w-0 flex-1">
          {product.brand?.name && <p className="t-caption text-fg-3">{product.brand.name}</p>}
          <h3 className="mt-0.5 line-clamp-2 pb-0.5 text-[0.9375rem] leading-snug font-[420]">{titleLink}</h3>
          <Price className="mt-1.5" size="sm" price={product.price} priceAfterDiscount={product.priceAfterDiscount} />
        </div>
        {addButton}
      </article>
    );
  }

  return (
    <CurtainCard
      product={product}
      variant={variant}
      priority={priority}
      sizes={sizes}
      showCompare={showCompare}
      className={className}
      titleLink={titleLink}
      busy={busy}
      soldOut={soldOut}
      comparing={comparing}
      onAdd={() => addToBag(product)}
      onCompare={() => toggleCompare(product._id)}
    />
  );
}

type Side = "left" | "right" | "top" | "bottom";
/** Where the second photo waits when hidden: tucked against the edge it will wipe in from. */
const HIDDEN: Record<Side, string> = {
  left: "inset(0 100% 0 0)",
  right: "inset(0 0 0 100%)",
  top: "inset(0 0 100% 0)",
  bottom: "inset(100% 0 0 0)",
};

/** The edge nearest the pointer: the side it entered (or left) by. */
function sideOf(e: React.PointerEvent, el: HTMLElement): Side {
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width;
  const y = (e.clientY - r.top) / r.height;
  const d = { left: x, right: 1 - x, top: y, bottom: 1 - y };
  return (Object.keys(d) as Side[]).reduce((a, b) => (d[a] <= d[b] ? a : b));
}

/**
 * The plate card ("Curtain", chosen on /lab). Direction-aware: the second photo
 * wipes in from whichever edge the pointer entered by and draws back toward the
 * edge it leaves by; the cover drifts a little closer meanwhile. The quick add
 * opens from a round "+" into a labelled pill. Keyboard focus reveals the same;
 * touch shows the controls at rest; reduced motion swaps without the wipe.
 */
function CurtainCard({
  product,
  variant,
  priority,
  sizes,
  showCompare,
  className,
  titleLink,
  busy,
  soldOut,
  comparing,
  onAdd,
  onCompare,
}: {
  product: Product;
  variant: ProductCardVariant;
  priority?: boolean;
  sizes?: string;
  showCompare: boolean;
  className?: string;
  titleLink: React.ReactNode;
  busy: boolean;
  soldOut: boolean;
  comparing: boolean;
  onAdd: () => void;
  onCompare: () => void;
}) {
  const featured = variant === "featured";
  const compact = variant === "compact";
  const plate = useRef<HTMLDivElement>(null);
  const [curtain, setCurtain] = useState<{ shown: boolean; side: Side }>({ shown: false, side: "left" });
  // A fully clipped image never lazy-loads, so the second photo is fetched on the first sign of
  // intent (pointer or focus — never on touch), and the curtain waits until it has arrived:
  // never an empty plate over the product.
  const [armed, setArmed] = useState(false);
  const [secondReady, setSecondReady] = useState(false);
  const reveal = (side?: Side) => {
    setArmed(true);
    setCurtain((c) => ({ shown: true, side: side ?? c.side }));
  };
  const second = compact ? undefined : product.images?.find((src) => src !== product.imageCover);
  const fit = featured ? "object-contain py-[6%]" : "object-cover";
  const crop = (src: string) => (featured ? undefined : matCrop(src));
  const imgSizes = sizes ?? (featured ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw");

  return (
    <article
      className={cn("group relative", className)}
      onPointerEnter={(e) => e.pointerType === "mouse" && plate.current && reveal(sideOf(e, plate.current))}
      onPointerLeave={(e) => plate.current && setCurtain({ shown: false, side: sideOf(e, plate.current) })}
      onFocus={() => reveal()}
      // Only when focus leaves the card — not while it moves between the card's own buttons.
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setCurtain((c) => ({ ...c, shown: false }))}
    >
      <div ref={plate} className={cn("relative overflow-hidden rounded-card bg-plate", featured ? "aspect-[4/3]" : "aspect-[11/15]")}>
        {/* Each photo on its own isolated plate: multiply only ever touches its own layer. */}
        <div className="absolute inset-0 isolate bg-plate transition-[scale] duration-(--dur-light) ease-light motion-safe:group-hover:scale-[1.04]">
          <Image src={product.imageCover} alt={product.title} fill sizes={imgSizes} preload={priority} className={cn(fit, "mix-blend-multiply", crop(product.imageCover))} />
        </div>
        {second && (
          <div
            aria-hidden
            className="absolute inset-0 transition-[clip-path] duration-[650ms] ease-[cubic-bezier(.77,0,.18,1)] motion-reduce:transition-none"
            style={{ clipPath: curtain.shown && secondReady ? "inset(0 0 0 0)" : HIDDEN[curtain.side] }}
          >
            <div className="absolute inset-0 isolate bg-plate">
              <Image src={second} alt="" fill sizes={imgSizes} loading={armed ? "eager" : "lazy"} onLoad={() => setSecondReady(true)} className={cn(fit, "mix-blend-multiply", crop(second))} />
            </div>
          </div>
        )}

        {soldOut && (
          <span className="absolute left-3 top-3 z-10 rounded-pill bg-[#171721] px-3 py-1.5 t-caption text-[#ededf3]">Sold out</span>
        )}
        <div className="absolute right-3 top-3 z-10 grid gap-2">
          <WishButton product={product} />
          {showCompare && !compact && (
            <IconButton
              tone="plate"
              pressed={comparing}
              label={comparing ? `Remove ${product.title} from compare` : `Compare ${product.title}`}
              onClick={onCompare}
              icon={<ArrowLeftRight aria-hidden strokeWidth={1.5} />}
              className={cn("relative z-10", comparing ? "opacity-100" : REVEAL)}
            />
          )}
        </div>

        {/* A round "+" that opens into a labelled pill: the width grows, the label fades in a beat later. */}
        <button
          type="button"
          onClick={onAdd}
          disabled={soldOut || busy}
          aria-label={soldOut ? `${product.title} is sold out` : `Add ${product.title} to bag`}
          className={cn(
            "absolute right-3 bottom-3 z-10 flex h-11 max-w-11 items-center overflow-hidden rounded-pill bg-[#171721] text-[#ededf3]",
            "transition-[max-width,background-color,scale] duration-(--dur-sheet) ease-light hover:bg-[#272735] enabled:active:scale-[.96]",
            "disabled:cursor-not-allowed disabled:opacity-60 group-hover:max-w-44 group-focus-within:max-w-44",
          )}
        >
          <span className="grid size-11 shrink-0 place-items-center [&_svg]:size-[18px]">
            {busy ? (
              <Spinner size={16} label="Adding" />
            ) : (
              <Plus aria-hidden strokeWidth={1.75} className="transition-[rotate] duration-(--dur-sheet) ease-light group-hover:rotate-90" />
            )}
          </span>
          <span
            aria-hidden
            className="whitespace-nowrap pr-5 t-label opacity-0 transition-opacity delay-100 duration-(--dur-state) group-hover:opacity-100 group-focus-within:opacity-100"
          >
            {soldOut ? "Sold out" : "Add to bag"}
          </span>
        </button>
      </div>

      <div className={cn("pt-4", compact && "pt-3")}>
        {product.brand?.name && <p className="t-caption text-fg-3">{product.brand.name}</p>}
        <h3
          className={cn(
            "mt-1 line-clamp-2 pb-0.5",
            featured ? "t-h3" : "text-[0.9375rem] leading-snug font-[420]",
            compact && "text-sm",
          )}
        >
          {titleLink}
        </h3>
        <Price
          className="mt-2"
          size={featured ? "md" : "sm"}
          price={product.price}
          priceAfterDiscount={product.priceAfterDiscount}
        />
        {!compact && <Rating avg={product.ratingsAverage} count={product.ratingsQuantity} />}
      </div>
    </article>
  );
}

/** Loading state: the plate with a slow sweep of light, and text bars at the real line heights. */
export function ProductCardSkeleton({ variant = "default", className }: { variant?: ProductCardVariant; className?: string }) {
  if (variant === "horizontal") {
    return (
      <div className={cn("flex items-center gap-4", className)} aria-hidden>
        <div className="skeleton aspect-[11/15] w-20 shrink-0 rounded-card sm:w-24" />
        <div className="grid flex-1 gap-2">
          <div className="skeleton h-3 w-16 rounded-pill" />
          <div className="skeleton h-4 w-4/5 rounded-pill" />
          <div className="skeleton h-4 w-24 rounded-pill" />
        </div>
      </div>
    );
  }
  return (
    <div className={cn("grid gap-3", className)} aria-hidden>
      <div className="skeleton aspect-[11/15] rounded-card" />
      <div className="skeleton mt-1 h-3 w-16 rounded-pill" />
      <div className="skeleton h-4 w-4/5 rounded-pill" />
      <div className="skeleton h-4 w-28 rounded-pill" />
    </div>
  );
}
