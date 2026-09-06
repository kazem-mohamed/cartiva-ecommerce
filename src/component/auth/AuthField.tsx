'use client'

import { forwardRef } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  trailing?: ReactNode
}

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(function AuthField(
  { label, error, id, trailing, className, ...props },
  ref,
) {
  return (
    <div>
      <label htmlFor={id} className="label mb-2.5 block text-ink-muted">
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full rounded-[16px] border bg-sunk px-4 py-3.5 text-[15px] text-ink placeholder:text-ink-muted/70',
            'transition-colors duration-400 focus:bg-card focus:outline-none',
            error ? 'border-danger' : 'border-line focus:border-gold',
            trailing ? 'pr-12' : undefined,
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        {trailing}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-2 text-[12.5px] text-danger">
          {error}
        </p>
      )}
    </div>
  )
})
