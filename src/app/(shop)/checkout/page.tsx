'use client'

import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Button, ButtonLink } from '@/component/ui/Button'
import { notifyCartUpdate } from '@/lib/cart'

const CART_API = 'https://ecommerce.routemisr.com/api/v2/cart'
const CASH_ORDER_API = (cartId: string) => `https://ecommerce.routemisr.com/api/v1/orders/${cartId}`
const CHECKOUT_SESSION_API = (cartId: string, url: string) =>
  `https://ecommerce.routemisr.com/api/v1/orders/checkout-session/${cartId}?url=${encodeURIComponent(url)}`

type CartProduct = {
  product?: { _id?: string; title?: string; imageCover?: string; price?: number }
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
type ShippingAddress = { city: string; details: string; phone: string }
type FieldErrors = Partial<Record<keyof ShippingAddress, string>>

const INITIAL_ADDRESS: ShippingAddress = { city: '', details: '', phone: '' }

const egp = new Intl.NumberFormat('en-EG')

const getErrorMessage = async (res: Response, fallback: string) => {
  const data = await res.json().catch(() => null)
  if (!data) return fallback
  return data?.message ?? data?.error ?? fallback
}

/** Per-field rules, so a field can be validated on blur in isolation. */
function validateField(field: keyof ShippingAddress, value: string): string {
  const v = value.trim()
  if (field === 'city') return v ? '' : 'City is required.'
  if (field === 'details') return v ? '' : 'Street address is required.'
  if (field === 'phone') {
    if (!v) return 'Phone number is required.'
    // Egyptian mobile: 11 digits starting 010/011/012/015.
    if (!/^01[0125][0-9]{8}$/.test(v.replace(/[\s-]/g, ''))) {
      return 'Enter a valid Egyptian mobile number, e.g. 01012345678.'
    }
  }
  return ''
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
  const [errors, setErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof ShippingAddress, boolean>>>({})

  const items = useMemo(() => cart?.products ?? [], [cart])
  const subtotal = cart?.totalCartPrice ?? 0
  const totalAfterDiscount = cart?.totalAfterDiscount ?? subtotal
  const discount = subtotal > totalAfterDiscount ? subtotal - totalAfterDiscount : 0

  // The order is created for the cart total the API reports. The previous
  // version added a hardcoded 50 EGP "shipping" that exists nowhere in the
  // API, so the figure shown here never matched what was actually charged.
  const orderTotal = totalAfterDiscount

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
          headers: { token, Authorization: `Bearer ${token}`, 'Cache-Control': 'no-store' },
          cache: 'no-store',
        })
        if (!res.ok) throw new Error('Failed to load cart')
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

  const handleChange = (field: keyof ShippingAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }))
    // Clear an existing error as soon as the value becomes valid — but do
    // not introduce a new error mid-typing.
    if (errors[field]) {
      const next = validateField(field, value)
      if (!next) setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleBlur = (field: keyof ShippingAddress) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    setErrors((prev) => ({ ...prev, [field]: validateField(field, address[field]) || undefined }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    const cartId = cart?._id ?? cart?.id
    if (!cartId) {
      toast.error('Your cart is not ready yet.')
      return
    }

    const nextErrors: FieldErrors = {}
    ;(Object.keys(address) as (keyof ShippingAddress)[]).forEach((f) => {
      const msg = validateField(f, address[f])
      if (msg) nextErrors[f] = msg
    })

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      setTouched({ city: true, details: true, phone: true })
      // Move focus to the first invalid field rather than only toasting.
      const first = (Object.keys(nextErrors) as (keyof ShippingAddress)[])[0]
      document.getElementById(first)?.focus()
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
          headers: { 'Content-Type': 'application/json', token, Authorization: `Bearer ${token}` },
          body: JSON.stringify({ shippingAddress: address }),
        })
        if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to place cash order.'))
        await res.json().catch(() => null)

        // The cart is consumed by the order — tell the rest of the app, and
        // take the shopper somewhere that proves it worked.
        notifyCartUpdate()
        toast.success('Order placed.')
        router.push('/orders')
        return
      }

      const returnUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
      const res = await fetch(CHECKOUT_SESSION_API(cartId, returnUrl), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', token, Authorization: `Bearer ${token}` },
        body: JSON.stringify({ shippingAddress: address }),
      })
      if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to start payment session.'))

      const json = await res.json().catch(() => null)
      const sessionUrl = json?.session?.url ?? json?.data?.session?.url ?? json?.url
      if (sessionUrl) {
        window.location.href = sessionUrl
        return
      }
      toast.error('The payment provider did not return a checkout link. Try cash on delivery.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Checkout failed.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 py-12 sm:py-16">
        <div className="h-10 w-48 animate-pulse rounded-full bg-sunk" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="bento h-[420px] animate-pulse p-6" aria-hidden="true" />
          <div className="bento h-64 animate-pulse p-6" aria-hidden="true" />
        </div>
        <span className="sr-only" role="status">Loading checkout…</span>
      </main>
    )
  }

  if (error || !items.length) {
    return (
      <main className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 py-20">
        <div className="bento mx-auto max-w-[520px] px-8 py-16 text-center" role={error ? 'alert' : undefined}>
          <h1 className="font-display text-2xl">
            {error ? 'We could not load your cart' : 'Nothing to check out'}
          </h1>
          <p className="mt-3 text-sm font-light text-ink-muted">
            {error || 'Your cart is empty, so there is no order to place yet.'}
          </p>
          <div className="mt-8 flex justify-center">
            <ButtonLink href={error ? '/cart' : '/products'}>
              {error ? 'Back to cart' : 'Browse the catalogue'}
            </ButtonLink>
          </div>
        </div>
      </main>
    )
  }

  const field = (
    name: keyof ShippingAddress,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => {
    const err = touched[name] ? errors[name] : undefined
    return (
      <div>
        <label htmlFor={name} className="label mb-2.5 block text-ink-muted">
          {label} <span aria-hidden="true" className="text-gold">*</span>
        </label>
        <input
          id={name}
          value={address[name]}
          onChange={(e) => handleChange(name, e.target.value)}
          onBlur={() => handleBlur(name)}
          aria-invalid={err ? true : undefined}
          aria-describedby={err ? `${name}-error` : undefined}
          required
          {...props}
          className={`h-13 w-full rounded-[16px] border bg-sunk px-4 py-3.5 text-[15px] transition-colors duration-400 focus:bg-card focus:outline-none ${
            err ? 'border-danger' : 'border-line focus:border-gold'
          }`}
        />
        {err && (
          <p id={`${name}-error`} role="alert" className="mt-2 text-[12.5px] text-danger">
            {err}
          </p>
        )}
      </div>
    )
  }

  return (
    <main className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 py-12 sm:py-16">
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="label flex items-center gap-2 text-ink-muted">
          <li><Link href="/" className="transition-colors duration-300 hover:text-gold">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/cart" className="transition-colors duration-300 hover:text-gold">Cart</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-ink">Checkout</li>
        </ol>
      </nav>

      <h1 className="font-display-lg mb-8 text-[clamp(30px,4.6vw,48px)]">Checkout</h1>

      <form onSubmit={handleSubmit} noValidate className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="flex flex-col gap-6">
          <section className="bento p-6 sm:p-8">
            <h2 className="font-display text-lg">Shipping address</h2>
            <div className="mt-6 flex flex-col gap-5">
              {field('city', 'City', { autoComplete: 'address-level2', placeholder: 'Cairo' })}
              {field('details', 'Street address', {
                autoComplete: 'street-address',
                placeholder: 'Building, street, apartment',
              })}
              {field('phone', 'Phone', {
                type: 'tel',
                inputMode: 'numeric',
                autoComplete: 'tel',
                placeholder: '01012345678',
              })}
            </div>
          </section>

          <section className="bento p-6 sm:p-8">
            <h2 className="font-display text-lg">Payment</h2>
            <fieldset className="mt-6">
              <legend className="sr-only">Choose a payment method</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {([
                  { key: 'cash' as const, title: 'Cash on delivery', note: 'Pay when the order arrives' },
                  { key: 'card' as const, title: 'Card', note: 'Secure payment page' },
                ]).map((opt) => {
                  const on = paymentMethod === opt.key
                  return (
                    <label
                      key={opt.key}
                      className={`flex cursor-pointer items-start gap-3 rounded-[16px] border p-5 transition-colors duration-400 ${
                        on ? 'border-gold bg-gold/5' : 'border-line hover:border-ink-muted'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={opt.key}
                        checked={on}
                        onChange={() => setPaymentMethod(opt.key)}
                        className="mt-1 accent-[var(--gold)]"
                      />
                      <span>
                        <span className="block text-[15px] font-medium">{opt.title}</span>
                        <span className="mt-1 block text-[13px] font-light text-ink-muted">{opt.note}</span>
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
          </section>
        </div>

        <aside className="bento p-6 lg:sticky lg:top-6">
          <h2 className="font-display text-lg">Your order</h2>

          <ul className="mt-5 flex flex-col gap-4">
            {items.map((item, i) => (
              <li key={item.product?._id ?? i} className="flex items-center gap-3">
                <div className="well relative h-14 w-14 shrink-0">
                  {item.product?.imageCover && (
                    <Image src={item.product.imageCover} alt="" fill sizes="56px" className="object-contain p-1.5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px]">{item.product?.title}</p>
                  <p className="tabular text-[12px] font-light text-ink-muted">× {item.count ?? 1}</p>
                </div>
                <span className="tabular shrink-0 text-[13.5px]">
                  {egp.format((item.price ?? item.product?.price ?? 0) * (item.count ?? 1))}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-6 flex flex-col gap-3.5 border-t border-line-soft pt-5 text-[14.5px]">
            <div className="flex justify-between">
              <dt className="font-light text-ink-muted">Subtotal</dt>
              <dd className="tabular">{egp.format(subtotal)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-gold">
                <dt className="font-light">Discount</dt>
                <dd className="tabular">−{egp.format(discount)}</dd>
              </div>
            )}
            <div className="mt-1 flex items-baseline justify-between border-t border-line-soft pt-4">
              <dt className="font-display text-base">Total</dt>
              <dd className="font-display tabular text-[24px] font-semibold">
                {egp.format(orderTotal)}
                <span className="ml-1.5 text-[11px] font-light text-ink-muted">EGP</span>
              </dd>
            </div>
          </dl>

          <p className="mt-3 text-[12px] font-light leading-relaxed text-ink-muted">
            Shipping is arranged after the order is placed and is not included above.
          </p>

          <div className="mt-7">
            <Button type="submit" loading={submitting} className="w-full">
              {paymentMethod === 'cash' ? 'Place order' : 'Continue to payment'}
            </Button>
          </div>
        </aside>
      </form>
    </main>
  )
}
