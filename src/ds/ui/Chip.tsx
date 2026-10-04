import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Quiet, informational: discount percentage, stock, tags. Never a call to action. */
export function Chip({ className, ...rest }: ComponentProps<"span">) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-pill bg-chip px-2.5 py-1 t-caption t-num text-on-chip", className)}
      {...rest}
    />
  );
}

/**
 * Selectable pill for filters and sort. Selected = inverted (text colour fills it),
 * so the state never depends on cobalt, which is reserved for the one action.
 */
export function ToggleChip({
  selected,
  className,
  type = "button",
  ...rest
}: ComponentProps<"button"> & { selected: boolean }) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-pill border px-4 t-label enabled:active:scale-[.97]",
        selected ? "border-fg bg-fg text-canvas hover:bg-fg-2 hover:border-fg-2" : "border-line-strong text-fg hover:border-fg hover:bg-raised",
        className,
      )}
      {...rest}
    />
  );
}
