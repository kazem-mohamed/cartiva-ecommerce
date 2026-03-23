'use client'

import { type FormEvent, useState } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

interface Review {
  _id: string
  user?: { name?: string }
  rating: number
  review: string
  createdAt?: string
}

interface ProductTabsProps {
  productId: string
  description: string
  category?: { name: string }
  subcategory?: { name: string }
  brand?: { name: string }
  sold?: number
  ratingsAverage?: number
  ratingsQuantity?: number
  reviews?: Review[]
}

function Stars({ rating = 0 }: { rating?: number }) {
  const filled = Math.floor(rating)
  const hasHalf = rating - filled >= 0.5
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => {
        const color =
          i < filled ? 'text-yellow-400' : i === filled && hasHalf ? 'text-yellow-400' : 'text-gray-300'
        return (
          <svg key={i} className={`h-4 w-4 ${color}`} viewBox="0 0 576 512" aria-hidden="true">
            <path fill="currentColor" d="M309.5 13.5c-4.1-8-12.4-13.1-21.4-13.1s-17.3 5.1-21.4 13.1L193.1 125.3 33.2 150.7c-8.9 1.4-16.3 7.7-19.1 16.3s-.5 18 5.8 24.4l114.4 114.5-25.2 159.9c-1.4 8.9 2.3 17.9 9.6 23.2s16.9 6.1 25 2L288.1 417.6 432.4 491c8 4.1 17.7 3.3 25-2s11-14.2 9.6-23.2L441.7 305.9 556.1 191.4c6.4-6.4 8.6-15.8 5.8-24.4s-10.1-14.9-19.1-16.3L383 125.3 309.5 13.5z" />
          </svg>
        )
      })}
    </div>
  )
}

function StarRatingInput({
  value,
  hoverValue,
  onChange,
  onHover,
}: {
  value: number
  hoverValue: number | null
  onChange: (rating: number) => void
  onHover: (rating: number | null) => void
}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const star = index + 1
        const filled = (hoverValue ?? value) >= star
        return (
          <button
            key={star}
            type="button"
            className="p-1"
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => onHover(star)}
            onMouseLeave={() => onHover(null)}
          >
            <svg className={`h-6 w-6 ${filled ? 'text-yellow-400' : 'text-gray-300'}`} viewBox="0 0 576 512" aria-hidden="true">
              <path fill="currentColor" d="M309.5 13.5c-4.1-8-12.4-13.1-21.4-13.1s-17.3 5.1-21.4 13.1L193.1 125.3 33.2 150.7c-8.9 1.4-16.3 7.7-19.1 16.3s-.5 18 5.8 24.4l114.4 114.5-25.2 159.9c-1.4 8.9 2.3 17.9 9.6 23.2s16.9 6.1 25 2L288.1 417.6 432.4 491c8 4.1 17.7 3.3 25-2s11-14.2 9.6-23.2L441.7 305.9 556.1 191.4c6.4-6.4 8.6-15.8 5.8-24.4s-10.1-14.9-19.1-16.3L383 125.3 309.5 13.5z" />
            </svg>
          </button>
        )
      })}
    </div>
  )
}

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`h-4 w-4 shrink-0 ${className}`} viewBox="0 0 448 512" aria-hidden="true">
      <path fill="currentColor" d="M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4 13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5 101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z" />
    </svg>
  )
}

