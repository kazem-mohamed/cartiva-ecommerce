'use client'

import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/**
 * Auth submit — the locked Arrow Travel primary, rendered as a full-width
 * form action. Same gold sweep mechanic as every other primary button:
 * the ramp is painted at 220% width and its position is animated, because
 * CSS cannot transition a background-image.
 */
export function AuthSubmitButton({
  loading,
  loadingLabel,
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean
  loadingLabel?: string
}) {
  return (
    <button
      type="submit"
      data-variant="primary"
      style={{
        backgroundImage: 'linear-gradient(var(--vault),var(--vault)), var(--metal)',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
        backgroundSize: '100% 100%, 220% 100%',
        backgroundPosition: '0 0, 0% 0',
        border: '1px solid transparent',
        color: 'var(--gold-pale)',
        transitionTimingFunction: 'var(--ease)',
        boxShadow: 'var(--shadow)',
      }}
      className={cn(
        'btn-sweep group relative w-full overflow-hidden rounded-full py-4 text-[11px] font-medium uppercase tracking-[0.2em]',
        'transition-[background-position,color,transform] duration-[700ms]',
        'active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-40',
        className,
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center justify-center gap-2.5">
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border border-current border-r-transparent"
          />
          <span>{loadingLabel ?? 'Please wait…'}</span>
        </span>
      ) : (
        <>
          <span className="inline-block transition-transform duration-[550ms] ease-[var(--ease)] group-hover:-translate-x-3.5">
            {children}
          </span>
          <span
            aria-hidden="true"
            className="absolute right-7 top-1/2 flex -translate-y-1/2 -translate-x-2.5 opacity-0 transition-[opacity,transform] duration-[550ms] ease-[var(--ease)] group-hover:translate-x-0 group-hover:opacity-100"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </>
      )}
    </button>
  )
}
