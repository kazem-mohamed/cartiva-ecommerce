'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { ButtonLink } from '@/component/ui/Button'

const USER_ORDERS_API = (userId: string) =>
  `https://ecommerce.routemisr.com/api/v1/orders/user/${userId}`

type OrderItem = {
  count?: number
  price?: number
  product?: { _id?: string; title?: string; imageCover?: string }
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
  shippingAddress?: { city?: string; details?: string; phone?: string }
}

const egp = new Intl.NumberFormat('en-EG')
const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

const getErrorMessage = async (res: Response, fallback: string) => {
  const data = await res.json().catch(() => null)
  if (!data) return fallback
  return data?.message ?? data?.error ?? fallback
}

const formatDate = (value?: string) => {
  if (!value) return 'Unknown date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown date'
  return dateFmt.format(date)
}

const getStatusLabel = (order: Order) => {
  if (order.status) return order.status
  if (order.isDelivered) return 'Delivered'
  if (order.isPaid) return 'Paid'
  return 'Processing'
}

/** Status uses a dot plus a word — colour is never the only signal. */
const statusTone = (status: string) => {
  const n = status.toLowerCase()
  if (n.includes('deliver')) return 'var(--success)'
  if (n.includes('cancel')) return 'var(--danger)'
  if (n.includes('paid')) return 'var(--gold)'
  return 'var(--warning)'
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
          headers: { token, Authorization: `Bearer ${token}`, 'Cache-Control': 'no-store' },
          cache: 'no-store',
        })
        if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to load orders'))
        const json = await res.json().catch(() => null)
        const raw = json?.data ?? json?.orders ?? json ?? []
        setOrders(Array.isArray(raw) ? raw : [])
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

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 py-12 sm:py-16">
        <div className="h-10 w-44 animate-pulse rounded-full bg-sunk" />
        <div className="mt-8 flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} aria-hidden="true" className="bento h-36 animate-pulse p-6" />
          ))}
        </div>
        <span className="sr-only" role="status">Loading your orders…</span>
      </main>
    )
  }

  if (error) {
    return (
      <main className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 py-20">
        <div className="bento mx-auto max-w-[520px] px-8 py-16 text-center" role="alert">
          <h1 className="font-display text-2xl">We could not load your orders</h1>
          <p className="mt-3 text-sm font-light text-ink-muted">{error}</p>
          <div className="mt-8 flex justify-center">
            <ButtonLink href="/products">Browse the catalogue</ButtonLink>
          </div>
        </div>
      </main>
    )
  }

  if (!orders.length) {
    return (
      <main className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 py-20">
        <div className="bento mx-auto max-w-[520px] px-8 py-16 text-center">
          <div className="mx-auto mb-7 grid h-16 w-16 place-items-center rounded-full bg-sunk">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="h-7 w-7 text-ink-muted">
              <path d="M4 7h16v13H4zM4 7l2-3h12l2 3M9 11h6" />
            </svg>
          </div>
          <h1 className="font-display text-2xl">No orders yet</h1>
          <p className="mt-3 text-sm font-light text-ink-muted">
            When you place an order it will appear here with its full history.
          </p>
          <div className="mt-8 flex justify-center">
            <ButtonLink href="/products">Browse the catalogue</ButtonLink>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 py-12 sm:py-16">
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="label flex items-center gap-2 text-ink-muted">
          <li><Link href="/" className="transition-colors duration-300 hover:text-gold">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-ink">Orders</li>
        </ol>
      </nav>

      <header className="mb-9">
        <h1 className="font-display-lg text-[clamp(30px,4.6vw,48px)]">Your orders</h1>
        <p className="mt-2.5 text-[15px] font-light text-ink-muted">
          <span className="tabular">{orders.length}</span> order{orders.length === 1 ? '' : 's'}
        </p>
      </header>

      {/* A ledger, not a card grid — each order is a row that opens. */}
      <ul className="flex flex-col gap-4">
        {orders.map((order, i) => {
          const orderId = order._id ?? order.id ?? String(i)
          const isExpanded = expandedIds.has(orderId)
          const items = order.cartItems ?? []
          const label = getStatusLabel(order)
          const shortId = orderId.slice(-8).toUpperCase()

          return (
            <li key={orderId} className="bento overflow-hidden">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 p-6 sm:p-7">
                <div className="min-w-[128px]">
                  <span className="label text-ink-muted">Order</span>
                  <p className="tabular mt-1.5 text-[15px] font-medium">#{shortId}</p>
                </div>

                <div className="min-w-[110px]">
                  <span className="label text-ink-muted">Placed</span>
                  <p className="tabular mt-1.5 text-[14px]">{formatDate(order.createdAt)}</p>
                </div>

                <div className="min-w-[100px]">
                  <span className="label text-ink-muted">Status</span>
                  <p className="mt-1.5 flex items-center gap-2 text-[14px]">
                    <span
                      aria-hidden="true"
                      className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: statusTone(label) }}
                    />
                    {label}
                  </p>
                </div>

                {order.paymentMethodType && (
                  <div className="min-w-[90px]">
                    <span className="label text-ink-muted">Payment</span>
                    <p className="mt-1.5 text-[14px] capitalize">{order.paymentMethodType}</p>
                  </div>
                )}

                <div className="ml-auto flex items-center gap-6">
                  <div className="text-right">
                    <span className="label text-ink-muted">Total</span>
                    <p className="font-display tabular mt-1 text-[20px] font-semibold">
                      {egp.format(order.totalOrderPrice ?? 0)}
                      <span className="ml-1.5 text-[11px] font-light text-ink-muted">EGP</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleExpanded(orderId)}
                    aria-expanded={isExpanded}
                    aria-controls={`order-${orderId}`}
                    aria-label={`${isExpanded ? 'Hide' : 'Show'} items in order ${shortId}`}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line transition-colors duration-400 hover:border-gold hover:text-gold"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className={`h-4 w-4 transition-transform duration-[450ms] ease-[var(--ease)] ${isExpanded ? 'rotate-180' : ''}`}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div id={`order-${orderId}`} className="border-t border-line-soft bg-sunk/40 p-6 sm:p-7">
                  <span className="label text-ink-muted">
                    <span className="tabular">{items.length}</span> item{items.length === 1 ? '' : 's'}
                  </span>

                  <ul className="mt-5 flex flex-col gap-4">
                    {items.map((item, idx) => (
                      <li key={item.product?._id ?? idx} className="flex items-center gap-4">
                        <Link
                          href={item.product?._id ? `/products/${item.product._id}` : '#'}
                          className="well relative h-16 w-16 shrink-0 bg-card"
                        >
                          {item.product?.imageCover && (
                            <Image
                              src={item.product.imageCover}
                              alt=""
                              fill
                              sizes="64px"
                              className="object-contain p-2"
                            />
                          )}
                        </Link>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14.5px]">
                            <Link
                              href={item.product?._id ? `/products/${item.product._id}` : '#'}
                              className="transition-colors duration-300 hover:text-gold"
                            >
                              {item.product?.title ?? 'Item'}
                            </Link>
                          </p>
                          <p className="tabular mt-1 text-[12.5px] font-light text-ink-muted">
                            × {item.count ?? 1}
                          </p>
                        </div>
                        <span className="tabular shrink-0 text-[14.5px]">
                          {egp.format((item.price ?? 0) * (item.count ?? 1))}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {order.shippingAddress && (
                    <div className="mt-7 border-t border-line-soft pt-5">
                      <span className="label text-ink-muted">Shipping to</span>
                      <p className="mt-2 text-[14px] font-light leading-relaxed text-ink-soft">
                        {[order.shippingAddress.details, order.shippingAddress.city]
                          .filter(Boolean)
                          .join(', ')}
                        {order.shippingAddress.phone && (
                          <>
                            <br />
                            <span className="tabular">{order.shippingAddress.phone}</span>
                          </>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </main>
  )
}
