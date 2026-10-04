import { cn } from "@/lib/utils";
import { EditorialImage, hasEditorial } from "./EditorialImage";

/** Until the editorial photograph arrives: the same idea, drawn — an empty plinth under one light. */
function Plinth({ compact }: { compact?: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 160 120" className={cn("text-fg", compact ? "w-28" : "w-40")}>
      <defs>
        <radialGradient id="plinth-light" cx="50%" cy="0%" r="80%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.16" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d="M62 0h36l30 84H32z" fill="url(#plinth-light)" />
      <rect x="44" y="84" width="72" height="30" rx="3" fill="var(--raised)" />
      <ellipse cx="80" cy="84" rx="36" ry="7" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="1" />
    </svg>
  );
}

/**
 * Every "nothing here" moment: an empty plinth under one light, a sentence that
 * names the space, and one way forward. An invitation, never an apology.
 */
export function EmptyState({
  title,
  body,
  action,
  compact,
  heading = "h2",
  className,
}: {
  title: string;
  body?: React.ReactNode;
  action?: React.ReactNode;
  /** Drawers and small panels: a smaller image. */
  compact?: boolean;
  /** "h1" when the empty state is the whole page (no page title above it). */
  heading?: "h1" | "h2";
  className?: string;
}) {
  const Heading = heading;
  return (
    <div className={cn("enter grid justify-items-center gap-5 text-center", className)}>
      {hasEditorial("empty-plinth") ? (
        <EditorialImage name="empty-plinth" className={cn("w-full", compact ? "max-w-60" : "max-w-md")} />
      ) : (
        <Plinth compact={compact} />
      )}
      <div className="grid max-w-[40ch] gap-2">
        <Heading className={compact ? "t-h3" : "t-h2"}>{title}</Heading>
        {body && <p className="t-body text-fg-2">{body}</p>}
      </div>
      {action}
    </div>
  );
}
