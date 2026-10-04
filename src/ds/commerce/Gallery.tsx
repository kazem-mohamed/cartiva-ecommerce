"use client";

import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "motion/react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useDialog } from "../hooks/useDialog";
import { IconButton } from "../ui/IconButton";
import { matCrop } from "../ui/matted";

const noop = () => () => {};
const FADE = { duration: 0.32, ease: [0.16, 1, 0.3, 1] } as const;

/** One photo on its own isolated plate (see ProductShot for why the isolation matters). */
function Plated({
  src,
  alt,
  sizes,
  priority,
  className,
  style,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={cn("absolute inset-0 isolate bg-plate", className)} style={style}>
      <Image src={src} alt={alt} fill sizes={sizes} fetchPriority={priority ? "high" : undefined} className={cn("object-contain mix-blend-multiply", matCrop(src))} />
    </div>
  );
}

/**
 * Product gallery. Desktop: thumbnails + a stage that zooms where the pointer
 * is. Phones: a swipe track with position dots. Either opens full screen.
 */
export function Gallery({ images, title }: { images: string[]; title: string }) {
  const list = images.length ? images : [];
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const count = list.length;
  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  if (!count) return <div className="aspect-[11/15] rounded-card bg-plate" />;
  return (
    <>
      <DesktopGallery images={list} title={title} index={index} go={go} onOpen={() => setLightbox(true)} />
      <MobileGallery images={list} title={title} index={index} setIndex={setIndex} onOpen={() => setLightbox(true)} />
      <Lightbox open={lightbox} onClose={() => setLightbox(false)} images={list} title={title} index={index} go={go} />
    </>
  );
}

type Shared = { images: string[]; title: string; index: number; onOpen: () => void };

