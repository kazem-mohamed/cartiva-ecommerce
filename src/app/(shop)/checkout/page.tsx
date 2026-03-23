'use client'

import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Spinner } from '@/component/ui/Spinner'

const CART_API = 'https://ecommerce.routemisr.com/api/v2/cart'
const CASH_ORDER_API = (cartId: string) => `https://ecommerce.routemisr.com/api/v1/orders/${cartId}`
const CHECKOUT_SESSION_API = (cartId: string, url: string) =>
  `https://ecommerce.routemisr.com/api/v1/orders/checkout-session/${cartId}?url=${encodeURIComponent(url)}`

type CartProduct = {
  product?: {
    _id?: string
    title?: string
    imageCover?: string
    price?: number
  }
  count?: number
  price?: number
}

type Cart = {
  _id?: string
  id?: string
  products?: CartProduct[]
  totalCartPrice?: number
  totalAfterDiscount?: number
}

type PaymentMethod = 'cash' | 'card'

type ShippingAddress = {
  city: string
  details: string
  phone: string
}

const INITIAL_ADDRESS: ShippingAddress = {
  city: '',
  details: '',
  phone: '',
}

const SHIPPING_COST = 50

const getErrorMessage = async (res: Response, fallback: string) => {
  const data = await res.json().catch(() => null)
  if (!data) return fallback
  return data?.message ?? data?.error ?? fallback
}

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const token = session?.accessToken ?? ''

  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [address, setAddress] = useState<ShippingAddress>(INITIAL_ADDRESS)

  const items = useMemo(() => cart?.products ?? [], [cart])
  const subtotal = cart?.totalCartPrice ?? 0
  const totalAfterDiscount = cart?.totalAfterDiscount ?? subtotal
  const grandTotal = totalAfterDiscount + SHIPPING_COST

  useEffect(() => {
    if (status === 'loading') return
    if (!token || status !== 'authenticated') {
      setLoading(false)
      router.replace('/login')
      return
    }

    const loadCart = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await fetch(CART_API, {
          headers: {
            token,
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-store',
          },
          cache: 'no-store',
        })

        if (!res.ok) {
          throw new Error('Failed to load cart')
        }

        const json = await res.json().catch(() => null)
        setCart(json?.data ?? null)
      } catch {
        setError('Unable to load your cart right now.')
        setCart(null)
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [status, token, router])

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }))
  }

  const validateAddress = () => {
    if (!address.city.trim()) return 'City is required.'
    if (!address.details.trim()) return 'Street address is required.'
    if (!address.phone.trim()) return 'Phone number is required.'
    return ''
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (submitting) return

    const cartId = cart?._id ?? cart?.id
    if (!cartId) {
      toast.error('Your cart is not ready yet.')
      return
    }

    const validationError = validateAddress()
    if (validationError) {
      toast.error(validationError)
      return
    }

    if (!token) {
      toast.error('Please login first.')
      return
    }

    setSubmitting(true)
    try {
      if (paymentMethod === 'cash') {
        const res = await fetch(CASH_ORDER_API(cartId), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            token,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ shippingAddress: address }),
        })

        if (!res.ok) {
          const message = await getErrorMessage(res, 'Failed to place cash order.')
          throw new Error(message)
        }

        await res.json().catch(() => null)
        toast.success('Cash order placed successfully.')
        return
      }
      const returnUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
      const res = await fetch(CHECKOUT_SESSION_API(cartId, returnUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shippingAddress: address }),
      })

      if (!res.ok) {
        const message = await getErrorMessage(res, 'Failed to start payment session.')
        throw new Error(message)
      }

      const json = await res.json().catch(() => null)
      const sessionUrl = json?.session?.url ?? json?.data?.session?.url ?? json?.url
      if (sessionUrl) {
        window.location.href = sessionUrl
        return
      }

      toast.success('Payment session created. Check the response below.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Checkout failed.'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen py-10">
        <div className="container mx-auto px-4">
          <p className="text-gray-500">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add items to your cart before checking out.</p>
          <Link
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all"
            href="/"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link className="hover:text-primary-600 transition" href="/">
              Home
            </Link>
            <span className="text-gray-300">/</span>
            <Link className="hover:text-primary-600 transition" href="/cart">
              Cart
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">Checkout</span>
          </nav>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="bg-gradient-to-br from-primary-600 to-primary-700 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/20">
                  {/* Receipt icon */}
                  <svg className="h-5 w-5" role="img" viewBox="0 0 384 512" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M14 2.2C22.5-1.7 32.5-.3 39.6 5.8L80 40.4 120.4 5.8c9-7.7 22.3-7.7 31.2 0L192 40.4 232.4 5.8c9-7.7 22.2-7.7 31.2 0L304 40.4 344.4 5.8c7.1-6.1 17.1-7.5 25.6-3.6S384 14.6 384 24l0 464c0 9.4-5.5 17.9-14 21.8s-18.5 2.5-25.6-3.6l-40.4-34.6-40.4 34.6c-9 7.7-22.2 7.7-31.2 0l-40.4-34.6-40.4 34.6c-9 7.7-22.3 7.7-31.2 0L80 471.6 39.6 506.2c-7.1 6.1-17.1 7.5-25.6 3.6S0 497.4 0 488L0 24C0 14.6 5.5 6.1 14 2.2zM104 136c-13.3 0-24 10.7-24 24s10.7 24 24 24l176 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-176 0zM80 352c0 13.3 10.7 24 24 24l176 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-176 0c-13.3 0-24 10.7-24 24zm24-120c-13.3 0-24 10.7-24 24s10.7 24 24 24l176 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-176 0z"
                    />
                  </svg>
                </span>
                Complete Your Order
              </h1>
              <p className="text-gray-500 mt-2">Review your items and complete your purchase</p>
            </div>
            <Link
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-primary-50 transition-all"
              href="/cart"
            >
              {/* Arrow left icon */}
              <svg className="h-4 w-4" role="img" viewBox="0 0 512 512" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 105.4-105.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"
                />
              </svg>
              Back to Cart
            </Link>
          </div>
        </div>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">

              {/* Shipping Address Card */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    {/* House icon */}
                    <svg className="h-5 w-5" role="img" viewBox="0 0 512 512" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M277.8 8.6c-12.3-11.4-31.3-11.4-43.5 0l-224 208c-9.6 9-12.8 22.9-8 35.1S18.8 272 32 272l16 0 0 176c0 35.3 28.7 64 64 64l288 0c35.3 0 64-28.7 64-64l0-176 16 0c13.2 0 25-8.1 29.8-20.3s1.6-26.2-8-35.1l-224-208zM240 320l32 0c26.5 0 48 21.5 48 48l0 96-128 0 0-96c0-26.5 21.5-48 48-48z"
                      />
                    </svg>
                    Shipping Address
                  </h2>
                  <p className="text-primary-100 text-sm mt-1">Where should we deliver your order?</p>
                </div>

                <div className="p-6 space-y-5">
                  {/* Info banner */}
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      {/* Circle info icon */}
                      <svg className="h-4 w-4 text-blue-600" role="img" viewBox="0 0 512 512" aria-hidden="true">
                        <path
                          fill="currentColor"
                          d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM224 160a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm-8 64l48 0c13.3 0 24 10.7 24 24l0 88 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-80 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l24 0 0-64-24 0c-13.3 0-24-10.7-24-24s10.7-24 24-24z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-blue-800 font-medium">Delivery Information</p>
                      <p className="text-xs text-blue-600 mt-0.5">Please ensure your address is accurate for smooth delivery</p>
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        {/* City icon */}
                        <svg className="h-4 w-4 text-gray-500" role="img" viewBox="0 0 576 512" aria-hidden="true">
                          <path
                            fill="currentColor"
                            d="M320 0c-35.3 0-64 28.7-64 64l0 32-48 0 0-72c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 72-64 0 0-72C96 10.7 85.3 0 72 0S48 10.7 48 24l0 74c-27.6 7.1-48 32.2-48 62L0 448c0 35.3 28.7 64 64 64l448 0c35.3 0 64-28.7 64-64l0-192c0-35.3-28.7-64-64-64l-64 0 0-128c0-35.3-28.7-64-64-64L320 0zm64 112l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16zm-16 80c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16l32 0zm16 112l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16zm112-16c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16l32 0zM256 304l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16zM240 192c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16l32 0zM128 304l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16zM112 192c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16l32 0z"
                          />
                        </svg>
                      </div>
                      <input
                        id="city"
                        className="w-full px-4 py-3.5 pl-14 border-2 rounded-xl focus:outline-none transition-all border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        placeholder="e.g. Cairo, Alexandria, Giza"
                        type="text"
                        value={address.city}
                        onChange={(event) => handleAddressChange('city', event.target.value)}
                      />
                    </div>
                  </div>

                  {/* Street Address */}
                  <div>
                    <label htmlFor="details" className="block text-sm font-semibold text-gray-700 mb-2">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-4 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        {/* Location dot icon */}
                        <svg className="h-4 w-4 text-gray-500" role="img" viewBox="0 0 384 512" aria-hidden="true">
                          <path
                            fill="currentColor"
                            d="M0 188.6C0 84.4 86 0 192 0S384 84.4 384 188.6c0 119.3-120.2 262.3-170.4 316.8-11.8 12.8-31.5 12.8-43.3 0-50.2-54.5-170.4-197.5-170.4-316.8zM192 256a64 64 0 1 0 0-128 64 64 0 1 0 0 128z"
                          />
                        </svg>
                      </div>
                      <textarea
                        id="details"
                        rows={3}
                        className="w-full px-4 py-3.5 pl-14 border-2 rounded-xl focus:outline-none transition-all resize-none border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        placeholder="Street name, building number, floor, apartment..."
                        value={address.details}
                        onChange={(event) => handleAddressChange('details', event.target.value)}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        {/* Phone icon */}
                        <svg className="h-4 w-4 text-gray-500" role="img" viewBox="0 0 512 512" aria-hidden="true">
                          <path
                            fill="currentColor"
                            d="M160.2 25C152.3 6.1 131.7-3.9 112.1 1.4l-5.5 1.5c-64.6 17.6-119.8 80.2-103.7 156.4 37.1 175 174.8 312.7 349.8 349.8 76.3 16.2 138.8-39.1 156.4-103.7l1.5-5.5c5.4-19.7-4.7-40.3-23.5-48.1l-97.3-40.5c-16.5-6.9-35.6-2.1-47 11.8l-38.6 47.2C233.9 335.4 177.3 277 144.8 205.3L189 169.3c13.9-11.3 18.6-30.4 11.8-47L160.2 25z"
                          />
                        </svg>
                      </div>
                      <input
                        id="phone"
                        className="w-full px-4 py-3.5 pl-14 border-2 rounded-xl focus:outline-none transition-all border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                        placeholder="01xxxxxxxxx"
                        type="tel"
                        value={address.phone}
                        onChange={(event) => handleAddressChange('phone', event.target.value)}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                        Egyptian numbers only
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Card */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    {/* Wallet icon */}
                    <svg className="h-5 w-5" role="img" viewBox="0 0 512 512" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M64 32C28.7 32 0 60.7 0 96L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-192c0-35.3-28.7-64-64-64L72 128c-13.3 0-24-10.7-24-24S58.7 80 72 80l384 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L64 32zM416 256a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"
                      />
                    </svg>
                    Payment Method
                  </h2>
                  <p className="text-primary-100 text-sm mt-1">Choose how you'd like to pay</p>
                </div>

                <div className="p-6 space-y-4">
                  {/* Cash on Delivery */}
                  <button
                    type="button"
                    className={`w-full p-5 rounded-xl border-2 transition-all flex items-center gap-4 group ${
                      paymentMethod === 'cash'
                        ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-emerald-50 shadow-sm'
                        : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setPaymentMethod('cash')}
                  >
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                        paymentMethod === 'cash'
                          ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                          : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                      }`}
                    >
                      {/* Money bill icon */}
                      <svg className="h-6 w-6" role="img" viewBox="0 0 512 512" aria-hidden="true">
                        <path
                          fill="currentColor"
                          d="M64 64C28.7 64 0 92.7 0 128L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64L64 64zm192 96a96 96 0 1 1 0 192 96 96 0 1 1 0-192zm192 24c0 4.4-3.6 8.1-8 7.5-29-3.6-51.9-26.6-55.5-55.5-.5-4.4 3.1-8 7.5-8l48 0c4.4 0 8 3.6 8 8l0 48zM64 328c0-4.4 3.6-8.1 8-7.5 29 3.6 51.9 26.6 55.5 55.5 .5 4.4-3.1 8-7.5 8l-48 0c-4.4 0-8-3.6-8-8l0-48zm8-136.5c-4.4 .5-8-3.1-8-7.5l0-48c0-4.4 3.6-8 8-8l48 0c4.4 0 8.1 3.6 7.5 8-3.6 29-26.6 51.9-55.5 55.5zm368 129c4.4-.5 8 3.1 8 7.5l0 48c0 4.4-3.6 8-8 8l-48 0c-4.4 0-8.1-3.6-7.5-8 3.6-29 26.6-51.9 55.5-55.5z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className={`font-bold ${paymentMethod === 'cash' ? 'text-primary-700' : 'text-gray-900'}`}>
                        Cash on Delivery
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">Pay when your order arrives at your doorstep</p>
                    </div>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        paymentMethod === 'cash'
                          ? 'bg-primary-600 text-white'
                          : 'border-2 border-gray-200'
                      }`}
                    >
                      {paymentMethod === 'cash' && (
                        <svg className="h-3 w-3" role="img" viewBox="0 0 448 512" aria-hidden="true">
                          <path
                            fill="currentColor"
                            d="M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4 13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5 101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z"
                          />
                        </svg>
                      )}
                    </div>
                  </button>

                  {/* Pay Online */}
                  <button
                    type="button"
                    className={`w-full p-5 rounded-xl border-2 transition-all flex items-center gap-4 group ${
                      paymentMethod === 'card'
                        ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-emerald-50 shadow-sm'
                        : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                        paymentMethod === 'card'
                          ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                          : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                      }`}
                    >
                      {/* Credit card icon */}
                      <svg className="h-6 w-6" role="img" viewBox="0 0 512 512" aria-hidden="true">
                        <path
                          fill="currentColor"
                          d="M0 128l0 32 512 0 0-32c0-35.3-28.7-64-64-64L64 64C28.7 64 0 92.7 0 128zm0 80L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-176-512 0zM64 360c0-13.3 10.7-24 24-24l48 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-48 0c-13.3 0-24-10.7-24-24zm144 0c0-13.3 10.7-24 24-24l64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0c-13.3 0-24-10.7-24-24z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-bold text-gray-900">Pay Online</h3>
                      <p className="text-sm text-gray-500 mt-0.5">Secure payment with Credit/Debit Card via Stripe</p>
                      <div className="flex items-center gap-2 mt-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt="Visa" className="h-5" src="https://img.icons8.com/color/48/visa.png" />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt="Mastercard" className="h-5" src="https://img.icons8.com/color/48/mastercard.png" />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt="Amex" className="h-5" src="https://img.icons8.com/color/48/amex.png" />
                      </div>
                    </div>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        paymentMethod === 'card'
                          ? 'bg-primary-600 text-white'
                          : 'border-2 border-gray-200'
                      }`}
                    >
                      {paymentMethod === 'card' && (
                        <svg className="h-3 w-3" role="img" viewBox="0 0 448 512" aria-hidden="true">
                          <path
                            fill="currentColor"
                            d="M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4 13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5 101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z"
                          />
                        </svg>
                      )}
                    </div>
                  </button>

                  {/* Security badge */}
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 mt-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      {/* Shield halved icon */}
                      <svg className="h-5 w-5 text-green-600" role="img" viewBox="0 0 512 512" aria-hidden="true">
                        <path
                          fill="currentColor"
                          d="M256 0c4.6 0 9.2 1 13.4 2.9L457.8 82.8c22 9.3 38.4 31 38.3 57.2-.5 99.2-41.3 280.7-213.6 363.2-16.7 8-36.1 8-52.8 0-172.4-82.5-213.1-264-213.6-363.2-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.9 1 251.4 0 256 0zm0 66.8l0 378.1c138-66.8 175.1-214.8 176-303.4l-176-74.6 0 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-800">Secure &amp; Encrypted</p>
                      <p className="text-xs text-green-600 mt-0.5">Your payment info is protected with 256-bit SSL encryption</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column — Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm sticky top-4">
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    {/* Bag shopping icon */}
                    <svg className="h-5 w-5" role="img" viewBox="0 0 448 512" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M160 80c0-35.3 28.7-64 64-64s64 28.7 64 64l0 48-128 0 0-48zm-48 48l-64 0c-26.5 0-48 21.5-48 48L0 384c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-208c0-26.5-21.5-48-48-48l-64 0 0-48c0-61.9-50.1-112-112-112S112 18.1 112 80l0 48zm24 48a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm152 24a24 24 0 1 1 48 0 24 24 0 1 1 -48 0z"
                      />
                    </svg>
                    Order Summary
                  </h2>
                  <p className="text-primary-100 text-sm mt-1">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                </div>

                <div className="p-5">
                  <div className="space-y-3 max-h-56 overflow-y-auto mb-5 pr-1">
                    {items.map((item, index) => {
                      const product = item.product ?? {}
                      const count = item.count ?? 1
                      const price = item.price ?? product.price ?? 0
                      const total = price * count
                      return (
                        <div
                          key={`${product._id ?? 'item'}-${index}`}
                          className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="w-14 h-14 rounded-lg bg-white p-1 border border-gray-100 shrink-0">
                            {product.imageCover ? (
                              <Image
                                alt={product.title ?? 'Product'}
                                className="w-full h-full object-contain"
                                src={product.imageCover}
                                width={80}
                                height={80}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 rounded" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{product.title ?? 'Product'}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {count} × {price} EGP
                            </p>
                          </div>
                          <p className="text-sm font-bold text-gray-900 shrink-0">{total}</p>
                        </div>
                      )
                    })}
                  </div>

                  <hr className="border-gray-100 my-4" />

                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-medium">{subtotal} EGP</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span className="flex items-center gap-2">
                        {/* Truck icon */}
                        <svg className="h-4 w-4 text-gray-400" role="img" viewBox="0 0 576 512" aria-hidden="true">
                          <path
                            fill="currentColor"
                            d="M0 96C0 60.7 28.7 32 64 32l288 0c35.3 0 64 28.7 64 64l0 32 50.7 0c17 0 33.3 6.7 45.3 18.7L557.3 192c12 12 18.7 28.3 18.7 45.3L576 384c0 35.3-28.7 64-64 64l-3.3 0c-10.4 36.9-44.4 64-84.7 64s-74.2-27.1-84.7-64l-102.6 0c-10.4 36.9-44.4 64-84.7 64s-74.2-27.1-84.7-64L64 448c-35.3 0-64-28.7-64-64L0 96zM512 288l0-50.7-45.3-45.3-50.7 0 0 96 96 0zM192 424a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zm232 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80z"
                          />
                        </svg>
                        Shipping
                      </span>
                      <span className="font-medium">{SHIPPING_COST} EGP</span>
                    </div>
                    <hr className="border-gray-100" />
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-primary-600">{grandTotal}</span>
                        <span className="text-sm text-gray-500 ml-1">EGP</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-bold hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 active:scale-[0.98]"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span className="inline-flex items-center gap-2">
                        <Spinner className="text-white" />
                        Processing...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        {/* Box icon */}
                        <svg className="h-4 w-4" role="img" viewBox="0 0 448 512" aria-hidden="true">
                          <path
                            fill="currentColor"
                            d="M369.4 128l-34.3-48-222.1 0-34.3 48 290.7 0zM0 148.5c0-13.3 4.2-26.3 11.9-37.2L60.9 42.8C72.9 26 92.3 16 112.9 16l222.1 0c20.7 0 40.1 10 52.1 26.8l48.9 68.5c7.8 10.9 11.9 23.9 11.9 37.2L448 416c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 148.5z"
                          />
                        </svg>
                        Place Order
                      </span>
                    )}
                  </button>

                  {/* Trust badges */}
                  <div className="flex items-center justify-center gap-4 mt-4 py-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <svg className="h-3.5 w-3.5 text-green-500" role="img" viewBox="0 0 512 512" aria-hidden="true">
                        <path
                          fill="currentColor"
                          d="M256 0c4.6 0 9.2 1 13.4 2.9L457.8 82.8c22 9.3 38.4 31 38.3 57.2-.5 99.2-41.3 280.7-213.6 363.2-16.7 8-36.1 8-52.8 0-172.4-82.5-213.1-264-213.6-363.2-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.9 1 251.4 0 256 0zm0 66.8l0 378.1c138-66.8 175.1-214.8 176-303.4l-176-74.6 0 0z"
                        />
                      </svg>
                      <span>Secure</span>
                    </div>
                    <div className="w-px h-4 bg-gray-200" />
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <svg className="h-3.5 w-3.5 text-blue-500" role="img" viewBox="0 0 576 512" aria-hidden="true">
                        <path
                          fill="currentColor"
                          d="M0 96C0 60.7 28.7 32 64 32l288 0c35.3 0 64 28.7 64 64l0 32 50.7 0c17 0 33.3 6.7 45.3 18.7L557.3 192c12 12 18.7 28.3 18.7 45.3L576 384c0 35.3-28.7 64-64 64l-3.3 0c-10.4 36.9-44.4 64-84.7 64s-74.2-27.1-84.7-64l-102.6 0c-10.4 36.9-44.4 64-84.7 64s-74.2-27.1-84.7-64L64 448c-35.3 0-64-28.7-64-64L0 96z"
                        />
                      </svg>
                      <span>Fast Delivery</span>
                    </div>
                    <div className="w-px h-4 bg-gray-200" />
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <svg className="h-3.5 w-3.5 text-orange-500" role="img" viewBox="0 0 448 512" aria-hidden="true">
                        <path
                          fill="currentColor"
                          d="M369.4 128l-34.3-48-222.1 0-34.3 48 290.7 0zM0 148.5c0-13.3 4.2-26.3 11.9-37.2L60.9 42.8C72.9 26 92.3 16 112.9 16l222.1 0c20.7 0 40.1 10 52.1 26.8l48.9 68.5c7.8 10.9 11.9 23.9 11.9 37.2L448 416c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 148.5z"
                        />
                      </svg>
                      <span>Easy Returns</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}