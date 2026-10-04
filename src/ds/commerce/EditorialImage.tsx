import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The eight editorial images (docs/editorial-image-prompts.md, v2: one bright
 * studio, soft daylight from the upper left). A null `src` renders a placeholder
 * of the exact ratio, so layouts never shift. All are decorative mood images —
 * the text beside them carries the meaning — so their alt text is empty.
 */
const EDITORIAL = {
  "hero-desktop": { ratio: "16/9", src: "/images/editorial/hero-desktop.webp", alt: "" },
  "hero-mobile": { ratio: "4/5", src: "/images/editorial/hero-mobile.webp", alt: "" },
  "category-electronics": { ratio: "3/4", src: "/images/editorial/category-electronics.webp", alt: "" },
  "category-men": { ratio: "3/4", src: "/images/editorial/category-men.webp", alt: "" },
  "category-women": { ratio: "3/4", src: "/images/editorial/category-women.webp", alt: "" },
  "brand-story": { ratio: "21/9", src: "/images/editorial/brand-story.webp", alt: "" },
  "empty-plinth": { ratio: "4/3", src: "/images/editorial/empty-plinth.webp", alt: "" },
  "auth-vitrine": { ratio: "3/4", src: "/images/editorial/auth-vitrine.webp", alt: "" },
} as const satisfies Record<string, { ratio: string; src: string | null; alt: string }>;

export type EditorialName = keyof typeof EDITORIAL;

/** Whether the real image has been delivered — pages show a real-product stand-in until it has. */
export const hasEditorial = (name: EditorialName) => Boolean((EDITORIAL[name] as { src: string | null }).src);

export function EditorialImage({
  name,
  className,
  imgClassName,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority,
}: {
  name: EditorialName;
  className?: string;
  /** e.g. an object-position, to keep the people in frame when a wide image is cropped. */
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const { ratio, src, alt } = EDITORIAL[name] as { ratio: string; src: string | null; alt: string };
  return (
    <div
      // The studio's paper tone while the photo loads, so a bright image never flashes in over black.
      className={cn("relative overflow-hidden rounded-card", src ? "bg-[#e9e9ef]" : "bg-[#171721]", className)}
      style={{ aspectRatio: ratio }}
      aria-hidden={alt ? undefined : true}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          preload={priority}
          // Same slow drift as the product plates when it sits inside a hovered `group` (department cards).
          className={cn("object-cover transition-[scale] duration-(--dur-light) ease-light motion-safe:group-hover:scale-[1.035]", imgClassName)}
        />
      ) : (
        // Placeholder: the studio's single light, upper left, on onyx.
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_18%_12%,rgb(237_237_243/0.14),transparent_62%),linear-gradient(160deg,#1e1e2a,#171721_60%)]" />
      )}
    </div>
  );
}
