import type { FormEvent } from 'react'
import Link from 'next/link'

type SessionStatus = 'authenticated' | 'unauthenticated' | 'loading'

export default function MobileMenu({
  open,
  onClose,
  status,
  displayName,
  wishlistCount,
  cartCount,
  onSignOut,
  onSearchSubmit,
}: {
  open: boolean
  onClose: () => void
  status: SessionStatus
  displayName: string
  wishlistCount: number
  cartCount: number
  onSignOut: () => void
  onSearchSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden={!open}
    >
      <button
        className="absolute inset-0 bg-black/50"
        aria-label="Close menu overlay"
        type="button"
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 overflow-y-auto ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-4 border-b border-line-soft bg-sunk/50">
          <span className="text-2xl font-bold tracking-tight text-ink">
            Souq<span className="text-gold">ly</span>
          </span>
          <button
            className="w-9 h-9 rounded-full bg-sunk hover:bg-line flex items-center justify-center transition-colors"
            type="button"
            aria-label="Close menu"
            onClick={onClose}
          >
            <svg data-prefix="fas" data-icon="xmark" className="svg-inline--fa fa-xmark text-ink-muted" role="img" viewBox="0 0 384 512" aria-hidden="true">
              <path fill="currentColor" d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z" />
            </svg>
          </button>
        </div>

        <form className="p-4 border-b border-line-soft" onSubmit={(event) => { onSearchSubmit(event); onClose() }}>
          <div className="relative">
            <input
              type="text"
              name="keyword"
              placeholder="Search products..."
              className="w-full px-4 py-3 pr-12 rounded-[16px] border border-line bg-sunk focus:bg-card focus:outline-none focus:border-gold transition-colors duration-400 text-sm"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-vault text-white flex items-center justify-center">
              <svg data-prefix="fas" data-icon="magnifying-glass" className="svg-inline--fa fa-magnifying-glass text-sm" role="img" viewBox="0 0 512 512" aria-hidden="true">
                <path fill="currentColor" d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376C296.3 401.1 253.9 416 208 416 93.1 416 0 322.9 0 208S93.1 0 208 0 416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
              </svg>
            </button>
          </div>
        </form>

        <nav className="p-4">
          <div className="space-y-1">
            <Link className="flex items-center gap-3 px-4 py-3 rounded-[16px] font-medium text-ink hover:text-gold hover:bg-sunk transition-colors" href="/" onClick={onClose}>
              Home
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-[16px] font-medium text-ink hover:text-gold hover:bg-sunk transition-colors" href="/products" onClick={onClose}>
              Shop
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-[16px] font-medium text-ink hover:text-gold hover:bg-sunk transition-colors" href="/categories" onClick={onClose}>
              Categories
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded-[16px] font-medium text-ink hover:text-gold hover:bg-sunk transition-colors" href="/brand" onClick={onClose}>
              Brands
            </Link>
          </div>
        </nav>

        <div className="mx-4 border-t border-line-soft" />

        <div className="p-4 space-y-1">
          <Link className="flex items-center justify-between px-4 py-3 rounded-[16px] hover:bg-sunk transition-colors" href="/wishlist" onClick={onClose}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
                <svg data-prefix="far" data-icon="heart" className="svg-inline--fa fa-heart text-red-500" role="img" viewBox="0 0 512 512" aria-hidden="true">
                  <path fill="currentColor" d="M378.9 80c-27.3 0-53 13.1-69 35.2l-34.4 47.6c-4.5 6.2-11.7 9.9-19.4 9.9s-14.9-3.7-19.4-9.9l-34.4-47.6c-16-22.1-41.7-35.2-69-35.2-47 0-85.1 38.1-85.1 85.1 0 49.9 32 98.4 68.1 142.3 41.1 50 91.4 94 125.9 120.3 3.2 2.4 7.9 4.2 14 4.2s10.8-1.8 14-4.2c34.5-26.3 84.8-70.4 125.9-120.3 36.2-43.9 68.1-92.4 68.1-142.3 0-47-38.1-85.1-85.1-85.1zM271 87.1c25-34.6 65.2-55.1 107.9-55.1 73.5 0 133.1 59.6 133.1 133.1 0 68.6-42.9 128.9-79.1 172.8-44.1 53.6-97.3 100.1-133.8 127.9-12.3 9.4-27.5 14.1-43.1 14.1s-30.8-4.7-43.1-14.1C176.4 438 123.2 391.5 79.1 338 42.9 294.1 0 233.7 0 165.1 0 91.6 59.6 32 133.1 32 175.8 32 216 52.5 241 87.1l15 20.7 15-20.7z" />
                </svg>
              </div>
              <span className="font-medium text-ink">Wishlist</span>
            </div>
            {wishlistCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {wishlistCount > 9 ? '9+' : wishlistCount}
              </span>
            )}
          </Link>
          <Link className="flex items-center justify-between px-4 py-3 rounded-[16px] hover:bg-sunk transition-colors" href="/cart" onClick={onClose}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-sunk flex items-center justify-center">
                <svg data-prefix="fas" data-icon="cart-shopping" className="svg-inline--fa fa-cart-shopping text-gold" role="img" viewBox="0 0 640 512" aria-hidden="true">
                  <path fill="currentColor" d="M24-16C10.7-16 0-5.3 0 8S10.7 32 24 32l45.3 0c3.9 0 7.2 2.8 7.9 6.6l52.1 286.3c6.2 34.2 36 59.1 70.8 59.1L456 384c13.3 0 24-10.7 24-24s-10.7-24-24-24l-255.9 0c-11.6 0-21.5-8.3-23.6-19.7l-5.1-28.3 303.6 0c30.8 0 57.2-21.9 62.9-52.2L568.9 69.9C572.6 50.2 557.5 32 537.4 32l-412.7 0-.4-2c-4.8-26.6-28-46-55.1-46L24-16zM208 512a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm224 0a48 48 0 1 0 0-96 48 48 0 1 0 0 96z" />
                </svg>
              </div>
              <span className="font-medium text-ink">Cart</span>
            </div>
            {cartCount > 0 && (
              <span className="bg-vault text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>
        </div>

        <div className="mx-4 border-t border-line-soft" />

        <div className="p-4 space-y-1">
          {status === 'authenticated' ? (
            <>
              <Link
                className="flex items-center gap-3 px-4 py-3 rounded-[16px] hover:bg-sunk transition-colors"
                href="/profile/addresses"
                onClick={onClose}
              >
                <div className="w-9 h-9 rounded-full bg-sunk flex items-center justify-center">
                  <svg data-prefix="far" data-icon="user" className="svg-inline--fa fa-user text-ink-muted" role="img" viewBox="0 0 448 512" aria-hidden="true">
                    <path fill="currentColor" d="M144 128a80 80 0 1 1 160 0 80 80 0 1 1 -160 0zm208 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0zM48 480c0-70.7 57.3-128 128-128l96 0c70.7 0 128 57.3 128 128l0 8c0 13.3 10.7 24 24 24s24-10.7 24-24l0-8c0-97.2-78.8-176-176-176l-96 0C78.8 304 0 382.8 0 480l0 8c0 13.3 10.7 24 24 24s24-10.7 24-24l0-8z" />
                  </svg>
                </div>
                <span className="font-medium text-ink">{displayName}</span>
              </Link>
              <button
                className="flex items-center gap-3 px-4 py-3 rounded-[16px] hover:bg-red-50 transition-colors w-full text-left"
                type="button"
                onClick={onSignOut}
              >
                <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
                  <svg data-prefix="fas" data-icon="right-from-bracket" className="svg-inline--fa fa-right-from-bracket text-red-500" role="img" viewBox="0 0 512 512" aria-hidden="true">
                    <path fill="currentColor" d="M505 273c9.4-9.4 9.4-24.6 0-33.9L361 95c-6.9-6.9-17.2-8.9-26.2-5.2S320 102.3 320 112l0 80-112 0c-26.5 0-48 21.5-48 48l0 32c0 26.5 21.5 48 48 48l112 0 0 80c0 9.7 5.8 18.5 14.8 22.2s19.3 1.7 26.2-5.2L505 273zM160 96c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 32C43 32 0 75 0 128L0 384c0 53 43 96 96 96l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l64 0z" />
                  </svg>
                </div>
                <span className="font-medium text-red-600">Sign Out</span>
              </button>
            </>
          ) : (
            <Link
              className="flex items-center gap-3 px-4 py-3 rounded-[16px] hover:bg-sunk transition-colors"
              href="/login"
              onClick={onClose}
            >
              <div className="w-9 h-9 rounded-full bg-sunk flex items-center justify-center">
                <svg data-prefix="far" data-icon="user" className="svg-inline--fa fa-user text-ink-muted" role="img" viewBox="0 0 448 512" aria-hidden="true">
                  <path fill="currentColor" d="M144 128a80 80 0 1 1 160 0 80 80 0 1 1 -160 0zm208 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0zM48 480c0-70.7 57.3-128 128-128l96 0c70.7 0 128 57.3 128 128l0 8c0 13.3 10.7 24 24 24s24-10.7 24-24l0-8c0-97.2-78.8-176-176-176l-96 0C78.8 304 0 382.8 0 480l0 8c0 13.3 10.7 24 24 24s24-10.7 24-24l0-8z" />
                </svg>
              </div>
              <span className="font-medium text-ink">Sign In</span>
            </Link>
          )}
        </div>

        <a
          className="mx-4 mt-2 p-4 rounded-[16px] bg-sunk border border-line-soft flex items-center gap-3 hover:bg-sunk transition-colors"
          href="tel:+18001234567"
          onClick={onClose}
        >
          <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
            <svg data-prefix="fas" data-icon="headset" className="svg-inline--fa fa-headset text-gold" role="img" viewBox="0 0 448 512" aria-hidden="true">
              <path fill="currentColor" d="M224 64c-79 0-144.7 57.3-157.7 132.7 9.3-3 19.3-4.7 29.7-4.7l16 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-16 0c-53 0-96-43-96-96l0-64C0 100.3 100.3 0 224 0S448 100.3 448 224l0 168.1c0 66.3-53.8 120-120.1 120l-87.9-.1-32 0c-26.5 0-48-21.5-48-48s21.5-48 48-48l32 0c26.5 0 48 21.5 48 48l0 0 40 0c39.8 0 72-32.2 72-72l0-20.9c-14.1 8.2-30.5 12.8-48 12.8l-16 0c-26.5 0-48-21.5-48-48l0-96c0-26.5 21.5-48 48-48l16 0c10.4 0 20.3 1.6 29.7 4.7-13-75.3-78.6-132.7-157.7-132.7z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-ink">Need Help?</div>
            <div className="text-sm text-gold">Contact Support</div>
          </div>
        </a>
      </div>
    </div>
  )
}
