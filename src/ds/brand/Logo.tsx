import {
  CAP_HEIGHT,
  MARK_VIEWBOX,
  MINIMAL_RING_PATH,
  MINIMAL_VIEWBOX,
  RIM_PATH,
  RING_PATH,
  WORDMARK_BOX,
  WORDMARK_PATH,
} from "./logo-paths";

/** The rim of light only reads at 40px and up; below that the minimal mark is used. */
export const RIM_MIN_PX = 40;

type Labelled = { title?: string; className?: string };

function a11y(title?: string) {
  return title
    ? ({ role: "img", "aria-label": title } as const)
    : ({ "aria-hidden": true } as const);
}

/** Lit Edge symbol. Colour comes from `currentColor` — ivory on dark, onyx on light. */
export function LitEdgeMark({ size = 40, title, className }: Labelled & { size?: number }) {
  const minimal = size < RIM_MIN_PX;
  return (
    <svg
      viewBox={minimal ? MINIMAL_VIEWBOX : MARK_VIEWBOX}
      width={size}
      height={size}
      className={className}
      focusable="false"
      {...a11y(title)}
    >
      <path d={minimal ? MINIMAL_RING_PATH : RING_PATH} fill="currentColor" />
      {!minimal && <path d={RIM_PATH} fill="currentColor" />}
    </svg>
  );
}

type Variant = "horizontal" | "stacked" | "compact";

// Lockup geometry, in wordmark units (cap height = 729). Matches the brand board.
const WORD_W = WORDMARK_BOX.x + WORDMARK_BOX.width;
const LOCKUPS = {
  horizontal: { markH: CAP_HEIGHT * 1.34, gap: CAP_HEIGHT * 0.46, vb: MARK_VIEWBOX, minimal: false },
  compact: { markH: CAP_HEIGHT * 1.16, gap: CAP_HEIGHT * 0.4, vb: MINIMAL_VIEWBOX, minimal: true },
} as const;

/**
 * Cartiva logo. `height` is the rendered height in px.
 * horizontal — default (≥ 96px wide) · compact — small headers, no rim · stacked — auth, splash.
 */
export function CartivaLogo({
  variant = "horizontal",
  height = 24,
  title = "Cartiva",
  className,
}: Labelled & { variant?: Variant; height?: number }) {
  if (variant === "stacked") {
    const markH = CAP_HEIGHT * 2.2;
    const gap = CAP_HEIGHT * 0.62;
    const top = -CAP_HEIGHT - gap - markH;
    const vbH = markH + gap + CAP_HEIGHT + 40;
    const s = markH / 1200;
    return (
      <svg
        viewBox={`0 ${top} ${WORD_W} ${vbH}`}
        height={height}
        width={(height * WORD_W) / vbH}
        className={className}
        focusable="false"
        {...a11y(title)}
      >
        <g transform={`translate(${WORD_W / 2} ${top + markH / 2}) scale(${s})`}>
          <path d={RING_PATH} fill="currentColor" />
          <path d={RIM_PATH} fill="currentColor" />
        </g>
        <path d={WORDMARK_PATH} fill="currentColor" />
      </svg>
    );
  }

  const { markH, gap, vb, minimal } = LOCKUPS[variant];
  const vbSize = Number(vb.split(" ")[2]);
  const s = markH / vbSize;
  const top = -CAP_HEIGHT / 2 - markH / 2;
  const width = markH + gap + WORD_W;
  return (
    <svg
      viewBox={`0 ${top} ${width} ${markH}`}
      height={height}
      width={(height * width) / markH}
      className={className}
      focusable="false"
      {...a11y(title)}
    >
      <g transform={`translate(${markH / 2} ${-CAP_HEIGHT / 2}) scale(${s})`}>
        <path d={minimal ? MINIMAL_RING_PATH : RING_PATH} fill="currentColor" />
        {!minimal && <path d={RIM_PATH} fill="currentColor" />}
      </g>
      <path d={WORDMARK_PATH} fill="currentColor" transform={`translate(${markH + gap} 0)`} />
    </svg>
  );
}
