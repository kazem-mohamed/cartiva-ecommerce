'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import ProductShelf from '@/component/product/ProductShelf'
import type { CardProduct } from '@/component/product/ProductCard'
import { ButtonLink } from '@/component/ui/Button'
import { addToCart, notifyCartUpdate } from '@/lib/cart'
import { getWishlist, notifyWishlistUpdate, removeFromWishlist } from '@/lib/wishlist'

/**
 * Saved items — engine style "Soft UI Evolution", pattern "Minimal &
 * Direct + Conversion" with the CTA above the fold.
 *
 * Rebuilt on ProductShelf rather than the previous page.jsx, which was an
 * untyped 19KB file predating the brand and reimplemented cart/wishlist
 * calls that lib/cart and lib/wishlist already own.
 */

const WISHLIST_API = 'https://ecommerce.routemisr.com/api/v1/wishlist'

export default function WishlistPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const token = session?.accessToken ?? ''

  const [items, setItems] = useState<CardProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [bulkBusy, setBulkBusy] = useState(false)

  const load = useCallback(async () => {
    if (!token) return
    try {
      setLoading(true)
      setError('')
      const res = await fetch(WISHLIST_API, {
        headers: { token, Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      if (!res.ok) throw new Error('Failed to load')
      const json = await res.json().catch(() => null)
      setItems(Array.isArray(json?.data) ? json.data : [])
    } catch {
      setError('Unable to load your saved items.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (status === 'loading') return
    if (!token || status !== 'authenticated') {
      setLoading(false)
      router.replace('/login')
      return
    }
    load()
  }, [status, token, router, load])

  /** Keep the page in step when a card's heart is toggled from inside it. */
  const handleWishlistChange = useCallback((id: string, next: boolean) => {
    if (!next) setItems((prev) => prev.filter((p) => p._id !== id))
  }, [])

  /** Bulk action — engine UX rule: don't offer single-row actions only. */
  const addAllToCart = async () => {
    if (!token || bulkBusy || !items.length) return
    setBulkBusy(true)
    let ok = 0
    try {
      for (const item of items) {
        try {
          await addToCart(item._id, token)
          ok += 1
        } catch {
          // one failure should not abandon the rest
        }
      }
      notifyCartUpdate()
      if (ok === items.length) toast.success(`Added ${ok} item${ok === 1 ? '' : 's'} to your cart.`)
      else if (ok > 0) toast.success(`Added ${ok} of ${items.length}. Some could not be added.`)
      else toast.error('Could not add these to your cart.')
    } finally {
      setBulkBusy(false)
    }
  }

  const clearAll = async () => {
    if (!token || bulkBusy || !items.length) return
    setBulkBusy(true)
    const snapshot = items
    setItems([])
    try {
      await Promise.all(snapshot.map((p) => removeFromWishlist(p._id, token).catch(() => null)))
      notifyWishlistUpdate()
      toast.error('Saved items cleared')
    } catch {
      setItems(snapshot)
      toast.error('Could not clear your saved items.')
    } finally {
      setBulkBusy(false)
    }
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 py-12 sm:py-16">
        <div className="h-10 w-52 animate-pulse rounded-full bg-sunk" />
        <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} aria-hidden="true" className="bento p-3">
              <div className="well aspect-[4/5] animate-pulse" />
              <div className="space-y-3 px-2 pt-4 pb-2">
                <div className="h-2 w-1/3 animate-pulse rounded-full bg-sunk" />
                <div className="h-3.5 w-4/5 animate-pulse rounded-full bg-sunk" />
                <div className="h-5 w-1/2 animate-pulse rounded-full bg-sunk" />
              </div>
            </div>
          ))}
        </div>
        <span className="sr-only" role="status">Loading your saved items…</span>
      </main>
    )
  }

  if (error) {
    return (
      <main className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 py-20">
        <div className="bento mx-auto max-w-[520px] px-8 py-16 text-center" role="alert">
          <h1 className="font-display text-2xl">We could not load your saved items</h1>
          <p className="mt-3 text-sm font-light text-ink-muted">{error}</p>
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={load}
              className="label rounded-full bg-vault px-8 py-4 text-white transition-transform duration-[280ms] ease-[var(--ease-hover)] hover:scale-[1.03]"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    )
  }

  if (!items.length) {
    return (
      <main className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 py-20">
        <div className="bento mx-auto max-w-[520px] px-8 py-16 text-center">
          <div className="mx-auto mb-7 grid h-16 w-16 place-items-center rounded-full bg-sunk">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="h-7 w-7 text-ink-muted">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8Z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl">Nothing saved yet</h1>
          <p className="mt-3 text-sm font-light text-ink-muted">
            Tap the heart on any product and it will wait for you here.
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
          <li className="text-ink">Saved</li>
        </ol>
      </nav>

      {/* CTA above the fold, per the engine's pattern for this surface. */}
      <div className="bento mb-8 flex flex-wrap items-end justify-between gap-6 p-7 sm:p-9">
        <div>
          <span className="label text-ink-muted">
            <span className="tabular">{items.length}</span> item{items.length === 1 ? '' : 's'}
          </span>
          <h1 className="font-display-lg mt-3 text-[clamp(28px,4.4vw,46px)]">Saved for later</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={addAllToCart}
            disabled={bulkBusy}
            className="label rounded-full bg-vault px-7 py-3.5 text-white transition-transform duration-[280ms] ease-[var(--ease-hover)] hover:scale-[1.03] disabled:opacity-40 disabled:hover:scale-100"
          >
            {bulkBusy ? 'Working…' : 'Add all to cart'}
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={bulkBusy}
            className="label rounded-full border border-line px-7 py-3.5 transition-colors duration-[280ms] hover:border-danger hover:text-danger disabled:opacity-40"
          >
            Clear all
          </button>
        </div>
      </div>

      <ProductShelf products={items} onWishlistChange={handleWishlistChange} />
    </main>
  )
}
