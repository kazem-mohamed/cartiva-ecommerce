'use client'

import { type FormEvent, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

export interface Review {
  _id: string
  review: string
  rating: number
  user?: { _id?: string; name?: string }
  createdAt?: string
}

const REVIEWS_API = (productId: string) =>
  `https://ecommerce.routemisr.com/api/v1/products/${productId}/reviews`

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

function initials(name?: string) {
  if (!name) return '—'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          width={size}
          height={size}
          fill={i < Math.round(value) ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.3"
          className={i < Math.round(value) ? 'text-gold' : 'text-line'}
        >
          <path d="m12 3 2.6 5.6 6 .8-4.4 4.2 1.1 6.1L12 16.8 6.7 19.7l1.1-6.1L3.4 9.4l6-.8L12 3Z" />
        </svg>
      ))}
    </span>
  )
}

/** Interactive rating input — every star is a real, labelled button. */
function RatingInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState<number | null>(null)
  const shown = hover ?? value

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Your rating">
      {Array.from({ length: 5 }).map((_, i) => {
        const star = i + 1
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(null)}
            className="grid h-11 w-11 place-items-center rounded-full transition-colors duration-300 hover:bg-sunk"
          >
            <svg
              viewBox="0 0 24 24"
              className={`h-6 w-6 transition-colors duration-200 ${shown >= star ? 'text-gold' : 'text-line'}`}
              fill={shown >= star ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.3"
            >
              <path d="m12 3 2.6 5.6 6 .8-4.4 4.2 1.1 6.1L12 16.8 6.7 19.7l1.1-6.1L3.4 9.4l6-.8L12 3Z" />
            </svg>
          </button>
        )
      })}
    </div>
  )
}

