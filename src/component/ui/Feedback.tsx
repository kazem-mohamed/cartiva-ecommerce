import type { ReactNode } from 'react'

/**
 * Shared feedback primitives, built to the engine's rules:
 *
 *   · Loading States (HIGH) — skeleton or spinner for anything over 300ms
 *   · Error Messages (HIGH) — role="alert" / aria-live, never visual-only
 *   · Empty States — a helpful message AND an action, never a blank panel
 *   · Colour is never the only signal — every tone carries an icon
 *   · Progress Indicators — show where you are in a multi-step flow
 */

/* ── Skeleton ─────────────────────────────────────────────────────────── */

export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-full bg-sunk ${className}`} />
}

/** Card-shaped skeleton matching the real ProductCard footprint, so the
 *  swap to loaded content shifts nothing (CLS). */
export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true" className="bento p-3">
      <div className="well aspect-[4/5] animate-pulse" />
      <div className="space-y-3 px-2 pt-4 pb-2">
        <Skeleton className="h-2 w-1/3" />
        <Skeleton className="h-3.5 w-4/5" />
        <Skeleton className="h-5 w-1/2" />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({
  count = 8,
  className = 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  label = 'Loading products…',
}: {
  count?: number
  className?: string
  label?: string
}) {
  return (
    <>
      <div className={`grid gap-5 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
      <span className="sr-only" role="status">
        {label}
      </span>
    </>
  )
}

/* ── Spinner ──────────────────────────────────────────────────────────── */

export function Spinner({
  className = 'h-4 w-4',
  label,
}: {
  className?: string
  label?: string
}) {
  return (
    <>
      <span
        aria-hidden="true"
        className={`inline-block animate-spin rounded-full border-[1.5px] border-current border-r-transparent ${className}`}
      />
      {label && (
        <span className="sr-only" role="status">
          {label}
        </span>
      )}
    </>
  )
}

/* ── Alert ────────────────────────────────────────────────────────────── */

type Tone = 'info' | 'success' | 'warning' | 'danger'

const TONE: Record<Tone, { rule: string; icon: ReactNode; text: string }> = {
  info: {
    rule: 'var(--gold)',
    text: 'text-gold-deep',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8v.5" />
      </>
    ),
  },
  success: {
    rule: 'var(--success)',
    text: 'text-success',
    icon: <path d="m5 13 4 4L19 7" />,
  },
  warning: {
    rule: 'var(--warning)',
    text: 'text-warning',
    icon: (
      <>
        <path d="M12 9v5M12 17.5v.5" />
        <path d="M10.3 3.9 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      </>
    ),
  },
  danger: {
    rule: 'var(--danger)',
    text: 'text-danger',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v6M12 16v.5" />
      </>
    ),
  },
}

/**
 * Inline alert. Errors announce themselves via role="alert"; the rest use
 * a polite live region so they never interrupt what is being read.
 */
export function Alert({
  tone = 'info',
  title,
  children,
  action,
}: {
  tone?: Tone
  title?: string
  children?: ReactNode
  action?: ReactNode
}) {
  const t = TONE[tone]
  const assertive = tone === 'danger'

  return (
    <div
      role={assertive ? 'alert' : 'status'}
      aria-live={assertive ? 'assertive' : 'polite'}
      className="relative flex items-start gap-3.5 overflow-hidden rounded-[20px] border border-line-soft bg-card px-5 py-4"
      style={{ boxShadow: 'var(--shadow)' }}
    >
      {/* A rule, not a tinted fill — the tile stays a bento tile. */}
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px]" style={{ background: t.rule }} />

      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={`mt-0.5 h-[18px] w-[18px] shrink-0 ${t.text}`}
      >
        {t.icon}
      </svg>

      <div className="min-w-0 flex-1">
        {title && <p className="text-[14.5px] font-medium leading-snug text-ink">{title}</p>}
        {children && (
          <div className={`text-[13.5px] font-light leading-relaxed text-ink-muted ${title ? 'mt-1' : ''}`}>
            {children}
          </div>
        )}
      </div>

      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  )
}

/* ── Empty state ──────────────────────────────────────────────────────── */

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode
  title: string
  body?: string
  action?: ReactNode
}) {
  return (
    <div className="bento px-8 py-16 text-center">
      {icon && (
        <div className="mx-auto mb-7 grid h-16 w-16 place-items-center rounded-full bg-sunk text-ink-muted">
          {icon}
        </div>
      )}
      <h2 className="font-display text-2xl">{title}</h2>
      {body && <p className="mx-auto mt-3 max-w-[40ch] text-sm font-light text-ink-muted">{body}</p>}
      {action && <div className="mt-8 flex justify-center">{action}</div>}
    </div>
  )
}

/* ── Step progress ────────────────────────────────────────────────────── */

/** Engine rule: multi-step flows show where you are and how far is left. */
export function Steps({
  steps,
  current,
}: {
  steps: string[]
  current: number
}) {
  return (
    <ol className="flex items-center gap-3" aria-label={`Step ${current + 1} of ${steps.length}`}>
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={label} className="flex flex-1 items-center gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <span
                aria-hidden="true"
                className="h-[3px] w-full rounded-full transition-colors duration-[400ms]"
                style={{
                  background: done || active ? 'var(--gold)' : 'var(--line)',
                  opacity: active ? 1 : done ? 0.55 : 1,
                }}
              />
              <span
                className={`label truncate ${active ? 'text-gold' : 'text-ink-muted'}`}
                aria-current={active ? 'step' : undefined}
              >
                {label}
              </span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
