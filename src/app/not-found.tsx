import Link from 'next/link'
import type { Metadata } from 'next'
import { ButtonLink } from '@/component/ui/Button'
import { CartivaMark } from '@/component/brand/CartivaMark'

export const metadata: Metadata = {
  title: 'Page not found',
}

/**
 * 404 — a single Bento tile on the light ground.
 *
 * The previous version stacked four blurred gradient blobs (500px, blur-3xl)
 * behind a gradient card. The engine lists "Cheap visuals" under Avoid for
 * this direction, and those blobs are also the most expensive thing on the
 * page to paint for something nobody wants to look at.
 */

const LINKS = [
  { label: 'All products', href: '/products' },
  { label: 'Departments', href: '/categories' },
  { label: 'Brands', href: '/brand' },
  { label: 'Search', href: '/search' },
]

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-[1320px] flex-1 items-center justify-center px-5 py-20 sm:px-8 sm:py-28">
      <div className="bento w-full max-w-[560px] px-8 py-14 text-center sm:px-12">
        <div className="flex justify-center">
          <CartivaMark size={44} />
        </div>

        <p className="label tabular mt-9 text-ink-muted">Error 404</p>

        <h1 className="font-display-lg mt-4 text-[clamp(30px,5vw,46px)]">
          This page has <span className="gold-text">no price tag.</span>
        </h1>

        <p className="mx-auto mt-5 max-w-[42ch] text-[15.5px] font-light leading-relaxed text-ink-muted">
          The link may be out of date, or the item is no longer in the
          catalogue. Everything else is still where you left it.
        </p>

        <div className="mt-9 flex justify-center">
          <ButtonLink href="/">Back to home</ButtonLink>
        </div>

        <div className="mt-10 border-t border-line-soft pt-8">
          <span className="label mb-4 block text-ink-muted">Or jump to</span>
          <ul className="flex flex-wrap justify-center gap-2.5">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="inline-block rounded-full border border-line px-4 py-2.5 text-[13px] transition-colors duration-[280ms] ease-[var(--ease-hover)] hover:border-gold hover:text-gold"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}
