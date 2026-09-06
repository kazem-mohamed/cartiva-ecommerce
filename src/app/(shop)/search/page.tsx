'use client'

import Link from 'next/link'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductShelf from '@/component/product/ProductShelf'
import type { CardProduct } from '@/component/product/ProductCard'
import SearchFilters from './SearchFilters'

interface ProductsResponse {
  results?: number
  data: CardProduct[]
}

interface Ref {
  _id: string
  name: string
}

const PRODUCTS_API = 'https://ecommerce.routemisr.com/api/v1/products'
const CATEGORIES_API = 'https://ecommerce.routemisr.com/api/v1/categories'
const BRANDS_API = 'https://ecommerce.routemisr.com/api/v1/brands'

function getFirstValue(value: string | string[] | null | undefined) {
  if (!value) return ''
  if (Array.isArray(value)) return value[0] ?? ''
  return value
}

function getMultiValues(value: string | string[] | null | undefined) {
  if (!value) return [] as string[]
  return Array.isArray(value) ? value.filter(Boolean) : value ? [value] : []
}

function useDebouncedValue<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(handle)
  }, [value, delay])
  return debounced
}

/**
 * The API's own `keyword` param is broken: it returns 0 results for every
 * term, including ones that exactly match a product title (`keyword=Woman`
 * returns nothing while "Woman Shawl" is in the catalogue). Search has
 * therefore never worked on this store.
 *
 * The catalogue is 56 products, so the fix is to let the API do what it
 * does correctly — category, brand, price and sort — and match the title
 * here. `keyword` is deliberately NOT sent.
 */
function buildProductsQuery(params: {
  categories?: string[]
  brands?: string[]
  minPrice?: string
  maxPrice?: string
  sort?: string
  limit?: string
}) {
  const query = new URLSearchParams()
  params.categories?.forEach((id) => id && query.append('category[in]', id))
  params.brands?.forEach((id) => id && query.append('brand', id))
  if (params.minPrice) query.set('price[gte]', params.minPrice)
  if (params.maxPrice) query.set('price[lte]', params.maxPrice)
  if (params.sort) query.set('sort', params.sort)
  if (params.limit) query.set('limit', params.limit)
  return query.toString()
}

