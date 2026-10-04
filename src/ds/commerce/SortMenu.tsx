"use client";

import { Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { SORTS, type SortKey } from "./filter-logic";

/**
 * Sort as a custom listbox: button opens a popover, ↑ ↓ move, Enter or Space
 * picks, Escape or a click outside closes and returns focus to the button.
 */
export function SortMenu({ value, onChange, className }: { value: SortKey; onChange: (k: SortKey) => void; className?: string }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() => SORTS.findIndex((s) => s.key === value));
  const id = useId();
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const current = SORTS.find((s) => s.key === value) ?? SORTS[0];

  useEffect(() => {
    if (!open) return;
    list.current?.focus();
    const onDown = (e: PointerEvent) => {
      if (!list.current?.contains(e.target as Node) && !btn.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const pick = (k: SortKey) => {
    onChange(k);
    setOpen(false);
    btn.current?.focus();
  };

  return (
    <div className={cn("relative", className)}>
      <button
        ref={btn}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          setActive(SORTS.findIndex((s) => s.key === value));
          setOpen((o) => !o);
        }}
        className="inline-flex h-11 items-center gap-2 rounded-pill border border-line-strong px-4 t-label hover:border-fg active:scale-[.98] aria-expanded:border-fg"
      >
        <span className="text-fg-3">Sort:</span> {current.label}
        <ChevronDown aria-hidden size={16} strokeWidth={1.5} className={cn("transition-transform duration-(--dur-state)", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            ref={list}
            id={id}
            role="listbox"
            tabIndex={-1}
            aria-label="Sort products"
            aria-activedescendant={`${id}-${active}`}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } }}
            exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.14, ease: [0.4, 0, 1, 1] } }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((i) => (i + 1) % SORTS.length);
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((i) => (i - 1 + SORTS.length) % SORTS.length);
              } else if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                pick(SORTS[active].key);
              } else if (e.key === "Escape" || e.key === "Tab") {
                setOpen(false);
                btn.current?.focus();
              }
            }}
            className="absolute right-0 z-(--z-raised) mt-2 min-w-56 origin-top-right rounded-card border border-line bg-surface p-1.5 outline-none shadow-[0_16px_40px_-16px_rgb(0_0_0/0.4)]"
          >
            {SORTS.map((s, i) => (
              <li
                key={s.key}
                id={`${id}-${i}`}
                role="option"
                aria-selected={s.key === value}
                onPointerEnter={() => setActive(i)}
                onClick={() => pick(s.key)}
                className={cn("flex cursor-pointer items-center gap-3 rounded-[8px] px-3 py-2.5 t-label hover:bg-raised", i === active && "bg-raised")}
              >
                <span className="flex-1">{s.label}</span>
                {s.key === value && <Check aria-hidden size={16} strokeWidth={1.5} />}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
