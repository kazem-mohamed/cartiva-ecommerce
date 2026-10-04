"use client";

import { ArrowRight, Clock, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useDialog } from "../hooks/useDialog";
import { Button } from "../ui/Button";
import { IconButton } from "../ui/IconButton";
import { formatEGP } from "../ui/Price";
import { ProductShot } from "../ui/ProductShot";
import { searchProducts, splitMatch } from "./search";
import type { Product } from "./types";
import { unitPrice } from "./types";
import { useCatalog } from "./useCatalog";

const RECENT_KEY = "cartiva-recent-searches";
const noop = () => () => {};

function readRecent(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((s): s is string => typeof s === "string").slice(0, 6) : [];
  } catch {
    return [];
  }
}
function saveRecent(q: string) {
  const term = q.trim();
  if (!term) return;
  try {
    const next = [term, ...readRecent().filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, 6);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
}

function Highlight({ text, query }: { text: string; query: string }) {
  const parts = splitMatch(text, query);
  if (!parts) return <>{text}</>;
  return (
    <>
      {parts[0]}
      <mark className="bg-transparent text-fg underline decoration-fg underline-offset-4">{parts[1]}</mark>
      {parts[2]}
    </>
  );
}

function ResultRow({ product, query }: { product: Product; query: string }) {
  return (
    <span className="flex items-center gap-4">
      {/* Results are on screen the moment they render — load thumbnails now, not lazily. */}
      <ProductShot src={product.imageCover} alt="" sizes="56px" priority className="w-14 shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block truncate t-body text-fg-2 transition-colors group-hover:text-fg group-aria-selected:text-fg">
          <Highlight text={product.title} query={query} />
        </span>
        <span className="block t-caption text-fg-3">
          {[product.brand?.name, product.category?.name].filter(Boolean).join(" · ")}
        </span>
      </span>
      <span className="t-label t-num text-fg">{formatEGP(unitPrice(product))}</span>
    </span>
  );
}

/**
 * Search as an experience, not an input: instant results over the whole
 * catalogue as you type, with the matching words marked, recent searches, and
 * full keyboard control (↑ ↓ to move, Enter to open, Esc to close).
 */
export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>{open && <Panel onClose={onClose} />}</AnimatePresence>,
    document.body,
  );
}