const TABS = [
  {
    key: 'details',
    label: 'Product Details',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 512 512" aria-hidden="true">
        <path fill="currentColor" d="M0 96C0 60.7 28.7 32 64 32l384 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zm64 0l0 64 384 0 0-64L64 96zm0 128l0 64 160 0 0-64-160 0zm0 128l0 64 160 0 0-64-160 0zm224-128l0 192 160 0 0-192-160 0z" />
      </svg>
    ),
  },
  {
    key: 'reviews',
    label: 'Reviews',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 576 512" aria-hidden="true">
        <path fill="currentColor" d="M309.5 13.5c-4.1-8-12.4-13.1-21.4-13.1s-17.3 5.1-21.4 13.1L193.1 125.3 33.2 150.7c-8.9 1.4-16.3 7.7-19.1 16.3s-.5 18 5.8 24.4l114.4 114.5-25.2 159.9c-1.4 8.9 2.3 17.9 9.6 23.2s16.9 6.1 25 2L288.1 417.6 432.4 491c8 4.1 17.7 3.3 25-2s11-14.2 9.6-23.2L441.7 305.9 556.1 191.4c6.4-6.4 8.6-15.8 5.8-24.4s-10.1-14.9-19.1-16.3L383 125.3 309.5 13.5z" />
      </svg>
    ),
  },
  {
    key: 'shipping',
    label: 'Shipping & Returns',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 640 512" aria-hidden="true">
        <path fill="currentColor" d="M0 96C0 60.7 28.7 32 64 32l288 0c35.3 0 64 28.7 64 64l0 32 50.7 0c17 0 33.3 6.7 45.3 18.7L557.3 192c12 12 18.7 28.3 18.7 45.3L576 384c0 35.3-28.7 64-64 64l-3.3 0c-10.4 36.9-44.4 64-84.7 64s-74.2-27.1-84.7-64l-102.6 0c-10.4 36.9-44.4 64-84.7 64s-74.2-27.1-84.7-64L64 448c-35.3 0-64-28.7-64-64L0 96zM512 288l0-50.7-45.3-45.3-50.7 0 0 96 96 0zM192 424a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zm232 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80z" />
      </svg>
    ),
  },
]

