"use client";

import { Check, CircleAlert } from "lucide-react";
import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

/**
 * Branded text field. A visible label always (never placeholder-only), helper
 * text below, errors announced with role="alert" and tied to the input through
 * aria-describedby. Validate on blur, not per keystroke — the caller decides when
 * to pass `error`.
 *
 * States: default · hover · focus · filled · disabled · error · valid · loading.
 */
export function Field({
  label,
  hint,
  error,
  valid,
  loading,
  end,
  className,
  inputClassName,
  id: idProp,
  required,
  disabled,
  ...input
}: Omit<ComponentProps<"input">, "children"> & {
  label: string;
  hint?: ReactNode;
  /** Error message. Presence switches the field to the error state. */
  error?: string;
  /** Confirmed good, e.g. an applied coupon. */
  valid?: boolean;
  /** Async check in progress, e.g. validating a coupon. */
  loading?: boolean;
  /** A trailing control inside the field, e.g. a show-password button. */
  end?: ReactNode;
  inputClassName?: string;
}) {
  const auto = useId();
  const id = idProp ?? auto;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;

  const status = loading ? (
    <Spinner label="Checking" size={18} className="text-fg-3" />
  ) : error ? (
    <CircleAlert aria-hidden size={18} strokeWidth={1.5} className="text-error" />
  ) : valid ? (
    <Check aria-hidden size={18} strokeWidth={1.5} className="text-fg" />
  ) : null;
  const hasStatus = status !== null;
  const hasEnd = end != null && end !== false;

  return (
    <div className={cn("grid content-start gap-2", className)}>
      <label htmlFor={id} className={cn("t-label text-fg-2", disabled && "opacity-50")}>
        {label}
        {required && (
          <span aria-hidden className="text-fg-3">
            {" "}
            *
          </span>
        )}
      </label>
      <div className="relative">
        <input
          id={id}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-12 w-full rounded-field border border-field-edge bg-transparent px-5 text-base text-fg outline-none",
            "placeholder:text-fg-3 transition-[border-color,box-shadow] duration-(--dur-hover) ease-light",
            "enabled:hover:border-fg focus-visible:border-fg focus-visible:shadow-[0_0_0_1px_var(--text)]",
            "aria-invalid:border-error aria-invalid:shadow-[0_0_0_1px_var(--error)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            (hasStatus || hasEnd) && "pr-12",
            hasStatus && hasEnd && "pr-24",
            inputClassName,
          )}
          {...input}
        />
        {(hasStatus || hasEnd) && (
          <span className="absolute inset-y-0 right-2 flex items-center gap-1 pr-2">
            {status}
            {end}
          </span>
        )}
      </div>
      {error ? (
        <p key={error} id={errorId} role="alert" className="enter t-caption flex items-start gap-1.5 text-error">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="t-caption text-fg-3">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Multi-line sibling of Field: same label, hint and error behaviour; 12px corners instead of a pill. */
export function TextArea({
  label,
  hint,
  error,
  className,
  id: idProp,
  ...area
}: Omit<ComponentProps<"textarea">, "children"> & { label: string; hint?: ReactNode; error?: string }) {
  const auto = useId();
  const id = idProp ?? auto;
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("grid content-start gap-2", className)}>
      <label htmlFor={id} className="t-label text-fg-2">
        {label}
      </label>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "min-h-32 w-full resize-y rounded-card border border-field-edge bg-transparent px-5 py-3.5 t-body text-fg outline-none",
          "placeholder:text-fg-3 transition-[border-color,box-shadow] duration-(--dur-hover) ease-light",
          "hover:border-fg focus-visible:border-fg focus-visible:shadow-[0_0_0_1px_var(--text)]",
          "aria-invalid:border-error aria-invalid:shadow-[0_0_0_1px_var(--error)]",
        )}
        {...area}
      />
      {error ? (
        <p key={error} id={`${id}-error`} role="alert" className="enter t-caption text-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="t-caption text-fg-3">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
