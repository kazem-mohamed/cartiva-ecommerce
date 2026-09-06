'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/**
 * Route progress — a hairline bar across the top, not a blocking overlay.
 *
 * The previous version threw a full-screen white scrim with a spinner over
 * the page for 450ms on every navigation, which the engine's motion rules
 * call out directly: "Don't block navigation on animation; the app never
 * feels unresponsive." It also hid content the user could already read.
 *
 * This shows nothing at all for navigations under 300ms — the engine's
 * threshold for when a loading indicator is worth showing. Anything faster
 * resolves before the bar appears, so quick moves stay silent.
 */
export default function RouteLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle')
  const first = useRef(true)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }

    timers.current.forEach(clearTimeout)
    timers.current = []

    // Engine rule: indicator only for operations over ~300ms.
    const show = setTimeout(() => setPhase('running'), 300)
    const finish = setTimeout(() => setPhase('done'), 700)
    const reset = setTimeout(() => setPhase('idle'), 1100)
    timers.current = [show, finish, reset]

    return () => {
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
  }, [pathname, searchParams])

  if (phase === 'idle') return null

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px]"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div
        className="h-full origin-left transition-[transform,opacity] ease-[var(--ease)]"
        style={{
          background: 'var(--metal-light)',
          transform: phase === 'done' ? 'scaleX(1)' : 'scaleX(0.72)',
          opacity: phase === 'done' ? 0 : 1,
          transitionDuration: phase === 'done' ? '380ms' : '700ms',
        }}
      />
    </div>
  )
}
