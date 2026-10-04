"use client";

import { ChevronDown, SlidersHorizontal, Star, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/Button";
import { ToggleChip } from "../ui/Chip";
import { Checkbox, Switch } from "../ui/Choice";
import { IconButton } from "../ui/IconButton";
import { formatEGP } from "../ui/Price";
import { RangeSlider } from "../ui/RangeSlider";
import { Sheet } from "../ui/Sheet";
import { EMPTY_FILTERS, activeCount, facets, type FilterState } from "./filter-logic";
import type { Product } from "./types";

type Props = {
  products: Product[];
  value: FilterState;
  onChange: (next: FilterState) => void;
  /** Facets that make no sense on this page, e.g. Department on a department page. */
  hide?: Array<"categories" | "brands">;
};

const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

function Group({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const reduce = useReducedMotion();
  const id = useId();
  return (
    <section className="border-b border-line py-2">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="group flex min-h-12 w-full items-center justify-between t-label"
        >
          {title}
          <span className="grid size-8 place-items-center rounded-full transition-colors group-hover:bg-raised">
            <ChevronDown
              aria-hidden
              size={18}
              strokeWidth={1.5}
              className={cn("text-fg-3 transition-[rotate,color] duration-(--dur-state) group-hover:text-fg", open && "rotate-180")}
            />
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/** The facets. Counts are live; options that would return nothing are not offered. */
export function FilterPanel({ products, value, onChange, hide = [] }: Props) {
  const f = useMemo(() => facets(products, value), [products, value]);
  const [lo, hi] = f.bounds;
  // A range from the URL may be open-ended; clamp it to the catalogue's real bounds for the slider.
  const price: [number, number] = value.price ? [Math.max(lo, value.price[0]), Math.min(hi, value.price[1])] : [lo, hi];
  const step = Math.max(1, Math.round((hi - lo) / 200));

  return (
    <div>
      {f.categories.length > 0 && !hide.includes("categories") && (
        <Group title="Department">
          <div className="flex flex-wrap gap-2">
            {f.categories.map((c) => (
              <ToggleChip
                key={c.id}
                selected={value.categories.includes(c.id)}
                onClick={() => onChange({ ...value, categories: toggle(value.categories, c.id) })}
              >
                {c.name} <span className="t-num opacity-70">{c.count}</span>
              </ToggleChip>
            ))}
          </div>
        </Group>
      )}

      {f.brands.length > 0 && !hide.includes("brands") && (
        <Group title="Brand">
          <div className="grid">
            {f.brands.map((b) => (
              <Checkbox
                key={b.id}
                label={b.name}
                meta={b.count}
                checked={value.brands.includes(b.id)}
                onChange={() => onChange({ ...value, brands: toggle(value.brands, b.id) })}
              />
            ))}
          </div>
        </Group>
      )}

      {hi > lo && (
        <Group title="Price">
          <RangeSlider
            min={lo}
            max={hi}
            step={step}
            value={price}
            labels={["Minimum price", "Maximum price"]}
            format={formatEGP}
            onChange={(next) => onChange({ ...value, price: next[0] <= lo && next[1] >= hi ? null : next })}
          />
        </Group>
      )}

      <Group title="Rating">
        <div className="flex flex-wrap gap-2">
          {f.rating
            .filter((r) => r.count > 0 || value.minRating === r.stars)
            .map((r) => (
              <ToggleChip
                key={r.stars}
                selected={value.minRating === r.stars}
                onClick={() => onChange({ ...value, minRating: value.minRating === r.stars ? null : r.stars })}
              >
                <Star aria-hidden size={14} strokeWidth={1.5} className="fill-current" />
                {r.stars} &amp; up <span className="t-num opacity-70">{r.count}</span>
              </ToggleChip>
            ))}
        </div>
      </Group>

      {(f.onSale > 0 || value.onSale) && (
        <Group title="Deals">
          <Switch
            label="On sale only"
            meta={f.onSale}
            checked={value.onSale}
            onChange={() => onChange({ ...value, onSale: !value.onSale })}
          />
        </Group>
      )}
    </div>
  );
}

/** What is applied, each removable in one tap, plus a way out of all of it. */
export function ActiveFilters({ products, value, onChange }: Props) {
  const names = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of products) {
      if (p.category) m.set(p.category._id ?? p.category.name, p.category.name);
      if (p.brand) m.set(p.brand._id ?? p.brand.name, p.brand.name);
    }
    return m;
  }, [products]);

  const chips: { key: string; label: string; clear: () => void }[] = [
    ...value.categories.map((id) => ({
      key: `c-${id}`,
      label: names.get(id) ?? id,
      clear: () => onChange({ ...value, categories: value.categories.filter((x) => x !== id) }),
    })),
    ...value.brands.map((id) => ({
      key: `b-${id}`,
      label: names.get(id) ?? id,
      clear: () => onChange({ ...value, brands: value.brands.filter((x) => x !== id) }),
    })),
    ...(value.price
      ? [
          {
            key: "price",
            label:
              value.price[1] >= Number.MAX_SAFE_INTEGER
                ? `From ${formatEGP(value.price[0])}`
                : `${formatEGP(value.price[0])} – ${formatEGP(value.price[1])}`,
            clear: () => onChange({ ...value, price: null }),
          },
        ]
      : []),
    ...(value.minRating ? [{ key: "rating", label: `${value.minRating}★ & up`, clear: () => onChange({ ...value, minRating: null }) }] : []),
    ...(value.onSale ? [{ key: "sale", label: "On sale", clear: () => onChange({ ...value, onSale: false }) }] : []),
  ];

  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Active filters" role="group">
      <AnimatePresence initial={false}>
        {chips.map((c) => (
          <motion.span
            key={c.key}
            layout
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex h-9 items-center gap-1 rounded-pill bg-raised pl-3.5 pr-1 t-label"
          >
            {c.label}
            <button
              type="button"
              onClick={c.clear}
              aria-label={`Remove filter: ${c.label}`}
              className="grid size-8 place-items-center rounded-full hover:bg-[color-mix(in_srgb,var(--raised)_60%,var(--line-strong))]"
            >
              <X aria-hidden size={14} strokeWidth={1.5} />
            </button>
          </motion.span>
        ))}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => onChange({ ...EMPTY_FILTERS, sort: value.sort })}
        className="ml-1 t-label underline decoration-line-strong underline-offset-4 hover:decoration-current"
      >
        Clear all
      </button>
    </div>
  );
}