async function fetchProducts(query: string, signal?: AbortSignal): Promise<ProductsResponse | null> {
  try {
    const url = query ? `${PRODUCTS_API}?${query}` : PRODUCTS_API
    const res = await fetch(url, { signal, cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as ProductsResponse
  } catch {
    return null
  }
}

async function fetchRefs(url: string, signal?: AbortSignal): Promise<Ref[]> {
  try {
    const res = await fetch(url, { signal, cache: 'force-cache' })
    if (!res.ok) return []
    const json = (await res.json()) as { data: Ref[] }
    return json.data ?? []
  } catch {
    return []
  }
}

function SearchInner() {
  const searchParams = useSearchParams()
  const searchKey = searchParams.toString()

  const initialKeyword = useMemo(
    () => getFirstValue(searchParams.get('keyword') ?? searchParams.get('q')),
    [searchParams],
  )
  const initialCategories = useMemo(
    () =>
      getMultiValues(searchParams.getAll('category[in]')).concat(
        getMultiValues(searchParams.get('category')),
      ),
    [searchParams],
  )
  const initialBrands = useMemo(() => getMultiValues(searchParams.getAll('brand')), [searchParams])
  const initialMinPrice = useMemo(() => getFirstValue(searchParams.get('price[gte]')), [searchParams])
  const initialMaxPrice = useMemo(() => getFirstValue(searchParams.get('price[lte]')), [searchParams])
  const initialSort = useMemo(() => getFirstValue(searchParams.get('sort')), [searchParams])

  const [keyword, setKeyword] = useState(initialKeyword)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(() => [...new Set(initialCategories)])
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>(() => [...new Set(initialBrands)])
  const [minPrice, setMinPrice] = useState(initialMinPrice)
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice)
  const [sort, setSort] = useState(initialSort)
  const [categories, setCategories] = useState<Ref[]>([])
  const [brands, setBrands] = useState<Ref[]>([])
  const [products, setProducts] = useState<CardProduct[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  const debouncedKeyword = useDebouncedValue(keyword)
  const debouncedMinPrice = useDebouncedValue(minPrice)
  const debouncedMaxPrice = useDebouncedValue(maxPrice)

  // Depends on searchKey ALONE — a string, so it is stable across renders.
  //
  // Listing initialCategories/initialBrands here instead is an infinite
  // loop: they are arrays rebuilt on every render, so the effect re-runs,
  // calls setState, triggers another render, and re-runs again. The fetch
  // effect below then aborts its own in-flight request every cycle and the
  // grid never populates.
  useEffect(() => {
    setKeyword(initialKeyword)
    setSelectedCategoryIds([...new Set(initialCategories)])
    setSelectedBrandIds([...new Set(initialBrands)])
    setMinPrice(initialMinPrice)
    setMaxPrice(initialMaxPrice)
    setSort(initialSort)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKey])

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      fetchRefs(CATEGORIES_API, controller.signal),
      fetchRefs(`${BRANDS_API}?limit=50`, controller.signal),
    ]).then(([c, b]) => {
      setCategories(c)
      setBrands(b)
    })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const query = buildProductsQuery({
      categories: selectedCategoryIds,
      brands: selectedBrandIds,
      minPrice: debouncedMinPrice,
      maxPrice: debouncedMaxPrice,
      sort,
      // The whole catalogue is 56 items; fetching it lets the title match
      // below run over everything rather than one page of it.
      limit: '100',
    })

    setLoading(true)
    setFailed(false)
    fetchProducts(query, controller.signal)
      .then((response) => {
        if (!response) {
          setProducts([])
          setTotal(0)
          setFailed(true)
          return
        }

        const all = response.data ?? []
        const term = debouncedKeyword.trim().toLowerCase()
        const matched = term
          ? all.filter((p) => {
              const haystack = [p.title, p.brand?.name, p.category?.name]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
              // Every word must appear, so "leather boots" is narrower
              // than "leather" rather than looser.
              return term.split(/\s+/).every((w) => haystack.includes(w))
            })
          : all

        setProducts(matched)
        setTotal(matched.length)
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
    // Arrays are joined into strings so this compares by VALUE. Passing the
    // arrays directly compares by reference and re-fires on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedKeyword,
    selectedCategoryIds.join(','),
    selectedBrandIds.join(','),
    debouncedMinPrice,
    debouncedMaxPrice,
    sort,
  ])

  const handleCategoryToggle = (id: string) =>
    setSelectedCategoryIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const handleBrandToggle = (id: string) =>
    setSelectedBrandIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const hasFilters =
    keyword.trim().length > 0 ||
    selectedCategoryIds.length > 0 ||
    selectedBrandIds.length > 0 ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    Boolean(sort)

  const clearFilters = () => {
    setKeyword('')
    setSelectedCategoryIds([])
    setSelectedBrandIds([])
    setMinPrice('')
    setMaxPrice('')
    setSort('')
  }

  return (
    <main className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 py-10 sm:py-14">
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="label flex items-center gap-2 text-ink-muted">
          <li><Link href="/" className="transition-colors duration-300 hover:text-gold">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-ink">Search</li>
        </ol>
      </nav>

      {/* The field is the page, not a filter tucked in a sidebar. */}
      <div className="bento mb-8 p-7 sm:p-10">
        <label htmlFor="search-field" className="label mb-4 block text-ink-muted">
          Search the catalogue
        </label>
        <div className="flex items-center gap-3 border-b border-line pb-4 transition-colors duration-500 focus-within:border-gold">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            className="h-6 w-6 shrink-0 text-ink-muted"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            id="search-field"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="What are you looking for?"
            autoComplete="off"
            className="font-display w-full bg-transparent text-[clamp(20px,3vw,32px)] outline-none placeholder:font-light placeholder:text-ink-muted/60"
          />
          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword('')}
              aria-label="Clear search"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-muted transition-colors duration-300 hover:bg-sunk hover:text-ink"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <p aria-live="polite" className="mt-4 text-[13.5px] font-light text-ink-muted">
          {loading ? (
            'Searching…'
          ) : (
            <>
              <span className="tabular">{total}</span> result{total === 1 ? '' : 's'}
              {keyword.trim() && <> for “{keyword.trim()}”</>}
            </>
          )}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[248px_minmax(0,1fr)] lg:items-start">
        <SearchFilters
          categories={categories}
          brands={brands}
          selectedCategoryIds={selectedCategoryIds}
          selectedBrandIds={selectedBrandIds}
          minPrice={minPrice}
          maxPrice={maxPrice}
          sort={sort}
          hasFilters={hasFilters}
          onCategoryToggle={handleCategoryToggle}
          onBrandToggle={handleBrandToggle}
          onMinPrice={setMinPrice}
          onMaxPrice={setMaxPrice}
          onSort={setSort}
          onClear={clearFilters}
        />

        <div>
          {loading ? (
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} aria-hidden="true" className="bento p-3">
                  <div className="well aspect-[4/5] animate-pulse" />
                  <div className="space-y-3 px-2 pt-4 pb-2">
                    <div className="h-2 w-1/3 animate-pulse rounded-full bg-sunk" />
                    <div className="h-3.5 w-4/5 animate-pulse rounded-full bg-sunk" />
                    <div className="h-5 w-1/2 animate-pulse rounded-full bg-sunk" />
                  </div>
                </div>
              ))}
              <span className="sr-only" role="status">Searching…</span>
            </div>
          ) : failed ? (
            <div className="bento px-8 py-20 text-center" role="alert">
              <h2 className="font-display text-xl">Search is unavailable</h2>
              <p className="mt-3 text-sm font-light text-ink-muted">
                The catalogue could not be reached. Try again in a moment.
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="bento px-8 py-20 text-center">
              <h2 className="font-display text-xl">
                {keyword.trim() ? `Nothing matches “${keyword.trim()}”` : 'Nothing matches those filters'}
              </h2>
              <p className="mt-3 text-sm font-light text-ink-muted">
                Try a shorter word, a wider price range, or fewer departments.
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="label mt-7 text-gold transition-colors duration-300 hover:text-gold-deep"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <ProductShelf products={products} className="grid-cols-2 lg:grid-cols-3" />
          )}
        </div>
      </div>
    </main>
  )
}

export default function SearchPage() {
  // useSearchParams needs a Suspense boundary above it.
  return (
    <Suspense fallback={null}>
      <SearchInner />
    </Suspense>
  )
}
