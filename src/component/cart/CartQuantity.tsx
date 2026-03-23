'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Spinner } from '@/component/ui/Spinner'

const CART_API = 'https://ecommerce.routemisr.com/api/v2/cart'

function notifyCartUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cartUpdated'))
  }
}

type CartQuantityProps = {
  productId: string
  max: number
  price: number
  discounted?: number
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
        const res = await fetch(CART_API, {
          headers: {
            token,
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-store',
          },
          cache: 'no-store',
        })
        if (!res.ok) return
        const json = await res.json().catch(() => null)
        const items = json?.data?.products ?? []
        const match = items.find((item: any) => {
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
    return () => {
      active = false
    }
  }, [token, productId])

  const addToCart = async () => {
    const res = await fetch(CART_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token: token ?? '',
        Authorization: `Bearer ${token ?? ''}`,
      },
      body: JSON.stringify({ productId }),
    })

    if (!res.ok) {
      throw new Error('Failed to add to cart')
    }
  }

  const updateRemoteCount = async (nextCount: number) => {
    const res = await fetch(`${CART_API}/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        token: token ?? '',
        Authorization: `Bearer ${token ?? ''}`,
      },
      body: JSON.stringify({ count: nextCount }),
    })

    if (!res.ok) {
      throw new Error('Failed to update cart')
    }
  }

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
        await addToCart()
        setInCart(true)
      }

      if (nextCount !== count || !inCart) {
        await updateRemoteCount(nextCount)
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
        <div className="flex items-center gap-4">
          <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
            <button
              className="px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-green-600 transition disabled:opacity-50 cursor-pointer"
              type="button"
              onClick={() => updateCount(count - 1)}
              disabled={loading || !inStock || count <= 1}
            >
              {loading ? (
                <Spinner className="text-gray-500" />
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
              className="px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-green-600 transition disabled:opacity-50 cursor-pointer"
              type="button"
              onClick={() => updateCount(count + 1)}
              disabled={loading || !inStock || count >= maxCount}
            >
              {loading ? (
                <Spinner className="text-gray-500" />
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
          <span className="text-sm text-gray-500">{max} available</span>
        </div>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Price:</span>
          <span className="text-2xl font-bold text-green-600">{total} EGP</span>
        </div>
      </div>
    </>
  )
}
