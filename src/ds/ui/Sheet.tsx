"use client";

import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "motion/react";
import { useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useDialog } from "../hooks/useDialog";
import { useMediaQuery } from "../hooks/useMediaQuery";

const ENTER = { duration: 0.52, ease: [0.16, 1, 0.3, 1] } as const; // --dur-sheet, --ease-out
const EXIT = { duration: 0.34, ease: [0.4, 0, 1, 1] } as const; // ~65% of enter, --ease-exit

const noopSubscribe = () => () => {};

/**
 * Modal panel. `side="auto"` is a right-hand drawer from 640px up and a bottom
 * sheet below it — on a phone the thumb reaches the bottom, not the edge.
 * Bottom sheets close on a downward swipe as well as Escape and the scrim.
 */
export function Sheet({
  open,
  onClose,
  labelledBy,
  side = "auto",
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  /** id of the heading that names the sheet. */
  labelledBy: string;
  side?: "auto" | "right" | "bottom";
  className?: string;
  children: React.ReactNode;
}) {
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const small = useMediaQuery("(max-width: 639px)");
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  useDialog(ref, open, onClose);

  const bottom = side === "bottom" || (side === "auto" && small);
  const hidden = reduce ? { opacity: 0 } : bottom ? { y: "100%" } : { x: "100%" };
  const shown = reduce ? { opacity: 1 } : bottom ? { y: 0 } : { x: 0 };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 600) onClose();
  };

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-(--z-drawer)">
          <motion.div
            className="absolute inset-0 bg-(--scrim)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: ENTER }}
            exit={{ opacity: 0, transition: EXIT }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            tabIndex={-1}
            initial={hidden}
            animate={{ ...shown, transition: ENTER }}
            exit={{ ...hidden, transition: EXIT }}
            drag={bottom && !reduce ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={onDragEnd}
            className={cn(
              "absolute flex flex-col bg-surface text-fg outline-none",
              bottom
                ? "inset-x-0 bottom-0 max-h-[88dvh] rounded-t-[20px] pb-[env(safe-area-inset-bottom)]"
                : "inset-y-0 right-0 w-full max-w-[440px] border-l border-line",
              className,
            )}
          >
            {bottom && (
              <span aria-hidden className="mx-auto mt-2.5 mb-1 h-1 w-10 shrink-0 rounded-pill bg-line-strong/60" />
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
