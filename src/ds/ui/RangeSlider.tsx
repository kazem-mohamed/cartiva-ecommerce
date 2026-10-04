"use client";

import { cn } from "@/lib/utils";

/**
 * Two-thumb range built from two native range inputs laid over one track, so
 * each thumb keeps full keyboard and screen-reader support (arrow keys, Page
 * Up/Down, announced values). Thumbs can't cross.
 */
export function RangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  labels,
  format = String,
  className,
}: {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (next: [number, number]) => void;
  /** Accessible names for the two thumbs. */
  labels: [string, string];
  format?: (n: number) => string;
  className?: string;
}) {
  const span = Math.max(1, max - min);
  const lo = ((value[0] - min) / span) * 100;
  const hi = ((value[1] - min) / span) * 100;

  const thumb = cn(
    "pointer-events-none absolute inset-x-0 top-1/2 h-11 w-full -translate-y-1/2 appearance-none bg-transparent outline-none",
    "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full",
    "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-fg [&::-webkit-slider-thumb]:bg-canvas [&::-webkit-slider-thumb]:cursor-grab",
    "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-6 [&::-moz-range-thumb]:rounded-full",
    "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-fg [&::-moz-range-thumb]:bg-canvas [&::-moz-range-thumb]:cursor-grab",
    "focus-visible:[&::-webkit-slider-thumb]:outline-2 focus-visible:[&::-webkit-slider-thumb]:outline-offset-2 focus-visible:[&::-webkit-slider-thumb]:outline-(--focus)",
    // A halo of light on hover, wider while dragging — the thumb answers the pointer.
    "[&::-webkit-slider-thumb]:transition-[box-shadow] [&::-webkit-slider-thumb]:duration-(--dur-hover) [&::-webkit-slider-thumb]:ease-light",
    "hover:[&::-webkit-slider-thumb]:shadow-[0_0_0_6px_var(--raised)] active:[&::-webkit-slider-thumb]:shadow-[0_0_0_9px_var(--raised)] active:[&::-webkit-slider-thumb]:cursor-grabbing",
    "[&::-moz-range-thumb]:transition-[box-shadow] [&::-moz-range-thumb]:duration-(--dur-hover)",
    "hover:[&::-moz-range-thumb]:shadow-[0_0_0_6px_var(--raised)] active:[&::-moz-range-thumb]:shadow-[0_0_0_9px_var(--raised)]",
  );

  return (
    <div className={cn("grid gap-3", className)}>
      <div className="relative h-11">
        <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-pill bg-line-strong" />
        <div
          className="absolute top-1/2 h-0.5 -translate-y-1/2 rounded-pill bg-fg"
          style={{ left: `${lo}%`, right: `${100 - hi}%` }}
        />
        <input
          type="range"
          aria-label={labels[0]}
          aria-valuetext={format(value[0])}
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={(e) => onChange([Math.min(Number(e.target.value), value[1] - step), value[1]])}
          className={thumb}
        />
        <input
          type="range"
          aria-label={labels[1]}
          aria-valuetext={format(value[1])}
          min={min}
          max={max}
          step={step}
          value={value[1]}
          onChange={(e) => onChange([value[0], Math.max(Number(e.target.value), value[0] + step)])}
          className={thumb}
        />
      </div>
      <p className="flex justify-between t-label t-num text-fg-2">
        <span>{format(value[0])}</span>
        <span>{format(value[1])}</span>
      </p>
    </div>
  );
}
