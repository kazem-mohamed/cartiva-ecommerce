'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { ButtonLink } from '@/component/ui/Button'
import { addToCart, notifyCartUpdate } from '@/lib/cart'
import { clearCompare, getCompareIds, notifyCompareUpdate, removeFromCompare } from '@/lib/compare'

/**
 * Compare — engine pattern "Comparison Table Focus".
 *
 *  · Side-by-side matrix, one column per product
 *  · The best value in each row is highlighted (the engine's "highlighted
 *    column" rule, applied per-row since no product is "ours")
 *  · Wide tables get horizontal scroll, never a broken layout
 *    (engine UX rule: Table Handling)
 *  · Every icon-only control carries an aria-label
 */

interface Product {
  _id: string
  title: string
  price: number
  priceAfterDiscount?: number
  imageCover: string
  ratingsAverage?: number
  ratingsQuantity?: number
  quantity: number
  category?: { name?: string }
  brand?: { name?: string }
}

const egp = new Intl.NumberFormat('en-EG')

async function fetchProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`https://ecommerce.routemisr.com/api/v1/products/${id}`)
    if (!res.ok) return null
    const json = await res.json()
    return json?.data ?? null
  } catch {
    return null
  }
}

const effectivePrice = (p: Product) =>
  typeof p.priceAfterDiscount === 'number' && p.priceAfterDiscount < p.price
    ? p.priceAfterDiscount
    : p.price

