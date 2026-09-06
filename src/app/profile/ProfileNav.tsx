'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * Account sidebar. The two profile pages used to be unconnected screens
 * with no way to move between them and no indication of where you were —
 * the engine flags both (Active State, Nav Hierarchy).
 */

const SECTIONS = [
  {
    href: '/profile',
    label: 'Overview',
    icon: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" /></>,
  },
  {
    href: '/profile/settings',
    label: 'Profile & password',
    icon: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>,
  },
  {
    href: '/profile/addresses',
    label: 'Addresses',
    icon: <><path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></>,
  },
]

const ELSEWHERE = [
  { href: '/orders', label: 'Orders' },
  { href: '/wishlist', label: 'Saved items' },
  { href: '/compare', label: 'Compare' },
]

export default function ProfileNav() {
  const pathname = usePathname()

  return (
    <aside className="lg:sticky lg:top-[92px] lg:self-start">
      <nav aria-label="Account" className="bento p-4">
        <ul className="flex flex-col gap-1">
          {SECTIONS.map((s) => {
            const active = pathname === s.href
            return (
              <li key={s.href}>
                <Link
                  href={s.href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-[16px] px-4 py-3.5 text-[14.5px] transition-colors duration-[280ms] ease-[var(--ease-hover)] ${
                    active ? 'bg-gold/10 font-medium text-gold-deep' : 'text-ink hover:bg-sunk'
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                    className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-gold' : 'text-ink-muted'}`}
                  >
                    {s.icon}
                  </svg>
                  {s.label}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="mt-4 border-t border-line-soft pt-4">
          <span className="label mb-2 block px-4 text-ink-muted">Elsewhere</span>
          <ul className="flex flex-col gap-0.5">
            {ELSEWHERE.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="flex items-center justify-between rounded-[16px] px-4 py-3 text-[14px] text-ink-muted transition-colors duration-[280ms] hover:bg-sunk hover:text-gold"
                >
                  {l.label}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="h-3.5 w-3.5">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  )
}
