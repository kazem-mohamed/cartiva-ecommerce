import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "text" | "danger";
export type ButtonSize = "md" | "lg";

// Transitions come from the base interaction rule (tokens.css): colours on the hover
// rhythm, the press scale on the faster press rhythm. `not-disabled` (not `enabled`)
// so ButtonLink — an <a> — presses too.
const base =
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-pill t-label " +
  "active:not-disabled:scale-[.97] aria-disabled:pointer-events-none aria-disabled:opacity-50 disabled:cursor-not-allowed disabled:opacity-50 " +
  "[&_svg]:size-[18px] [&_svg]:shrink-0";

const variants: Record<ButtonVariant, string> = {
  // The one cobalt per view — the single next step.
  primary: "bg-action text-on-action hover:bg-[color-mix(in_srgb,var(--action)_86%,white)]",
  secondary: "border border-field-edge text-fg hover:bg-raised",
  text: "text-fg underline decoration-line-strong underline-offset-[5px] hover:decoration-current",
  danger: "border border-error text-error hover:bg-[color-mix(in_srgb,var(--error)_12%,transparent)]",
};

const sizes: Record<ButtonSize, string> = {
  md: "h-12 px-6 text-[0.9375rem]",
  lg: "h-14 px-8 text-base",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; fullWidth?: boolean; className?: string } = {}) {
  return cn(base, variants[variant], variant === "text" ? "h-11 px-1" : sizes[size], fullWidth && "w-full", className);
}

type Shared = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

export function Button({
  variant,
  size,
  fullWidth,
  loading = false,
  loadingLabel,
  leadingIcon,
  trailingIcon,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: Shared &
  ComponentProps<"button"> & {
    /** Shows a spinner, keeps the width, and blocks repeat submits. */
    loading?: boolean;
    /** What a screen reader hears while loading, e.g. "Placing order". */
    loadingLabel?: string;
  }) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...rest}
    >
      {/* Content stays in the flow (invisible) while loading so the button never changes width. */}
      <span className={cn("inline-flex items-center gap-2", loading && "invisible")}>
        {leadingIcon}
        {children}
        {trailingIcon}
      </span>
      {loading && (
        <span className="absolute inset-0 grid place-items-center">
          <Spinner label={loadingLabel ?? "Loading"} />
        </span>
      )}
    </button>
  );
}

/** A link that looks like a button. For navigation — never for actions. */
export function ButtonLink({
  variant,
  size,
  fullWidth,
  leadingIcon,
  trailingIcon,
  className,
  children,
  ...rest
}: Shared & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonClasses({ variant, size, fullWidth, className })} {...rest}>
      {leadingIcon}
      {children}
      {trailingIcon}
    </Link>
  );
}
