'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Spinner } from '@/component/ui/Spinner'

export default function RouteLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const isFirstRender = useRef(true)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    setLoading(true)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setLoading(false)
    }, 450)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [pathname, searchParams])

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <div className="flex items-center gap-5 text-gray-500">
        <Spinner className="text-primary-600 h-12 w-12" />
        <span className="text-lg font-semibold">Loading...</span>
      </div>
    </div>
  )
}
