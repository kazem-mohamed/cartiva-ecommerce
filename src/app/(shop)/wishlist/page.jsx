'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Spinner } from '@/component/ui/Spinner'

const API_URL = 'https://ecommerce.routemisr.com/api/v1/wishlist'
const CART_API = 'https://ecommerce.routemisr.com/api/v2/cart'

export default function WishlistPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const token = session?.accessToken ?? ''
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionMessage, setActionMessage] = useState(null)
  const [removingId, setRemovingId] = useState(null)
  const [addingId, setAddingId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [addedToCart, setAddedToCart] = useState(new Set())

  useEffect(() => {
    if (!actionMessage) return
    const timer = window.setTimeout(() => setActionMessage(null), 2600)
    return () => window.clearTimeout(timer)
  }, [actionMessage])

  const loadWishlist = async (activeToken) => {
    try {
      setLoading(true)
      setError('')

      const res = await fetch(API_URL, {
        headers: { token: activeToken },
      })

      if (!res.ok) {
        throw new Error('Failed to load wishlist')
      }

      const json = await res.json()
      setItems(json.data ?? [])
    } catch {
      setError('Unable to load wishlist. Please check your token.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const loadCartIds = async (activeToken) => {
    try {
      const res = await fetch(CART_API, {
        headers: { token: activeToken },
      })
      if (!res.ok) return
      const json = await res.json().catch(() => null)
      const products = json?.data?.products ?? []
      const ids = products
        .map((item) => item?.product?._id ?? item?.product?.id ?? item?.productId)
        .filter(Boolean)
      setAddedToCart(new Set(ids))
    } catch {
      setAddedToCart(new Set())
    }
  }

  useEffect(() => {
    if (status === 'loading') return
    if (!token) {
      setLoading(false)
      router.replace('/login')
      return
    }

    loadWishlist(token)
    loadCartIds(token)
  }, [status, token, router])

  const handleRemove = async (productId) => {
    if (!token) {
      setError('Please login first')
      toast.error('Please login first')
      return
    }

    if (!productId) {
      setError('Invalid product id')
      toast.error('Invalid product id')
      return
    }

    try {
      setRemovingId(productId)
      setError('')
      const res = await fetch(`${API_URL}/${productId}`, {
        method: 'DELETE',
        headers: { token },
      })

      if (!res.ok) {
        throw new Error('Failed to remove')
      }

      setItems((prev) =>
        prev.filter((item) => (item._id ?? item.id ?? item.productId) !== productId)
      )
      setActionMessage({ type: 'error', text: 'Removed from wishlist.' })
      toast.error('Removed from wishlist')
    } catch {
      setError('Unable to remove item from wishlist')
      toast.error('Unable to remove item from wishlist')
    } finally {
      setRemovingId(null)
    }
  }

  const handleConfirmDelete = (productId, title) => {
    if (!productId) {
      setError('Invalid product id')
      toast.error('Invalid product id')
      return
    }
    setConfirmDelete({ id: productId, title: title ?? 'this item' })
  }

  const handleAddToCart = async (productId) => {
    if (!token) {
      setError('Please login first')
      toast.error('Please login first')
      return
    }

    if (!productId) {
      setError('Invalid product id')
      toast.error('Invalid product id')
      return
    }

    try {
      setAddingId(productId)
      setError('')
      const res = await fetch(CART_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      })

      if (!res.ok) {
        throw new Error('Failed to add to cart')
      }

      setAddedToCart((prev) => {
        const next = new Set(prev)
        next.add(productId)
        return next
      })
      toast.success('Added to cart')
    } catch {
      setError('Unable to add item to cart')
      toast.error('Unable to add item to cart')
    } finally {
      setAddingId(null)
    }
  }

  if (loading) {
    return (
      <section className="py-10">
        <div className="container mx-auto px-4">
          <p className="text-gray-500">Loading wishlist...</p>
        </div>
      </section>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-sm mx-auto text-center">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <svg className="text-3xl text-gray-400 h-8 w-8" role="img" viewBox="0 0 512 512" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M378.9 80c-27.3 0-53 13.1-69 35.2l-34.4 47.6c-4.5 6.2-11.7 9.9-19.4 9.9s-14.9-3.7-19.4-9.9l-34.4-47.6c-16-22.1-41.7-35.2-69-35.2-47 0-85.1 38.1-85.1 85.1 0 49.9 32 98.4 68.1 142.3 41.1 50 91.4 94 125.9 120.3 3.2 2.4 7.9 4.2 14 4.2s10.8-1.8 14-4.2c34.5-26.3 84.8-70.4 125.9-120.3 36.2-43.9 68.1-92.4 68.1-142.3 0-47-38.1-85.1-85.1-85.1zM271 87.1c25-34.6 65.2-55.1 107.9-55.1 73.5 0 133.1 59.6 133.1 133.1 0 68.6-42.9 128.9-79.1 172.8-44.1 53.6-97.3 100.1-133.8 127.9-12.3 9.4-27.5 14.1-43.1 14.1s-30.8-4.7-43.1-14.1C176.4 438 123.2 391.5 79.1 338 42.9 294.1 0 233.7 0 165.1 0 91.6 59.6 32 133.1 32 175.8 32 216 52.5 241 87.1l15 20.7 15-20.7z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 text-sm mb-6">Browse products and save your favorites here.</p>
            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
            <div className="flex flex-col gap-3">
              <Link
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors cursor-pointer"
                href="/products"
              >
                Browse Products
                <svg className="text-sm h-4 w-4" role="img" viewBox="0 0 512 512" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-105.4 105.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link className="hover:text-green-600 transition-colors cursor-pointer" href="/">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Wishlist</span>
          </nav>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                <svg className="text-xl text-red-500 h-5 w-5" role="img" viewBox="0 0 512 512" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M241 87.1l15 20.7 15-20.7C296 52.5 336.2 32 378.9 32 452.4 32 512 91.6 512 165.1l0 2.6c0 112.2-139.9 242.5-212.9 298.2-12.4 9.4-27.6 14.1-43.1 14.1s-30.8-4.6-43.1-14.1C139.9 410.2 0 279.9 0 167.7l0-2.6C0 91.6 59.6 32 133.1 32 175.8 32 216 52.5 241 87.1z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
                <p className="text-gray-500 text-sm">{items.length} item{items.length === 1 ? '' : 's'} saved</p>
              </div>
            </div>
          </div>
          {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
          {actionMessage && (
            <div
              className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium ${
                actionMessage.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-red-200 bg-red-50 text-red-600'
              }`}
            >
              {actionMessage.text}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-500">
            <div className="col-span-6">Product</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-2 text-center">Actions</div>
          </div>

          <div className="divide-y divide-gray-100">
            {items.map((item) => {
              const itemId = item._id ?? item.id ?? item.productId
              const price = item.price ?? 0
              const discounted = item.priceAfterDiscount
              const hasDiscount = discounted && discounted < price
              const categoryName = item.category?.name ?? item.categoryName ?? 'Category'

              return (
                <div key={itemId} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:px-6 md:py-5 items-center hover:bg-gray-50/50 transition-colors">
                  <div className="md:col-span-6 flex items-center gap-4">
                    <Link className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 cursor-pointer" href={`/products/${itemId}`}>
                      <Image
                        alt={item.title}
                        className="w-full h-full object-contain p-2"
                        src={item.imageCover}
                        width={160}
                        height={160}
                      />
                    </Link>
                    <div className="min-w-0">
                      <Link className="font-medium text-gray-900 hover:text-green-600 transition-colors line-clamp-2 cursor-pointer" href={`/products/${itemId}`}>
                        {item.title}
                      </Link>
                      <p className="text-sm text-gray-400 mt-1">{categoryName ?? 'Category'}</p>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex md:justify-center items-center gap-2">
                    <span className="md:hidden text-sm text-gray-500">Price:</span>
                    <div className="text-right md:text-center">
                      <div className="font-semibold text-gray-900">{hasDiscount ? discounted : price} EGP</div>
                      {hasDiscount && <div className="text-sm text-gray-400 line-through">{price} EGP</div>}
                    </div>
                  </div>

                  <div className="md:col-span-2 flex md:justify-center">
                    <span className="md:hidden text-sm text-gray-500 mr-2">Status:</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      In Stock
                    </span>
                  </div>

                  <div className="md:col-span-2 flex items-center gap-2 md:justify-center">
                    {addedToCart.has(itemId) ? (
                      <Link
                        className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                        href="/cart"
                      >
                        <svg className="svg-inline--fa fa-check text-xs text-green-600 h-3 w-3" role="img" viewBox="0 0 448 512" aria-hidden="true">
                          <path
                            fill="currentColor"
                            d="M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4 13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5 101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z"
                          />
                        </svg>
                        <span className="md:hidden lg:inline">View Cart</span>
                      </Link>
                    ) : (
                      <button
                        className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                        type="button"
                        onClick={() => handleAddToCart(itemId)}
                        disabled={addingId === itemId}
                      >
                        {addingId === itemId ? (
                          <Spinner className="text-white" />
                        ) : (
                          <svg className="text-xs h-3 w-3" role="img" viewBox="0 0 640 512" aria-hidden="true">
                            <path
                              fill="currentColor"
                              d="M24-16C10.7-16 0-5.3 0 8S10.7 32 24 32l45.3 0c3.9 0 7.2 2.8 7.9 6.6l52.1 286.3c6.2 34.2 36 59.1 70.8 59.1L456 384c13.3 0 24-10.7 24-24s-10.7-24-24-24l-255.9 0c-11.6 0-21.5-8.3-23.6-19.7l-5.1-28.3 303.6 0c30.8 0 57.2-21.9 62.9-52.2L568.9 69.9C572.6 50.2 557.5 32 537.4 32l-412.7 0-.4-2c-4.8-26.6-28-46-55.1-46L24-16zM208 512a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm224 0a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"
                            />
                          </svg>
                        )}
                        <span className="md:hidden lg:inline">
                          {addingId === itemId ? 'Adding...' : 'Add to Cart'}
                        </span>
                      </button>
                    )}
                    <button
                      className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all disabled:opacity-50 cursor-pointer"
                      title="Remove"
                      type="button"
                      onClick={() => handleConfirmDelete(itemId, item.title)}
                      disabled={removingId === itemId}
                    >
                      {removingId === itemId ? (
                        <Spinner />
                      ) : (
                        <svg className="text-sm h-4 w-4" role="img" viewBox="0 0 448 512" aria-hidden="true">
                          <path
                            fill="currentColor"
                            d="M136.7 5.9L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-8.7-26.1C306.9-7.2 294.7-16 280.9-16L167.1-16c-13.8 0-26 8.8-30.4 21.9zM416 144L32 144 53.1 467.1C54.7 492.4 75.7 512 101 512L347 512c25.3 0 46.3-19.6 47.9-44.9L416 144z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Link className="text-gray-500 hover:text-green-600 text-sm font-medium transition-colors cursor-pointer" href="/products">
            &lt;- Continue Shopping
          </Link>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                <svg className="h-5 w-5" role="img" viewBox="0 0 448 512" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M136.7 5.9L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-8.7-26.1C306.9-7.2 294.7-16 280.9-16L167.1-16c-13.8 0-26 8.8-30.4 21.9zM416 144L32 144 53.1 467.1C54.7 492.4 75.7 512 101 512L347 512c25.3 0 46.3-19.6 47.9-44.9L416 144z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Remove from wishlist?</h3>
                <p className="text-sm text-gray-500">This will remove {confirmDelete.title}.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                type="button"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                type="button"
                onClick={() => {
                  const id = confirmDelete.id
                  setConfirmDelete(null)
                  handleRemove(id)
                }}
                disabled={removingId === confirmDelete.id}
              >
                {removingId === confirmDelete.id ? 'Removing...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
