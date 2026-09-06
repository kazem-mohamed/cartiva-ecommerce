'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { getCart } from '@/lib/cart'
import { getWishlist } from '@/lib/wishlist'

/**
 * Account overview. This route did not exist before — /profile returned a
 * 404 while /profile/settings and /profile/addresses worked, so the
 * account area had no front door.
 *
 * Every figure here is read from the API. Nothing is estimated or invented.
 */

const ORDERS_API = (userId: string) =>
  `https://ecommerce.routemisr.com/api/v1/orders/user/${userId}`

export default function ProfileOverview() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const token = session?.accessToken ?? ''
  const userId = session?.user?.id ?? ''

  const [counts, setCounts] = useState<{ orders: number | null; saved: number | null; cart: number | null }>({
    orders: null,
    saved: null,
    cart: null,
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!token || status !== 'authenticated') {
      router.replace('/login')
      return
    }

    let alive = true

    const loadOrders = async () => {
      if (!userId) return null
      try {
        const res = await fetch(ORDERS_API(userId), {
          headers: { token, Authorization: `Bearer ${token}` },
          cache: 'no-store',
        })
        if (!res.ok) return null
        const json = await res.json().catch(() => null)
        const raw = json?.data ?? json?.orders ?? json ?? []
        return Array.isArray(raw) ? raw.length : null
      } catch {
        return null
      }
    }

    const loadCart = async () => {
      try {
        const cart = await getCart(token)
        const products = cart?.products ?? []
        return Array.isArray(products)
          ? products.reduce((s: number, i: { count?: number }) => s + (i?.count ?? 0), 0)
          : null
      } catch {
        return null
      }
    }

    Promise.all([
      loadOrders(),
      getWishlist(token).then((i) => i.length).catch(() => null),
      loadCart(),
    ]).then(([orders, saved, cart]) => {
      if (alive) setCounts({ orders, saved, cart })
    })

    return () => {
      alive = false
    }
  }, [status, token, userId, router])

  const name = session?.user?.name ?? 'there'
  const email = session?.user?.email ?? ''

  const tiles = [
    { label: 'Orders', value: counts.orders, href: '/orders', cta: 'View orders' },
    { label: 'Saved items', value: counts.saved, href: '/wishlist', cta: 'View saved' },
    { label: 'In your cart', value: counts.cart, href: '/cart', cta: 'View cart' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <section className="bento p-8 sm:p-10">
        <span className="label text-ink-muted">Signed in as</span>
        <h1 className="font-display-lg mt-3 text-[clamp(26px,3.6vw,40px)]">
          Hello, <span className="gold-text">{name}</span>
        </h1>
        {email && <p className="mt-3 text-[15px] font-light text-ink-muted">{email}</p>}
      </section>

      <section aria-label="Account summary" className="grid gap-5 sm:grid-cols-3">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href} className="bento bento-hover group flex flex-col p-6">
            <span className="label text-ink-muted">{t.label}</span>
            <span className="font-display tabular mt-4 text-[38px] font-semibold leading-none">
              {t.value === null ? (
                <span className="inline-block h-9 w-12 animate-pulse rounded-[8px] bg-sunk align-middle" />
              ) : (
                t.value
              )}
            </span>
            <span className="label mt-auto flex items-center gap-2 pt-6 text-gold">
              {t.cta}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                aria-hidden="true"
                className="h-3 w-3 transition-transform duration-[280ms] ease-[var(--ease-hover)] group-hover:translate-x-1"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </Link>
        ))}
      </section>

      <section className="bento p-8">
        <h2 className="font-display text-lg">Manage your account</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/profile/settings"
            className="flex items-center justify-between rounded-[16px] border border-line px-5 py-4 text-[14.5px] transition-colors duration-[280ms] ease-[var(--ease-hover)] hover:border-gold hover:text-gold"
          >
            Profile &amp; password
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="h-4 w-4">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
          <Link
            href="/profile/addresses"
            className="flex items-center justify-between rounded-[16px] border border-line px-5 py-4 text-[14.5px] transition-colors duration-[280ms] ease-[var(--ease-hover)] hover:border-gold hover:text-gold"
          >
            Addresses
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="h-4 w-4">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  )
}
