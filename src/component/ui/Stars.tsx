import { cn } from '@/lib/utils'

export function Stars({
  rating = 0,
  className,
  size = 'h-4 w-4',
}: {
  rating?: number
  className?: string
  size?: string
}) {
  const filled = Math.round(rating)
  return (
    <div className={cn('flex text-gold', className)}>
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          className={cn(size, index < filled ? 'text-yellow-400' : 'text-line')}
          viewBox="0 0 576 512"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M309.5 13.5c-4.1-8-12.4-13.1-21.4-13.1s-17.3 5.1-21.4 13.1L193.1 125.3 33.2 150.7c-8.9 1.4-16.3 7.7-19.1 16.3s-.5 18 5.8 24.4l114.4 114.5-25.2 159.9c-1.4 8.9 2.3 17.9 9.6 23.2s16.9 6.1 25 2L288.1 417.6 432.4 491c8 4.1 17.7 3.3 25-2s11-14.2 9.6-23.2L441.7 305.9 556.1 191.4c6.4-6.4 8.6-15.8 5.8-24.4s-10.1-14.9-19.1-16.3L383 125.3 309.5 13.5z"
          />
        </svg>
      ))}
    </div>
  )
}
