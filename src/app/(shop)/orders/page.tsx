'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Spinner } from '@/component/ui/Spinner'

const USER_ORDERS_API = (userId: string) =>
  `https://ecommerce.routemisr.com/api/v1/orders/user/${userId}`

type OrderItem = {
  count?: number
  price?: number
  product?: {
    _id?: string
    title?: string
    imageCover?: string
  }
}

type Order = {
  _id?: string
  id?: string
  createdAt?: string
  totalOrderPrice?: number
  isPaid?: boolean
  isDelivered?: boolean
  paymentMethodType?: string
  status?: string
  cartItems?: OrderItem[]
  shippingAddress?: {
    city?: string
    details?: string
    phone?: string
  }
}

const getErrorMessage = async (res: Response, fallback: string) => {
  const data = await res.json().catch(() => null)
  if (!data) return fallback
  return data?.message ?? data?.error ?? fallback
}

const formatDate = (value?: string) => {
  if (!value) return 'Unknown date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown date'
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const getStatusLabel = (order: Order) => {
  if (order.status) return order.status
  if (order.isDelivered) return 'Delivered'
  if (order.isPaid) return 'Paid'
  return 'Processing'
}

const getStatusStyle = (status: string) => {
  const normalized = status.toLowerCase()
  if (normalized.includes('deliver')) return 'bg-green-100 text-green-700'
  if (normalized.includes('paid')) return 'bg-blue-100 text-blue-700'
  if (normalized.includes('cancel')) return 'bg-red-100 text-red-700'
  return 'bg-amber-100 text-amber-700'
}

export default function OrdersPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const token = session?.accessToken ?? ''
  const userId = session?.user?.id ?? ''

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (status === 'loading') return

    if (!token || status !== 'authenticated') {
      setLoading(false)
      router.replace('/login')
      return
    }

    if (!userId) {
      setLoading(false)
      setError('Unable to identify your account.')
      return
    }

    const loadOrders = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await fetch(USER_ORDERS_API(userId), {
          headers: {
            token,
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-store',
          },
          cache: 'no-store',
        })

        if (!res.ok) {
          const message = await getErrorMessage(res, 'Failed to load orders')
          throw new Error(message)
        }

        const json = await res.json().catch(() => null)
        const raw = json?.data ?? json?.orders ?? json ?? []
        const list = Array.isArray(raw) ? raw : []
        setOrders(list)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load orders'
        setError(message)
        toast.error(message)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [status, token, userId, router])

  const totalOrders = orders.length

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-gray-500">Loading your orders...</p>
      </div>
    )
  }

  if (!totalOrders) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No orders yet</h2>
          <p className="text-gray-500 mb-6">Once you place an order, it will appear here.</p>
          <Link
            className="inline-flex items-center gap-2 bg-linear-to-r from-primary-600 to-primary-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all"
            href="/"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link className="hover:text-primary-600 transition" href="/">
            Home
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium">My Orders</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <svg className="h-6 w-6 text-white" role="img" viewBox="0 0 448 512" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M369.4 128l-34.3-48-222.1 0-34.3 48 290.7 0zM0 148.5c0-13.3 4.2-26.3 11.9-37.2L60.9 42.8C72.9 26 92.3 16 112.9 16l222.1 0c20.7 0 40.1 10 52.1 26.8l48.9 68.5c7.8 10.9 11.9 23.9 11.9 37.2L448 416c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 148.5z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-500 text-sm mt-0.5">Track and manage your {totalOrders} orders</p>
            </div>
          </div>
          <Link
            className="self-start sm:self-auto text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-primary-50 transition-all text-sm"
            href="/"
          >
            <svg className="h-4 w-4" role="img" viewBox="0 0 448 512" aria-hidden="true">
              <path
                fill="currentColor"
                d="M160 80c0-35.3 28.7-64 64-64s64 28.7 64 64l0 48-128 0 0-48zm-48 48l-64 0c-26.5 0-48 21.5-48 48L0 384c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-208c0-26.5-21.5-48-48-48l-64 0 0-48c0-61.9-50.1-112-112-112S112 18.1 112 80l0 48zm24 48a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm152 24a24 24 0 1 1 48 0 24 24 0 1 1 -48 0z"
              />
            </svg>
            Continue Shopping
          </Link>
        </div>
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <div className="space-y-4">
        {orders.map((order, index) => {
          const orderId = order._id ?? order.id ?? `order-${index}`
          const statusLabel = getStatusLabel(order)
          const statusStyle = getStatusStyle(statusLabel)
          const items = order.cartItems ?? []
          const itemsCount = items.reduce((sum, item) => sum + (item.count ?? 0), 0) || items.length
          const totalPrice = order.totalOrderPrice ?? 0
          const address = order.shippingAddress
          const paymentMethod = order.paymentMethodType ?? 'cash'
          const isExpanded = expandedIds.has(orderId)
          const firstItem = items[0]?.product

          return (
            <div
              key={orderId}
              className="bg-white rounded-2xl border transition-all duration-300 overflow-hidden border-gray-100 shadow-sm"
            >
              <div className="p-5 sm:p-6">
                <div className="flex gap-5">
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-2.5 overflow-hidden">
                      {firstItem?.imageCover ? (
                        <Image
                          alt={firstItem.title ?? 'Order item'}
                          className="w-full h-full object-contain"
                          src={firstItem.imageCover}
                          width={120}
                          height={120}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100" />
                      )}
                    </div>
                    {itemsCount > 1 && (
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                        +{itemsCount - 1}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg mb-2 ${statusStyle}`}>
                          <span className="text-xs font-semibold">{statusLabel}</span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                          <span className="text-xs text-gray-400">#</span>
                          {String(orderId).slice(-6).toUpperCase()}
                        </h3>
                      </div>
                      <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100">
                        <svg className="h-4 w-4 text-gray-600" role="img" viewBox="0 0 512 512" aria-hidden="true">
                          <path
                            fill="currentColor"
                            d="M64 64C28.7 64 0 92.7 0 128L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64L64 64zm192 96a96 96 0 1 1 0 192 96 96 0 1 1 0-192z"
                          />
                        </svg>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1.5">
                        <svg className="h-3 w-3 text-gray-400" role="img" viewBox="0 0 448 512" aria-hidden="true">
                          <path
                            fill="currentColor"
                            d="M128 0c17.7 0 32 14.3 32 32l0 32 128 0 0-32c0-17.7 14.3-32 32-32s32 14.3 32 32l0 32 32 0c35.3 0 64 28.7 64 64l0 288c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 128C0 92.7 28.7 64 64 64l32 0 0-32c0-17.7 14.3-32 32-32z"
                          />
                        </svg>
                        {formatDate(order.createdAt)}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="flex items-center gap-1.5">
                        <svg className="h-3 w-3 text-gray-400" role="img" viewBox="0 0 448 512" aria-hidden="true">
                          <path
                            fill="currentColor"
                            d="M369.4 128l-34.3-48-222.1 0-34.3 48 290.7 0zM0 148.5c0-13.3 4.2-26.3 11.9-37.2L60.9 42.8C72.9 26 92.3 16 112.9 16l222.1 0c20.7 0 40.1 10 52.1 26.8l48.9 68.5c7.8 10.9 11.9 23.9 11.9 37.2L448 416c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 148.5z"
                          />
                        </svg>
                        {itemsCount} item{itemsCount === 1 ? '' : 's'}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="flex items-center gap-1.5">
                        <svg className="h-3 w-3 text-gray-400" role="img" viewBox="0 0 384 512" aria-hidden="true">
                          <path
                            fill="currentColor"
                            d="M0 188.6C0 84.4 86 0 192 0S384 84.4 384 188.6c0 119.3-120.2 262.3-170.4 316.8-11.8 12.8-31.5 12.8-43.3 0-50.2-54.5-170.4-197.5-170.4-316.8zM192 256a64 64 0 1 0 0-128 64 64 0 1 0 0 128z"
                          />
                        </svg>
                        {address?.city ?? 'Address pending'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">{totalPrice}</span>
                        <span className="text-sm font-medium text-gray-400 ml-1">EGP</span>
                      </div>
                      <button
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          isExpanded ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        type="button"
                        onClick={() => toggleExpanded(orderId)}
                      >
                        {isExpanded ? 'Hide' : 'Details'}
                        <svg
                          className={`h-3 w-3 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                          role="img"
                          viewBox="0 0 448 512"
                          aria-hidden="true"
                        >
                          <path
                            fill="currentColor"
                            d="M201.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 338.7 54.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50/50">
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <div className="w-6 h-6 rounded-lg bg-primary-100 flex items-center justify-center">
                        <svg className="h-3 w-3 text-primary-600" role="img" viewBox="0 0 384 512" aria-hidden="true">
                          <path
                            fill="currentColor"
                            d="M14 2.2C22.5-1.7 32.5-.3 39.6 5.8L80 40.4 120.4 5.8c9-7.7 22.3-7.7 31.2 0L192 40.4 232.4 5.8c9-7.7 22.2-7.7 31.2 0L304 40.4 344.4 5.8c7.1-6.1 17.1-7.5 25.6-3.6S384 14.6 384 24l0 464c0 9.4-5.5 17.9-14 21.8s-18.5 2.5-25.6-3.6l-40.4-34.6-40.4 34.6c-9 7.7-22.2 7.7-31.2 0l-40.4-34.6-40.4 34.6c-9 7.7-22.3 7.7-31.2 0L80 471.6 39.6 506.2c-7.1 6.1-17.1 7.5-25.6 3.6S0 497.4 0 488L0 24C0 14.6 5.5 6.1 14 2.2z"
                          />
                        </svg>
                      </div>
                      Order Items
                    </div>

                    <div className="space-y-3">
                      {items.map((item, itemIndex) => {
                        const product = item.product ?? {}
                        const count = item.count ?? 1
                        const price = item.price ?? 0
                        return (
                          <div
                            key={`${product._id ?? 'item'}-${itemIndex}`}
                            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100"
                          >
                            <div className="w-16 h-16 rounded-xl bg-gray-50 p-2 shrink-0">
                              {product.imageCover ? (
                                <Image
                                  alt={product.title ?? 'Order item'}
                                  className="w-full h-full object-contain"
                                  src={product.imageCover}
                                  width={64}
                                  height={64}
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{product.title ?? 'Order item'}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                <span className="font-medium text-gray-700">{count}</span> × {price} EGP
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-lg font-bold text-gray-900">{price * count}</p>
                              <p className="text-xs text-gray-400">EGP</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="mt-6 grid sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-white rounded-xl border border-gray-100">
                        <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                            <svg className="h-3 w-3 text-blue-600" role="img" viewBox="0 0 384 512" aria-hidden="true">
                              <path
                                fill="currentColor"
                                d="M0 188.6C0 84.4 86 0 192 0S384 84.4 384 188.6c0 119.3-120.2 262.3-170.4 316.8-11.8 12.8-31.5 12.8-43.3 0-50.2-54.5-170.4-197.5-170.4-316.8zM192 256a64 64 0 1 0 0-128 64 64 0 1 0 0 128z"
                              />
                            </svg>
                          </div>
                          Delivery Address
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p className="font-medium text-gray-900">{address?.city ?? 'City'}</p>
                          <p className="text-gray-600 leading-relaxed">{address?.details ?? 'No details'}</p>
                          <p className="text-gray-600">{address?.phone ?? 'No phone'}</p>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                        <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center">
                            <svg className="h-3 w-3 text-white" role="img" viewBox="0 0 512 512" aria-hidden="true">
                              <path
                                fill="currentColor"
                                d="M256 0c4.6 0 9.2 1 13.4 2.9L457.8 82.8c22 9.3 38.4 31 38.3 57.2-.5 99.2-41.3 280.7-213.6 363.2-16.7 8-36.1 8-52.8 0-172.4-82.5-213.1-264-213.6-363.2-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.9 1 251.4 0 256 0zm0 66.8l0 378.1c138-66.8 175.1-214.8 176-303.4l-176-74.6 0 0z"
                              />
                            </svg>
                          </div>
                          Payment Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between text-gray-600">
                            <span>Payment</span>
                            <span className="font-medium">{paymentMethod === 'card' ? 'Online' : 'Cash'}</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Status</span>
                            <span className="font-medium">{statusLabel}</span>
                          </div>
                          <hr className="border-amber-200/60 my-2" />
                          <div className="flex justify-between pt-1">
                            <span className="font-semibold text-gray-900">Total</span>
                            <span className="font-bold text-lg text-gray-900">{totalPrice} EGP</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
