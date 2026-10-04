"use client";

import { useSyncExternalStore } from "react";

/** Server and first client render return `fallback`, so hydration never disagrees. */
export function useMediaQuery(query: string, fallback = false) {
  return useSyncExternalStore(
    (onChange) => {
      const m = matchMedia(query);
      m.addEventListener("change", onChange);
      return () => m.removeEventListener("change", onChange);
    },
    () => matchMedia(query).matches,
    () => fallback,
  );
}