export default function ComparePage() {
  const { data: session } = useSession()
  const token = session?.accessToken ?? null

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [cartLoadingIds, setCartLoadingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      const ids = getCompareIds()
      const results = await Promise.all(ids.map((id) => fetchProduct(id)))
      if (!active) return
      setProducts(results.filter((item): item is Product => Boolean(item)))
      setLoading(false)
    }

    load()
    window.addEventListener('compareUpdated', load)
    return () => {
      active = false
      window.removeEventListener('compareUpdated', load)
    }
  }, [])

  /** Which product wins each row — drives the highlight. */
  const best = useMemo(() => {
    if (products.length < 2) return { price: null as string | null, rating: null as string | null }
    const cheapest = [...products].sort((a, b) => effectivePrice(a) - effectivePrice(b))[0]
    const topRated = [...products].sort(
      (a, b) => (b.ratingsAverage ?? 0) - (a.ratingsAverage ?? 0),
    )[0]
    return {
      price: cheapest?._id ?? null,
      rating: (topRated?.ratingsAverage ?? 0) > 0 ? topRated._id : null,
    }
  }, [products])

  const handleRemove = (id: string) => {
    removeFromCompare(id)
    notifyCompareUpdate()
    toast.error('Removed from compare')
  }

  const handleAddToCart = async (productId: string) => {
    if (!token) {
      toast.error('Sign in to add items to your cart.')
      return
    }
    if (cartLoadingIds.has(productId)) return

    setCartLoadingIds((prev) => new Set(prev).add(productId))
    try {
      await addToCart(productId, token)
      notifyCartUpdate()
      toast.success('Added to cart.')
    } catch {
      toast.error('Could not add to cart. Try again.')
    } finally {
      setCartLoadingIds((prev) => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })
    }
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 py-12 sm:py-16">
        <div className="h-10 w-52 animate-pulse rounded-full bg-sunk" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} aria-hidden="true" className="bento h-96 animate-pulse p-5" />
          ))}
        </div>
        <span className="sr-only" role="status">Loading your comparison…</span>
      </main>
    )
  }

  if (!products.length) {
    return (
      <main className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 py-20">
        <div className="bento mx-auto max-w-[520px] px-8 py-16 text-center">
          <div className="mx-auto mb-7 grid h-16 w-16 place-items-center rounded-full bg-sunk">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="h-7 w-7 text-ink-muted">
              <path d="M4 7h11M4 17h11M18 4l3 3-3 3M18 14l3 3-3 3" />
            </svg>
          </div>
          <h1 className="font-display text-2xl">Nothing to compare yet</h1>
          <p className="mt-3 text-sm font-light text-ink-muted">
            Add items from the catalogue and they will line up side by side here.
          </p>
          <div className="mt-8 flex justify-center">
            <ButtonLink href="/products">Browse the catalogue</ButtonLink>
          </div>
        </div>
      </main>
    )
  }

  const rows: { label: string; key: 'price' | 'rating' | 'stock' | 'brand' | 'category' }[] = [
    { label: 'Price', key: 'price' },
    { label: 'Rating', key: 'rating' },
    { label: 'Availability', key: 'stock' },
    { label: 'Brand', key: 'brand' },
    { label: 'Department', key: 'category' },
  ]

  return (
    <main className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 py-12 sm:py-16">
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="label flex items-center gap-2 text-ink-muted">
          <li><Link href="/" className="transition-colors duration-300 hover:text-gold">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-ink">Compare</li>
        </ol>
      </nav>

      <div className="mb-9 flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h1 className="font-display-lg text-[clamp(30px,4.6vw,48px)]">Side by side</h1>
          <p className="mt-2.5 text-[15px] font-light text-ink-muted">
            <span className="tabular">{products.length}</span> item
            {products.length === 1 ? '' : 's'}
            {products.length > 1 && ' · best value in each row is marked'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            clearCompare()
            notifyCompareUpdate()
            toast.error('Comparison cleared')
          }}
          className="label text-ink-muted transition-colors duration-300 hover:text-danger"
        >
          Clear all
        </button>
      </div>

      {/* Wide tables scroll horizontally rather than breaking the layout. */}
      <div className="-mx-5 overflow-x-auto px-5 pb-3 sm:mx-0 sm:px-0 [scrollbar-width:thin]">
        <div
          className="grid min-w-[640px] gap-5"
          style={{ gridTemplateColumns: `140px repeat(${products.length}, minmax(200px, 1fr))` }}
        >
          {/* Header row — the products themselves */}
          <div aria-hidden="true" />
          {products.map((p) => {
            const busy = cartLoadingIds.has(p._id)
            const soldOut = p.quantity === 0
            return (
              <div key={p._id} className="bento bento-hover group relative flex flex-col p-4">
                <button
                  type="button"
                  onClick={() => handleRemove(p._id)}
                  aria-label={`Remove ${p.title} from comparison`}
                  className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-card/90 text-ink-muted shadow-[0_2px_6px_rgba(12,10,9,0.08)] transition-colors duration-300 hover:text-danger"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>

                <Link href={`/products/${p._id}`} className="well relative aspect-square">
                  <Image
                    src={p.imageCover}
                    alt=""
                    fill
                    sizes="220px"
                    className="object-contain p-[12%] transition-transform duration-[280ms] ease-[var(--ease-hover)] group-hover:scale-[1.05]"
                  />
                </Link>

                <h2 className="mt-4 line-clamp-2 min-h-[42px] px-1 text-[14px] leading-snug">
                  <Link href={`/products/${p._id}`} className="transition-colors duration-300 hover:text-gold">
                    {p.title}
                  </Link>
                </h2>

                <button
                  type="button"
                  onClick={() => handleAddToCart(p._id)}
                  disabled={busy || soldOut}
                  className="label mt-4 w-full rounded-full bg-vault py-3 text-white transition-transform duration-[280ms] ease-[var(--ease-hover)] hover:scale-[1.03] disabled:opacity-35 disabled:hover:scale-100"
                >
                  {busy ? 'Adding…' : soldOut ? 'Sold out' : 'Add to cart'}
                </button>
              </div>
            )
          })}

          {/* Matrix rows */}
          {rows.map((row) => (
            <div key={row.key} className="contents">
              <div className="flex items-center">
                <span className="label text-ink-muted">{row.label}</span>
              </div>

              {products.map((p) => {
                const isBest =
                  (row.key === 'price' && best.price === p._id) ||
                  (row.key === 'rating' && best.rating === p._id)

                let content: React.ReactNode = '—'
                if (row.key === 'price') {
                  const eff = effectivePrice(p)
                  content = (
                    <span className="flex items-baseline gap-2">
                      <span className="font-display tabular text-[17px] font-semibold">{egp.format(eff)}</span>
                      {eff < p.price && (
                        <s className="tabular text-[12px] font-light text-ink-muted">{egp.format(p.price)}</s>
                      )}
                    </span>
                  )
                } else if (row.key === 'rating') {
                  content =
                    typeof p.ratingsAverage === 'number' ? (
                      <span className="flex items-center gap-2 text-[14px]">
                        <span aria-hidden="true" className="text-gold">★</span>
                        <span className="tabular">{p.ratingsAverage.toFixed(1)}</span>
                        {typeof p.ratingsQuantity === 'number' && (
                          <span className="tabular text-[12px] text-ink-muted">({p.ratingsQuantity})</span>
                        )}
                      </span>
                    ) : (
                      '—'
                    )
                } else if (row.key === 'stock') {
                  const soldOut = p.quantity === 0
                  const low = !soldOut && p.quantity <= 5
                  content = (
                    <span className="flex items-center gap-2 text-[14px]">
                      <span
                        aria-hidden="true"
                        className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: soldOut ? 'var(--danger)' : low ? 'var(--warning)' : 'var(--success)' }}
                      />
                      {soldOut ? 'Out of stock' : low ? `Only ${p.quantity} left` : 'In stock'}
                    </span>
                  )
                } else if (row.key === 'brand') {
                  content = <span className="text-[14px]">{p.brand?.name ?? '—'}</span>
                } else {
                  content = <span className="text-[14px]">{p.category?.name ?? '—'}</span>
                }

                return (
                  <div
                    key={p._id}
                    className={`flex items-center rounded-[16px] border px-4 py-3.5 transition-colors duration-[280ms] ${
                      isBest ? 'border-gold bg-gold/[0.06]' : 'border-line-soft bg-card'
                    }`}
                  >
                    {content}
                    {isBest && (
                      <span
                        className="label ml-auto flex shrink-0 items-center gap-1.5 pl-3 text-gold"
                        title={row.key === 'price' ? 'Lowest price' : 'Highest rating'}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-3 w-3">
                          <path d="m5 13 4 4L19 7" />
                        </svg>
                        Best
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
