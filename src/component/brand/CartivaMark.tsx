"use client";

import { useId } from "react";

/**
 * Cartiva mark — constructed, not drawn.
 *
 * A ring with a rectangular bite taken from its right side produces a C,
 * with a disc seated in the mouth: a letter and a container at once.
 * Geometry is fixed — never re-round, rotate, skew or stretch it.
 *
 * The mask id comes from useId, not a module counter. A counter increments
 * separately on the server and on the client, so the two render different
 * ids and React reports a hydration mismatch — which is exactly what a
 * previous version of this file did.
 */

type Tone = "ink" | "reversed";

const TONES: Record<Tone, { ring: string; disc: string }> = {
  ink: { ring: "#1C1917", disc: "#9A6B12" },
  reversed: { ring: "#F2ECE1", disc: "#E8C878" },
};

export function CartivaMark({
  size = 32,
  tone = "ink",
  className,
}: {
  size?: number;
  tone?: Tone;
  className?: string;
}) {
  const maskId = `cartiva-mark-${useId().replace(/:/g, "")}`;
  const { ring, disc } = TONES[tone];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Cartiva"
    >
      <mask id={maskId}>
        <rect width="100" height="100" fill="#000" />
        <circle cx="50" cy="50" r="44" fill="#fff" />
        <circle cx="50" cy="50" r="23" fill="#000" />
        <rect x="50" y="35" width="50" height="30" fill="#000" />
      </mask>
      <rect width="100" height="100" fill={ring} mask={`url(#${maskId})`} />
      <circle cx="68" cy="50" r="9" fill={disc} />
    </svg>
  );
}

/** Mark plus wordmark. Minimum 96px wide. */
export function CartivaLockup({
  size = 30,
  tone = "ink",
  className = "",
}: {
  size?: number;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <CartivaMark size={size} tone={tone} />
      <span
        className="font-display-lg"
        style={{
          fontSize: size * 0.72,
          color: tone === "ink" ? "var(--vault)" : "#F2ECE1",
        }}
      >
        Cartiva
      </span>
    </span>
  );
}
