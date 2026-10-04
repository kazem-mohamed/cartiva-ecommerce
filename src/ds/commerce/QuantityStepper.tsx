"use client";

import { Minus, Plus } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * − count + in one pill. The number rolls in the direction it moved, so the
 * change is felt rather than just read. Minus stops at 1 — removing is its own,
 * explicit action.
 */
export function QuantityStepper({
  value,
  onChange,
  max,
  busy,
  label,
  size = "md",
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  max?: number;
  busy?: boolean;
  /** e.g. "Quantity of Woman Shawl" */
  label: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const reduce = useReducedMotion();
  // Direction of the last change, derived during render (React's sanctioned pattern).
  const [prev, setPrev] = useState(value);
  const [dir, setDir] = useState(1);
  if (value !== prev) {
    setDir(value > prev ? 1 : -1);
    setPrev(value);
  }

  const atMax = typeof max === "number" && value >= max;
  const btn = cn(
    "grid place-items-center rounded-full text-fg",
    "enabled:hover:bg-raised enabled:active:scale-[.9] disabled:cursor-not-allowed disabled:opacity-40 [&_svg]:size-4",
    size === "sm" ? "size-9" : "size-11",
  );

  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex items-center rounded-pill border border-line-strong p-0.5", busy && "opacity-80", className)}
    >
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity">
        <Minus strokeWidth={1.5} aria-hidden />
      </button>
      <span className={cn("relative grid overflow-hidden text-center t-label t-num", size === "sm" ? "w-7" : "w-9")} aria-live="polite">
        <AnimatePresence initial={false} mode="popLayout" custom={dir}>
          <motion.span
            key={value}
            custom={dir}
            initial={reduce ? { opacity: 0 } : { y: `${dir * 70}%`, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: `${dir * -70}%`, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="[grid-area:1/1]"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </span>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value + 1)}
        disabled={atMax}
        aria-label={atMax ? "Maximum quantity reached" : "Increase quantity"}
      >
        <Plus strokeWidth={1.5} aria-hidden />
      </button>
    </div>
  );
}
