"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * A hairline across the top while a navigation is actually in flight: it starts
 * when an internal link is followed (after 120ms, so quick moves stay silent)
 * and finishes when the new route renders. Never shown for time that isn't spent.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const route = `${pathname}?${search}`;
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");
  const [seen, setSeen] = useState(route);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // The route changed: finish the bar if it was showing.
  if (route !== seen) {
    setSeen(route);
    if (phase === "loading") setPhase("done");
  }

  useEffect(() => {
    clearTimeout(timer.current); // a navigation faster than 120ms never shows the bar
  }, [route]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download") || !a.href) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setPhase("loading"), 120);
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      clearTimeout(timer.current);
    };
  }, []);

  if (phase === "idle") return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-(--z-toast) h-0.5" role="progressbar" aria-label="Loading page">
      <div
        onTransitionEnd={() => phase === "done" && setPhase("idle")}
        className="h-full origin-left bg-fg transition-[transform,opacity] duration-(--dur-state) ease-light"
        style={
          phase === "done"
            ? { transform: "scaleX(1)", opacity: 0 }
            : { transform: "scaleX(0.8)", animation: "cv-progress 8s cubic-bezier(.16,1,.3,1) both" }
        }
      />
    </div>
  );
}
