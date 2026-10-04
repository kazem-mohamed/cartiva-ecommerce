"use client";

import { Star } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Read-only rating: outlined stars with a filled layer clipped to the exact value. */
export function Stars({ value, size = 16, className }: { value: number; size?: number; className?: string }) {
  const pct = Math.max(0, Math.min(5, value)) * 20;
  const row = (filled: boolean) => (
    <span className="flex gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} size={size} strokeWidth={1.5} aria-hidden className={filled ? "fill-current" : undefined} />
      ))}
    </span>
  );
  return (
    <span className={cn("relative inline-flex text-fg", className)} role="img" aria-label={`${value.toFixed(1)} out of 5`}>
      <span className="text-line-strong">{row(false)}</span>
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${pct}%` }}>
        {row(true)}
      </span>
    </span>
  );
}

/** Rating input: a real radio group — arrow keys move, every star is labelled. */
export function StarInput({
  value,
  onChange,
  invalid,
  describedBy,
}: {
  value: number;
  onChange: (n: number) => void;
  invalid?: boolean;
  describedBy?: string;
}) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  // Hovering previews the rating the click would give.
  const [preview, setPreview] = useState(0);
  const labels = ["Poor", "Fair", "Good", "Very good", "Excellent"];
  return (
    <div
      role="radiogroup"
      aria-label="Your rating"
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className="flex gap-1"
      onPointerLeave={() => setPreview(0)}
    >
      {labels.map((label, i) => {
        const n = i + 1;
        const on = n <= (preview || value);
        return (
          <button
            key={n}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? "s" : ""} — ${label}`}
            tabIndex={value === n || (value === 0 && n === 1) ? 0 : -1}
            onClick={() => onChange(n)}
            onPointerEnter={(e) => e.pointerType === "mouse" && setPreview(n)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                e.preventDefault();
                const next = Math.min(5, (value || 0) + 1);
                onChange(next);
                refs.current[next - 1]?.focus();
              } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                e.preventDefault();
                const next = Math.max(1, (value || 1) - 1);
                onChange(next);
                refs.current[next - 1]?.focus();
              }
            }}
            className="grid size-11 place-items-center rounded-full hover:bg-raised active:scale-90"
          >
            <Star
              size={26}
              strokeWidth={1.5}
              aria-hidden
              className={cn("transition-[color,fill] duration-(--dur-hover) ease-light", on ? "fill-current text-fg" : "text-line-strong")}
            />
          </button>
        );
      })}
    </div>
  );
}
