 'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Spinner } from '@/component/ui/Spinner'
import { toast } from 'sonner'

interface ProductCategory {
  name: string
}

interface Product {
  _id: string
  title: string
  price: number
  priceAfterDiscount?: number
  category?: ProductCategory
  imageCover: string
  ratingsAverage?: number
  ratingsQuantity?: number
}

interface ProductsResponse {
  data: Product[]
}

function Stars({ rating = 0 }: { rating?: number }) {
  const filled = Math.round(rating)
  return (
    <div className="flex text-amber-400 mr-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          className={index < filled ? 'h-4 w-4 text-yellow-400' : 'h-4 w-4 text-gray-300'}
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

const WISHLIST_API = 'https://ecommerce.routemisr.com/api/v1/wishlist'
const CART_API = 'https://ecommerce.routemisr.com/api/v2/cart'

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

export default function ProductHome() {
  const { data: session } = useSession()
  const token = session?.accessToken ?? null
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set())
  const [wishlistLoadingIds, setWishlistLoadingIds] = useState<Set<string>>(new Set())
  const [cartLoadingIds, setCartLoadingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await fetch('https://ecommerce.routemisr.com/api/v1/products')
        if (!res.ok) throw new Error('Failed')
        const json = (await res.json()) as ProductsResponse
        setProducts(json.data ?? [])
      } catch {
        setError('Failed to load products')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!token) {
      setWishlistIds(new Set())
      return
    }

    let active = true
    fetch(WISHLIST_API, { headers: { token } })
      .then((res) => {
        if (!res.ok) throw new Error('Failed')
        return res.json() as Promise<{ data?: Array<{ _id: string }> }>
      })
      .then((json) => {
        if (!active) return
        const ids = new Set((json.data ?? []).map((item) => item._id))
        setWishlistIds(ids)
      })
      .catch(() => {
        if (active) setError('Failed to load wishlist')
      })

    return () => {
      active = false
    }
  }, [token])

  const toggleWishlist = async (productId: string) => {
    if (!token) {
      setError('Please login first')
      toast.error('Please login first')
      return
    }

    const isInWishlist = wishlistIds.has(productId)

    setWishlistLoadingIds((prev) => {
      const next = new Set(prev)
      next.add(productId)
      return next
    })
    try {
      const res = await fetch(isInWishlist ? `${WISHLIST_API}/${productId}` : WISHLIST_API, {
        method: isInWishlist ? 'DELETE' : 'POST',
        headers: isInWishlist
          ? { token }
          : {
              'Content-Type': 'application/json',
              token,
            },
        body: isInWishlist ? undefined : JSON.stringify({ productId }),
      })

      if (!res.ok) throw new Error('Failed')
      setError('')
      setWishlistIds((prev) => {
        const next = new Set(prev)
        if (isInWishlist) {
          next.delete(productId)
        } else {
          next.add(productId)
        }
        return next
      })
      notifyWishlistUpdate()
      toast.error(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist')
    } catch {
      setError('Failed to update wishlist')
      toast.error('Failed to update wishlist')
    } finally {
      setWishlistLoadingIds((prev) => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })
    }
  }

  const addToCart = async (productId: string) => {
    if (!token) {
      setError('Please login first')
      toast.error('Please login first')
      return
    }

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
      setError('')
      notifyCartUpdate()
      toast.success('Added to cart')
    } catch {
      setError('Failed to add to cart')
      toast.error('Failed to add to cart')
    } finally {
      setCartLoadingIds((prev) => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })
    }
  }

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 my-8">
          <div className="h-8 w-1.5 bg-linear-to-b from-emerald-500 to-emerald-700 rounded-full" />
          <h2 className="text-3xl font-bold text-gray-800">
            Featured <span className="text-emerald-600">Products</span>
          </h2>
        </div>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        {loading ? (
          <p className="text-gray-500">Loading products...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary-200"
              >
                <div className="relative">
                  {typeof product.priceAfterDiscount === 'number' &&
                    product.priceAfterDiscount < product.price && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                          Save {Math.round(((product.price - product.priceAfterDiscount) / product.price) * 100)}%
                        </span>
                      </div>
                    )}
                  <Image
                    className="w-full h-60 object-contain bg-white transition-transform duration-500 group-hover:scale-105"
                    alt={product.title}
                    src={product.imageCover}
                    width={800}
                    height={800}
                  />

                  <div className="absolute top-3 right-3 flex flex-col space-y-2">
                    <button
                      className={`bg-white h-8 w-8 rounded-full flex items-center justify-center transition shadow-sm disabled:opacity-60 ${
                        wishlistIds.has(product._id)
                          ? 'text-red-500'
                          : 'text-gray-600 hover:text-red-500'
                      }`}
                      title={wishlistIds.has(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                      type="button"
                      onClick={() => toggleWishlist(product._id)}
                      disabled={wishlistLoadingIds.has(product._id)}
                    >
                      {wishlistLoadingIds.has(product._id) ? (
                        <Spinner />
                      ) : (
                        <svg className="h-4 w-4" viewBox="0 0 512 512" aria-hidden="true">
                          <path
                            fill="currentColor"
                            d={
                              wishlistIds.has(product._id)
                                ? 'M241 87.1l15 20.7 15-20.7C296 52.5 336.2 32 378.9 32 452.4 32 512 91.6 512 165.1l0 2.6c0 112.2-139.9 242.5-212.9 298.2-12.4 9.4-27.6 14.1-43.1 14.1s-30.8-4.6-43.1-14.1C139.9 410.2 0 279.9 0 167.7l0-2.6C0 91.6 59.6 32 133.1 32 175.8 32 216 52.5 241 87.1z'
                                : 'M378.9 80c-27.3 0-53 13.1-69 35.2l-34.4 47.6c-4.5 6.2-11.7 9.9-19.4 9.9s-14.9-3.7-19.4-9.9l-34.4-47.6c-16-22.1-41.7-35.2-69-35.2-47 0-85.1 38.1-85.1 85.1 0 49.9 32 98.4 68.1 142.3 41.1 50 91.4 94 125.9 120.3 3.2 2.4 7.9 4.2 14 4.2s10.8-1.8 14-4.2c34.5-26.3 84.8-70.4 125.9-120.3 36.2-43.9 68.1-92.4 68.1-142.3 0-47-38.1-85.1-85.1-85.1zM271 87.1c25-34.6 65.2-55.1 107.9-55.1 73.5 0 133.1 59.6 133.1 133.1 0 68.6-42.9 128.9-79.1 172.8-44.1 53.6-97.3 100.1-133.8 127.9-12.3 9.4-27.5 14.1-43.1 14.1s-30.8-4.7-43.1-14.1C176.4 438 123.2 391.5 79.1 338 42.9 294.1 0 233.7 0 165.1 0 91.6 59.6 32 133.1 32 175.8 32 216 52.5 241 87.1l15 20.7 15-20.7z'
                            }
                          />
                        </svg>
                      )}
                    </button>

                    <button
                      className="bg-white h-8 w-8 rounded-full flex items-center justify-center text-gray-600 hover:text-primary-600 shadow-sm"
                      type="button"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 512 512" aria-hidden="true">
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
                      <svg className="h-4 w-4" viewBox="0 0 576 512" aria-hidden="true">
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
                      className="line-clamp-2 transition-colors duration-300 group-hover:text-[#15803d]"
                      href={`/products/${product._id}`}
                    >
                      {product.title}
                    </Link>
                  </h3>

                  <div className="flex items-center mb-2">
                    <Stars rating={product.ratingsAverage ?? 0} />
                    <span className="text-xs text-gray-500">
                      {product.ratingsAverage?.toFixed(1) ?? '0.0'} ({product.ratingsQuantity ?? 0})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-[#1e2939]">
                        {(product.priceAfterDiscount ?? product.price)} EGP
                      </span>
                      {typeof product.priceAfterDiscount === 'number' &&
                        product.priceAfterDiscount < product.price && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            {product.price} EGP
                          </span>
                        )}
                    </div>
                    <button
                      className="h-10 w-10 rounded-full flex items-center justify-center transition bg-[#16a34a] text-white hover:bg-[#15803d] disabled:opacity-70"
                      type="button"
                      onClick={() => addToCart(product._id)}
                      disabled={cartLoadingIds.has(product._id)}
                    >
                      {cartLoadingIds.has(product._id) ? (
                        <Spinner className="text-white" />
                      ) : (
                        <svg className="h-4 w-4" viewBox="0 0 448 512" aria-hidden="true">
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
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
