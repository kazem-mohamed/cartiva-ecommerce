'use client'

interface Ref {
  _id: string
  name: string
}

const SORTS = [
  { value: '', label: 'Relevance' },
  { value: '-createdAt', label: 'Newest' },
  { value: 'price', label: 'Price, low to high' },
  { value: '-price', label: 'Price, high to low' },
  { value: '-ratingsAverage', label: 'Best rated' },
  { value: '-sold', label: 'Best selling' },
]

const QUICK_PRICE = [250, 500, 1000, 5000]

export default function SearchFilters({
  categories,
  brands,
  selectedCategoryIds,
  selectedBrandIds,
  minPrice,
  maxPrice,
  sort,
  hasFilters,
  onCategoryToggle,
  onBrandToggle,
  onMinPrice,
  onMaxPrice,
  onSort,
  onClear,
}: {
  categories: Ref[]
  brands: Ref[]
  selectedCategoryIds: string[]
  selectedBrandIds: string[]
  minPrice: string
  maxPrice: string
  sort: string
  hasFilters: boolean
  onCategoryToggle: (id: string) => void
  onBrandToggle: (id: string) => void
  onMinPrice: (v: string) => void
  onMaxPrice: (v: string) => void
  onSort: (v: string) => void
  onClear: () => void
}) {
  const activeCount =
    selectedCategoryIds.length + selectedBrandIds.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0)

  return (
    <aside className="lg:sticky lg:top-6 lg:self-start">
      <div className="bento p-6">
        <div className="flex items-baseline justify-between gap-4">
          <span className="label text-ink-muted">
            Filters{activeCount > 0 && <> · <span className="tabular">{activeCount}</span></>}
          </span>
          {hasFilters && (
            <button
              type="button"
              onClick={onClear}
              className="label text-gold transition-colors duration-300 hover:text-gold-deep"
            >
              Clear
            </button>
          )}
        </div>

        <div className="border-t border-line-soft mt-5 py-5">
          <label htmlFor="search-sort" className="label mb-3 block text-ink-muted">Sort</label>
          <select
            id="search-sort"
            value={sort}
            onChange={(e) => onSort(e.target.value)}
            className="h-12 w-full rounded-full border border-line bg-sunk px-4 text-sm"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <fieldset className="border-t border-line-soft py-5">
          <legend className="label mb-3 text-ink-muted">Price · EGP</legend>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              value={minPrice}
              onChange={(e) => onMinPrice(e.target.value)}
              placeholder="Min"
              aria-label="Minimum price"
              className="tabular h-11 w-full rounded-full border border-line bg-sunk px-3.5 text-sm transition-colors duration-400 focus:border-gold focus:bg-card focus:outline-none"
            />
            <span aria-hidden="true" className="text-ink-muted">–</span>
            <input
              type="number"
              inputMode="numeric"
              value={maxPrice}
              onChange={(e) => onMaxPrice(e.target.value)}
              placeholder="Max"
              aria-label="Maximum price"
              className="tabular h-11 w-full rounded-full border border-line bg-sunk px-3.5 text-sm transition-colors duration-400 focus:border-gold focus:bg-card focus:outline-none"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {QUICK_PRICE.map((limit) => {
              const on = maxPrice === String(limit) && !minPrice
              return (
                <button
                  key={limit}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    onMinPrice('')
                    onMaxPrice(on ? '' : String(limit))
                  }}
                  className={`tabular rounded-full border px-3 py-1.5 text-[11.5px] transition-colors duration-300 ${
                    on ? 'border-gold bg-gold text-white' : 'border-line text-ink-muted hover:border-gold hover:text-gold'
                  }`}
                >
                  under {limit}
                </button>
              )
            })}
          </div>
        </fieldset>

        <div className="border-t border-line-soft py-5">
          <span className="label mb-3 block text-ink-muted">Department</span>
          <ul className="flex flex-col">
            {categories.map((c) => {
              const on = selectedCategoryIds.includes(c._id)
              return (
                <li key={c._id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => onCategoryToggle(c._id)}
                    className="flex w-full items-center gap-3 py-2.5 text-left text-sm transition-colors duration-300 hover:text-gold"
                  >
                    <span
                      aria-hidden="true"
                      className={`grid h-4 w-4 shrink-0 place-items-center rounded-[5px] border transition-colors duration-300 ${
                        on ? 'border-gold bg-gold text-white' : 'border-line'
                      }`}
                    >
                      {on && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-2.5 w-2.5">
                          <path d="m5 13 4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <span className={on ? 'text-gold' : ''}>{c.name}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="border-t border-line-soft pt-5">
          <span className="label mb-3 block text-ink-muted">Brand</span>
          <ul className="flex flex-wrap gap-2">
            {brands.slice(0, 16).map((b) => {
              const on = selectedBrandIds.includes(b._id)
              return (
                <li key={b._id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => onBrandToggle(b._id)}
                    className={`rounded-full border px-3.5 py-2 text-[12px] transition-colors duration-300 ${
                      on ? 'border-gold bg-gold text-white' : 'border-line text-ink-muted hover:border-gold hover:text-gold'
                    }`}
                  >
                    {b.name}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </aside>
  )
}
