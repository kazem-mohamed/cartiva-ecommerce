import { discountOf, unitPrice, type Product } from "./types";

export type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "discount";

export const SORTS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Most wanted" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "rating", label: "Top rated" },
  { key: "discount", label: "Biggest discount" },
];

export type FilterState = {
  categories: string[];
  brands: string[];
  /** Inclusive, in EGP, against the price actually charged. */
  price: [number, number] | null;
  minRating: number | null;
  onSale: boolean;
  sort: SortKey;
};

export const EMPTY_FILTERS: FilterState = {
  categories: [],
  brands: [],
  price: null,
  minRating: null,
  onSale: false,
  sort: "featured",
};

type Facet = "categories" | "brands" | "price" | "minRating" | "onSale";

function passes(p: Product, f: FilterState, skip?: Facet) {
  const id = (r?: { _id?: string; name: string }) => r?._id ?? r?.name ?? "";
  if (skip !== "categories" && f.categories.length && !f.categories.includes(id(p.category))) return false;
  if (skip !== "brands" && f.brands.length && !f.brands.includes(id(p.brand))) return false;
  if (skip !== "price" && f.price) {
    const v = unitPrice(p);
    if (v < f.price[0] || v > f.price[1]) return false;
  }
  if (skip !== "minRating" && f.minRating && (p.ratingsAverage ?? 0) < f.minRating) return false;
  if (skip !== "onSale" && f.onSale && !discountOf(p)) return false;
  return true;
}

const SORTERS: Record<SortKey, (a: Product, b: Product) => number> = {
  featured: (a, b) => (b.sold ?? 0) - (a.sold ?? 0),
  "price-asc": (a, b) => unitPrice(a) - unitPrice(b),
  "price-desc": (a, b) => unitPrice(b) - unitPrice(a),
  rating: (a, b) => (b.ratingsAverage ?? 0) - (a.ratingsAverage ?? 0) || (b.ratingsQuantity ?? 0) - (a.ratingsQuantity ?? 0),
  discount: (a, b) => discountOf(b) - discountOf(a),
};

export function applyFilters(products: Product[], f: FilterState): Product[] {
  return products.filter((p) => passes(p, f)).sort(SORTERS[f.sort]);
}

export type FacetOption = { id: string; name: string; count: number };

/**
 * Standard faceting: each facet's counts are computed with every OTHER filter
 * applied, so a count always says how many results that choice would give.
 * Options that would give nothing are left out — unless already selected.
 */
export function facets(products: Product[], f: FilterState) {
  const tally = (skip: Facet, pick: (p: Product) => { _id?: string; name: string } | undefined, selected: string[]) => {
    const m = new Map<string, FacetOption>();
    for (const p of products) {
      if (!passes(p, f, skip)) continue;
      const r = pick(p);
      if (!r) continue;
      const id = r._id ?? r.name;
      const cur = m.get(id) ?? { id, name: r.name, count: 0 };
      cur.count++;
      m.set(id, cur);
    }
    for (const id of selected) if (!m.has(id)) m.set(id, { id, name: id, count: 0 });
    return [...m.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  };

  const prices = products.map(unitPrice);
  const bounds: [number, number] = prices.length ? [Math.min(...prices), Math.max(...prices)] : [0, 0];
  const count = (skip: Facet, extra: (p: Product) => boolean) =>
    products.filter((p) => passes(p, f, skip) && extra(p)).length;

  return {
    categories: tally("categories", (p) => p.category, f.categories),
    brands: tally("brands", (p) => p.brand, f.brands),
    bounds,
    onSale: count("onSale", (p) => discountOf(p) > 0),
    rating: [4, 3].map((stars) => ({ stars, count: count("minRating", (p) => (p.ratingsAverage ?? 0) >= stars) })),
  };
}

/** Filtering without re-sorting — keeps search relevance order intact. */
export function filterOnly(products: Product[], f: FilterState): Product[] {
  return products.filter((p) => passes(p, f));
}

type Params = Record<string, string | string[] | undefined>;
const all = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []).flatMap((s) => s.split(",")).filter(Boolean);
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

// v1 links used the API's own parameter names and sort codes — still honoured.
const LEGACY_SORT: Record<string, SortKey> = { "-sold": "featured", price: "price-asc", "-price": "price-desc", "-ratingsAverage": "rating" };

/** URL → state. Reads the clean v2 names and the v1/API names, so no old link breaks. */
export function parseFilters(sp: Params): { filters: FilterState; q: string } {
  const sortRaw = one(sp.sort);
  const sort = (SORTS.some((s) => s.key === sortRaw) ? sortRaw : LEGACY_SORT[sortRaw]) as SortKey | undefined;
  const min = Number(one(sp.min) || one(sp["price[gte]"]));
  const max = Number(one(sp.max) || one(sp["price[lte]"]));
  const rating = Number(one(sp.rating));
  return {
    q: one(sp.q) || one(sp.keyword),
    filters: {
      categories: [...all(sp.category), ...all(sp["category[in]"])],
      brands: all(sp.brand),
      price: min || max ? [min || 0, max || Number.MAX_SAFE_INTEGER] : null,
      minRating: rating >= 1 && rating <= 5 ? rating : null,
      onSale: one(sp.sale) === "1",
      sort: sort ?? "featured",
    },
  };
}

/** State → URL (clean v2 names only). */
export function toQuery(f: FilterState, q = ""): string {
  const p = new URLSearchParams();
  if (q.trim()) p.set("q", q.trim());
  if (f.categories.length) p.set("category", f.categories.join(","));
  if (f.brands.length) p.set("brand", f.brands.join(","));
  if (f.price) {
    p.set("min", String(Math.round(f.price[0])));
    if (f.price[1] < Number.MAX_SAFE_INTEGER) p.set("max", String(Math.round(f.price[1])));
  }
  if (f.minRating) p.set("rating", String(f.minRating));
  if (f.onSale) p.set("sale", "1");
  if (f.sort !== "featured") p.set("sort", f.sort);
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function activeCount(f: FilterState) {
  return f.categories.length + f.brands.length + (f.price ? 1 : 0) + (f.minRating ? 1 : 0) + (f.onSale ? 1 : 0);
}
