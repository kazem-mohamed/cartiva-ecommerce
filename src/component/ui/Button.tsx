"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/**
 * Arrow Travel — the locked Cartiva primary action.
 *
 * At rest it is a centred label and nothing else. On hover the label steps
 * left and a mark arrives in the space it vacated: the composition changes,
 * not the colour.
 *
 * The gold SWEEPS rather than snaps. CSS cannot transition a
 * background-image, so the ramp is painted at 220% width and its *position*
 * is animated instead.
 *
 * These live on light surfaces — the button is the only near-black object
 * on the page, which is what makes it read as the primary action.
 */

type Variant = "primary" | "secondary" | "tertiary";
type Size = "md" | "lg";

const SIZES: Record<Size, string> = {
  md: "h-[52px] px-8",
  lg: "h-[58px] px-10",
};

const BASE =
  "relative inline-flex items-center justify-center rounded-full font-sans uppercase " +
  "text-[11px] font-medium tracking-[0.2em] overflow-hidden select-none " +
  "transition-[background-position,color,transform,border-color,box-shadow] duration-[700ms] " +
  "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none " +
  "active:scale-[0.985]";

function variantStyle(variant: Variant): React.CSSProperties {
  switch (variant) {
    case "primary":
      return {
        backgroundImage:
          "linear-gradient(var(--vault),var(--vault)), var(--metal)",
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
        backgroundSize: "100% 100%, 220% 100%",
        backgroundPosition: "0 0, 0% 0",
        border: "1px solid transparent",
        color: "var(--gold-pale)",
        transitionTimingFunction: "var(--ease)",
        boxShadow: "var(--shadow)",
      };
    case "secondary":
      return {
        background: "var(--card)",
        border: "1px solid var(--line)",
        color: "var(--ink)",
        transitionTimingFunction: "var(--ease)",
      };
    case "tertiary":
      return { color: "var(--gold)", border: 0, background: "none" };
  }
}

const Arrow = () => (
  <span
    aria-hidden="true"
    className="absolute right-7 flex opacity-0 -translate-x-2.5 transition-[opacity,transform] duration-[550ms] ease-[var(--ease)] group-hover:opacity-100 group-hover:translate-x-0"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3.5 w-3.5">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  </span>
);

const Label = ({ children }: { children: ReactNode }) => (
  <span className="inline-block transition-transform duration-[550ms] ease-[var(--ease)] group-hover:-translate-x-3.5">
    {children}
  </span>
);

type Common = {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
  className?: string;
};

export function Button({
  variant = "primary",
  size = "lg",
  loading = false,
  children,
  className = "",
  disabled,
  ...rest
}: Common & ComponentProps<"button">) {
  const isTertiary = variant === "tertiary";
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      data-variant={variant}
      style={variantStyle(variant)}
      className={`group btn-sweep ${BASE} ${
        isTertiary ? "h-auto rounded-none pb-3 tracking-[0.26em]" : SIZES[size]
      } ${className}`}
    >
      {loading ? (
        <>
          <span className="opacity-25">{children}</span>
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 -ml-[8px] -mt-[8px] h-4 w-4 animate-spin rounded-full border border-current border-r-transparent"
          />
          <span className="sr-only">Working…</span>
        </>
      ) : (
        <>
          <Label>{children}</Label>
          {!isTertiary && <Arrow />}
        </>
      )}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "lg",
  children,
  className = "",
  href,
  ...rest
}: Common & ComponentProps<typeof Link>) {
  const isTertiary = variant === "tertiary";
  return (
    <Link
      {...rest}
      href={href}
      data-variant={variant}
      style={variantStyle(variant)}
      className={`group btn-sweep ${BASE} ${
        isTertiary ? "h-auto rounded-none pb-3 tracking-[0.26em]" : SIZES[size]
      } ${className}`}
    >
      <Label>{children}</Label>
      {!isTertiary && <Arrow />}
    </Link>
  );
}
