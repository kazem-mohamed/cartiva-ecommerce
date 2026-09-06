"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface Ref {
  _id: string;
  name: string;
}

const SORTS = [
  { value: "-createdAt", label: "Newest" },
  { value: "price", label: "Price, low to high" },
  { value: "-price", label: "Price, high to low" },
  { value: "-ratingsAverage", label: "Best rated" },
  { value: "-sold", label: "Best selling" },
];

export default function FilterRail({
  categories,
  brands,
  total,
}: {
  categories: Ref[];
  brands: Ref[];
  total: number;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
      // Any filter change resets pagination — staying on page 7 of a
      // narrower result set is the classic way to land on an empty grid.
      next.delete("page");
      router.push(`/products?${next.toString()}`);
    },
    [params, router]
  );

  const activeCategory = params.get("category[in]");
  const activeBrand = params.get("brand");
  const activeSort = params.get("sort") ?? "-createdAt";
  const min = params.get("price[gte]") ?? "";
  const max = params.get("price[lte]") ?? "";
  const hasFilters = Boolean(activeCategory || activeBrand || min || max);

  return (
    <aside className="lg:sticky lg:top-6 lg:self-start">
      <div className="bento p-6">
        <div className="flex items-baseline justify-between gap-4 pb-5">
          <span className="label text-ink-muted">
            <span className="tabular">{total}</span> item{total === 1 ? "" : "s"}
          </span>
          {hasFilters && (
            <button
              type="button"
              onClick={() => router.push("/products")}
              className="label text-gold transition-colors duration-300 hover:text-gold-deep"
            >
              Clear
            </button>
          )}
        </div>

        <div className="border-t border-line-soft py-5">
          <label htmlFor="sort" className="label mb-3 block text-ink-muted">
            Sort
          </label>
          <select
            id="sort"
            value={activeSort}
            onChange={(e) => setParam("sort", e.target.value)}
            className="h-12 w-full rounded-full border border-line bg-sunk px-4 text-sm"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="border-t border-line-soft py-5">
          <legend className="label mb-3 text-ink-muted">Price · EGP</legend>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              defaultValue={min}
              placeholder="Min"
              aria-label="Minimum price"
              onBlur={(e) => setParam("price[gte]", e.target.value || null)}
              className="tabular h-12 w-full rounded-full border border-line bg-sunk px-4 text-sm"
            />
            <span aria-hidden="true" className="text-ink-muted">–</span>
            <input
              type="number"
              inputMode="numeric"
              defaultValue={max}
              placeholder="Max"
              aria-label="Maximum price"
              onBlur={(e) => setParam("price[lte]", e.target.value || null)}
              className="tabular h-12 w-full rounded-full border border-line bg-sunk px-4 text-sm"
            />
          </div>
        </fieldset>

        <div className="border-t border-line-soft py-5">
          <span className="label mb-3 block text-ink-muted">Department</span>
          <ul className="flex flex-col">
            {categories.map((c) => {
              const on = activeCategory === c._id;
              return (
                <li key={c._id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => setParam("category[in]", on ? null : c._id)}
                    className={`w-full py-2.5 text-left text-sm transition-colors duration-300 ${
                      on ? "font-medium text-gold" : "text-ink hover:text-gold"
                    }`}
                  >
                    {c.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="border-t border-line-soft pt-5">
          <span className="label mb-3 block text-ink-muted">Brand</span>
          <ul className="flex flex-wrap gap-2">
            {brands.slice(0, 14).map((b) => {
              const on = activeBrand === b._id;
              return (
                <li key={b._id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => setParam("brand", on ? null : b._id)}
                    className={`rounded-full border px-3.5 py-2 text-[12px] transition-colors duration-300 ${
                      on
                        ? "border-gold bg-gold text-white"
                        : "border-line text-ink-muted hover:border-gold hover:text-gold"
                    }`}
                  >
                    {b.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
}
