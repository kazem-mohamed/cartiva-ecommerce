'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { clearCompare, getCompareIds } from '@/lib/compare'

export default function CompareBar() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const sync = () => setCount(getCompareIds().length)
    sync()
    window.addEventListener('compareUpdated', sync)
    return () => window.removeEventListener('compareUpdated', sync)
  }, [])

  if (count === 0) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full bg-vault text-white pl-5 pr-2 py-2 shadow-[var(--shadow-lift)] shadow-[var(--shadow-lift)]">
      <span className="text-sm font-medium">Compare ({count})</span>
      <Link
        className="rounded-full bg-vault hover:bg-vault text-white text-sm font-semibold px-4 py-1.5 transition-colors"
        href="/compare"
      >
        View
      </Link>
      <button
        className="h-7 w-7 rounded-full flex items-center justify-center text-ink-muted hover:text-white hover:bg-white/10 transition"
        type="button"
        title="Clear compare list"
        onClick={() => clearCompare()}
      >
        <svg className="h-3 w-3" viewBox="0 0 384 512" aria-hidden="true">
          <path
            fill="currentColor"
            d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
          />
        </svg>
      </button>
    </div>
  )
}