export default function ProductTabs({
  productId,
  description,
  category,
  subcategory,
  brand,
  sold,
  ratingsAverage = 0,
  ratingsQuantity = 0,
  reviews = [],
}: ProductTabsProps) {
  const { data: session } = useSession()
  const token = session?.accessToken ?? ''
  const [active, setActive] = useState('details')
  const [localReviews, setLocalReviews] = useState<Review[]>(reviews)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const reviewCount = localReviews.length || ratingsQuantity
  const avgRating =
    localReviews.length > 0
      ? localReviews.reduce((sum, review) => sum + (review.rating ?? 0), 0) / localReviews.length
      : ratingsAverage

  const ratingPercent = (star: number) => {
    if (!localReviews.length) return 0
    const count = localReviews.filter((r) => Math.round(r.rating) === star).length
    return Math.round((count / localReviews.length) * 100)
  }

  const reloadReviews = async () => {
    try {
      const res = await fetch(`https://ecommerce.routemisr.com/api/v1/products/${productId}/reviews`, {
        cache: 'no-store',
      })
      if (!res.ok) return
      const json = await res.json().catch(() => null)
      const next = Array.isArray(json?.data) ? (json.data as Review[]) : []
      if (next.length) {
        setLocalReviews(next)
      }
    } catch {
      // Ignore refresh errors; we still keep local optimistic state.
    }
  }

  const handleSubmitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError('')

    if (!token) {
      setSubmitError('Please sign in to write a review.')
      return
    }

    const trimmed = comment.trim()
    if (!rating) {
      setSubmitError('Please select a star rating.')
      return
    }
    if (!trimmed) {
      setSubmitError('Please write a short review.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`https://ecommerce.routemisr.com/api/v1/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          review: trimmed,
          rating,
        }),
      })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        let message = 'Failed to submit review. Please try again.'
        if (text) {
          try {
            const json = JSON.parse(text)
            message =
              json?.errors?.msg ||
              json?.message ||
              json?.errors?.[0]?.msg ||
              json?.error ||
              message
          } catch {
            message = text
          }
        }
        setSubmitError(message)
        toast.error(message)
        return
      }

      const json = await res.json().catch(() => null)
      const data = json?.data ?? json?.review ?? json
      const nextReview: Review = {
        _id: data?._id ?? `${Date.now()}`,
        user: data?.user ?? { name: session?.user?.name ?? 'You' },
        rating: data?.rating ?? rating,
        review: data?.review ?? trimmed,
        createdAt: data?.createdAt ?? new Date().toISOString(),
      }

      setLocalReviews((prev) => [nextReview, ...prev])
      setComment('')
      setRating(0)
      setHoverRating(null)
      setShowReviewForm(false)
      toast.success('Review submitted successfully')
      await reloadReviews()
    } catch {
      const message = 'Failed to submit review. Please try again.'
      setSubmitError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-10">
      {/* Tab bar */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActive(tab.key)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors cursor-pointer border-b-2 -mb-px
                ${active === tab.key
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {tab.icon}
              {tab.label}
              {tab.key === 'reviews' && reviewCount > 0 && (
                <span className="ml-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                  {reviewCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Product Details Tab ── */}
        {active === 'details' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">About this Product</h3>
              <p className="text-gray-600 leading-relaxed">{description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Product Information</h4>
                <ul className="space-y-2">
                  {[
                    { label: 'Category', value: category?.name },
                    { label: 'Subcategory', value: subcategory?.name },
                    { label: 'Brand', value: brand?.name },
                    { label: 'Items Sold', value: sold ? `${sold}+ sold` : undefined },
                  ].map(({ label, value }) => (
                    <li key={label} className="flex justify-between text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                      <span className="text-gray-500">{label}</span>
                      <span className="text-gray-900 font-medium">{value ?? 'N/A'}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key Features */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Key Features</h4>
                <ul className="space-y-2">
                  {[
                    'Premium Quality Product',
                    '100% Authentic Guarantee',
                    'Fast & Secure Packaging',
                    'Quality Tested',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckIcon className="text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ── Reviews Tab ── */}
        {active === 'reviews' && (
          <div className="p-6 space-y-6">
            {/* Rating summary */}
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              <div className="text-center shrink-0">
                <div className="text-5xl font-bold text-gray-900 mb-2">{avgRating.toFixed(1)}</div>
                <Stars rating={avgRating} />
                <p className="text-sm text-gray-500 mt-2">
                  Based on {reviewCount} review{reviewCount === 1 ? '' : 's'}
                </p>
              </div>

              <div className="flex-1 w-full">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-gray-600 w-10">{star} star</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                        style={{ width: `${ratingPercent(star)}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-10 text-right">{ratingPercent(star)}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 md:p-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h4 className="text-base font-semibold text-gray-900">Write a Review</h4>
                  <p className="text-sm text-gray-500">Share your thoughts about this product.</p>
                </div>
                <button
                  className="text-green-600 hover:text-green-700 font-medium"
                  type="button"
                  onClick={() => setShowReviewForm((prev) => !prev)}
                >
                  {showReviewForm ? 'Close' : 'Write a Review'}
                </button>
              </div>

              {showReviewForm && (
                <form className="mt-4 space-y-4" onSubmit={handleSubmitReview}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                    <StarRatingInput
                      value={rating}
                      hoverValue={hoverRating}
                      onChange={setRating}
                      onHover={setHoverRating}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {rating ? `You rated ${rating} star${rating > 1 ? 's' : ''}.` : 'Select a rating.'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="review-comment">
                      Your Review
                    </label>
                    <textarea
                      id="review-comment"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      rows={4}
                      placeholder="Write your review..."
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                    />
                  </div>

                  {submitError && <p className="text-sm text-red-500">{submitError}</p>}

                  <button
                    className="inline-flex items-center justify-center rounded-full bg-green-600 text-white px-6 py-2.5 text-sm font-semibold hover:bg-green-700 transition disabled:opacity-60"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v3l3-3-3-3v3a11 11 0 0 0-11 11h3z" />
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      'Submit Review'
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Reviews list */}
            {localReviews.length === 0 ? (
              <div className="border-t border-gray-200 pt-6">
                <div className="text-center py-8">
                  <svg className="svg-inline--fa fa-star text-4xl text-gray-300 mb-3" role="img" viewBox="0 0 576 512" aria-hidden="true">
                    <path fill="currentColor" d="M309.5-18.9c-4.1-8-12.4-13.1-21.4-13.1s-17.3 5.1-21.4 13.1L193.1 125.3 33.2 150.7c-8.9 1.4-16.3 7.7-19.1 16.3s-.5 18 5.8 24.4l114.4 114.5-25.2 159.9c-1.4 8.9 2.3 17.9 9.6 23.2s16.9 6.1 25 2L288.1 417.6 432.4 491c8 4.1 17.7 3.3 25-2s11-14.2 9.6-23.2L441.7 305.9 556.1 191.4c6.4-6.4 8.6-15.8 5.8-24.4s-10.1-14.9-19.1-16.3L383 125.3 309.5-18.9z" />
                  </svg>
                  <p className="text-gray-500">Customer reviews will be displayed here.</p>
                  <button
                    className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
                    type="button"
                    onClick={() => setShowReviewForm(true)}
                  >
                    Write a Review
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-6 space-y-6">
                {localReviews.map((review) => (
                  <div key={review._id} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-900">{review.user?.name ?? 'Anonymous'}</p>
                      <p className="text-xs text-gray-400">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Stars rating={review.rating} />
                      <span className="text-xs text-gray-500">{review.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-sm text-gray-600">{review.review}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Shipping & Returns Tab ── */}
        {active === 'shipping' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 bg-green-600 text-white rounded-full flex items-center justify-center shrink-0">
                    <svg className="h-5 w-5" viewBox="0 0 640 512" aria-hidden="true">
                      <path fill="currentColor" d="M0 96C0 60.7 28.7 32 64 32l288 0c35.3 0 64 28.7 64 64l0 32 50.7 0c17 0 33.3 6.7 45.3 18.7L557.3 192c12 12 18.7 28.3 18.7 45.3L576 384c0 35.3-28.7 64-64 64l-3.3 0c-10.4 36.9-44.4 64-84.7 64s-74.2-27.1-84.7-64l-102.6 0c-10.4 36.9-44.4 64-84.7 64s-74.2-27.1-84.7-64L64 448c-35.3 0-64-28.7-64-64L0 96zM512 288l0-50.7-45.3-45.3-50.7 0 0 96 96 0zM192 424a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zm232 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900">Shipping Information</h4>
                </div>
                <ul className="space-y-3">
                  {[
                    'Free shipping on orders over $50',
                    'Standard delivery: 3-5 business days',
                    'Express delivery available (1-2 business days)',
                    'Track your order in real-time',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckIcon className="text-green-600 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Returns */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 bg-green-600 text-white rounded-full flex items-center justify-center shrink-0">
                    <svg className="h-5 w-5" viewBox="0 0 512 512" aria-hidden="true">
                      <path fill="currentColor" d="M24 192l144 0c9.7 0 18.5-5.8 22.2-14.8s1.7-19.3-5.2-26.2l-46.7-46.7c75.3-58.6 184.3-53.3 253.5 15.9 75 75 75 196.5 0 271.5s-196.5 75-271.5 0c-10.2-10.2-19-21.3-26.4-33-9.5-14.9-29.3-19.3-44.2-9.8s-19.3 29.3-9.8 44.2C49.7 408.7 61.4 423.5 75 437 175 537 337 537 437 437S537 175 437 75C342.8-19.3 193.3-24.7 92.7 58.8L41 7C34.1 .2 23.8-1.9 14.8 1.8S0 14.3 0 24L0 168c0 13.3 10.7 24 24 24z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900">Returns and Refunds</h4>
                </div>
                <ul className="space-y-3">
                  {[
                    '30-day hassle-free returns',
                    'Full refund or exchange available',
                    'Free return shipping on defective items',
                    'Easy online return process',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckIcon className="text-green-600 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Buyer Protection */}
            <div className="bg-gray-50 rounded-lg p-6 flex items-center gap-4">
              <div className="h-14 w-14 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center shrink-0">
                <svg className="h-6 w-6" viewBox="0 0 512 512" aria-hidden="true">
                  <path fill="currentColor" d="M256 0c4.6 0 9.2 1 13.4 2.9L457.8 82.8c22 9.3 38.4 31 38.3 57.2-.5 99.2-41.3 280.7-213.6 363.2-16.7 8-36.1 8-52.8 0-172.4-82.5-213.1-264-213.6-363.2-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.9 1 251.4 0 256 0zm0 66.8l0 378.1c138-66.8 175.1-214.8 176-303.4l-176-74.6 0 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Buyer Protection Guarantee</h4>
                <p className="text-sm text-gray-600">
                  Get a full refund if your order does not arrive or is not as described. We ensure your shopping experience is safe and secure.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
