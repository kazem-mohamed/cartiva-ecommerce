'use client'

import { Toaster as Sonner, type ToasterProps } from 'sonner'

/**
 * Toasts, on the brand.
 *
 * Engine rules applied:
 *   · auto-dismiss after 3-5s — set to 4000ms
 *   · never steal focus; announced politely to screen readers
 *   · colour is never the only signal — every variant carries an icon
 *
 * `richColors` is off: it paints red/green/amber fills that fight the Vault
 * palette. The status colour lives in the icon and a single left rule
 * instead, which keeps the toast a white bento tile like everything else.
 */
export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="bottom-right"
      duration={4000}
      gap={12}
      visibleToasts={3}
      closeButton
      icons={{
        success: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[18px] w-[18px] text-success">
            <path d="m5 13 4 4L19 7" />
          </svg>
        ),
        error: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[18px] w-[18px] text-danger">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ),
        warning: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-[18px] w-[18px] text-warning">
            <path d="M12 9v5M12 17.5v.5M10.3 3.9 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
          </svg>
        ),
        info: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-[18px] w-[18px] text-gold">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5M12 8v.5" />
          </svg>
        ),
        loading: (
          <span className="h-[18px] w-[18px] animate-spin rounded-full border-[1.5px] border-gold border-r-transparent" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            'toast-bento group flex items-start gap-3 rounded-[20px] border border-line-soft bg-card px-5 py-4 ' +
            'shadow-[var(--shadow-lift)] font-sans',
          title: 'text-[14.5px] font-medium text-ink leading-snug',
          description: 'text-[13px] font-light text-ink-muted mt-1 leading-relaxed',
          actionButton:
            'label rounded-full bg-vault px-4 py-2.5 text-white transition-transform duration-[280ms] hover:scale-[1.04]',
          cancelButton:
            'label rounded-full border border-line px-4 py-2.5 text-ink-muted transition-colors duration-[280ms] hover:border-ink',
          closeButton:
            'border border-line bg-card text-ink-muted hover:text-ink transition-colors duration-[280ms]',
          success: 'toast-success',
          error: 'toast-error',
          warning: 'toast-warning',
          info: 'toast-info',
        },
      }}
      {...props}
    />
  )
}
