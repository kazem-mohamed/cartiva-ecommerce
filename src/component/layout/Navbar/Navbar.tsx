'use client'

import { type FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { getCart } from '@/lib/cart'
import { getWishlist } from '@/lib/wishlist'
import { CartivaMark } from '@/component/brand/CartivaMark'
import AccountMenu from './AccountMenu'
import MobileMenu from './MobileMenu'

/**
 * Header — one bar, not two.
 *
 * The utility strip that used to sit above this was removed: it showed a
 * location label and sign-in links that the account menu already provides,
 * costing ~44px of every page for a duplicate. It also carried a support
 * phone number and a "24/7 Help" promise, neither of which this build can
 * keep — the same fabricated-claim problem as the old footer.
 *
 * Added per the engine's navigation rules, all previously missing:
 *   · Active State — the current section is marked, not guessed at
 *   · Skip Links   — a keyboard route past the nav to main content
 *   · Sticky nav that never overlaps the first section
 */

const USERS_API = 'https://ecommerce.routemisr.com/api/v1/users'

type ApiUser = { name?: string; email?: string }

const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/products' },
  { label: 'Departments', href: '/categories' },
  { label: 'Brands', href: '/brand' },
]

function pickUserName(user?: ApiUser | null) {
  return user?.name ?? 'Account'
}
function pickUserEmail(user?: ApiUser | null) {
  return user?.email ?? ''
}

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const token = session?.accessToken ?? ''
  const [profile, setProfile] = useState<ApiUser | null>(null)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [cartCount, setCartCount] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const keyword = String(formData.get('keyword') ?? '').trim()
    const params = new URLSearchParams()
    if (keyword) params.set('keyword', keyword)
    router.push(params.toString() ? `/search?${params.toString()}` : '/search')
  }

  useEffect(() => {
    if (status !== 'authenticated' || !token) {
      setProfile(null)
      return
    }
    let active = true
    const loadProfile = async () => {
      try {
        const res = await fetch(USERS_API, { headers: { token } })
        if (!res.ok) return
        const json = await res.json().catch(() => null)
        const data =
          json?.data?.user ?? json?.data ?? json?.user ?? (Array.isArray(json?.data) ? json.data[0] : null)
        const nextName = data?.name ?? data?.firstName ?? data?.lastName
        const nextEmail = data?.email
        if (active && (nextName || nextEmail)) setProfile({ name: nextName, email: nextEmail })
      } catch {
        if (active) setProfile(null)
      }
    }
    loadProfile()
    return () => {
      active = false
    }
  }, [status, token])

  useEffect(() => {
    if (status !== 'authenticated' || !token) {
      setWishlistCount(0)
      return
    }
    let active = true
    const loadWishlistCount = async () => {
      try {
        const items = await getWishlist(token)
        if (active) setWishlistCount(items.length)
      } catch {
        if (active) setWishlistCount(0)
      }
    }
    loadWishlistCount()
    const handleWishlistUpdate = () => loadWishlistCount()
    window.addEventListener('wishlistUpdated', handleWishlistUpdate)
    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate)
      active = false
    }
  }, [status, token])

  useEffect(() => {
    if (status !== 'authenticated' || !token) {
      setCartCount(0)
      return
    }
    let active = true
    const loadCartCount = async () => {
      try {
        const cart = await getCart(token)
        const products = cart?.products ?? []
        const count = Array.isArray(products)
          ? products.reduce((sum: number, item: { count?: number }) => sum + (item?.count ?? 0), 0)
          : 0
        if (active) setCartCount(count)
      } catch {
        if (active) setCartCount(0)
      }
    }
    loadCartCount()
    const handleCartUpdate = () => loadCartCount()
    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
      active = false
    }
  }, [status, token])

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])


  const displayName =
    profile?.name ?? session?.user?.name ?? session?.user?.email ?? pickUserName(profile ?? null)
  const displayEmail = profile?.email ?? session?.user?.email ?? pickUserEmail(profile ?? null)

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false })
    } catch {
      toast.error('Sign out failed. Please try again.')
      return
    }
    toast.success('Signed out successfully')
    setMobileOpen(false)
    router.push('/login')
  }

  /** A section is current if the path is it, or sits beneath it. */
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)

  const iconLink = (
    href: string,
    label: string,
    count: number,
    path: React.ReactNode,
  ) => {
    const active = isActive(href)
    return (
      <Link
        href={href}
        aria-label={count > 0 ? `${label}, ${count} item${count === 1 ? '' : 's'}` : label}
        aria-current={active ? 'page' : undefined}
        className={`relative grid h-11 w-11 place-items-center rounded-full transition-colors duration-[280ms] ease-[var(--ease-hover)] ${
          active ? 'bg-sunk text-gold' : 'text-ink-muted hover:bg-sunk hover:text-gold'
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-[19px] w-[19px]">
          {path}
        </svg>
        {count > 0 && (
          <span className="tabular absolute -top-0.5 -right-0.5 grid h-[19px] min-w-[19px] place-items-center rounded-full bg-gold px-1 text-[10px] font-semibold text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </Link>
    )
  }

  return (
    <>
      {/* Engine UX rule: Skip Links on nav-heavy pages. */}
      <a href="#main" className="skip-link label">
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-line-soft bg-page/85 backdrop-blur-md">
        <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8">
          <div className="flex h-[72px] items-center gap-4 lg:gap-8">
            <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Cartiva">
              <CartivaMark size={30} />
              <span className="font-display-lg text-[21px] lg:text-[23px]">Cartiva</span>
            </Link>

            {/* Primary nav — active section is marked, per the engine. */}
            <nav aria-label="Primary" className="hidden xl:block">
              <ul className="flex items-center gap-1">
                {NAV.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={`relative inline-block rounded-full px-4 py-2.5 text-[14.5px] transition-colors duration-[280ms] ease-[var(--ease-hover)] ${
                          active ? 'text-gold' : 'text-ink hover:text-gold'
                        }`}
                      >
                        {item.label}
                        <span
                          aria-hidden="true"
                          className={`absolute inset-x-4 -bottom-px h-px origin-left bg-gold transition-transform duration-[280ms] ease-[var(--ease-hover)] ${
                            active ? 'scale-x-100' : 'scale-x-0'
                          }`}
                        />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <form onSubmit={handleSearchSubmit} role="search" className="hidden flex-1 lg:block">
              <label htmlFor="nav-search" className="sr-only">
                Search products
              </label>
              <div className="relative">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="pointer-events-none absolute left-5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-muted"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  id="nav-search"
                  name="keyword"
                  type="search"
                  placeholder="Search the catalogue"
                  className="w-full rounded-full border border-line bg-sunk py-3.5 pl-[52px] pr-14 text-sm transition-colors duration-[280ms] focus:border-gold focus:bg-card focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-vault text-white transition-transform duration-[280ms] ease-[var(--ease-hover)] hover:scale-105"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </div>
            </form>

            <div className="ml-auto flex items-center gap-1 lg:ml-0 lg:gap-1.5">
              {iconLink(
                '/wishlist',
                'Saved items',
                wishlistCount,
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8Z" />,
              )}
              {iconLink(
                '/cart',
                'Cart',
                cartCount,
                <>
                  <path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6" />
                  <circle cx="10" cy="20" r="1" />
                  <circle cx="18" cy="20" r="1" />
                </>,
              )}

              <AccountMenu
                status={status}
                displayName={displayName}
                displayEmail={displayEmail}
                onSignOut={handleSignOut}
              />

              <button
                className="grid h-11 w-11 place-items-center rounded-full bg-vault text-white transition-transform duration-[280ms] ease-[var(--ease-hover)] hover:scale-105 xl:hidden"
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen(true)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[18px] w-[18px]">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </button>
            </div>
          </div>

        </div>
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        status={status}
        displayName={displayName}
        wishlistCount={wishlistCount}
        cartCount={cartCount}
        onSignOut={handleSignOut}
        onSearchSubmit={handleSearchSubmit}
      />
    </>
  )
}
