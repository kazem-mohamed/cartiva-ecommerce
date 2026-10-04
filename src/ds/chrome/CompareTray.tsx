"use client";

import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { clearCompare, MAX_COMPARE_ITEMS } from "@/lib/compare";
import { cn } from "@/lib/utils";
import { useCommerce } from "../commerce/CommerceProvider";
import { useCatalog } from "../commerce/useCatalog";
import { matCrop } from "../ui/matted";

/** Appears once something is marked to compare; one tap to the table. Sits above the mobile pill. */
export function CompareTray() {
  const { compare } = useCommerce();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const visible = compare.length > 0 && pathname !== "/compare";
  const { data } = useCatalog(visible);
  const items = compare.map((id) => data?.products.find((p) => p._id === id)).filter((p) => p !== undefined);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          role="region"
          aria-label="Compare"
          className="fixed inset-x-0 bottom-[calc(88px+env(safe-area-inset-bottom))] z-(--z-sticky) flex justify-center px-4 lg:bottom-6"
        >
          <div className="flex items-center gap-3 rounded-pill border border-line bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] py-1.5 pr-1.5 pl-2 backdrop-blur-xl">
            <ul className="flex -space-x-2" aria-hidden>
              {items.map((p) => (
                <li key={p._id} className="relative isolate size-9 overflow-hidden rounded-full bg-plate ring-2 ring-(--surface)">
                  <Image src={p.imageCover} alt="" fill sizes="36px" className={cn("object-cover mix-blend-multiply", matCrop(p.imageCover))} />
                </li>
              ))}
            </ul>
            <span className="t-label t-num">
              Compare <span className="text-fg-3">{compare.length}/{MAX_COMPARE_ITEMS}</span>
            </span>
            <Link href="/compare" className="inline-flex h-10 items-center rounded-pill bg-fg px-4 t-label text-canvas hover:bg-fg-2 active:scale-[.97]">
              View
            </Link>
            <button
              type="button"
              onClick={clearCompare}
              aria-label="Clear the compare list"
              className="grid size-10 place-items-center rounded-full text-fg-2 hover:bg-raised hover:text-fg active:scale-[.94] [&_svg]:size-[18px]"
            >
              <X aria-hidden strokeWidth={1.5} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