export default function ProductReviews({
  productId,
  reviews: initialReviews,
  ratingsAverage = 0,
}: {
  productId: string
  reviews: Review[]
  ratingsAverage?: number
}) {
  const { data: session, status } = useSession()
  const token = session?.accessToken ?? ''

  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [visible, setVisible] = useState(6)
  const [errors, setErrors] = useState<{ rating?: string; text?: string }>({})

  const total = reviews.length
  const average = useMemo(() => {
    if (!total) return ratingsAverage
    return reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / total
  }, [reviews, total, ratingsAverage])

  /** Count per star, 5 → 1, for the distribution bars. */
  const distribution = useMemo(() => {
    const buckets = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviews.filter((r) => Math.round(r.rating ?? 0) === star).length,
    }))
    return buckets.map((b) => ({ ...b, pct: total ? (b.count / total) * 100 : 0 }))
  }, [reviews, total])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return

    const next: typeof errors = {}
    if (!rating) next.rating = 'Choose a rating.'
    if (!text.trim()) next.text = 'Write a few words about the product.'
    if (Object.keys(next).length) {
      setErrors(next)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(REVIEWS_API(productId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ review: text.trim(), rating }),
      })

      const json = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(json?.message ?? 'Could not publish your review.')
      }

      const created: Review = json?.data ?? {
        _id: `local-${Date.now()}`,
        review: text.trim(),
        rating,
        user: { name: session?.user?.name ?? 'You' },
        createdAt: new Date().toISOString(),
      }

      setReviews((prev) => [created, ...prev])
      setText('')
      setRating(0)
      setErrors({})
      setOpen(false)
      toast.success('Review published.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not publish your review.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 py-16 sm:py-24">
      <div className="mb-12 flex items-end justify-between gap-6 flex-wrap">
        <div>
          <span className="label text-ink-muted">What buyers said</span>
          <h2 className="font-display-lg mt-3 text-[clamp(28px,4vw,44px)]">Reviews</h2>
        </div>
        {status === 'authenticated' && !open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="label rounded-full border border-line px-6 py-3.5 transition-colors duration-400 hover:border-gold hover:text-gold"
          >
            Write a review
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-10 lg:items-start">
        {/* Score panel — sticky, so the summary stays while the list scrolls */}
        <aside className="bento p-8 lg:sticky lg:top-6">
          <div className="flex items-baseline gap-3">
            <span className="font-display tabular text-[56px] leading-none font-semibold">
              {average.toFixed(1)}
            </span>
            <span className="text-[15px] font-light text-ink-muted">/ 5</span>
          </div>
          <div className="mt-4">
            <Stars value={average} size={17} />
          </div>
          <p className="mt-3 text-[13.5px] font-light text-ink-muted">
            <span className="tabular">{total}</span> review{total === 1 ? '' : 's'}
          </p>

          <dl className="mt-8 flex flex-col gap-3">
            {distribution.map((d) => (
              <div key={d.star} className="flex items-center gap-3">
                <dt className="tabular w-3 shrink-0 text-[12.5px] text-ink-muted">{d.star}</dt>
                <div
                  className="h-1.5 flex-1 overflow-hidden rounded-full bg-sunk"
                  role="img"
                  aria-label={`${d.count} of ${total} reviews gave ${d.star} stars`}
                >
                  <div
                    className="h-full rounded-full bg-gold transition-[width] duration-[800ms] ease-[var(--ease)]"
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
                <dd className="tabular w-7 shrink-0 text-right text-[12.5px] text-ink-muted">
                  {d.count}
                </dd>
              </div>
            ))}
          </dl>
        </aside>

        <div>
          {/* Write form */}
          {open && (
            <form onSubmit={handleSubmit} className="bento mb-6 p-7 sm:p-8">
              <h3 className="font-display text-lg">Your review</h3>

              <div className="mt-6">
                <span className="label mb-2 block text-ink-muted">Rating</span>
                <RatingInput
                  value={rating}
                  onChange={(n) => {
                    setRating(n)
                    setErrors((p) => ({ ...p, rating: undefined }))
                  }}
                />
                {errors.rating && (
                  <p role="alert" className="mt-2 text-[12.5px] text-danger">{errors.rating}</p>
                )}
              </div>

              <div className="mt-6">
                <label htmlFor="review-text" className="label mb-2.5 block text-ink-muted">
                  Your words
                </label>
                <textarea
                  id="review-text"
                  rows={4}
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value)
                    if (errors.text && e.target.value.trim()) setErrors((p) => ({ ...p, text: undefined }))
                  }}
                  aria-invalid={errors.text ? true : undefined}
                  aria-describedby={errors.text ? 'review-text-error' : undefined}
                  placeholder="How did it hold up?"
                  className={`w-full resize-y rounded-[16px] border bg-sunk px-4 py-3.5 text-[15px] transition-colors duration-400 focus:bg-card focus:outline-none ${
                    errors.text ? 'border-danger' : 'border-line focus:border-gold'
                  }`}
                />
                {errors.text && (
                  <p id="review-text-error" role="alert" className="mt-2 text-[12.5px] text-danger">
                    {errors.text}
                  </p>
                )}
              </div>

              <div className="mt-7 flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="label rounded-full bg-vault px-7 py-3.5 text-white transition-transform duration-400 hover:scale-[1.03] disabled:opacity-50"
                >
                  {submitting ? 'Publishing…' : 'Publish review'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    setErrors({})
                  }}
                  className="label rounded-full border border-line px-7 py-3.5 transition-colors duration-400 hover:border-ink"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {status !== 'authenticated' && (
            <p className="bento mb-6 px-7 py-5 text-[14px] font-light text-ink-muted">
              Sign in to write a review.
            </p>
          )}

          {/* List */}
          {total === 0 ? (
            <div className="bento px-8 py-16 text-center">
              <h3 className="font-display text-lg">No reviews yet</h3>
              <p className="mt-2.5 text-sm font-light text-ink-muted">
                Be the first to say something about this product.
              </p>
            </div>
          ) : (
            <>
              <ul className="flex flex-col gap-4">
                {reviews.slice(0, visible).map((r) => (
                  <li key={r._id} className="bento p-7">
                    <div className="flex items-start gap-4">
                      <span
                        aria-hidden="true"
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sunk text-[12.5px] font-medium text-ink-muted"
                      >
                        {initials(r.user?.name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                          <p className="text-[15px] font-medium">{r.user?.name ?? 'Cartiva buyer'}</p>
                          {r.createdAt && (
                            <time
                              dateTime={r.createdAt}
                              className="tabular text-[12.5px] font-light text-ink-muted"
                            >
                              {dateFmt.format(new Date(r.createdAt))}
                            </time>
                          )}
                        </div>
                        <div className="mt-2">
                          <Stars value={r.rating ?? 0} />
                          <span className="sr-only">{r.rating} out of 5</span>
                        </div>
                        <p className="mt-3.5 text-[15px] font-light leading-relaxed text-ink-soft">
                          {r.review}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {visible < total && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisible((v) => v + 6)}
                    className="label rounded-full border border-line px-8 py-4 transition-colors duration-400 hover:border-gold hover:text-gold"
                  >
                    Show more · <span className="tabular">{total - visible}</span> left
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
