'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Spinner } from '@/component/ui/Spinner'
import { addToCart as apiAddToCart, getCart, notifyCartUpdate, updateCartQuantity } from '@/lib/cart'

type CartQuantityProps = {
  productId: string
  max: number
  price: number
  discounted?: number
}

type CartProductEntry = {
  count?: number
  product?: {
    _id?: string
    id?: string
  }
  productId?: string
}

export default function CartQuantity({ productId, max, price, discounted }: CartQuantityProps) {
  const { data: session } = useSession()
  const token = session?.accessToken ?? null
  const [count, setCount] = useState(1)
  const [inCart, setInCart] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const maxCount = Math.max(1, max)
  const inStock = max > 0
  const unitPrice = discounted && discounted < price ? discounted : price
  const total = unitPrice * count

  useEffect(() => {
    if (!token || !productId) {
      setCount(1)
      setInCart(false)
      return
    }

    let active = true

    const loadCount = async () => {
      try {
        const cart = await getCart(token).catch(() => null)
        const items = Array.isArray(cart?.products)
          ? (cart.products as CartProductEntry[])
          : []
        const match = items.find((item) => {
          const id = item?.product?._id ?? item?.product?.id ?? item?.productId
          return id === productId
        })
        if (!active) return
        if (match?.count) {
          setCount(match.count)
        } else {
          setCount(1)
        }
        setInCart(Boolean(match))
      } catch {
        if (active) {
          setCount(1)
          setInCart(false)
        }
      }
    }

    loadCount()
    window.addEventListener('cartUpdated', loadCount)

    return () => {
      window.removeEventListener('cartUpdated', loadCount)
      active = false
    }
  }, [token, productId])

  const updateCount = async (nextCount: number) => {
    if (!inStock) return
    if (nextCount < 1 || nextCount > maxCount) return

    if (!token) {
      setError('Please login first')
      return
    }

    setLoading(true)
    setError('')

    try {
      if (!inCart) {
        await apiAddToCart(productId, token)
        setInCart(true)
      }

      if (nextCount !== count || !inCart) {
        await updateCartQuantity(productId, nextCount, token)
      }

      setCount(nextCount)
      notifyCartUpdate()
    } catch {
      setError('Failed to update cart')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mb-6">
        <label className="block text-sm font-medium text-ink-soft mb-2">Quantity</label>
        <div className="flex items-center gap-4">
          <div className="flex items-center border-2 border-line rounded-lg overflow-hidden">
            <button
              className="px-4 py-3 text-ink-muted hover:bg-sunk hover:text-success transition disabled:opacity-50 cursor-pointer"
              type="button"
              onClick={() => updateCount(count - 1)}
              disabled={loading || !inStock || count <= 1}
            >
              {loading ? (
                <Spinner className="text-ink-muted" />
              ) : (
                <svg className="h-3 w-3" role="img" viewBox="0 0 448 512" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32z"
                  />
                </svg>
              )}
            </button>
            <input
              min={1}
              max={maxCount}
              className="w-16 text-center border-0 focus:ring-0 focus:outline-none text-lg font-medium"
              type="number"
              value={count}
              readOnly
            />
            <button
              className="px-4 py-3 text-ink-muted hover:bg-sunk hover:text-success transition disabled:opacity-50 cursor-pointer"
              type="button"
              onClick={() => updateCount(count + 1)}
              disabled={loading || !inStock || count >= maxCount}
            >
              {loading ? (
                <Spinner className="text-ink-muted" />
              ) : (
                <svg className="h-3 w-3" role="img" viewBox="0 0 448 512" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M256 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 160-160 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l160 0 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160 160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-160 0 0-160z"
                  />
                </svg>
              )}
            </button>
          </div>
          <span className="text-sm text-ink-muted">{max} available</span>
        </div>
        {error && <p className="text-xs text-danger mt-2">{error}</p>}
      </div>

      <div className="bg-sunk rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-ink-muted">Total Price:</span>
          <span className="text-2xl font-bold text-success">{total} EGP</span>
        </div>
      </div>
    </>
  )
}
