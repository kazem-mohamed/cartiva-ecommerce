'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { addToWishlist, getWishlist, notifyWishlistUpdate, removeFromWishlist } from '@/lib/wishlist'

type WishlistButtonProps = {
  productId: string
  variant?: 'full' | 'icon'
  showError?: boolean
}

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.4" className="h-4 w-4">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8Z" />
  </svg>
)

export default function WishlistButton({
  productId,
  variant = 'full',
  showError,
}: WishlistButtonProps) {
  const { data: session, status } = useSession()
  const token = session?.accessToken ?? null
  const [loading, setLoading] = useState(false)
  const [inWishlist, setInWishlist] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status !== 'authenticated' || !token) {
      setInWishlist(false)
      return
    }

    getWishlist(token)
      .then((items) => {
        const exists = items.some((item) => item._id === productId)
        setInWishlist(exists)
      })
      .catch(() => {
        setError('Unable to load wishlist')
      })
  }, [productId, status, token])

  const handleClick = async () => {
    if (!token) {
      setError('Please login first')
      return
    }

    setLoading(true)
    setError('')

    try {
      if (inWishlist) {
        await removeFromWishlist(productId, token)
        setInWishlist(false)
        notifyWishlistUpdate()
      } else {
        await addToWishlist(productId, token)
        setInWishlist(true)
        notifyWishlistUpdate()
      }
    } catch {
      setError('Wishlist action failed')
    } finally {
      setLoading(false)
    }
  }

  const shouldShowError = showError ?? variant === 'full'

  if (variant === 'icon') {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          className={`grid h-11 w-11 place-items-center rounded-full bg-white/90 backdrop-blur-sm shadow-[0_2px_6px_rgba(12,10,9,0.08)] transition-colors duration-400 disabled:opacity-50 ${
            inWishlist ? 'text-gold' : 'text-ink-muted hover:text-gold'
          }`}
          title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          type="button"
          onClick={handleClick}
          disabled={loading}
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border border-current border-r-transparent" />
          ) : (
            <HeartIcon filled={inWishlist} />
          )}
        </button>
        {shouldShowError && error && <p className="text-[10px] text-danger">{error}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-2">
      <button
        className={`flex flex-1 items-center justify-center gap-2 rounded-full border py-3 px-5 text-[13.5px] font-medium transition-colors duration-400 disabled:opacity-60 ${
          inWishlist
            ? 'border-gold bg-gold/10 text-gold-deep'
            : 'border-line text-ink hover:border-gold hover:text-gold'
        }`}
        type="button"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border border-current border-r-transparent" />
        ) : (
          <HeartIcon filled={inWishlist} />
        )}
        {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
      </button>
      {shouldShowError && error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