function DesktopGallery({ images, title, index, go, onOpen }: Shared & { go: (i: number) => void }) {
  const reduce = useReducedMotion();
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const thumbs = useRef<Array<HTMLButtonElement | null>>([]);

  return (
    <div className="hidden gap-4 lg:grid lg:grid-cols-[72px_1fr]">
      {/* h-0 + min-h-full: the strip never sets the row height, the stage does; extra thumbs scroll. */}
      <div
        role="tablist"
        aria-label="Product photos"
        aria-orientation="vertical"
        className="grid h-0 min-h-full content-start gap-3 overflow-y-auto overscroll-contain p-0.5 [scrollbar-width:none]"
      >
        {images.map((src, i) => (
          <button
            key={src}
            ref={(el) => {
              thumbs.current[i] = el;
            }}
            role="tab"
            type="button"
            aria-selected={i === index}
            aria-label={`Photo ${i + 1} of ${images.length}`}
            tabIndex={i === index ? 0 : -1}
            onClick={() => go(i)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                const next = (i + (e.key === "ArrowDown" ? 1 : -1) + images.length) % images.length;
                go(next);
                thumbs.current[next]?.focus();
              }
            }}
            className={cn(
              "relative aspect-[11/15] overflow-hidden rounded-[8px] outline-offset-2 transition-[box-shadow,opacity] duration-(--dur-hover)",
              i === index ? "shadow-[0_0_0_1.5px_var(--text)]" : "opacity-70 hover:opacity-100",
            )}
          >
            <Plated src={src} alt="" sizes="72px" />
          </button>
        ))}
      </div>

      <div
        className="group relative aspect-[11/15] cursor-zoom-in overflow-hidden rounded-card bg-plate"
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse" || reduce) return;
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onPointerLeave={() => setZoom(null)}
        // A click anywhere on the photo opens it full screen — a pointer shortcut; keyboard and screen
        // readers use the "View full screen" button below, so this box carries no role of its own.
        onClick={onOpen}
      >
        <AnimatePresence initial={false}>
          <motion.div key={index} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={FADE}>
            <Plated src={images[index]} alt={`${title}, photo ${index + 1} of ${images.length}`} sizes="(min-width: 1024px) 45vw, 100vw" priority={index === 0} />
          </motion.div>
        </AnimatePresence>
        {/* Zoom follows the pointer: the same photo at 2.2×, origin at the cursor. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-(--dur-hover)"
          style={{ opacity: zoom ? 1 : 0 }}
        >
          <Plated
            src={images[index]}
            alt=""
            sizes="95vw"
            className="scale-[2.2]"
            style={{ transformOrigin: `${zoom?.x ?? 50}% ${zoom?.y ?? 50}%` }}
          />
        </div>
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <IconButton tone="plate" label="Previous photo" icon={<ChevronLeft strokeWidth={1.5} aria-hidden />} onClick={() => go(index - 1)} />
          <IconButton tone="plate" label="Next photo" icon={<ChevronRight strokeWidth={1.5} aria-hidden />} onClick={() => go(index + 1)} />
          <span className="rounded-pill bg-[#171721] px-3 py-1.5 t-caption t-num text-[#ededf3]">
            {index + 1} / {images.length}
          </span>
          <IconButton tone="plate" label="View full screen" icon={<Expand strokeWidth={1.5} aria-hidden />} onClick={onOpen} className="ml-auto" />
        </div>
      </div>
    </div>
  );
}

function MobileGallery({ images, title, index, setIndex, onOpen }: Shared & { setIndex: (i: number) => void }) {
  const track = useRef<HTMLDivElement>(null);
  // The dots follow the scroll position — the track is the source of truth on touch.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setIndex(Number((e.target as HTMLElement).dataset.i));
      },
      { root: el, threshold: 0.6 },
    );
    el.querySelectorAll("[data-i]").forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, [images, setIndex]);

  return (
    <div className="lg:hidden">
      <div
        ref={track}
        className="-mx-(--gutter) flex snap-x snap-mandatory overflow-x-auto md:mx-0 overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label={`${title} photos`}
      >
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            data-i={i}
            onClick={onOpen}
            aria-label={`Photo ${i + 1} of ${images.length}. Open full screen.`}
            className="relative aspect-[11/15] w-full shrink-0 snap-center px-(--gutter) md:px-0"
          >
            <span className="relative block h-full overflow-hidden rounded-card">
              <Plated src={src} alt="" sizes="(min-width: 768px) 50vw, 100vw" priority={i === 0} />
            </span>
          </button>
        ))}
      </div>
      <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
        {images.map((src, i) => (
          <span
            key={src}
            className={cn("h-1.5 rounded-pill transition-[width,background-color] duration-(--dur-state)", i === index ? "w-5 bg-fg" : "w-1.5 bg-line-strong")}
          />
        ))}
      </div>
    </div>
  );
}

function Lightbox({ open, onClose, images, title, index, go }: { open: boolean; onClose: () => void; images: string[]; title: string; index: number; go: (i: number) => void }) {
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>{open && <LightboxPanel onClose={onClose} images={images} title={title} index={index} go={go} />}</AnimatePresence>,
    document.body,
  );
}

function LightboxPanel({ onClose, images, title, index, go }: { onClose: () => void; images: string[]; title: string; index: number; go: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [dir, setDir] = useState(0);
  useDialog(ref, true, onClose);

  const step = (d: number) => {
    setDir(d);
    go(index + d);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -80 || info.velocity.x < -500) step(1);
    else if (info.offset.x > 80 || info.velocity.x > 500) step(-1);
  };

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — photos`}
      tabIndex={-1}
      className="fixed inset-0 z-(--z-modal) flex flex-col bg-canvas text-fg outline-none"
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1, transition: FADE }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.99, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }}
    >
      <div className="flex items-center gap-3 px-(--gutter) py-3">
        <p className="min-w-0 flex-1 truncate t-label text-fg-2">{title}</p>
        <span className="t-caption t-num text-fg-3">
          {index + 1} / {images.length}
        </span>
        <IconButton label="Close full screen" icon={<X strokeWidth={1.5} aria-hidden />} onClick={onClose} data-autofocus />
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={index}
            className="absolute inset-4 overflow-hidden rounded-card sm:inset-8"
            custom={dir}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0, transition: FADE }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -40, transition: { duration: 0.2 } }}
            drag={reduce ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.4}
            onDragEnd={onDragEnd}
          >
            <Plated src={images[index]} alt={`${title}, photo ${index + 1}`} sizes="100vw" />
          </motion.div>
        </AnimatePresence>
        <IconButton tone="plate" label="Previous photo" icon={<ChevronLeft strokeWidth={1.5} aria-hidden />} onClick={() => step(-1)} className="absolute left-6 top-1/2 z-10 -translate-y-1/2 max-sm:hidden sm:left-10" />
        <IconButton tone="plate" label="Next photo" icon={<ChevronRight strokeWidth={1.5} aria-hidden />} onClick={() => step(1)} className="absolute right-6 top-1/2 z-10 -translate-y-1/2 max-sm:hidden sm:right-10" />
      </div>
      <div className="flex justify-center gap-2 overflow-x-auto px-(--gutter) py-4">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => {
              setDir(i > index ? 1 : -1);
              go(i);
            }}
            aria-label={`Photo ${i + 1}`}
            aria-current={i === index}
            className={cn(
              "relative aspect-[11/15] w-12 shrink-0 overflow-hidden rounded-[8px] active:scale-[.94]",
              i === index ? "shadow-[0_0_0_1.5px_var(--text)]" : "opacity-60 hover:opacity-100",
            )}
          >
            <Plated src={src} alt="" sizes="48px" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}
