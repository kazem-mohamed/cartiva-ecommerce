import Image from "next/image";
import { cn } from "@/lib/utils";
import { matCrop } from "./matted";

/**
 * The lit plate. Every catalogue photo is 660×900 and most are shot on white;
 * multiplied onto the plate, the white becomes the plate.
 *
 * Each photo sits on its OWN plate layer with `isolation: isolate`, so the
 * multiply only ever touches that layer. Without it, the hover photo would blend
 * into the cover photo underneath and show both at once (a double exposure).
 *
 * The hover swap is driven by a `group` ancestor (the product card) and only
 * runs on devices that can hover — Tailwind v4's `hover:` is gated on it.
 */
export function ProductShot({
  src,
  hoverSrc,
  alt,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw",
  priority,
  wide,
  className,
  children,
}: {
  src: string;
  hoverSrc?: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  /**
   * A 4:3 plate for featured, double-width slots. The 11:15 photo is contained,
   * not cropped, with the plate showing either side — a wider vitrine, same object.
   */
  wide?: boolean;
  className?: string;
  /** Overlaid controls (wishlist, quick add). */
  children?: React.ReactNode;
}) {
  // Under a hovered `group` (a card, a department tile) the object drifts slightly closer,
  // slowly — the light settling on it, not a zoom effect. Motion-safe only.
  const layer =
    "absolute inset-0 isolate bg-plate motion-safe:group-hover:scale-[1.035] " +
    "[transition:opacity_var(--dur-state)_var(--ease-out),scale_var(--dur-light)_var(--ease-out)]";
  const img = cn(wide ? "object-contain py-[6%]" : "object-cover", "mix-blend-multiply");
  // Contained (wide), a mat merges into the plate around it; only a filled frame needs the crop.
  const crop = (s: string) => (wide ? undefined : matCrop(s));

  return (
    <div className={cn("relative overflow-hidden rounded-card bg-plate", wide ? "aspect-[4/3]" : "aspect-[11/15]", className)}>
      <div className={layer}>
        <Image src={src} alt={alt} fill sizes={sizes} preload={priority} className={cn(img, crop(src))} />
      </div>
      {hoverSrc && hoverSrc !== src && (
        <div
          aria-hidden
          className={cn(layer, "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100")}
        >
          <Image src={hoverSrc} alt="" fill sizes={sizes} className={cn(img, crop(hoverSrc))} />
        </div>
      )}
      {children}
    </div>
  );
}
