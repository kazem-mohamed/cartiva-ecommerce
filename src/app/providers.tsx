'use client'

import { MotionConfig } from 'motion/react'
import { SessionProvider } from 'next-auth/react'
import { CartDrawer } from '@/ds/commerce/CartDrawer'
import { CommerceProvider } from '@/ds/commerce/CommerceProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // reducedMotion="user": with the OS setting on, every motion component keeps its fades but drops movement.
    <MotionConfig reducedMotion="user">
      <SessionProvider>
        <CommerceProvider>
          {children}
          <CartDrawer />
        </CommerceProvider>
      </SessionProvider>
    </MotionConfig>
  )
}
