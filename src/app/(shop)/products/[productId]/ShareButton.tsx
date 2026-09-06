'use client'

import { toast } from 'sonner'

export default function ShareButton({ title }: { title: string }) {
  const handleShare = async () => {
    if (typeof navigator === 'undefined') return

    const url = window.location.href
    const share = navigator.share?.bind(navigator)

    if (share) {
      try {
        await share({ title, url })
      } catch {
        // user dismissed the native share sheet — nothing to report
      }
      return
    }

    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard')
    } catch {
      toast.error('Unable to copy link')
    }
  }

  return (
    <button
      className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink-muted transition-colors duration-400 hover:border-gold hover:text-gold"
      type="button"
      onClick={handleShare}
      title="Share this product"
    >
      <svg className="h-4 w-4" role="img" viewBox="0 0 512 512" aria-hidden="true">
        <path
          fill="currentColor"
          d="M384 192c53 0 96-43 96-96s-43-96-96-96-96 43-96 96c0 5.4 .5 10.8 1.3 16L159.6 184.1c-16.9-15-39.2-24.1-63.6-24.1-53 0-96 43-96 96s43 96 96 96c24.4 0 46.6-9.1 63.6-24.1L289.3 400c-.9 5.2-1.3 10.5-1.3 16 0 53 43 96 96 96s96-43 96-96-43-96-96-96c-24.4 0-46.6 9.1-63.6 24.1L190.7 272c.9-5.2 1.3-10.5 1.3-16s-.5-10.8-1.3-16l129.7-72.1c16.9 15 39.2 24.1 63.6 24.1z"
        />
      </svg>
    </button>
  )
}
