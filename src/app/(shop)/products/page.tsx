import Image from 'next/image'
import Link from 'next/link'

interface ProductCategory {
  _id?: string
  name?: string
  slug?: string
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

interface SubcategoryRef {
  _id: string
  name: string
}

interface CategoriesResponse {
  data: CategoryRef[]
}

interface SubcategoriesResponse {
  data: SubcategoryRef[]
}

type SearchParams = Record<string, string | string[] | undefined>

const PRODUCTS_API = 'https://ecommerce.routemisr.com/api/v1/products'
const CATEGORIES_API = 'https://ecommerce.routemisr.com/api/v1/categories'
const SUBCATEGORIES_API = 'https://ecommerce.routemisr.com/api/v1/subcategories'

const QUERY_KEYS = [
  'limit',
  'sort',
  'fields',
  'page',
  'keyword',
  'brand',
  'subcategory',
  'price[gte]',
  'price[lte]',
  'category[in]',
]

function normalizeFilterLabel(key: string) {
  switch (key) {
    case 'price[gte]':
      return 'Price ?'
    case 'price[lte]':
      return 'Price ?'
    case 'category[in]':
      return 'Category'
    case 'brand':
      return 'Brand'
    case 'subcategory':
      return 'Subcategory'
    case 'sort':
      return 'Sort'
    case 'page':
      return 'Page'
    case 'limit':
      return 'Limit'
    case 'keyword':
      return 'Keyword'
    case 'fields':
      return 'Fields'
    default:
      return key
  }
}

function normalizeFilterValue(key: string, value: string) {
  if (key === 'sort') {
    if (value.startsWith('-')) return `${value.slice(1)} (desc)`
    return `${value} (asc)`
  }
  return value
}

function resolveFilterValue(
  key: string,
  value: string,
  lookups: { categoryById: Map<string, string>; subcategoryById: Map<string, string> },
) {
  if (key === 'category[in]') {
    return lookups.categoryById.get(value) ?? value
  }
  if (key === 'subcategory') {
    return lookups.subcategoryById.get(value) ?? value
  }
  return normalizeFilterValue(key, value)
}

function appendParam(params: URLSearchParams, key: string, value: string | string[] | undefined) {
  if (value === undefined) return
  if (Array.isArray(value)) {
    value.forEach((entry) => {
      if (entry !== '') params.append(key, entry)
    })
    return
  }
  if (value !== '') params.append(key, value)
}

function buildProductsQuery(searchParams?: SearchParams) {
  const params = new URLSearchParams()
  if (!searchParams) return ''

  QUERY_KEYS.forEach((key) => appendParam(params, key, searchParams[key]))

  if (!searchParams.fields && searchParams.select) {
    appendParam(params, 'fields', searchParams.select)
  }

  const query = params.toString()
  return query
}

function getActiveFilters(searchParams?: SearchParams) {
  if (!searchParams) return [] as { key: string; value: string }[]

  const filters: { key: string; value: string }[] = []

  QUERY_KEYS.forEach((key) => {
    const raw = searchParams[key]
    if (!raw) return

    if (Array.isArray(raw)) {
      raw.forEach((value) => {
        if (value !== '') filters.push({ key, value })
      })
      return
    }

    if (raw !== '') filters.push({ key, value: raw })
  })

  if (!searchParams.fields && searchParams.select) {
    const raw = searchParams.select
    if (raw) {
      if (Array.isArray(raw)) {
        raw.forEach((value) => {
          if (value !== '') filters.push({ key: 'fields', value })
        })
      } else if (raw !== '') {
        filters.push({ key: 'fields', value: raw })
      }
    }
  }

  return filters
}

async function getProducts(query: string): Promise<ProductsResponse | null> {
  try {
    const url = query ? `${PRODUCTS_API}?${query}` : PRODUCTS_API
    const res = await fetch(url, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return (await res.json()) as ProductsResponse
  } catch {
    return null
  }
}

async function getCategories(): Promise<CategoryRef[]> {
  try {
    const res = await fetch(CATEGORIES_API, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const json = (await res.json()) as CategoriesResponse
    return json.data ?? []
  } catch {
    return []
  }
}

async function getSubcategories(): Promise<SubcategoryRef[]> {
  try {
    const res = await fetch(SUBCATEGORIES_API, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const json = (await res.json()) as SubcategoriesResponse
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

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>
}) {
  const resolvedSearchParams = await searchParams
  const query = buildProductsQuery(resolvedSearchParams)
  const [response, categories, subcategories] = await Promise.all([
    getProducts(query),
    getCategories(),
    getSubcategories(),
  ])
  const products = response?.data ?? []
  const total = response?.results ?? products.length
  const activeFilters = getActiveFilters(resolvedSearchParams)
  const lookups = {
    categoryById: new Map(categories.map((category) => [category._id, category.name])),
    subcategoryById: new Map(subcategories.map((subcategory) => [subcategory._id, subcategory.name])),
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 text-white">
        <div className="container mx-auto px-4 py-10 sm:py-14">
          <nav className="flex items-center gap-2 text-sm text-white/70 mb-6 flex-wrap">
            <Link className="hover:text-white transition-colors" href="/">
              Home
            </Link>
            <span className="text-white/40">/</span>
            <span className="text-white font-medium">All Products</span>
          </nav>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl ring-1 ring-white/30">
              <svg className="h-8 w-8 text-white" role="img" viewBox="0 0 640 512" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M560.3 237.2c10.4 11.8 28.3 14.4 41.8 5.5 14.7-9.8 18.7-29.7 8.9-44.4l-48-72c-2.8-4.2-6.6-7.7-11.1-10.2L351.4 4.7c-19.3-10.7-42.8-10.7-62.2 0L88.8 116c-5.4 3-9.7 7.4-12.6 12.8L27.7 218.7c-12.6 23.4-3.8 52.5 19.6 65.1l33 17.7 0 53.3c0 23 12.4 44.3 32.4 55.7l176 99.7c19.6 11.1 43.5 11.1 63.1 0l176-99.7c20.1-11.4 32.4-32.6 32.4-55.7l0-117.5zm-240-9.8L170.2 144 320.3 60.6 470.4 144 320.3 227.4zm-41.5 50.2l-21.3 46.2-165.8-88.8 25.4-47.2 161.7 89.8z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">All Products</h1>
              <p className="text-white/80 mt-1">Explore our complete product collection</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {activeFilters.length > 0 && (
          <div className="mb-6 flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="h-4 w-4" role="img" viewBox="0 0 512 512" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M32 64C19.1 64 7.4 71.8 2.4 83.8S.2 109.5 9.4 118.6L192 301.3 192 416c0 8.5 3.4 16.6 9.4 22.6l64 64c9.2 9.2 22.9 11.9 34.9 6.9S320 492.9 320 480l0-178.7 182.6-182.6c9.2-9.2 11.9-22.9 6.9-34.9S492.9 64 480 64L32 64z"
                />
              </svg>
              Active Filters:
            </span>
            {activeFilters.map((filter, index) => (
              <span
                key={`${filter.key}-${filter.value}-${index}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 text-violet-700 text-sm font-medium"
              >
                {normalizeFilterLabel(filter.key)}: {resolveFilterValue(filter.key, filter.value, lookups)}
              </span>
            ))}
            <Link className="text-sm text-gray-500 hover:text-gray-700 underline" href="/products">
              Clear all
            </Link>
          </div>
        )}

        <div className="mb-6 text-sm text-gray-500">Showing {total} products</div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
              <svg className="h-8 w-8 text-gray-400" role="img" viewBox="0 0 640 512" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M560.3 237.2c10.4 11.8 28.3 14.4 41.8 5.5 14.7-9.8 18.7-29.7 8.9-44.4l-48-72c-2.8-4.2-6.6-7.7-11.1-10.2L351.4 4.7c-19.3-10.7-42.8-10.7-62.2 0L88.8 116c-5.4 3-9.7 7.4-12.6 12.8L27.7 218.7c-12.6 23.4-3.8 52.5 19.6 65.1l33 17.7 0 53.3c0 23 12.4 44.3 32.4 55.7l176 99.7c19.6 11.1 43.5 11.1 63.1 0l176-99.7c20.1-11.4 32.4-32.6 32.4-55.7l0-117.5zm-240-9.8L170.2 144 320.3 60.6 470.4 144 320.3 227.4zm-41.5 50.2l-21.3 46.2-165.8-88.8 25.4-47.2 161.7 89.8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-500 mb-6">No products match your current filters.</p>
            <Link
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
              href="/products"
            >
              View All Products
            </Link>
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
                        className="bg-white h-8 w-8 rounded-full flex items-center justify-center transition shadow-sm text-gray-600 hover:text-red-500"
                        title="Add to wishlist"
                        type="button"
                      >
                        <svg className="h-4 w-4" role="img" viewBox="0 0 512 512" aria-hidden="true">
                          <path
                            fill="currentColor"
                            d="M378.9 80c-27.3 0-53 13.1-69 35.2l-34.4 47.6c-4.5 6.2-11.7 9.9-19.4 9.9s-14.9-3.7-19.4-9.9l-34.4-47.6c-16-22.1-41.7-35.2-69-35.2-47 0-85.1 38.1-85.1 85.1 0 49.9 32 98.4 68.1 142.3 41.1 50 91.4 94 125.9 120.3 3.2 2.4 7.9 4.2 14 4.2s10.8-1.8 14-4.2c34.5-26.3 84.8-70.4 125.9-120.3 36.2-43.9 68.1-92.4 68.1-142.3 0-47-38.1-85.1-85.1-85.1zM271 87.1c25-34.6 65.2-55.1 107.9-55.1 73.5 0 133.1 59.6 133.1 133.1 0 68.6-42.9 128.9-79.1 172.8-44.1 53.6-97.3 100.1-133.8 127.9-12.3 9.4-27.5 14.1-43.1 14.1s-30.8-4.7-43.1-14.1C176.4 438 123.2 391.5 79.1 338 42.9 294.1 0 233.7 0 165.1 0 91.6 59.6 32 133.1 32 175.8 32 216 52.5 241 87.1l15 20.7 15-20.7z"
                          />
                        </svg>
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
                      <span className="text-xs text-gray-500">{rating.toFixed(1)} ({reviews})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-gray-800">{displayPrice} EGP</span>
                      </div>
                      <button
                        className="h-10 w-10 rounded-full flex items-center justify-center transition bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-70"
                        type="button"
                      >
                        <svg className="h-4 w-4" role="img" viewBox="0 0 448 512" aria-hidden="true">
                          <path
                            fill="currentColor"
                            d="M256 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 160-160 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l160 0 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160 160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-160 0 0-160z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
