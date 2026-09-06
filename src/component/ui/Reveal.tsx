"use client";

import { useEffect, useRef } from "react";

/**
 * Scroll reveal to the engine's spec: y 24px, 0.08s stagger, ~500ms.
 * The engine's anti-pattern list for this direction names "fast animations",
 * so nothing here runs short.
 *
 * Two failure modes this guards against, both of which hide content
 * permanently — the worst thing a reveal can do:
 *
 *  1. An element scrolled PAST before the observer attached never
 *     intersects again, so it would stay invisible forever. Anything
 *     already above the viewport bottom is revealed immediately.
 *  2. Re-running this effect on every render (e.g. by depending on
 *     `children`) tears down the observer and cancels the failsafe timer
 *     mid-flight. The effect deliberately runs once per mount.
 */
export default function Reveal({
  children,
  stagger = 80,
  className = "",
}: {
  children: React.ReactNode;
  stagger?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const staggerRef = useRef(stagger);
  staggerRef.current = stagger;

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const collect = () => Array.from(root.querySelectorAll<HTMLElement>(".reveal:not(.is-in)"));
    const showAll = () => collect().forEach((el) => el.classList.add("is-in"));

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      showAll();
      return;
    }

    const items = collect();
    if (!items.length) return;

    // Anything already at or above the fold gets revealed straight away —
    // it will never produce an intersection event.
    const vh = window.innerHeight;
    const pending: HTMLElement[] = [];
    items.forEach((el) => {
      if (el.getBoundingClientRect().top < vh) el.classList.add("is-in");
      else pending.push(el);
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const i = pending.indexOf(entry.target as HTMLElement);
          window.setTimeout(
            () => entry.target.classList.add("is-in"),
            Math.max(i % 8, 0) * staggerRef.current
          );
          io.unobserve(entry.target);
        });
      },
      { threshold: 0, rootMargin: "0px 0px -5% 0px" }
    );

    pending.forEach((el) => io.observe(el));

    // Last resort: content must never stay hidden.
    const failsafe = window.setTimeout(showAll, 3000);

    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
    };
    // Runs once per mount by design — see the note above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
