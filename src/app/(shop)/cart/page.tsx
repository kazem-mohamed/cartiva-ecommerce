'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Spinner } from '@/component/ui/Spinner'

const CART_API = 'https://ecommerce.routemisr.com/api/v2/cart'
const COUPON_API = 'https://ecommerce.routemisr.com/api/v2/cart/applyCoupon'

type CartProduct = {
  _id?: string
  productId?: string
  count?: number
  price?: number
  product?: {
    _id?: string
    id?: string
    title?: string
    imageCover?: string
    price?: number
    category?: {
      name?: string
    }
    categoryName?: string
  }
}

type Cart = {
  _id?: string
  id?: string
  products?: CartProduct[]
  totalCartPrice?: number
  totalAfterDiscount?: number
}

type ConfirmRemove = {
  id: string
  cartItemId: string | null
  title: string
}

export default function CartPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const token = session?.accessToken ?? ''

  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)
  const [coupon, setCoupon] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [showCoupon, setShowCoupon] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState<ConfirmRemove | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)

  const items = cart?.products ?? []
  const totalItems = useMemo(() => items.reduce((sum, item) => sum + (item.count ?? 0), 0), [items])
  const subtotal = cart?.totalCartPrice ?? 0
  const totalAfterDiscount = cart?.totalAfterDiscount ?? subtotal
  const discount = subtotal > totalAfterDiscount ? subtotal - totalAfterDiscount : 0
  const shippingFee = subtotal > 0 ? 50 : 0
  const totalWithShipping = totalAfterDiscount + shippingFee
  const freeShippingThreshold = 500
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - totalAfterDiscount)
  const shippingProgress = Math.min(100, (totalAfterDiscount / freeShippingThreshold) * 100)

  const loadCart = async (activeToken: string, opts: { silent?: boolean } = {}) => {
    const silent = opts?.silent === true
    try {
      if (!silent) {
        setLoading(true)
      }
      setError('')
      const res = await fetch(CART_API, {
        headers: {
          token: activeToken,
          Authorization: `Bearer ${activeToken}`,
          'Cache-Control': 'no-store',
        },
        cache: 'no-store',
      })

      if (!res.ok) {
        throw new Error('Failed to load cart')
      }

      const json = await res.json().catch(() => null)
      setCart(json?.data ?? null)
    } catch {
      setError('Unable to load your cart. Please try again.')
      setCart(null)
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    if (status === 'loading') return
    if (!token || status !== 'authenticated') {
      setLoading(false)
      router.replace('/login')
      return
    }

    loadCart(token)
  }, [status, token, router])

  const handleUpdateQuantity = async (productId: string, nextCount: number) => {
    if (!token) {
      toast.error('Please login first')
      return
    }
    if (!productId || nextCount < 1) return

    try {
      setUpdatingId(productId)
      const res = await fetch(`${CART_API}/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          token,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ count: nextCount }),
      })

      if (!res.ok) {
        throw new Error('Failed to update cart')
      }

      const json = await res.json().catch(() => null)
      if (json?.data) {
        setCart(json.data)
      } else {
        await loadCart(token)
      }
      toast.success('Cart updated')
    } catch {
      toast.error('Unable to update quantity')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleRemoveItem = async (productId: string, cartItemId?: string | null) => {
    if (!token) {
      toast.error('Please login first')
      return
    }
    if (!productId) return

    try {
      const primaryId = cartItemId ?? productId
      setRemovingId(primaryId)
      const res = await fetch(`${CART_API}/${primaryId}`, {
        method: 'DELETE',
        headers: {
          token,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, cartItemId }),
      })

      if (!res.ok) {
        throw new Error('Failed to remove item')
      }

      const json = await res.json().catch(() => null)
      const products: CartProduct[] = json?.data?.products ?? []
      const stillThere = products.some((item) => {
        const id = item?.product?._id ?? item?.product?.id ?? item?.productId
        return id === productId
      })

      if (json?.data && !stillThere) {
        setCart(json.data)
      } else if (cartItemId && cartItemId !== productId) {
        const fallbackRes = await fetch(`${CART_API}/${productId}`, {
          method: 'DELETE',
          headers: {
            token,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId, cartItemId }),
        })
        const fallbackJson = await fallbackRes.json().catch(() => null)
        if (fallbackJson?.data) {
          setCart(fallbackJson.data)
        }
      }

      setCart((prev) => {
        if (!prev || !prev.products) return prev
        const nextProducts = prev.products.filter((item) => {
          const id = item?.product?._id ?? item?.product?.id ?? item?.productId
          const rowId = item?._id
          return id !== productId && rowId !== cartItemId
        })
        return { ...prev, products: nextProducts }
      })
      await loadCart(token, { silent: true })
      toast.error('Removed from cart')
    } catch {
      toast.error('Unable to remove item')
    } finally {
      setRemovingId(null)
    }
  }

  const handleClearCart = async () => {
    if (!token) {
      toast.error('Please login first')
      return
    }

    try {
      setClearing(true)
      const res = await fetch(CART_API, {
        method: 'DELETE',
        headers: {
          token,
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        throw new Error('Failed to clear cart')
      }

      setCart({ products: [], totalCartPrice: 0 })
      toast.error('Cart cleared')
    } catch {
      toast.error('Unable to clear cart')
    } finally {
      setClearing(false)
    }
  }

  const handleConfirmRemove = (productId: string, cartItemId?: string | null, title?: string) => {
    if (!productId) {
      toast.error('Invalid product')
      return
    }
    setConfirmRemove({
      id: productId,
      cartItemId: cartItemId ?? null,
      title: title ?? 'this item',
    })
  }

  const handleApplyCoupon = async () => {
    if (!token) {
      toast.error('Please login first')
      return
    }

    if (!coupon.trim()) {
      toast.error('Enter a coupon code')
      return
    }

    try {
      setCouponLoading(true)
      const res = await fetch(COUPON_API, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          token,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ couponName: coupon.trim() }),
      })

      if (!res.ok) {
        throw new Error('Failed to apply coupon')
      }

      const json = await res.json().catch(() => null)
      if (json?.data) {
        setCart(json.data)
      } else {
        await loadCart(token)
      }
      toast.success('Coupon applied')
    } catch {
      toast.error('Unable to apply coupon')
    } finally {
      setCouponLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-10">
        <div className="container mx-auto px-4">
          <p className="text-gray-500">Loading your cart...</p>
        </div>
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mx-auto">
              <svg className="h-12 w-12 text-gray-300" role="img" viewBox="0 0 640 512" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M560.3 237.2c10.4 11.8 28.3 14.4 41.8 5.5 14.7-9.8 18.7-29.7 8.9-44.4l-48-72c-2.8-4.2-6.6-7.7-11.1-10.2L351.4 4.7c-19.3-10.7-42.8-10.7-62.2 0L88.8 116c-5.4 3-9.7 7.4-12.6 12.8L27.7 218.7c-12.6 23.4-3.8 52.5 19.6 65.1l33 17.7 0 53.3c0 23 12.4 44.3 32.4 55.7l176 99.7c19.6 11.1 43.5 11.1 63.1 0l176-99.7c20.1-11.4 32.4-32.6 32.4-55.7l0-117.5zm-240-9.8L170.2 144 320.3 60.6 470.4 144 320.3 227.4zm-41.5 50.2l-21.3 46.2-165.8-88.8 25.4-47.2 161.7 89.8z"
                />
              </svg>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-gray-100 rounded-full blur-md" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Looks like you haven't added anything to your cart yet.
            <br />
            Start exploring our products!
          </p>
          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
          <Link
            className="inline-flex items-center gap-2 bg-linear-to-r from-primary-600 to-primary-700 text-white py-3.5 px-8 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-600/20 active:scale-[0.98]"
            href="/"
          >
            Start Shopping
            <svg className="h-4 w-4" role="img" viewBox="0 0 512 512" aria-hidden="true">
              <path
                fill="currentColor"
                d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-105.4 105.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
              />
            </svg>
          </Link>
          <div className="mt-12 pt-8 border-t border-gray-100">
            <p className="text-sm text-gray-400 mb-4">Popular Categories</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                className="px-4 py-2 bg-gray-50 hover:bg-primary-50 hover:text-primary-600 text-gray-600 rounded-full text-sm font-medium transition-colors"
                href="/categories"
              >
                Electronics
              </Link>
              <Link
                className="px-4 py-2 bg-gray-50 hover:bg-primary-50 hover:text-primary-600 text-gray-600 rounded-full text-sm font-medium transition-colors"
                href="/categories"
              >
                Fashion
              </Link>
              <Link
                className="px-4 py-2 bg-gray-50 hover:bg-primary-50 hover:text-primary-600 text-gray-600 rounded-full text-sm font-medium transition-colors"
                href="/categories"
              >
                Home
              </Link>
              <Link
                className="px-4 py-2 bg-gray-50 hover:bg-primary-50 hover:text-primary-600 text-gray-600 rounded-full text-sm font-medium transition-colors"
                href="/categories"
              >
                Beauty
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link className="hover:text-primary-600 transition" href="/">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Shopping Cart</span>
          </nav>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="bg-gradient-to-r from-primary-600 to-primary-700 text-white w-12 h-12 rounded-xl flex items-center justify-center">
                  <svg className="h-5 w-5" role="img" viewBox="0 0 640 512" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M24-16C10.7-16 0-5.3 0 8S10.7 32 24 32l45.3 0c3.9 0 7.2 2.8 7.9 6.6l52.1 286.3c6.2 34.2 36 59.1 70.8 59.1L456 384c13.3 0 24-10.7 24-24s-10.7-24-24-24l-255.9 0c-11.6 0-21.5-8.3-23.6-19.7l-5.1-28.3 303.6 0c30.8 0 57.2-21.9 62.9-52.2L568.9 69.9C572.6 50.2 557.5 32 537.4 32l-412.7 0-.4-2c-4.8-26.6-28-46-55.1-46L24-16zM208 512a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm224 0a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"
                    />
                  </svg>
                </span>
                Shopping Cart
              </h1>
              <p className="text-gray-500 mt-2">
                You have <span className="font-semibold text-primary-600">{totalItems} item</span>
                {totalItems === 1 ? '' : 's'} in your cart
              </p>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => {
                const product = item.product ?? {}
                const productId = String(product._id ?? product.id ?? item.productId ?? '')
                const count = item.count ?? 1
                const unitPrice = item.price ?? product.price ?? 0
                const total = unitPrice * count
                const category = product.category?.name ?? product.categoryName ?? 'Category'
                const sku = String(productId ?? '').slice(-6).toUpperCase()

                return (
                  <div
                    key={productId}
                    className="relative bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300"
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex gap-4 sm:gap-6">
                        <Link className="relative shrink-0 group" href={`/products/${productId}`}>
                          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl bg-gradient-to-br from-gray-50 via-white to-gray-100 p-3 border border-gray-100 overflow-hidden">
                            {product.imageCover ? (
                              <Image
                                alt={product.title ?? 'Product'}
                                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                                src={product.imageCover}
                                width={160}
                                height={160}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100" />
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <svg className="h-3 w-3" role="img" viewBox="0 0 448 512" aria-hidden="true">
                              <path
                                fill="currentColor"
                                d="M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4 13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5 101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z"
                              />
                            </svg>
                            In Stock
                          </div>
                        </Link>

                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="mb-3">
                            <Link className="group/title" href={`/products/${productId}`}>
                              <h3 className="font-semibold text-gray-900 group-hover/title:text-primary-600 transition-colors leading-relaxed text-base sm:text-lg">
                                {product.title ?? 'Product'}
                              </h3>
                            </Link>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="inline-block px-2.5 py-1 bg-gradient-to-r from-primary-50 to-emerald-50 text-primary-700 text-xs font-medium rounded-full">
                                {category}
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">SKU: {sku || 'N/A'}</span>
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="flex items-baseline gap-2">
                              <span className="text-primary-600 font-bold text-lg">{unitPrice} EGP</span>
                              <span className="text-xs text-gray-400">per unit</span>
                            </div>
                          </div>

                          <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center">
                              <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-200">
                                <button
                                  className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all"
                                  aria-label="Decrease quantity"
                                  type="button"
                                  disabled={count <= 1 || updatingId === productId}
                                  onClick={() => handleUpdateQuantity(productId, count - 1)}
                                >
                                  {updatingId === productId ? (
                                    <Spinner />
                                  ) : (
                                    <svg className="h-3 w-3" role="img" viewBox="0 0 448 512" aria-hidden="true">
                                      <path
                                        fill="currentColor"
                                        d="M0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32z"
                                      />
                                    </svg>
                                  )}
                                </button>
                                <span className="w-12 text-center font-bold text-gray-900">{count}</span>
                                <button
                                  className="h-8 w-8 rounded-lg bg-primary-600 shadow-sm shadow-primary-600/30 flex items-center justify-center text-white hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                  aria-label="Increase quantity"
                                  type="button"
                                  disabled={updatingId === productId}
                                  onClick={() => handleUpdateQuantity(productId, count + 1)}
                                >
                                  {updatingId === productId ? (
                                    <Spinner className="text-white" />
                                  ) : (
                                    <svg className="h-3 w-3" role="img" viewBox="0 0 448 512" aria-hidden="true">
                                      <path
                                        fill="currentColor"
                                        d="M256 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 160-160 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l160 0 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160 160 0c17.7 0-32 14.3-32 32s14.3 32 32 32l160 0 0-160 160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-160 0 0-160z"
                                      />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-xs text-gray-400 mb-0.5">Total</p>
                                <p className="text-xl font-bold text-gray-900">
                                  {total} <span className="text-sm font-medium text-gray-400">EGP</span>
                                </p>
                              </div>
                              <button
                                className="h-10 w-10 rounded-xl border border-red-200 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 flex items-center justify-center disabled:opacity-40 transition-all duration-200"
                                title="Remove item"
                                aria-label="Remove from cart"
                                type="button"
                                onClick={() => handleConfirmRemove(productId, item?._id, product.title)}
                                disabled={removingId === (item?._id ?? productId)}
                              >
                                {removingId === (item?._id ?? productId) ? (
                                  <Spinner />
                                ) : (
                                  <svg className="h-4 w-4" role="img" viewBox="0 0 448 512" aria-hidden="true">
                                    <path
                                      fill="currentColor"
                                      d="M136.7 5.9L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-8.7-26.1C306.9-7.2 294.7-16 280.9-16L167.1-16c-13.8 0-26 8.8-30.4 21.9zM416 144L32 144 53.1 467.1C54.7 492.4 75.7 512 101 512L347 512c25.3 0 46.3-19.6 47.9-44.9L416 144z"
                                    />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
              <Link className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-2" href="/">
                <span>{'<-'}</span> Continue Shopping
              </Link>
              <button
                className="group flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                type="button"
                onClick={() => setConfirmClear(true)}
                disabled={clearing}
              >
                <svg className="h-3 w-3" role="img" viewBox="0 0 448 512" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M136.7 5.9L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-8.7-26.1C306.9-7.2 294.7-16 280.9-16L167.1-16c-13.8 0-26 8.8-30.4 21.9zM416 144L32 144 53.1 467.1C54.7 492.4 75.7 512 101 512L347 512c25.3 0 46.3-19.6 47.9-44.9L416 144z"
                  />
                </svg>
                <span>{clearing ? 'Clearing...' : 'Clear all items'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden sticky top-24 shadow-sm">
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <svg className="h-5 w-5" role="img" viewBox="0 0 448 512" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M160 80c0-35.3 28.7-64 64-64s64 28.7 64 64l0 48-128 0 0-48zm-48 48l-64 0c-26.5 0-48 21.5-48 48L0 384c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-208c0-26.5-21.5-48-48-48l-64 0 0-48c0-61.9-50.1-112-112-112S112 18.1 112 80l0 48zm24 48a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm152 24a24 24 0 1 1 48 0 24 24 0 1 1 -48 0z"
                    />
                  </svg>
                  Order Summary
                </h2>
                <p className="text-primary-100 text-sm mt-1">{totalItems} item in your cart</p>
              </div>

              <div className="p-6 space-y-5">
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="h-4 w-4 text-orange-500" role="img" viewBox="0 0 576 512" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M0 96C0 60.7 28.7 32 64 32l288 0c35.3 0 64 28.7 64 64l0 32 50.7 0c17 0 33.3 6.7 45.3 18.7L557.3 192c12 12 18.7 28.3 18.7 45.3L576 384c0 35.3-28.7 64-64 64l-3.3 0c-10.4 36.9-44.4 64-84.7 64s-74.2-27.1-84.7-64l-102.6 0c-10.4 36.9-44.4 64-84.7 64s-74.2-27.1-84.7-64L64 448c-35.3 0-64-28.7-64-64L0 96zM512 288l0-50.7-45.3-45.3-50.7 0 0 96 96 0zM192 424a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zm232 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">
                      {remainingForFreeShipping > 0
                        ? `Add ${remainingForFreeShipping} EGP for free shipping`
                        : 'Free shipping unlocked'}
                    </span>
                  </div>
                  <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${shippingProgress}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900">{subtotal} EGP</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-medium text-gray-900">{shippingFee} EGP</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Discount</span>
                      <span className="font-medium text-green-600">-{discount} EGP</span>
                    </div>
                  )}
                  <div className="border-t border-dashed border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-gray-900 font-semibold">Total</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-gray-900">{totalWithShipping}</span>
                        <span className="text-sm text-gray-500 ml-1">EGP</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/50 transition-all"
                  type="button"
                  onClick={() => setShowCoupon((prev) => !prev)}
                >
                  <svg className="h-4 w-4" role="img" viewBox="0 0 512 512" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M32.5 96l0 149.5c0 17 6.7 33.3 18.7 45.3l192 192c25 25 65.5 25 90.5 0L483.2 333.3c25-25 25-65.5 0-90.5l-192-192C279.2 38.7 263 32 246 32L96.5 32c-35.3 0-64 28.7-64 64zm112 16a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"
                    />
                  </svg>
                  <span className="text-sm font-medium">Apply Promo Code</span>
                </button>

                {showCoupon && (
                  <div className="flex gap-2">
                    <input
                      className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                      placeholder="Enter coupon"
                      value={coupon}
                      onChange={(event) => setCoupon(event.target.value)}
                    />
                    <button
                      className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                    >
                      {couponLoading ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                )}

                <Link
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary-600/20 active:scale-[0.98]"
                  href="/checkout"
                >
                  <svg className="h-4 w-4" role="img" viewBox="0 0 384 512" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M128 96l0 64 128 0 0-64c0-35.3-28.7-64-64-64s-64 28.7-64 64zM64 160l0-64C64 25.3 121.3-32 192-32S320 25.3 320 96l0 64c35.3 0 64 28.7 64 64l0 224c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 224c0-35.3 28.7-64 64-64z"
                    />
                  </svg>
                  <span>Secure Checkout</span>
                </Link>

                <div className="flex items-center justify-center gap-4 py-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <svg className="h-3 w-3 text-green-500" role="img" viewBox="0 0 512 512" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M256 0c4.6 0 9.2 1 13.4 2.9L457.8 82.8c22 9.3 38.4 31 38.3 57.2-.5 99.2-41.3 280.7-213.6 363.2-16.7 8-36.1 8-52.8 0-172.4-82.5-213.1-264-213.6-363.2-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.9 1 251.4 0 256 0zm0 66.8l0 378.1c138-66.8 175.1-214.8 176-303.4l-176-74.6 0 0z"
                      />
                    </svg>
                    <span>Secure Payment</span>
                  </div>
                  <div className="w-px h-4 bg-gray-200" />
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <svg className="h-3 w-3 text-blue-500" role="img" viewBox="0 0 576 512" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M0 96C0 60.7 28.7 32 64 32l288 0c35.3 0 64 28.7 64 64l0 32 50.7 0c17 0 33.3 6.7 45.3 18.7L557.3 192c12 12 18.7 28.3 18.7 45.3L576 384c0 35.3-28.7 64-64 64l-3.3 0c-10.4 36.9-44.4 64-84.7 64s-74.2-27.1-84.7-64l-102.6 0c-10.4 36.9-44.4 64-84.7 64s-74.2-27.1-84.7-64L64 448c-35.3 0-64-28.7-64-64L0 96zM512 288l0-50.7-45.3-45.3-50.7 0 0 96 96 0zM192 424a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zm232 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80z"
                      />
                    </svg>
                    <span>Fast Delivery</span>
                  </div>
                </div>

                <Link className="block text-center text-primary-600 hover:text-primary-700 text-sm font-medium py-2" href="/">
                  {'<-'} Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {confirmRemove && (
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
                <h3 className="text-base font-semibold text-gray-900">Remove item?</h3>
                <p className="text-sm text-gray-500">This will remove {confirmRemove.title}.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                type="button"
                onClick={() => setConfirmRemove(null)}
              >
                Cancel
              </button>
              <button
                className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                type="button"
                onClick={() => {
                  const id = confirmRemove.id
                  const cartItemId = confirmRemove.cartItemId
                  setConfirmRemove(null)
                  handleRemoveItem(id, cartItemId)
                }}
                disabled={removingId === (confirmRemove.cartItemId ?? confirmRemove.id)}
              >
                {removingId === (confirmRemove.cartItemId ?? confirmRemove.id) ? 'Removing...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmClear && (
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
                <h3 className="text-base font-semibold text-gray-900">Clear cart?</h3>
                <p className="text-sm text-gray-500">This will remove all items from your cart.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                type="button"
                onClick={() => setConfirmClear(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                type="button"
                onClick={() => {
                  setConfirmClear(false)
                  handleClearCart()
                }}
                disabled={clearing}
              >
                {clearing ? 'Clearing...' : 'Clear All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
