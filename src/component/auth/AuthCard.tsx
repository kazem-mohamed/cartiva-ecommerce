import type { ReactNode } from 'react'
import Link from 'next/link'
import { CartivaMark } from '@/component/brand/CartivaMark'

/**
 * Auth shell — a split editorial spread, not a centred card on a page.
 *
 * Left: a standing brand panel that holds the page down and gives the form
 * something to sit against. Right: the form itself, generous and unhurried
 * (engine density 2/10). On mobile the panel collapses to a compact header
 * so the form is never pushed below the fold.
 *
 * The previous version was a 440px card floating in the middle of an empty
 * viewport — the exact centred-box default this brand exists to avoid.
 */

const MARKS = [
  'Tracked end to end from Cairo',
  'Ten departments, one account',
  'Your saved items follow you',
]

export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-[1320px] gap-6 px-5 py-8 sm:px-8 sm:py-12 lg:grid-cols-[minmax(0,44%)_minmax(0,1fr)] lg:gap-8 lg:py-16">
      {/* Brand panel */}
      <aside className="bento relative overflow-hidden p-8 sm:p-10 lg:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 90% at 15% 0%, rgba(154,107,18,0.10) 0%, transparent 62%)',
          }}
        />

        <div className="relative flex h-full flex-col">
          <Link href="/" className="inline-flex items-center gap-3 self-start" aria-label="Cartiva">
            <CartivaMark size={34} />
            <span className="font-display-lg text-[24px]">Cartiva</span>
          </Link>

          <h2 className="font-display-lg mt-10 text-[clamp(26px,3.4vw,42px)] lg:mt-16">
            Everything has
            <br />
            <span className="gold-text">a price tag.</span>
          </h2>

          <ul className="mt-8 hidden flex-col gap-4 lg:flex">
            {MARKS.map((m) => (
              <li key={m} className="flex items-start gap-3 text-[14.5px] font-light text-ink-muted">
                <span
                  aria-hidden="true"
                  className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-gold"
                />
                {m}
              </li>
            ))}
          </ul>

          <p className="mt-auto hidden pt-12 text-[12.5px] font-light text-ink-muted lg:block">
            A portfolio build on a public demo catalogue.
          </p>
        </div>
      </aside>

      {/* Form column */}
      <div className="flex items-center">
        <div className="w-full">{children}</div>
      </div>
    </div>
  )
}

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="bento w-full p-8 sm:p-10 lg:p-12">
      <div className="mb-9">
        <h1 className="font-display-lg text-[clamp(26px,3vw,34px)]">{title}</h1>
        <p className="mt-3 text-[15px] font-light text-ink-muted">{subtitle}</p>
      </div>

      {children}

      {footer && (
        <div className="mt-9 border-t border-line-soft pt-7 text-center text-[14px] font-light text-ink-muted">
          {footer}
        </div>
      )}
    </div>
  )
}
