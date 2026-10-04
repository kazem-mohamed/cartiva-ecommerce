"use client";

import { useCallback, useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY, type Theme } from "./theme";

// The <html data-theme> attribute is the single source of truth. It is set before
// hydration by themeInitScript, so reading it here never disagrees with the paint.
function read(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  // With no stored choice, keep following the OS live.
  const media = matchMedia("(prefers-color-scheme: light)");
  const onSystem = () => {
    try {
      if (localStorage.getItem(THEME_STORAGE_KEY)) return;
    } catch {}
    document.documentElement.setAttribute("data-theme", media.matches ? "light" : "dark");
  };
  media.addEventListener("change", onSystem);

  return () => {
    observer.disconnect();
    media.removeEventListener("change", onSystem);
  };
}

export function useTheme() {
  // Server snapshot is null: the server cannot know the theme, so theme-dependent
  // UI (the toggle's label) renders only after hydration instead of mismatching.
  const theme = useSyncExternalStore<Theme | null>(subscribe, read, () => null);

  const setTheme = useCallback((next: Theme, origin?: { x: number; y: number }) => {
    const root = document.documentElement;
    const apply = () => {
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {}
    };
    if (origin) {
      root.style.setProperty("--vt-x", `${origin.x}px`);
      root.style.setProperty("--vt-y", `${origin.y}px`);
    }
    // Colour transitions are paused for the swap (see .theme-switching in tokens.css):
    // the new palette lands at once, and the view transition does the animating.
    root.classList.add("theme-switching");
    const done = () => requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("theme-switching")));
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduce) {
      apply();
      done();
    } else {
      document.startViewTransition(apply).finished.finally(done);
    }
  }, []);

  return { theme, setTheme };
}
