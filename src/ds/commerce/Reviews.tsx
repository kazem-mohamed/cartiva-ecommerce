"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useSession } from "next-auth/react";
import { useId, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button, ButtonLink } from "../ui/Button";
import { TextArea } from "../ui/Field";
import { StarInput, Stars } from "../ui/Stars";

export type Review = {
  _id: string;
  review: string;
  rating: number;
  user?: { _id?: string; name?: string };
  createdAt?: string;
};

const API = (id: string) => `https://ecommerce.routemisr.com/api/v1/products/${id}/reviews`;
const date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const PAGE = 4;

function initials(name?: string) {
  return (name ?? "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

/**
 * Real reviews only: the summary and the distribution are computed from the
 * reviews the store actually has — never from an invented number. Photos and
 * "helpful" votes are absent because the API has neither.
 */
export function Reviews({
  productId,
  initial,
  ratingsAverage,
  ratingsQuantity,
}: {
  productId: string;
  initial: Review[];
  /** The product's star-rating fields. Many ratings come without a written review. */
  ratingsAverage?: number;
  ratingsQuantity?: number;
}) {
  const { data: session } = useSession();
  const token = session?.accessToken ?? null;
  const reduce = useReducedMotion();
  const [reviews, setReviews] = useState(initial);
  const [visible, setVisible] = useState(PAGE);
  const [writing, setWriting] = useState(false);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<{ rating?: string; text?: string }>({});
  const [sending, setSending] = useState(false);
  const ratingErr = useId();

  const total = reviews.length;
  const avg = total ? reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / total : 0;
  const dist = useMemo(
    () => [5, 4, 3, 2, 1].map((star) => ({ star, count: reviews.filter((r) => Math.round(r.rating) === star).length })),
    [reviews],
  );

  async function submit(e: FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!rating) next.rating = "Choose a rating from 1 to 5.";
    if (text.trim().length < 3) next.text = "Write a few words about it.";
    setErrors(next);
    if (Object.keys(next).length || !token) return;
    setSending(true);
    try {
      const res = await fetch(API(productId), {
        method: "POST",
        headers: { "Content-Type": "application/json", token, Authorization: `Bearer ${token}` },
        body: JSON.stringify({ review: text.trim(), rating }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message ?? "Couldn't publish your review. Try again.");
      const created: Review = json?.data ?? {
        _id: `local-${Date.now()}`,
        review: text.trim(),
        rating,
        user: { name: session?.user?.name ?? "You" },
        createdAt: new Date().toISOString(),
      };
      setReviews((r) => [created, ...r]);
      setText("");
      setRating(0);
      setWriting(false);
      toast("Review published. Thank you.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't publish your review. Try again.");
    } finally {
      setSending(false);
    }
  }

  const form = !token ? (
    <div className="grid justify-items-start gap-3 rounded-card bg-surface p-6">
      <p className="t-body text-fg-2">Sign in to write a review.</p>
      <ButtonLink href="/login" variant="secondary">
        Sign in
      </ButtonLink>
    </div>
  ) : (
    <form onSubmit={submit} noValidate className="grid gap-5 rounded-card bg-surface p-6">
      <div className="grid gap-2">
        <span className="t-label text-fg-2">Your rating</span>
        <StarInput
          value={rating}
          onChange={(n) => {
            setRating(n);
            setErrors((x) => ({ ...x, rating: undefined }));
          }}
          invalid={!!errors.rating}
          describedBy={errors.rating ? ratingErr : undefined}
        />
        {errors.rating && (
          <p id={ratingErr} role="alert" className="enter t-caption text-error">
            {errors.rating}
          </p>
        )}
      </div>
      <TextArea
        label="Your review"
        placeholder="What stood out — fit, finish, how it holds up?"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (errors.text) setErrors((x) => ({ ...x, text: undefined }));
        }}
        error={errors.text}
        maxLength={1000}
      />
      <div className="flex gap-3">
        <Button type="submit" variant="secondary" loading={sending} loadingLabel="Publishing">
          Publish review
        </Button>
        <Button type="button" variant="text" onClick={() => setWriting(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );

  return (
    <section aria-labelledby="reviews-title" className="grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-16">
      <div className="grid content-start gap-6">
        <h2 id="reviews-title" className="t-h2">
          Reviews
        </h2>
        {total === 0 && !!ratingsQuantity && !!ratingsAverage && (
          <div className="flex items-end gap-4">
            <span className="text-[3.5rem] leading-none font-display font-[380] [font-variation-settings:'SOFT'_100,'opsz'_144] t-num">{ratingsAverage.toFixed(1)}</span>
            <div className="grid gap-1 pb-1.5">
              <Stars value={ratingsAverage} />
              <span className="t-caption text-fg-3 t-num">
                {ratingsQuantity} {ratingsQuantity === 1 ? "rating" : "ratings"} · no written reviews yet
              </span>
            </div>
          </div>
        )}
        {total > 0 && (
          <div className="grid gap-5">
            <div className="flex items-end gap-4">
              <span className="text-[3.5rem] leading-none font-display font-[380] [font-variation-settings:'SOFT'_100,'opsz'_144] t-num">{avg.toFixed(1)}</span>
              <div className="grid gap-1 pb-1.5">
                <Stars value={avg} />
                <span className="t-caption text-fg-3 t-num">
                  {total} written {total === 1 ? "review" : "reviews"}
                  {!!ratingsQuantity && ratingsQuantity > total && ` · ${ratingsQuantity} ratings in all`}
                </span>
              </div>
            </div>
            <ul className="grid gap-2">
              {dist.map((d) => (
                <li key={d.star} className="grid grid-cols-[3ch_1fr_3ch] items-center gap-3 t-caption t-num text-fg-2">
                  <span>{d.star}★</span>
                  <span
                    className="h-1.5 overflow-hidden rounded-pill bg-raised"
                    role="img"
                    aria-label={`${d.count} of ${total} reviews gave ${d.star} star${d.star > 1 ? "s" : ""}`}
                  >
                    <motion.span
                      className="block h-full rounded-pill bg-fg"
                      initial={reduce ? false : { width: 0 }}
                      whileInView={{ width: `${total ? (d.count / total) * 100 : 0}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                      style={reduce ? { width: `${total ? (d.count / total) * 100 : 0}%` } : undefined}
                    />
                  </span>
                  <span className="text-right">{d.count}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {!writing && (
          <Button variant="secondary" onClick={() => setWriting(true)} className="justify-self-start">
            Write a review
          </Button>
        )}
      </div>

      <div className="grid content-start gap-6">
        <AnimatePresence initial={false}>
          {writing && (
            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, height: "auto" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              {form}
            </motion.div>
          )}
        </AnimatePresence>

        {total === 0 ? (
          <div className="grid gap-2 rounded-card border border-dashed border-line-strong p-8">
            <p className="t-h3">No reviews yet.</p>
            <p className="t-body text-fg-2">Bought it? Be the first to say how it is.</p>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {reviews.slice(0, visible).map((r) => (
              <li key={r._id} className="grid gap-3 py-6 first:pt-0">
                <div className="flex items-center gap-3">
                  <span aria-hidden className="grid size-10 place-items-center rounded-full bg-raised t-caption">
                    {initials(r.user?.name)}
                  </span>
                  <div className="grid">
                    <span className="t-label">{r.user?.name ?? "Customer"}</span>
                    {r.createdAt && <time dateTime={r.createdAt} className="t-caption text-fg-3">{date.format(new Date(r.createdAt))}</time>}
                  </div>
                  <Stars value={r.rating} size={14} className="ml-auto" />
                </div>
                <p className="t-body max-w-[65ch] text-fg-2">{r.review}</p>
              </li>
            ))}
          </ul>
        )}
        {visible < total && (
          <Button variant="text" onClick={() => setVisible((v) => v + PAGE)} className="justify-self-start">
            Show more reviews ({total - visible})
          </Button>
        )}
      </div>
    </section>
  );
}