function Panel({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  useDialog(ref, true, onClose);
  const { data, loading, error, retry } = useCatalog();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  const [recent, setRecent] = useState<string[]>(() => (typeof window === "undefined" ? [] : readRecent()));
  const listId = useId();

  const results = useMemo(() => (data ? searchProducts(data.products, query) : []), [data, query]);
  const shown = results.slice(0, 6);
  const q = query.trim();

  const popular = useMemo(
    () => (data ? [...data.products].sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0)).slice(0, 4) : []),
    [data],
  );
  const departments = useMemo(() => {
    if (!data) return [];
    const withStock = new Set(data.products.map((p) => p.category?._id ?? p.category?.name));
    return data.categories.filter((c) => withStock.has(c._id) || withStock.has(c.name));
  }, [data]);
  const brandHits = useMemo(
    () => (data && q ? data.brands.filter((b) => b.name.toLowerCase().includes(q.toLowerCase())).slice(0, 4) : []),
    [data, q],
  );

  // Options the arrow keys move through: each result, then "see all".
  const options: { id: string; href: string }[] = q
    ? [
        ...shown.map((p) => ({ id: `${listId}-p-${p._id}`, href: `/products/${p._id}` })),
        ...(results.length ? [{ id: `${listId}-all`, href: `/search?q=${encodeURIComponent(q)}` }] : []),
      ]
    : [];

  const go = (href: string) => {
    if (q) saveRecent(q);
    onClose();
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && options.length) {
      e.preventDefault();
      setActive((i) => (i + 1) % options.length);
    } else if (e.key === "ArrowUp" && options.length) {
      e.preventDefault();
      setActive((i) => (i <= 0 ? options.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && options[active]) go(options[active].href);
      else if (q) go(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <div className="fixed inset-0 z-(--z-modal)">
      <motion.div
        className="absolute inset-0 bg-(--scrim)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Search the store"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] } }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }}
        className="absolute inset-x-0 top-0 max-h-[92dvh] overflow-y-auto overscroll-contain border-b border-line bg-canvas text-fg"
      >
        <div className="mx-auto max-w-(--page-max) px-(--gutter) pt-5 pb-10">
          {/* Focus is shown by the underline itself (thicker, full contrast), not a box around the input. */}
          <div className="flex items-center gap-3 border-b border-line-strong pb-3 transition-[border-color,box-shadow] duration-(--dur-hover) focus-within:border-fg focus-within:shadow-[0_1px_0_0_var(--text)]">
            <Search aria-hidden strokeWidth={1.5} className="size-6 shrink-0 text-fg-2" />
            <input
              data-autofocus
              role="combobox"
              aria-expanded={options.length > 0}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={active >= 0 ? options[active]?.id : undefined}
              aria-label="Search products, brands and departments"
              placeholder="Search Cartiva"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(-1);
              }}
              onKeyDown={onKeyDown}
              className="min-w-0 flex-1 bg-transparent py-2 text-[clamp(1.375rem,1.1rem+1.2vw,2rem)] font-display font-[400] [font-variation-settings:'SOFT'_100] outline-none placeholder:text-fg-3 focus-visible:outline-none"
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="search"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="t-label text-fg-2 underline decoration-line-strong underline-offset-4 hover:text-fg hover:decoration-current"
              >
                Clear
              </button>
            )}
            <IconButton label="Close search" icon={<X strokeWidth={1.5} aria-hidden />} onClick={onClose} />
          </div>

          <div className="mt-8" aria-live="polite">
            {error ? (
              <div key="error" className="enter grid justify-items-start gap-3">
                <p className="t-body text-fg-2">Couldn&apos;t reach the store.</p>
                <Button variant="secondary" onClick={retry}>
                  Try again
                </Button>
              </div>
            ) : loading ? (
              <ul className="grid gap-4" aria-label="Loading">
                {[0, 1, 2].map((i) => (
                  <li key={i} className="flex items-center gap-4">
                    <div className="skeleton aspect-[11/15] w-14 rounded-card" />
                    <div className="skeleton h-4 w-1/2 rounded-pill" />
                  </li>
                ))}
              </ul>
            ) : q ? (
              results.length ? (
                <div key="results" className="enter grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
                  <div className="min-w-0">
                    <p className="mb-3 t-caption text-fg-3 t-num">
                      {results.length} {results.length === 1 ? "product" : "products"}
                    </p>
                    <ul id={listId} role="listbox" aria-label="Products" className="grid grid-cols-1 gap-1">
                      {shown.map((p, i) => (
                        <li
                          key={p._id}
                          id={options[i].id}
                          role="option"
                          aria-selected={active === i}
                          onMouseEnter={() => setActive(i)}
                          onClick={() => go(`/products/${p._id}`)}
                          className={cn("group cursor-pointer rounded-card p-2", active === i && "bg-surface")}
                        >
                          <ResultRow product={p} query={q} />
                        </li>
                      ))}
                      <li
                        id={options[shown.length]?.id}
                        role="option"
                        aria-selected={active === shown.length}
                        onMouseEnter={() => setActive(shown.length)}
                        onClick={() => go(`/search?q=${encodeURIComponent(q)}`)}
                        className={cn("group mt-2 flex cursor-pointer items-center gap-2 rounded-card px-2 py-3 t-label", active === shown.length && "bg-surface")}
                      >
                        See all results for “{q}”{" "}
                        <ArrowRight aria-hidden size={16} strokeWidth={1.5} className="transition-[translate] duration-(--dur-state) ease-light group-aria-selected:translate-x-1" />
                      </li>
                    </ul>
                  </div>
                  {brandHits.length > 0 && (
                    <aside>
                      <h2 className="mb-3 t-caption text-fg-3">Brands</h2>
                      <ul className="flex flex-wrap gap-2">
                        {brandHits.map((b) => (
                          <li key={b._id}>
                            <Link
                              href={`/brand/${b._id}`}
                              onClick={() => {
                                saveRecent(q);
                                onClose();
                              }}
                              className="inline-flex h-10 items-center rounded-pill border border-line-strong px-4 t-label hover:border-fg hover:bg-raised active:scale-[.97]"
                            >
                              {b.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </aside>
                  )}
                </div>
              ) : (
                <div key="none" className="enter grid max-w-[46ch] gap-3">
                  <p className="t-h3">Nothing matches “{q}”.</p>
                  <p className="t-body text-fg-2">Try a brand or a kind of product — for example:</p>
                  <div className="flex flex-wrap gap-2">
                    {["Sony", "Adidas", "Laptop", "Shawl"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setQuery(s)}
                        className="inline-flex h-10 items-center rounded-pill border border-line-strong px-4 t-label hover:border-fg hover:bg-raised active:scale-[.97]"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )
            ) : (
              <div key="idle" className="enter grid gap-10 lg:grid-cols-[1fr_1fr]">
                <div className="grid content-start gap-8">
                  {recent.length > 0 && (
                    <section>
                      <div className="mb-3 flex items-center justify-between">
                        <h2 className="t-caption text-fg-3">Recent</h2>
                        <button
                          type="button"
                          className="t-caption text-fg-2 underline decoration-line-strong underline-offset-4 hover:text-fg hover:decoration-current"
                          onClick={() => {
                            try {
                              localStorage.removeItem(RECENT_KEY);
                            } catch {}
                            setRecent([]);
                          }}
                        >
                          Clear
                        </button>
                      </div>
                      <ul className="flex flex-wrap gap-2">
                        {recent.map((r) => (
                          <li key={r}>
                            <button
                              type="button"
                              onClick={() => setQuery(r)}
                              className="inline-flex h-10 items-center gap-2 rounded-pill border border-line-strong px-4 t-label hover:border-fg hover:bg-raised active:scale-[.97]"
                            >
                              <Clock aria-hidden size={14} strokeWidth={1.5} className="text-fg-3" />
                              {r}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                  <section>
                    <h2 className="mb-3 t-caption text-fg-3">Departments</h2>
                    <ul className="grid gap-1">
                      {departments.map((c) => (
                        <li key={c._id}>
                          <Link
                            href={`/categories/${c._id}`}
                            onClick={onClose}
                            className="group flex items-center justify-between rounded-card px-2 py-2.5 t-h3 hover:bg-surface"
                          >
                            {c.name}
                            <ArrowRight
                              aria-hidden
                              size={18}
                              strokeWidth={1.5}
                              className="text-fg-3 transition-[translate,color] duration-(--dur-state) ease-light group-hover:translate-x-1 group-hover:text-fg"
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
                <section>
                  <h2 className="mb-3 t-caption text-fg-3">Most wanted</h2>
                  <ul className="grid gap-1">
                    {popular.map((p) => (
                      <li key={p._id}>
                        <Link
                          href={`/products/${p._id}`}
                          onClick={onClose}
                          className="group block rounded-card p-2 hover:bg-surface"
                        >
                          <ResultRow product={p} query="" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
