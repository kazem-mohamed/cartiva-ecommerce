import type { ReactNode } from 'react'
import Link from 'next/link'
import ProfileNav from './ProfileNav'

/**
 * Shared shell for every account screen. Previously each profile page
 * carried its own header and stood alone, so there was no way to move
 * between them and no sense of being "inside" an account area.
 */
export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 py-10 sm:py-14">
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="label flex items-center gap-2 text-ink-muted">
          <li><Link href="/" className="transition-colors duration-300 hover:text-gold">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-ink">Account</li>
        </ol>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[264px_minmax(0,1fr)] lg:gap-8 lg:items-start">
        <ProfileNav />
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  )
}
