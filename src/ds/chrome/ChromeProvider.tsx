"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { SearchOverlay } from "../commerce/SearchOverlay";

/** What the floating mobile pill becomes on a product page. */
export type PillAction = { label: string; price?: string; onClick: () => void; busy?: boolean; disabled?: boolean };

type Chrome = {
  openSearch: () => void;
  pillAction: PillAction | null;
  setPillAction: (a: PillAction | null) => void;
};

const ChromeContext = createContext<Chrome | null>(null);

export function useChrome() {
  const ctx = useContext(ChromeContext);
  if (!ctx) throw new Error("useChrome must be used inside <ChromeProvider>");
  return ctx;
}

/** Search opens from anywhere: the header, the mobile pill, "/" or ⌘K / Ctrl+K. */
export function ChromeProvider({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [pillAction, setPillAction] = useState<PillAction | null>(null);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo(() => ({ openSearch, pillAction, setPillAction }), [openSearch, pillAction]);
  return (
    <ChromeContext.Provider value={value}>
      {children}
      <SearchOverlay open={searchOpen} onClose={closeSearch} />
    </ChromeContext.Provider>
  );
}
