'use client'

import { forwardRef, useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import { AuthField } from './AuthField'

type PasswordFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField(
  { label, error, id, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false)

  return (
    <AuthField
      ref={ref}
      id={id}
      label={label}
      error={error}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-ink-muted hover:text-gold"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          <svg className="h-4 w-4" role="img" viewBox="0 0 576 512" aria-hidden="true">
            {visible ? (
              <path
                fill="currentColor"
                d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4 3.3-7.9 3.3-16.7 0-24.6-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125.5 26.3-169.3 60.8L38.8 5.1zM223.1 149.5C248 126.2 281.4 112 320 112c79.5 0 144 64.5 144 144 0 24.9-6.3 48.3-17.4 68.7L408 288c1.3-5 2-10.5 2-16 0-53-43-96-96-96-3.6 0-7.1.2-10.6.6 1.9 5.2 3 10.7 3 16.4 0 8.5-2.7 16.4-7.3 22.9L223.1 149.5zM480 288c0 8.9-.6 17.6-1.9 26.2L578.4 402.6c1.4-2.1 2.6-4.2 3.8-6.2 3.3-5.6 3.3-12.4 0-18-19.5-33.5-61.9-92.9-127.1-135.4C480 261.7 480 274.6 480 288zM192 288c0 53 43 96 96 96 8.6 0 17-1.1 24.9-3.2l-89.1-70c-2.6-6.7-4.4-13.8-5.4-21.2 0 0 0 0 0 0-.3-2.2-.4-4.4-.4-6.6l-26-20.4c0 8.5 0 17 0 25.4z"
              />
            ) : (
              <path
                fill="currentColor"
                d="M288 32c-80.8 0-145.5 36.8-192.6 80.6-46.8 43.5-78.1 95.4-93 131.1-3.3 7.9-3.3 16.7 0 24.6 14.9 35.7 46.2 87.7 93 131.1 47.1 43.7 111.8 80.6 192.6 80.6s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1 3.3-7.9 3.3-16.7 0-24.6-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64-11.5 0-22.3-3-31.7-8.4-1 10.9-.1 22.1 2.9 33.2 13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-12.2-45.7-55.5-74.8-101.1-70.8 5.3 9.3 8.4 20.1 8.4 31.7z"
              />
            )}
          </svg>
        </button>
      }
      {...props}
    />
  )
})
