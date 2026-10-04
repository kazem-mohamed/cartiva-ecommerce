"use client";

import { Search, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useCommerce } from "@/ds/commerce/CommerceProvider";
import { EmptyState } from "@/ds/commerce/EmptyState";
import { ActiveFilters, FilterPanel, MobileFilters } from "@/ds/commerce/Filters";
import { EMPTY_FILTERS, applyFilters, type FilterState } from "@/ds/commerce/filter-logic";
import { Gallery } from "@/ds/commerce/Gallery";
import { ProductCard, ProductCardSkeleton } from "@/ds/commerce/ProductCard";
import { QuantityStepper } from "@/ds/commerce/QuantityStepper";
import { Reviews, type Review } from "@/ds/commerce/Reviews";
import { SearchOverlay } from "@/ds/commerce/SearchOverlay";
import { SortMenu } from "@/ds/commerce/SortMenu";
import { Swatches, siblingsOf } from "@/ds/commerce/Swatches";
import type { Product } from "@/ds/commerce/types";
import { Button, ButtonLink } from "@/ds/ui/Button";

function Section({ n, title, note, children }: { n: string; title: string; note?: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`s-${n}`} className="border-t border-line pt-10">
      <header className="mb-8 grid gap-2">
        <div className="flex items-baseline gap-4">
          <span className="t-caption t-num text-fg-3">{n}</span>
          <h2 id={`s-${n}`} className="t-h2">
            {title}
          </h2>
        </div>
        {note && <p className="t-body max-w-[65ch] text-fg-2">{note}</p>}
      </header>
      {children}
    </section>
  );
}

export function CommerceDemos({ products, reviews, reviewed }: { products: Product[]; reviews: Review[]; reviewed: Product | null }) {
  const { openBag, cart, signedIn } = useCommerce();
  const [searchOpen, setSearchOpen] = useState(false);
  const [qty, setQty] = useState(2);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);

  const bySold = useMemo(() => [...products].sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0)), [products]);
  const results = useMemo(() => applyFilters(products, filters), [products, filters]);
  const camera = products.find((p) => p.title.startsWith("EOS M50"));
  const shawl = products.find((p) => p.title.trim() === "Woman Shawl");

  return (
    <>
      <Section n="08" title="Product card" note="Hover a card: the second photo crossfades in and quick add appears. On touch screens quick add is always visible. Wishlist, compare and add are live against your account.">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {bySold.slice(0, 4).map((p, i) => (
            <li key={p._id}>
              <ProductCard product={p} priority={i < 2} />
            </li>
          ))}
        </ul>
        <div className="mt-12 grid gap-x-4 gap-y-10 lg:grid-cols-4">
          <ProductCard product={bySold[4] ?? bySold[0]} variant="featured" className="lg:col-span-2" />
          <ProductCard product={bySold[5] ?? bySold[1]} variant="compact" />
          <ProductCard product={bySold[6] ?? bySold[2]} variant="compact" />
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <ProductCard product={bySold[7] ?? bySold[0]} variant="horizontal" />
          <ProductCard product={bySold[8] ?? bySold[1]} variant="horizontal" />
        </div>
        <p className="mt-12 mb-4 t-caption text-fg-3">Loading</p>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </Section>

      <Section n="09" title="Bag, search, feedback" note="The bag opens by itself when something is added. Search covers the whole catalogue instantly — try ↑ ↓ and Enter.">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" leadingIcon={<ShoppingBag strokeWidth={1.5} />} onClick={openBag}>
            Open bag {signedIn && cart.units > 0 ? `(${cart.units})` : ""}
          </Button>
          <Button variant="secondary" leadingIcon={<Search strokeWidth={1.5} />} onClick={() => setSearchOpen(true)}>
            Open search
          </Button>
          <QuantityStepper value={qty} onChange={setQty} max={10} label="Demo quantity" />
          <Button variant="text" onClick={() => toast("Added to your bag.", { action: { label: "View", onClick: openBag } })}>
            Show a toast
          </Button>
          <Button variant="text" onClick={() => toast.error("Couldn't reach the store. Try again.")}>
            Show an error toast
          </Button>
        </div>
        <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
        <div className="mt-12 rounded-card bg-surface px-6 py-12">
          <EmptyState
            title="Nothing on display in Books yet."
            body="See what's in Fashion — or everything that's on sale."
            action={<ButtonLink href="/products" variant="secondary">Browse products</ButtonLink>}
          />
        </div>
      </Section>

      <Section n="10" title="Filters and sort" note="Counts are live and computed with the other filters applied; an option that would return nothing isn't offered. On phones the panel becomes a bottom sheet.">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block" aria-label="Filters">
            <FilterPanel products={products} value={filters} onChange={setFilters} />
          </aside>
          <div className="grid content-start gap-5">
            <div className="flex flex-wrap items-center gap-3">
              <p className="t-label t-num text-fg-2" aria-live="polite">
                {results.length} {results.length === 1 ? "product" : "products"}
              </p>
              <div className="ml-auto flex items-center gap-3">
                <div className="lg:hidden">
                  <MobileFilters products={products} value={filters} onChange={setFilters} resultCount={results.length} />
                </div>
                <SortMenu value={filters.sort} onChange={(sort) => setFilters((f) => ({ ...f, sort }))} />
              </div>
            </div>
            <ActiveFilters products={products} value={filters} onChange={setFilters} />
            <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
              {results.slice(0, 6).map((p) => (
                <li key={p._id}>
                  <ProductCard product={p} variant="compact" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {camera && (
        <Section n="11" title="Gallery" note="Desktop: thumbnails, and the stage zooms where your pointer is. Phones: swipe with position dots. Either opens full screen — arrows, swipe and Esc work there.">
          <div className="max-w-2xl">
            <Gallery images={camera.images?.length ? camera.images : [camera.imageCover]} title={camera.title} />
          </div>
        </Section>
      )}

      {shawl && (
        <Section n="12" title="Swatches" note="Only real variants: products the catalogue holds under the same title. Each swatch is that product's own photo.">
          <Swatches current={shawl} siblings={siblingsOf(shawl, products)} />
        </Section>
      )}

      {reviewed && (
        <Section n="13" title="Reviews" note={`Real reviews of ${reviewed.title}. The summary and bars are computed from them.`}>
          <Reviews
            productId={reviewed._id}
            initial={reviews}
            ratingsAverage={reviewed.ratingsAverage}
            ratingsQuantity={reviewed.ratingsQuantity}
          />
        </Section>
      )}
    </>
  );
}
