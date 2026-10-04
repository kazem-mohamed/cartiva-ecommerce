"use client";

import { Search } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../ui/Button";
import { ActiveFilters, FilterPanel, MobileFilters } from "./Filters";
import { EMPTY_FILTERS, applyFilters, filterOnly, toQuery, type FilterState } from "./filter-logic";
import { EmptyState } from "./EmptyState";
import { ProductCard } from "./ProductCard";
import { searchProducts } from "./search";
import { SortMenu } from "./SortMenu";
import type { Product } from "./types";

const BATCH = 12;

/**
 * The listing experience shared by Shop, departments, brands and search.
 * The whole scope is in memory, so filtering, sorting and search are instant;
 * the URL follows every change, so any view can be shared or bookmarked.
 */
export function Catalogue({
  products,
  initial,
  initialQuery = "",
  withSearch = false,
  hide,
}: {
  products: Product[];
  initial: FilterState;
  initialQuery?: string;
  /** The search page: a query field above the results. */
  withSearch?: boolean;
  /** Facets that are fixed by the page (a department page hides Department). */
  hide?: Array<"categories" | "brands">;
}) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [filters, setFilters] = useState<FilterState>(initial);
  const [q, setQ] = useState(initialQuery);
  const [visible, setVisible] = useState(BATCH);
  const first = useRef(true);

  // Keep the URL in step with the view. Native replaceState (which Next keeps in sync
  // with its router) instead of router.replace: no server round-trip, no remount,
  // no replayed animations — just a shareable address.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => window.history.replaceState(null, "", `${pathname}${toQuery(filters, withSearch ? q : "")}`), 250);
    return () => clearTimeout(t);
  }, [filters, q, pathname, withSearch]);

  const base = useMemo(() => (withSearch && q.trim() ? searchProducts(products, q) : products), [products, q, withSearch]);
  const results = useMemo(
    // With a query, "Most wanted" means relevance: keep the search order.
    () => (withSearch && q.trim() && filters.sort === "featured" ? filterOnly(base, filters) : applyFilters(base, filters)),
    [base, filters, q, withSearch],
  );
  const update = (next: FilterState) => {
    setFilters(next);
    setVisible(BATCH);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
      <aside aria-label="Filters" className="hidden lg:block">
        {/* Hidden headings keep the outline h1 → h2 → h3 for screen readers (filter groups and cards are h3). */}
        <h2 className="sr-only">Filters</h2>
        <div className="sticky top-24">
          <FilterPanel products={base} value={filters} onChange={update} hide={hide} />
        </div>
      </aside>

      <div className="grid min-w-0 content-start gap-6">
        {withSearch && (
          <label className="flex items-center gap-3 border-b border-line-strong pb-3 hover:border-fg-3 focus-within:border-fg">
            <Search aria-hidden strokeWidth={1.5} className="size-6 shrink-0 text-fg-2" />
            <span className="sr-only">Search products</span>
            <input
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setVisible(BATCH);
              }}
              placeholder="Search Cartiva"
              enterKeyHint="search"
              className="min-w-0 flex-1 bg-transparent py-1 text-[clamp(1.25rem,1.05rem+0.9vw,1.75rem)] font-display font-[400] [font-variation-settings:'SOFT'_100] outline-none placeholder:text-fg-3 focus-visible:outline-none"
            />
          </label>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <p className="t-label t-num text-fg-2" aria-live="polite">
            {results.length} {results.length === 1 ? "product" : "products"}
            {withSearch && q.trim() ? ` for “${q.trim()}”` : ""}
          </p>
          <div className="ml-auto flex items-center gap-2">
            <div className="lg:hidden">
              <MobileFilters products={base} value={filters} onChange={update} resultCount={results.length} hide={hide} />
            </div>
            <SortMenu value={filters.sort} onChange={(sort) => update({ ...filters, sort })} />
          </div>
        </div>

        <ActiveFilters products={products} value={filters} onChange={update} />

        {results.length === 0 ? (
          <EmptyState
            className="py-16"
            title={withSearch && q.trim() && base.length === 0 ? `Nothing matches “${q.trim()}”.` : "Nothing matches these filters."}
            body={withSearch && q.trim() && base.length === 0 ? "Try a brand or a kind of product — Sony, Adidas, laptop, shawl." : "Loosen one of them, or start again."}
            action={
              <Button variant="secondary" onClick={() => update({ ...EMPTY_FILTERS, sort: filters.sort })}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <>
            {/* Sort or filter and the cards travel to their new places (FLIP), leavers fade out,
                newcomers rise in as they enter the viewport. Reduced motion: no travel, fades only. */}
            <h2 className="sr-only">Products</h2>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 lg:gap-x-5">
              <AnimatePresence mode="popLayout">
                {results.slice(0, visible).map((p, i) => (
                  <motion.li
                    key={p._id}
                    layout={reduce ? false : "position"}
                    initial={{ opacity: 0, y: reduce ? 0 : 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                    exit={{ opacity: 0, scale: reduce ? 1 : 0.97, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }}
                    transition={{
                      duration: 0.7,
                      ease: [0.16, 1, 0.3, 1],
                      delay: (i % 3) * 0.06,
                      layout: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                    }}
                  >
                    <ProductCard product={p} priority={i < 3} sizes="(min-width: 1024px) 26vw, (min-width: 640px) 33vw, 50vw" />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            {visible < results.length && (
              <div className="grid justify-items-center gap-3 pt-4">
                <p className="t-caption t-num text-fg-3">
                  Showing {Math.min(visible, results.length)} of {results.length}
                </p>
                <Button variant="secondary" onClick={() => setVisible((v) => v + BATCH)}>
                  Show more
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