/**
 * Phones: filters live in a bottom sheet, opened from one button that carries
 * the active count. The sheet's single primary action shows the live result count.
 */
export function MobileFilters({ products, value, onChange, resultCount, hide }: Props & { resultCount: number }) {
  const [open, setOpen] = useState(false);
  const n = activeCount(value);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 items-center gap-2 rounded-pill border border-line-strong px-4 t-label hover:border-fg active:scale-[.98]"
      >
        <SlidersHorizontal aria-hidden size={16} strokeWidth={1.5} />
        Filters
        {n > 0 && <span className="grid size-5 place-items-center rounded-full bg-fg t-caption t-num text-canvas">{n}</span>}
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} labelledBy="filters-title" side="bottom">
        <div className="flex items-center px-6 pt-2 pb-2">
          <h2 id="filters-title" className="t-h3">
            Filters
          </h2>
          <IconButton label="Close filters" icon={<X strokeWidth={1.5} aria-hidden />} onClick={() => setOpen(false)} className="-mr-2 ml-auto" />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6">
          <FilterPanel products={products} value={value} onChange={onChange} hide={hide} />
        </div>
        <footer className="flex gap-3 border-t border-line px-6 py-4">
          <Button variant="secondary" onClick={() => onChange({ ...EMPTY_FILTERS, sort: value.sort })} disabled={n === 0}>
            Clear all
          </Button>
          <Button fullWidth onClick={() => setOpen(false)}>
            Show {resultCount} {resultCount === 1 ? "result" : "results"}
          </Button>
        </footer>
      </Sheet>
    </>
  );
}
