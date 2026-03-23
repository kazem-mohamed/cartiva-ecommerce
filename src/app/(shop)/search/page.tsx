'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Spinner } from '@/component/ui/Spinner'
import { useSession } from 'next-auth/react'

interface ProductCategory {
  _id?: string
  name?: string
}

interface Product {
  _id: string
  title: string
  price: number
  priceAfterDiscount?: number
  imageCover?: string
  ratingsAverage?: number
  ratingsQuantity?: number
  category?: ProductCategory
}

interface ProductsResponse {
  results?: number
  data: Product[]
}

interface CategoryRef {
  _id: string
  name: string
}

interface CategoriesResponse {
  data: CategoryRef[]
}

interface BrandRef {
  _id: string
  name: string
}

interface BrandsResponse {
  data: BrandRef[]
}

const PRODUCTS_API = 'https://ecommerce.routemisr.com/api/v1/products'
const CATEGORIES_API = 'https://ecommerce.routemisr.com/api/v1/categories'
const BRANDS_API = 'https://ecommerce.routemisr.com/api/v1/brands'
const WISHLIST_API = 'https://ecommerce.routemisr.com/api/v1/wishlist'
const CART_API = 'https://ecommerce.routemisr.com/api/v2/cart'

const SORT_OPTIONS = [
  { value: '', label: 'Relevance' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-ratingsAverage', label: 'Rating: High to Low' },
  { value: 'title', label: 'Name: A to Z' },
  { value: '-title', label: 'Name: Z to A' },
]

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

function buildProductsQuery(params: {
  keyword?: string
  categories?: string[]
  brands?: string[]
  minPrice?: string
  maxPrice?: string
  sort?: string
  page?: string
  limit?: string
}) {
  const query = new URLSearchParams()
  const keyword = params.keyword?.trim()
  if (keyword) query.set('keyword', keyword)

  params.categories?.forEach((id) => {
    if (id) query.append('category[in]', id)
  })

  params.brands?.forEach((id) => {
    if (id) query.append('brand', id)
  })

  if (params.minPrice) query.set('price[gte]', params.minPrice)
  if (params.maxPrice) query.set('price[lte]', params.maxPrice)
  if (params.sort) query.set('sort', params.sort)
  if (params.page) query.set('page', params.page)
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

async function fetchCategories(signal?: AbortSignal): Promise<CategoryRef[]> {
  try {
    const res = await fetch(CATEGORIES_API, { signal, cache: 'force-cache' })
    if (!res.ok) return []
    const json = (await res.json()) as CategoriesResponse
    return json.data ?? []
  } catch {
    return []
  }
}

async function fetchBrands(signal?: AbortSignal): Promise<BrandRef[]> {
  try {
    const res = await fetch(BRANDS_API, { signal, cache: 'force-cache' })
    if (!res.ok) return []
    const json = (await res.json()) as BrandsResponse
    return json.data ?? []
  } catch {
    return []
  }
}

function Stars({ rating = 0 }: { rating?: number }) {
  const filled = Math.round(rating)
  return (
    <div className="flex text-amber-400 mr-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          className={index < filled ? 'h-3.5 w-3.5 text-yellow-400' : 'h-3.5 w-3.5 text-gray-300'}
          viewBox="0 0 576 512"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M309.5 13.5c-4.1-8-12.4-13.1-21.4-13.1s-17.3 5.1-21.4 13.1L193.1 125.3 33.2 150.7c-8.9 1.4-16.3 7.7-19.1 16.3s-.5 18 5.8 24.4l114.4 114.5-25.2 159.9c-1.4 8.9 2.3 17.9 9.6 23.2s16.9 6.1 25 2L288.1 417.6 432.4 491c8 4.1 17.7 3.3 25-2s11-14.2 9.6-23.2L441.7 305.9 556.1 191.4c6.4-6.4 8.6-15.8 5.8-24.4s-10.1-14.9-19.1-16.3L383 125.3 309.5 13.5z"
          />
        </svg>
      ))}
    </div>
  )
}

function notifyWishlistUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('wishlistUpdated'))
  }
}

function notifyCartUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cartUpdated'))
  }
}

export default function SearchPage() {
  const { data: session } = useSession()
  const token = session?.accessToken ?? null
  const searchParams = useSearchParams()
  const searchKey = searchParams.toString()

  const initialKeyword = useMemo(
    () => getFirstValue(searchParams.get('keyword') ?? searchParams.get('q')),
    [searchParams],
  )
  const initialCategories = useMemo(
    () => getMultiValues(searchParams.getAll('category[in]')).concat(getMultiValues(searchParams.get('category'))),
    [searchParams],
  )
  const initialBrands = useMemo(
    () => getMultiValues(searchParams.getAll('brand')),
    [searchParams],
  )
  const initialMinPrice = useMemo(() => getFirstValue(searchParams.get('price[gte]')), [searchParams])
  const initialMaxPrice = useMemo(() => getFirstValue(searchParams.get('price[lte]')), [searchParams])
  const initialSort = useMemo(() => getFirstValue(searchParams.get('sort')), [searchParams])

  const [keyword, setKeyword] = useState(initialKeyword)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(() => [...new Set(initialCategories)])
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>(() => [...new Set(initialBrands)])
  const [minPrice, setMinPrice] = useState(initialMinPrice)
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice)
  const [sort, setSort] = useState(initialSort)
  const [categories, setCategories] = useState<CategoryRef[]>([])
  const [brands, setBrands] = useState<BrandRef[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [wishlistLoadingIds, setWishlistLoadingIds] = useState<Set<string>>(new Set())
  const [cartLoadingIds, setCartLoadingIds] = useState<Set<string>>(new Set())

  const debouncedKeyword = useDebouncedValue(keyword)
  const debouncedMinPrice = useDebouncedValue(minPrice)
  const debouncedMaxPrice = useDebouncedValue(maxPrice)

  useEffect(() => {
    setKeyword(initialKeyword)
    setSelectedCategoryIds([...new Set(initialCategories)])
    setSelectedBrandIds([...new Set(initialBrands)])
    setMinPrice(initialMinPrice)
    setMaxPrice(initialMaxPrice)
    setSort(initialSort)
  }, [
    searchKey,
    initialKeyword,
    initialCategories,
    initialBrands,
    initialMinPrice,
    initialMaxPrice,
    initialSort,
  ])

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      fetchCategories(controller.signal),
      fetchBrands(controller.signal),
    ]).then(([categoriesData, brandsData]) => {
      setCategories(categoriesData)
      setBrands(brandsData)
    })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const query = buildProductsQuery({
      keyword: debouncedKeyword,
      categories: selectedCategoryIds,
      brands: selectedBrandIds,
      minPrice: debouncedMinPrice,
      maxPrice: debouncedMaxPrice,
      sort,
    })

    setLoading(true)
    fetchProducts(query, controller.signal)
      .then((response) => {
        if (!response) {
          setProducts([])
          setTotal(0)
          return
        }
        setProducts(response.data ?? [])
        setTotal(response.results ?? response.data?.length ?? 0)
      })
      .finally(() => {
        setLoading(false)
      })

    return () => controller.abort()
  }, [debouncedKeyword, selectedCategoryIds, selectedBrandIds, debouncedMinPrice, debouncedMaxPrice, sort])

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategoryIds((prev) => {
      if (prev.includes(categoryId)) return prev.filter((id) => id !== categoryId)
      return [...prev, categoryId]
    })
  }

  const handleBrandToggle = (brandId: string) => {
    setSelectedBrandIds((prev) => {
      if (prev.includes(brandId)) return prev.filter((id) => id !== brandId)
      return [...prev, brandId]
    })
  }

  const handleQuickPrice = (limit: number) => {
    setMinPrice('')
    setMaxPrice(String(limit))
  }

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

  const addToWishlist = async (productId: string) => {
    if (!token) return

    setWishlistLoadingIds((prev) => {
      const next = new Set(prev)
      next.add(productId)
      return next
    })

    try {
      const res = await fetch(WISHLIST_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token,
        },
        body: JSON.stringify({ productId }),
      })

      if (!res.ok) throw new Error('Failed')
      notifyWishlistUpdate()
    } finally {
      setWishlistLoadingIds((prev) => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })
    }
  }

  const addToCart = async (productId: string) => {
    if (!token) return

    setCartLoadingIds((prev) => {
      const next = new Set(prev)
      next.add(productId)
      return next
    })

    try {
      const res = await fetch(CART_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      })

      if (!res.ok) throw new Error('Failed')
      notifyCartUpdate()
    } finally {
      setCartLoadingIds((prev) => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-6">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link className="hover:text-primary-600 transition-colors" href="/">
              Home
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">Search Results</span>
          </nav>

          <div className="flex flex-wrap items-center gap-4">
            <div className="max-w-2xl flex-1">
              <div className="relative">
                <svg
                  data-prefix="fas"
                  data-icon="magnifying-glass"
                  className="svg-inline--fa fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  role="img"
                  viewBox="0 0 512 512"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376C296.3 401.1 253.9 416 208 416 93.1 416 0 322.9 0 208S93.1 0 208 0 416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
                  />
                </svg>
                <input
                  type="text"
                  name="keyword"
                  placeholder="Search for products..."
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-lg"
                />
              </div>
            </div>

            {hasFilters && (
              <button
                className="text-sm text-gray-500 hover:text-gray-700 underline"
                type="button"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Categories</h3>
                  </div>
                  {categories.length === 0 ? (
                    <p className="text-sm text-gray-500">No categories available.</p>
                  ) : (
                    <div className="space-y-2 max-h-52 overflow-y-auto">
                      {categories.map((category) => (
                        <label key={category._id} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            type="checkbox"
                            name="category[in]"
                            value={category._id}
                            checked={selectedCategoryIds.includes(category._id)}
                            onChange={() => handleCategoryToggle(category._id)}
                          />
                          <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                            {category.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <hr className="border-gray-100" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">Price Range</h3>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Min (EGP)</label>
                      <input
                        name="price[gte]"
                        placeholder="0"
                        value={minPrice}
                        onChange={(event) => setMinPrice(event.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                        type="number"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Max (EGP)</label>
                      <input
                        name="price[lte]"
                        placeholder="No limit"
                        value={maxPrice}
                        onChange={(event) => setMaxPrice(event.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                        type="number"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[500, 1000, 5000, 10000].map((limit) => {
                      const active = maxPrice === String(limit)
                      return (
                        <button
                          key={limit}
                          type="button"
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            active
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          onClick={() => handleQuickPrice(limit)}
                        >
                          Under {limit >= 1000 ? `${limit / 1000}K` : limit}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <hr className="border-gray-100" />
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Brands</h3>
                  </div>
                  {brands.length === 0 ? (
                    <p className="text-sm text-gray-500">No brands available.</p>
                  ) : (
                    <div className="space-y-2 max-h-52 overflow-y-auto">
                      {brands.map((brand) => (
                        <label key={brand._id} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            type="checkbox"
                            name="brand"
                            value={brand._id}
                            checked={selectedBrandIds.includes(brand._id)}
                            onChange={() => handleBrandToggle(brand._id)}
                          />
                          <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                            {brand.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <hr className="border-gray-100" />
                <button
                  className="w-full py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  type="button"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
              <div className="text-sm text-gray-500">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="size-6 text-primary-600" />
                    Loading products...
                  </span>
                ) : (
                  `Showing ${total} products`
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <select
                  name="sort"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none bg-white"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value || 'relevance'} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="flex items-center justify-center gap-3 text-gray-500">
                  <Spinner className="size-8 text-primary-600" />
                  <span>Loading products...</span>
                </div>
              </div>
            ) : products.length === 0 && !loading ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
                  <svg
                    data-prefix="fas"
                    data-icon="magnifying-glass"
                    className="svg-inline--fa fa-magnifying-glass text-3xl text-gray-400"
                    role="img"
                    viewBox="0 0 512 512"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376C296.3 401.1 253.9 416 208 416 93.1 416 0 322.9 0 208S93.1 0 208 0 416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Products Found</h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <button
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
                  type="button"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {products.map((product) => {
                  const rating = product.ratingsAverage ?? 0
                  const reviews = product.ratingsQuantity ?? 0
                  const displayPrice = product.priceAfterDiscount ?? product.price
                  const hasSavings =
                    typeof product.priceAfterDiscount === 'number' &&
                    product.priceAfterDiscount < product.price
                  const savingsPercent = hasSavings
                    ? Math.round(((product.price - product.priceAfterDiscount!) / product.price) * 100)
                    : 0

                  return (
                    <div
                      key={product._id}
                      id="product-card"
                      className="group bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary-200"
                    >
                      <div className="relative">
                        {product.imageCover ? (
                          <Image
                            className="w-full h-60 object-contain bg-white transition-transform duration-500 group-hover:scale-105"
                            alt={product.title}
                            src={product.imageCover}
                            width={800}
                            height={800}
                            sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
                          />
                        ) : (
                          <div className="w-full h-60 bg-gray-100 flex items-center justify-center text-sm text-gray-400">
                            No image
                          </div>
                        )}

                        {hasSavings && (
                          <div className="absolute top-3 left-3">
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                              Save {savingsPercent > 0 ? `${savingsPercent}%` : ''}
                            </span>
                          </div>
                        )}

                        <div className="absolute top-3 right-3 flex flex-col space-y-2">
                          <button
                            className="bg-white h-8 w-8 rounded-full flex items-center justify-center transition shadow-sm text-gray-600 hover:text-red-500 disabled:opacity-60"
                            title="Add to wishlist"
                            type="button"
                            onClick={() => addToWishlist(product._id)}
                            disabled={wishlistLoadingIds.has(product._id)}
                          >
                            {wishlistLoadingIds.has(product._id) ? (
                              <Spinner />
                            ) : (
                              <svg className="h-4 w-4" role="img" viewBox="0 0 512 512" aria-hidden="true">
                                <path
                                  fill="currentColor"
                                  d="M378.9 80c-27.3 0-53 13.1-69 35.2l-34.4 47.6c-4.5 6.2-11.7 9.9-19.4 9.9s-14.9-3.7-19.4-9.9l-34.4-47.6c-16-22.1-41.7-35.2-69-35.2-47 0-85.1 38.1-85.1 85.1 0 49.9 32 98.4 68.1 142.3 41.1 50 91.4 94 125.9 120.3 3.2 2.4 7.9 4.2 14 4.2s10.8-1.8 14-4.2c34.5-26.3 84.8-70.4 125.9-120.3 36.2-43.9 68.1-92.4 68.1-142.3 0-47-38.1-85.1-85.1-85.1zM271 87.1c25-34.6 65.2-55.1 107.9-55.1 73.5 0 133.1 59.6 133.1 133.1 0 68.6-42.9 128.9-79.1 172.8-44.1 53.6-97.3 100.1-133.8 127.9-12.3 9.4-27.5 14.1-43.1 14.1s-30.8-4.7-43.1-14.1C176.4 438 123.2 391.5 79.1 338 42.9 294.1 0 233.7 0 165.1 0 91.6 59.6 32 133.1 32 175.8 32 216 52.5 241 87.1l15 20.7 15-20.7z"
                                />
                              </svg>
                            )}
                          </button>
                          <button
                            className="bg-white h-8 w-8 rounded-full flex items-center justify-center text-gray-600 hover:text-primary-600 shadow-sm"
                            type="button"
                          >
                            <svg className="h-4 w-4" role="img" viewBox="0 0 512 512" aria-hidden="true">
                              <path
                                fill="currentColor"
                                d="M65.9 228.5c13.3-93 93.4-164.5 190.1-164.5 53 0 101 21.5 135.8 56.2 .2 .2 .4 .4 .6 .6l7.6 7.2-47.9 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l128 0c17.7 0 32-14.3 32-32l0-128c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 53.4-11.3-10.7C390.5 28.6 326.5 0 256 0 127 0 20.3 95.4 2.6 219.5 .1 237 12.2 253.2 29.7 255.7s33.7-9.7 36.2-27.1zm443.5 64c2.5-17.5-9.7-33.7-27.1-36.2s-33.7 9.7-36.2 27.1c-13.3 93-93.4 164.5-190.1 164.5-53 0-101-21.5-135.8-56.2-.2-.2-.4-.4-.6-.6l-7.6-7.2 47.9 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 320c-8.5 0-16.7 3.4-22.7 9.5S-.1 343.7 0 352.3l1 127c.1 17.7 14.6 31.9 32.3 31.7S65.2 496.4 65 478.7l-.4-51.5 10.7 10.1c46.3 46.1 110.2 74.7 180.7 74.7 129 0 235.7-95.4 253.4-219.5z"
                              />
                            </svg>
                          </button>
                          <Link
                            className="bg-white h-8 w-8 rounded-full flex items-center justify-center text-gray-600 hover:text-primary-600 shadow-sm"
                            href={`/products/${product._id}`}
                          >
                            <svg className="h-4 w-4" role="img" viewBox="0 0 576 512" aria-hidden="true">
                              <path
                                fill="currentColor"
                                d="M288 80C222.8 80 169.2 109.6 128.1 147.7 89.6 183.5 63 226 49.4 256 63 286 89.6 328.5 128.1 364.3 169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256 513 226 486.4 183.5 447.9 147.7 406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1 3.3 7.9 3.3 16.7 0 24.6-14.9 35.7-46.2 87.7-93 131.1-47.1 43.7-111.8 80.6-192.6 80.6S142.5 443.2 95.4 399.4c-46.8-43.5-78.1-95.4-93-131.1-3.3-7.9-3.3-16.7 0-24.6 14.9-35.7 46.2-87.7 93-131.1zM288 336c44.2 0 80-35.8 80-80 0-29.6-16.1-55.5-40-69.3-1.4 59.7-49.6 107.9-109.3 109.3 13.8 23.9 39.7 40 69.3 40zm-79.6-88.4c2.5 .3 5 .4 7.6 .4 35.3 0 64-28.7 64-64 0-2.6-.2-5.1-.4-7.6-37.4 3.9-67.2 33.7-71.1 71.1zm45.6-115c10.8-3 22.2-4.5 33.9-4.5 8.8 0 17.5 .9 25.8 2.6 .3 .1 .5 .1 .8 .2 57.9 12.2 101.4 63.7 101.4 125.2 0 70.7-57.3 128-128 128-61.6 0-113-43.5-125.2-101.4-1.8-8.6-2.8-17.5-2.8-26.6 0-11 1.4-21.8 4-32 .2-.7 .3-1.3 .5-1.9 11.9-43.4 46.1-77.6 89.5-89.5z"
                              />
                            </svg>
                          </Link>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="text-xs text-gray-500 mb-1">{product.category?.name ?? 'Product'}</div>
                        <h3 className="font-medium mb-1 cursor-pointer" title={product.title}>
                          <Link
                            className="line-clamp-2 transition-colors duration-300 group-hover:text-primary-600"
                            href={`/products/${product._id}`}
                          >
                            {product.title}
                          </Link>
                        </h3>
                        <div className="flex items-center mb-2">
                          <Stars rating={rating} />
                          <span className="text-xs text-gray-500">
                            {rating.toFixed(1)} ({reviews})
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold text-gray-800">{displayPrice} EGP</span>
                          </div>
                          <button
                            className="h-10 w-10 rounded-full flex items-center justify-center transition bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-70"
                            type="button"
                            onClick={() => addToCart(product._id)}
                            disabled={cartLoadingIds.has(product._id)}
                          >
                            {cartLoadingIds.has(product._id) ? (
                              <Spinner className="text-white" />
                            ) : (
                              <svg className="h-4 w-4" role="img" viewBox="0 0 448 512" aria-hidden="true">
                                <path
                                  fill="currentColor"
                                  d="M256 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 160-160 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l160 0 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160 160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-160 0 0-160z"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
