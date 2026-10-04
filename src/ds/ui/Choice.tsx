"use client";

import { Check } from "lucide-react";
import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Real <input type="checkbox"> underneath (keyboard, forms, screen readers all
 * work natively); only the visual is custom. Checked = filled with the text
 * colour, never cobalt.
 */
export function Checkbox({
  label,
  meta,
  className,
  disabled,
  ...input
}: Omit<ComponentProps<"input">, "type"> & { label: ReactNode; meta?: ReactNode }) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={cn("group flex min-h-11 cursor-pointer items-center gap-3 t-body", disabled && "cursor-not-allowed opacity-50", className)}
    >
      <input id={id} type="checkbox" disabled={disabled} className="peer sr-only" {...input} />
      <span
        aria-hidden
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-[6px] border border-line-strong text-canvas",
          "transition-[background-color,border-color] duration-(--dur-hover) ease-light group-hover:border-fg",
          "peer-checked:border-fg peer-checked:bg-fg peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--focus)",
          "[&>svg]:scale-50 [&>svg]:opacity-0 [&>svg]:transition-[scale,opacity] [&>svg]:duration-(--dur-hover) [&>svg]:ease-light peer-checked:[&>svg]:scale-100 peer-checked:[&>svg]:opacity-100",
        )}
      >
        <Check size={14} strokeWidth={2.25} />
      </span>
      <span className="flex-1">{label}</span>
      {meta && <span className="t-caption t-num text-fg-3">{meta}</span>}
    </label>
  );
}

/** One of several options as a card — a real radio underneath, the whole card is the target. Selected = a ring in the text colour. */
export function RadioCard({
  title,
  body,
  meta,
  className,
  ...input
}: Omit<ComponentProps<"input">, "type" | "title"> & { title: ReactNode; body?: ReactNode; meta?: ReactNode }) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-4 rounded-card border border-line p-5",
        "transition-[border-color,box-shadow] duration-(--dur-hover) ease-light hover:border-line-strong",
        "has-checked:border-fg has-checked:shadow-[0_0_0_1px_var(--text)]",
        "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--focus)",
        className,
      )}
    >
      <input id={id} type="radio" className="peer sr-only" {...input} />
      <span
        aria-hidden
        className={cn(
          "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-line-strong transition-colors duration-(--dur-hover) peer-checked:border-fg",
          "after:size-2.5 after:scale-0 after:rounded-full after:bg-fg after:transition-transform after:duration-(--dur-hover) after:ease-light peer-checked:after:scale-100",
        )}
      />
      <span className="grid min-w-0 flex-1 gap-1">
        <span className="t-label">{title}</span>
        {body && <span className="t-caption text-fg-2">{body}</span>}
      </span>
      {meta}
    </label>
  );
}

/** On/off. A real checkbox with role="switch" — the thumb slides, the track fills. */
export function Switch({
  label,
  meta,
  className,
  ...input
}: Omit<ComponentProps<"input">, "type" | "role"> & { label: ReactNode; meta?: ReactNode }) {
  const id = useId();
  return (
    <label htmlFor={id} className={cn("group flex min-h-11 cursor-pointer items-center gap-3 t-body", className)}>
      <span className="flex-1">{label}</span>
      {meta && <span className="t-caption t-num text-fg-3">{meta}</span>}
      <input id={id} type="checkbox" role="switch" className="peer sr-only" {...input} />
      <span
        aria-hidden
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-pill border border-line-strong bg-transparent",
          "transition-[background-color,border-color] duration-(--dur-state) ease-light group-hover:border-fg",
          "peer-checked:border-fg peer-checked:bg-fg peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--focus)",
          "after:absolute after:top-1/2 after:left-1 after:size-5 after:-translate-y-1/2 after:rounded-full after:bg-fg after:transition-[translate,background-color] after:duration-(--dur-state) after:ease-light",
          "peer-checked:after:translate-x-5 peer-checked:after:bg-canvas",
        )}
      />
    </label>
  );
}
