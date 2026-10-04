import Link from "next/link";
import { EditorialImage, hasEditorial } from "@/ds/commerce/EditorialImage";
import type { Product } from "@/ds/commerce/types";
import { unitPrice } from "@/ds/commerce/types";
import { ButtonLink } from "@/ds/ui/Button";
import { formatEGP } from "@/ds/ui/Price";
import { ProductShot } from "@/ds/ui/ProductShot";

/**
 * The first frame. With the campaign photo it is a bright studio in both themes:
 * the headline on the pale left of the frame, the people on the right (desktop);
 * on phones the photo sits under the headline. Without the photo, a dark vitrine
 * of three real best sellers on stepped plates stands in.
 */
export function Hero({ vitrine }: { vitrine: Product[] }) {
  const hasImage = hasEditorial("hero-desktop");
  const steps = ["lg:mt-24", "lg:mt-0", "lg:mt-40"];

  return (
    <section
      data-theme={hasImage ? "light" : "dark"}
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-canvas text-fg lg:-mt-16"
    >
      {hasImage ? (
        // Below the header and pinned right at the photo's own 16:9, so the people are never cropped or
        // tucked under the header icons; its paper wall fades into the canvas on the left, top and bottom.
        <div className="absolute top-16 right-0 bottom-0 -z-10 hidden aspect-video lg:block">
          <EditorialImage name="hero-desktop" priority sizes="(min-width: 1024px) 92vw, 1px" className="h-full w-full rounded-none" />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(90deg,var(--canvas)_0%,color-mix(in_srgb,var(--canvas)_50%,transparent)_14%,transparent_30%),linear-gradient(180deg,var(--canvas)_0%,transparent_12%),linear-gradient(0deg,var(--canvas)_0%,transparent_5%)]"
          />
        </div>
      ) : (
        // One light, high on the upper left.
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_70%_at_62%_18%,rgb(237_237_243/0.10),transparent_65%)]"
        />
      )}

      <div className="mx-auto grid max-w-(--page-max) items-center gap-12 px-(--gutter) pt-14 pb-16 lg:min-h-[min(100svh,800px)] lg:grid-cols-[1fr_1.1fr] lg:pt-28 lg:pb-20">
        <div className="grid max-w-[34rem] content-center gap-7">
          <p className="lights-on t-caption text-fg-3">Electronics · Men&apos;s fashion · Women&apos;s fashion</p>
          <h1 id="hero-title" className="lights-on t-display [--delay:80ms]">
            Everything, well&nbsp;lit.
          </h1>
          <p className="lights-on t-body-lg max-w-[36ch] text-fg-2 [--delay:160ms]">
            Electronics and fashion, presented with care — every piece on the same light, at its real price.
          </p>
          <div className="lights-on flex flex-wrap items-center gap-x-6 gap-y-3 [--delay:240ms]">
            <ButtonLink href="/products" size="lg">
              Shop the collection
            </ButtonLink>
            <ButtonLink href="/categories" variant="text">
              Browse departments
            </ButtonLink>
          </div>
        </div>

        {hasImage && hasEditorial("hero-mobile") && (
          <EditorialImage name="hero-mobile" sizes="100vw" className="lights-on [--delay:320ms] lg:hidden" />
        )}

        {!hasImage && vitrine.length > 0 && (
          <ul aria-label="On display" className="grid grid-cols-3 items-start gap-3 sm:gap-5">
            {vitrine.slice(0, 3).map((p, i) => (
              <li key={p._id} className={steps[i]}>
                <Link href={`/products/${p._id}`} className="group block">
                  <div className="lit-plate rounded-card" style={{ "--delay": `${300 + i * 180}ms` } as React.CSSProperties}>
                    <ProductShot src={p.imageCover} alt={p.title} priority sizes="(min-width: 1024px) 18vw, 30vw" />
                  </div>
                  <p className="lights-on mt-3 hidden truncate t-caption text-fg-3 sm:block" style={{ "--delay": `${700 + i * 180}ms` } as React.CSSProperties}>
                    {p.brand?.name} · <span className="t-num text-fg-2">{formatEGP(unitPrice(p))}</span>
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
