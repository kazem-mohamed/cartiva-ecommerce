'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Spinner } from '@/component/ui/Spinner'

const API_URL = 'https://ecommerce.routemisr.com/api/v1/wishlist'

function notifyWishlistUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('wishlistUpdated'))
  }
}

async function getWishlist(token: string) {
  const res = await fetch(API_URL, {
    headers: { token },
  })

  if (!res.ok) {
    throw new Error('Failed to load wishlist')
  }

  const json = await res.json()
  return (json.data as Array<{ _id: string }> | undefined) ?? []
}

async function addToWishlist(productId: string, token: string) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      token,
    },
    body: JSON.stringify({ productId }),
  })

  if (!res.ok) {
    throw new Error('Failed to add to wishlist')
  }
}

async function removeFromWishlist(productId: string, token: string) {
  const res = await fetch(`${API_URL}/${productId}`, {
    method: 'DELETE',
    headers: { token },
  })

  if (!res.ok) {
    throw new Error('Failed to remove from wishlist')
  }
}

type WishlistButtonProps = {
  productId: string
  variant?: 'full' | 'icon'
  showError?: boolean
}

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
        className={`bg-white h-8 w-8 rounded-full flex items-center justify-center transition shadow-sm cursor-pointer ${
          inWishlist ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
        } disabled:opacity-60`}
        title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        type="button"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? (
          <Spinner />
        ) : (
          <svg className="h-4 w-4" role="img" viewBox="0 0 512 512" aria-hidden="true">
            <path
              fill="currentColor"
              d={
                inWishlist
                  ? 'M241 87.1l15 20.7 15-20.7C296 52.5 336.2 32 378.9 32 452.4 32 512 91.6 512 165.1l0 2.6c0 112.2-139.9 242.5-212.9 298.2-12.4 9.4-27.6 14.1-43.1 14.1s-30.8-4.6-43.1-14.1C139.9 410.2 0 279.9 0 167.7l0-2.6C0 91.6 59.6 32 133.1 32 175.8 32 216 52.5 241 87.1z'
                  : 'M378.9 80c-27.3 0-53 13.1-69 35.2l-34.4 47.6c-4.5 6.2-11.7 9.9-19.4 9.9s-14.9-3.7-19.4-9.9l-34.4-47.6c-16-22.1-41.7-35.2-69-35.2-47 0-85.1 38.1-85.1 85.1 0 49.9 32 98.4 68.1 142.3 41.1 50 91.4 94 125.9 120.3 3.2 2.4 7.9 4.2 14 4.2s10.8-1.8 14-4.2c34.5-26.3 84.8-70.4 125.9-120.3 36.2-43.9 68.1-92.4 68.1-142.3 0-47-38.1-85.1-85.1-85.1z'
              }
            />
          </svg>
        )}
      </button>
        {shouldShowError && error && <p className="text-[10px] text-red-500">{error}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 flex-1">
      <button
        className={`flex-1 border-2 py-3 px-4 rounded-xl font-medium transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer ${
          inWishlist
            ? 'border-red-200 text-red-600 bg-red-50'
            : 'border-gray-200 text-gray-700 hover:border-primary-300 hover:text-primary-600'
        }`}
        type="button"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? (
          <Spinner />
        ) : (
          <svg className="h-4 w-4" role="img" viewBox="0 0 512 512" aria-hidden="true">
            <path
              fill="currentColor"
              d={
                inWishlist
                  ? 'M241 87.1l15 20.7 15-20.7C296 52.5 336.2 32 378.9 32 452.4 32 512 91.6 512 165.1l0 2.6c0 112.2-139.9 242.5-212.9 298.2-12.4 9.4-27.6 14.1-43.1 14.1s-30.8-4.6-43.1-14.1C139.9 410.2 0 279.9 0 167.7l0-2.6C0 91.6 59.6 32 133.1 32 175.8 32 216 52.5 241 87.1z'
                  : 'M378.9 80c-27.3 0-53 13.1-69 35.2l-34.4 47.6c-4.5 6.2-11.7 9.9-19.4 9.9s-14.9-3.7-19.4-9.9l-34.4-47.6c-16-22.1-41.7-35.2-69-35.2-47 0-85.1 38.1-85.1 85.1 0 49.9 32 98.4 68.1 142.3 41.1 50 91.4 94 125.9 120.3 3.2 2.4 7.9 4.2 14 4.2s10.8-1.8 14-4.2c34.5-26.3 84.8-70.4 125.9-120.3 36.2-43.9 68.1-92.4 68.1-142.3 0-47-38.1-85.1-85.1-85.1z'
              }
            />
          </svg>
        )}
        {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
      </button>
      {shouldShowError && error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
