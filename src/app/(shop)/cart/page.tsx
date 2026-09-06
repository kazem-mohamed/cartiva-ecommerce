'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { ButtonLink, Button } from '@/component/ui/Button'
import {
  applyCoupon as apiApplyCoupon,
  clearCart,
  deleteCartItem,
  getCart,
  notifyCartUpdate,
  removeFromCart,
  updateCartQuantity,
} from '@/lib/cart'

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
    category?: { name?: string }
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

const egp = new Intl.NumberFormat('en-EG')

export default function CartPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const token = session?.accessToken ?? null

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

  const items = useMemo(() => cart?.products ?? [], [cart?.products])
  const totalItems = useMemo(() => items.reduce((sum, item) => sum + (item.count ?? 0), 0), [items])
  const subtotal = cart?.totalCartPrice ?? 0
  const totalAfterDiscount = cart?.totalAfterDiscount ?? subtotal
  const discount = subtotal > totalAfterDiscount ? subtotal - totalAfterDiscount : 0

  // No invented shipping line. The API returns totalCartPrice and (when a
  // coupon applies) totalAfterDiscount — that is the amount the order is
  // actually created for. The previous version added a hardcoded 50 EGP
  // and a "free shipping over 500" progress bar; neither exists anywhere
  // in the API, so both showed the shopper a number they would never be
  // charged. The brand's honesty rules forbid claims the store cannot keep.
  const orderTotal = totalAfterDiscount

  const loadCart = async (activeToken: string, opts: { silent?: boolean } = {}) => {
    const silent = opts?.silent === true
    try {
      if (!silent) setLoading(true)
      setError('')
      const data = await getCart(activeToken)
      setCart(data)
    } catch {
      setError('Unable to load your cart. Please try again.')
      setCart(null)
    } finally {
      if (!silent) setLoading(false)
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
      const data = await updateCartQuantity(productId, nextCount, token)
      if (data) setCart(data)
      else await loadCart(token)
      notifyCartUpdate()
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
      const data = await removeFromCart(productId, token, cartItemId)
      const products: CartProduct[] = data?.products ?? []
      const stillThere = products.some((item) => {
        const id = item?.product?._id ?? item?.product?.id ?? item?.productId
        return id === productId
      })

      if (data && !stillThere) {
        setCart(data)
      } else if (cartItemId && cartItemId !== productId) {
        const fallbackData = await deleteCartItem(productId, token, { productId, cartItemId }).catch(
          () => null,
        )
        if (fallbackData) setCart(fallbackData)
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
      notifyCartUpdate()
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
      await clearCart(token)
      setCart({ products: [], totalCartPrice: 0 })
      notifyCartUpdate()
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
    setConfirmRemove({ id: productId, cartItemId: cartItemId ?? null, title: title ?? 'this item' })
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
      const data = await apiApplyCoupon(coupon.trim(), token)
      if (data) setCart(data)
      else await loadCart(token)
      toast.success('Coupon applied')
    } catch {
      toast.error('Unable to apply coupon')
    } finally {
      setCouponLoading(false)
    }
  }

  /* ---------- loading: skeleton, not a bare sentence (engine: >300ms) ---- */
  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 py-12 sm:py-16">
        <div className="h-10 w-52 animate-pulse rounded-full bg-sunk" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bento flex gap-5 p-5" aria-hidden="true">
                <div className="h-28 w-28 shrink-0 animate-pulse rounded-[16px] bg-sunk" />
                <div className="flex-1 space-y-3 py-2">
                  <div className="h-3 w-24 animate-pulse rounded-full bg-sunk" />
                  <div className="h-4 w-3/5 animate-pulse rounded-full bg-sunk" />
                  <div className="h-5 w-28 animate-pulse rounded-full bg-sunk" />
                </div>
              </div>
            ))}
          </div>
          <div className="bento h-64 animate-pulse p-6" aria-hidden="true" />
        </div>
        <span className="sr-only" role="status">Loading your cart…</span>
      </main>
    )
  }

  /* ---------- error: recovery path, not a dead end ----------------------- */
  if (error) {
    return (
      <main className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 py-20">
        <div className="bento mx-auto max-w-[520px] px-8 py-16 text-center" role="alert">
          <h1 className="font-display text-2xl">We could not load your cart</h1>
          <p className="mt-3 text-sm font-light text-ink-muted">{error}</p>
          <div className="mt-8 flex justify-center">
            <Button onClick={() => token && loadCart(token)}>Try again</Button>
          </div>
        </div>
      </main>
    )
  }

  /* ---------- empty: helpful message + action --------------------------- */
  if (!items.length) {
    return (
      <main className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 py-20">
        <div className="bento mx-auto max-w-[520px] px-8 py-16 text-center">
          <div className="mx-auto mb-7 grid h-16 w-16 place-items-center rounded-full bg-sunk">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="h-7 w-7 text-ink-muted">
              <path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6" />
              <circle cx="10" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
          </div>
          <h1 className="font-display text-2xl">Your cart is empty</h1>
          <p className="mt-3 text-sm font-light text-ink-muted">
            Nothing here yet. Browse the catalogue and add something.
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
          <li className="text-ink">Cart</li>
        </ol>
      </nav>

      <div className="mb-8 flex items-end justify-between gap-5 flex-wrap">
        <div>
          <h1 className="font-display-lg text-[clamp(30px,4.6vw,48px)]">Your cart</h1>
          <p className="mt-2 text-[15px] font-light text-ink-muted">
            <span className="tabular">{totalItems}</span> item{totalItems === 1 ? '' : 's'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setConfirmClear(true)}
          disabled={clearing}
          className="label text-ink-muted transition-colors duration-300 hover:text-danger disabled:opacity-50"
        >
          {clearing ? 'Clearing…' : 'Clear cart'}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <ul className="flex flex-col gap-4">
          {items.map((item) => {
            const product = item.product
            const productId = product?._id ?? product?.id ?? item.productId ?? ''
            const rowId = item._id ?? productId
            const count = item.count ?? 1
            const unit = item.price ?? product?.price ?? 0
            const busy = updatingId === productId
            const removing = removingId === rowId || removingId === productId

            return (
              <li key={rowId} className="bento flex gap-4 p-4 sm:gap-5 sm:p-5">
                <Link href={`/products/${productId}`} className="well relative h-28 w-28 shrink-0 sm:h-32 sm:w-32">
                  {product?.imageCover && (
                    <Image
                      src={product.imageCover}
                      alt=""
                      fill
                      sizes="128px"
                      className="object-contain p-3"
                    />
                  )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="label text-ink-muted">
                    {product?.category?.name ?? product?.categoryName ?? 'Cartiva'}
                  </span>
                  <h2 className="mt-1.5 text-[15px] leading-snug">
                    <Link href={`/products/${productId}`} className="transition-colors duration-300 hover:text-gold">
                      {product?.title ?? 'Item'}
                    </Link>
                  </h2>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-4">
                    <div className="flex items-center gap-1 rounded-full border border-line p-1">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${product?.title ?? 'item'}`}
                        onClick={() => handleUpdateQuantity(productId, count - 1)}
                        disabled={busy || count <= 1}
                        className="grid h-9 w-9 place-items-center rounded-full transition-colors duration-300 hover:bg-sunk disabled:opacity-30"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5"><path d="M5 12h14" /></svg>
                      </button>
                      <span aria-live="polite" className="tabular w-9 text-center text-sm">
                        {busy ? <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border border-current border-r-transparent" /> : count}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${product?.title ?? 'item'}`}
                        onClick={() => handleUpdateQuantity(productId, count + 1)}
                        disabled={busy}
                        className="grid h-9 w-9 place-items-center rounded-full transition-colors duration-300 hover:bg-sunk disabled:opacity-30"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5"><path d="M12 5v14M5 12h14" /></svg>
                      </button>
                    </div>

                    <div className="flex items-center gap-5">
                      <span className="font-display tabular text-[18px] font-semibold">
                        {egp.format(unit * count)}
                        <span className="ml-1.5 text-[11px] font-light text-ink-muted">EGP</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleConfirmRemove(productId, item._id, product?.title)}
                        disabled={removing}
                        aria-label={`Remove ${product?.title ?? 'item'} from cart`}
                        className="grid h-9 w-9 place-items-center rounded-full text-ink-muted transition-colors duration-300 hover:bg-danger/10 hover:text-danger disabled:opacity-40"
                      >
                        {removing ? (
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border border-current border-r-transparent" />
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                            <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        <aside className="bento p-6 lg:sticky lg:top-6">
          <h2 className="font-display text-lg">Order summary</h2>

          <dl className="mt-6 flex flex-col gap-3.5 text-[14.5px]">
            <div className="flex justify-between">
              <dt className="font-light text-ink-muted">Subtotal</dt>
              <dd className="tabular">{egp.format(subtotal)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-gold">
                <dt className="font-light">Coupon discount</dt>
                <dd className="tabular">−{egp.format(discount)}</dd>
              </div>
            )}
            <div className="mt-2 flex items-baseline justify-between border-t border-line-soft pt-4">
              <dt className="font-display text-base">Total</dt>
              <dd className="font-display tabular text-[24px] font-semibold">
                {egp.format(orderTotal)}
                <span className="ml-1.5 text-[11px] font-light text-ink-muted">EGP</span>
              </dd>
            </div>
          </dl>

          <p className="mt-3 text-[12px] font-light leading-relaxed text-ink-muted">
            Shipping is arranged after checkout and is not included above.
          </p>

          <div className="mt-6">
            {showCoupon ? (
              <div className="flex items-center gap-2">
                <label htmlFor="coupon" className="sr-only">Coupon code</label>
                <input
                  id="coupon"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  placeholder="Coupon code"
                  className="h-11 min-w-0 flex-1 rounded-full border border-line bg-sunk px-4 text-sm transition-colors duration-500 focus:border-gold focus:bg-card focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading}
                  className="label shrink-0 rounded-full bg-vault px-5 py-3 text-white transition-transform duration-400 hover:scale-105 disabled:opacity-50"
                >
                  {couponLoading ? '…' : 'Apply'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowCoupon(true)}
                className="label text-gold transition-colors duration-300 hover:text-gold-deep"
              >
                + Add a coupon
              </button>
            )}
          </div>

          <div className="mt-7 flex flex-col gap-3">
            <ButtonLink href="/checkout" className="w-full">Checkout</ButtonLink>
            <ButtonLink href="/products" variant="secondary" size="md" className="w-full">
              Keep shopping
            </ButtonLink>
          </div>
        </aside>
      </div>

      {/* Destructive actions are confirmed — engine: confirmation-dialogs */}
      {confirmRemove && (
        <ConfirmDialog
          title="Remove this item?"
          body={`“${confirmRemove.title}” will be removed from your cart.`}
          confirmLabel="Remove"
          onCancel={() => setConfirmRemove(null)}
          onConfirm={() => {
            handleRemoveItem(confirmRemove.id, confirmRemove.cartItemId)
            setConfirmRemove(null)
          }}
        />
      )}

      {confirmClear && (
        <ConfirmDialog
          title="Clear your cart?"
          body="Every item will be removed. This cannot be undone."
          confirmLabel="Clear cart"
          onCancel={() => setConfirmClear(false)}
          onConfirm={() => {
            handleClearCart()
            setConfirmClear(false)
          }}
        />
      )}
    </main>
  )
}

function ConfirmDialog({
  title,
  body,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  title: string
  body: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 grid place-items-center p-5"
      onClick={onCancel}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-vault-deep/45 backdrop-blur-[2px]" />
      <div
        className="bento relative w-full max-w-[420px] p-7"
        style={{ boxShadow: 'var(--shadow-lift)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-xl">{title}</h2>
        <p className="mt-3 text-sm font-light text-ink-muted">{body}</p>
        <div className="mt-7 flex gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className="label flex-1 rounded-full bg-danger py-3.5 text-white transition-transform duration-400 hover:scale-[1.02]"
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="label flex-1 rounded-full border border-line py-3.5 transition-colors duration-400 hover:border-ink"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
