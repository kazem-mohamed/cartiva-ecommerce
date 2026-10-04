"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "./useTheme";

/**
 * Switches the room's lights. The new theme spreads from the button as a circle
 * of light (View Transitions); reduced motion swaps instantly.
 */
export function ThemeToggle({ className, showLabel = true }: { className?: string; showLabel?: boolean }) {
  const { theme, setTheme } = useTheme();
  const next = theme === "light" ? "dark" : "light";

  return (
    <button
      type="button"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setTheme(next, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }}
      aria-label={theme ? `Switch to ${next} theme` : "Switch colour theme"}
      className={cn(
        "inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-pill border border-field-edge px-3 text-fg t-label",
        "hover:bg-raised active:scale-[.97] [&_svg]:transition-[rotate] [&_svg]:duration-(--dur-state) hover:[&_svg]:rotate-[20deg]",
        showLabel && "pl-3 pr-4",
        className,
      )}
    >
      {/* Before hydration the theme is unknown; the icon pair is swapped by CSS so it is never wrong. */}
      {/* Keyed to <html> only: a subtree can pin its own theme (e.g. the header over the dark hero),
         but the toggle must always reflect the site's theme. */}
      <Sun aria-hidden size={18} strokeWidth={1.5} className="hidden [:root[data-theme=dark]_&]:block" />
      <Moon aria-hidden size={18} strokeWidth={1.5} className="hidden [:root[data-theme=light]_&]:block" />
      {showLabel && (
        <span className="[:root[data-theme=dark]_&]:after:content-['Light'] [:root[data-theme=light]_&]:after:content-['Dark']" />
      )}
    </button>
  );
}
