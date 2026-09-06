"use client";

import { useRef, useState } from "react";
import ProductCard, { type CardProduct } from "@/component/product/ProductCard";

/**
 * "You may also like" — a horizontal track, per the engine's
 * "Horizontal Scroll Journey" pattern, rather than another vertical grid.
 *
 * Native scroll-snap does the work: no scroll hijacking, so the trackpad,
 * touch, and keyboard all behave normally. The arrows are an addition for
 * mouse users, not the only way to move — the engine's rule is that a
 * gesture must never be the sole route to content.
 */
export default function SimilarProductsCarousel({ products }: { products: CardProduct[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  if (!products.length) return null;

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  };

  const nudge = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    // One card plus its gap, so a click always lands on a card edge.
    const step = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 280;
    el.scrollBy({ left: dir * (step + 20), behavior: "smooth" });
  };

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8">
        <div className="mb-9 flex items-end justify-between gap-6">
          <div>
            <span className="label text-ink-muted">From the same department</span>
            <h2 className="font-display-lg mt-3 text-[clamp(26px,3.6vw,40px)]">
              You may also like
            </h2>
          </div>

          <div className="hidden shrink-0 gap-2 sm:flex">
            <button
              type="button"
              onClick={() => nudge(-1)}
              disabled={atStart}
              aria-label="Scroll to previous products"
              className="grid h-12 w-12 place-items-center rounded-full border border-line transition-colors duration-400 hover:border-gold hover:text-gold disabled:opacity-30 disabled:hover:border-line disabled:hover:text-ink"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                <path d="M19 12H5M11 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => nudge(1)}
              disabled={atEnd}
              aria-label="Scroll to more products"
              className="grid h-12 w-12 place-items-center rounded-full border border-line transition-colors duration-400 hover:border-gold hover:text-gold disabled:opacity-30 disabled:hover:border-line disabled:hover:text-ink"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* The track bleeds to the viewport edge on the right so the last card
          is visibly cut — the standard cue that the row keeps going. */}
      <ul
        ref={trackRef}
        onScroll={onScroll}
        tabIndex={0}
        aria-label="Similar products"
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 pb-4 sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          paddingLeft: "max(1.25rem, calc((100vw - 1320px) / 2 + 2rem))",
        }}
      >
        {products.map((p) => (
          <li
            key={p._id}
            className="w-[248px] shrink-0 snap-start sm:w-[272px]"
          >
            <ProductCard product={p} priority={false} />
          </li>
        ))}
      </ul>
    </section>
  );
}
