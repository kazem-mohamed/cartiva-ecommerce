import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "ghost" | "solid" | "plate";

const tones: Record<Tone, string> = {
  ghost: "text-fg hover:bg-raised",
  solid: "bg-raised text-fg hover:bg-[color-mix(in_srgb,var(--raised)_70%,var(--line-strong))]",
  // Sits on a product plate, which is light in both themes — so it is fixed onyx.
  plate: "bg-[#171721] text-[#ededf3] hover:bg-[#272735]",
};

/**
 * Round, 44px — the minimum touch target. `label` is required: an icon alone
 * says nothing to a screen reader.
 */
export function IconButton({
  label,
  icon,
  tone = "ghost",
  pressed,
  className,
  type = "button",
  ...rest
}: Omit<ComponentProps<"button">, "children" | "aria-label"> & {
  label: string;
  icon: ReactNode;
  tone?: Tone;
  /** For toggles (wishlist, compare): announces on/off state. */
  pressed?: boolean;
}) {
  return (
    <button
      type={type}
      aria-label={label}
      aria-pressed={pressed}
      className={cn(
        // Transitions: the base interaction rule (colour on hover rhythm, scale on press rhythm).
        "inline-grid size-11 shrink-0 place-items-center rounded-full enabled:active:scale-[.94]",
        "disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-5",
        tones[tone],
        className,
      )}
      {...rest}
    >
      {icon}
    </button>
  );
}
