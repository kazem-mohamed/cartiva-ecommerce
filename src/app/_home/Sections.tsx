import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { EditorialImage, hasEditorial, type EditorialName } from "@/ds/commerce/EditorialImage";
import { ProductCard } from "@/ds/commerce/ProductCard";
import type { Product } from "@/ds/commerce/types";
import type { Brand, Category } from "@/ds/data/catalog";
import { Reveal } from "@/ds/motion/Reveal";
import { ProductShot } from "@/ds/ui/ProductShot";

export function SectionHead({ title, note, href, cta }: { title: string; note?: string; href?: string; cta?: string }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div className="grid gap-2">
        <h2 className="t-h1">{title}</h2>
        {note && <p className="t-body text-fg-2">{note}</p>}
      </div>
      {href && cta && (
        <Link href={href} className="group inline-flex items-center gap-2 t-label underline decoration-line-strong underline-offset-[6px] hover:decoration-current">
          {cta}{" "}
          <ArrowRight aria-hidden size={16} strokeWidth={1.5} className="transition-[translate] duration-(--dur-state) ease-light group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

const COVER: Record<string, EditorialName> = {
  Electronics: "category-electronics",
  "Men's Fashion": "category-men",
  "Women's Fashion": "category-women",
};

/**
 * The three departments that hold products, each with its real count. Until
 * the editorial covers arrive, a department shows its own best seller on the
 * plate. The empty departments stay reachable in a quiet line below.
 */
export function Departments({
  stocked,
  others,
}: {
  stocked: { category: Category; count: number; hero: Product | undefined }[];
  others: Category[];
}) {
  return (
    <section aria-labelledby="dept-title" className="mx-auto w-full max-w-(--page-max) px-(--gutter) py-24">
      <div id="dept-title">
        <SectionHead title="Departments" href="/categories" cta="All departments" />
      </div>
      <ul className="grid gap-x-5 gap-y-10 sm:grid-cols-3">
        {stocked.map(({ category, count, hero }, i) => {
          const cover = COVER[category.name];
          return (
            <Reveal as="li" key={category._id} delay={i * 80}>
              <Link href={`/categories/${category._id}`} className="group block">
                {cover && hasEditorial(cover) ? (
                  <EditorialImage name={cover} sizes="(min-width: 640px) 33vw, 100vw" />
                ) : hero ? (
                  <ProductShot src={hero.imageCover} hoverSrc={hero.images?.[1]} alt="" sizes="(min-width: 640px) 33vw, 100vw" />
                ) : (
                  <div className="aspect-[11/15] rounded-card bg-plate" />
                )}
                <div className="mt-4 flex items-baseline justify-between gap-3">
                  <h3 className="t-h3 underline-reveal underline-offset-[6px] transition-colors group-hover:decoration-line-strong">{category.name}</h3>
                  <span className="flex items-center gap-2 t-label t-num text-fg-3">
                    {count} products
                    <ArrowRight aria-hidden size={16} strokeWidth={1.5} className="transition-transform duration-(--dur-state) ease-light group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </ul>
      {others.length > 0 && (
        <p className="mt-12 t-body text-fg-3">
          Also at Cartiva:{" "}
          {others.map((c, i) => (
            <span key={c._id}>
              <Link href={`/categories/${c._id}`} className="text-fg-2 underline decoration-line-strong underline-offset-4 hover:text-fg">
                {c.name}
              </Link>
              {i < others.length - 1 && <span aria-hidden> · </span>}
            </span>
          ))}
        </p>
      )}
    </section>
  );
}

export function ProductRail({
  id,
  title,
  note,
  href,
  cta,
  products,
}: {
  id: string;
  title: string;
  note?: string;
  href?: string;
  cta?: string;
  products: Product[];
}) {
  return (
    <section aria-labelledby={id} className="mx-auto w-full max-w-(--page-max) px-(--gutter) py-24">
      <div id={id}>
        <SectionHead title={title} note={note} href={href} cta={cta} />
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-5">
        {products.map((p, i) => (
          <Reveal as="li" key={p._id} delay={(i % 4) * 70}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

/**
 * The one wide, atmospheric band — where "well lit" becomes a place. With the studio
 * photo it is a bright room (text on the empty left of the frame); without it, a dark one.
 */
export function BrandStory() {
  const hasImage = hasEditorial("brand-story");
  return (
    <section data-theme={hasImage ? "light" : "dark"} aria-labelledby="story-title" className="relative isolate overflow-hidden bg-canvas py-28 text-fg">
      {hasImage ? (
        <div className="absolute inset-0 -z-10">
          <EditorialImage name="brand-story" sizes="100vw" className="h-full w-full rounded-none" imgClassName="object-[78%_center]" />
          {/* Keeps the copy legible: a paper-toned fade from the left, and a full veil on phones where the copy covers the set. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(90deg,var(--canvas)_0%,color-mix(in_srgb,var(--canvas)_70%,transparent)_40%,transparent_70%)] max-md:bg-none max-md:bg-[color-mix(in_srgb,var(--canvas)_80%,transparent)]"
          />
        </div>
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(45%_80%_at_78%_50%,rgb(237_237_243/0.12),transparent_70%),linear-gradient(180deg,#171721,#1e1e2a)]"
        />
      )}
      <div className="mx-auto max-w-(--page-max) px-(--gutter)">
        <Reveal className="grid max-w-xl gap-6">
          <p className="t-caption text-fg-3">About Cartiva</p>
          <h2 id="story-title" className="t-h1">
            One light, nothing competing.
          </h2>
          <p className="t-body-lg text-fg-2">
            Every product — a EGP 149 shawl or a EGP 42,960 television — gets the same space, the same light and its real price. No
            invented reviews, no countdowns, nothing shouting.
          </p>
          <p className="t-caption text-fg-3">
            Cartiva is a portfolio store built on a public demo catalogue.{" "}
            <a href="/brand.html" className="text-fg-2 underline decoration-line-strong underline-offset-4 hover:text-fg">
              Read the brand guidelines
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/** Real brands, real logos from the catalogue — only the ones with products. Monochrome, on plates. */
export function BrandsWeCarry({ brands }: { brands: Brand[] }) {
  return (
    <section aria-labelledby="brands-title" className="mx-auto w-full max-w-(--page-max) px-(--gutter) py-24">
      <div id="brands-title">
        <SectionHead title="Brands we carry" href="/brand" cta="All brands" />
      </div>
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {brands.map((b, i) => (
          <Reveal as="li" key={b._id} delay={(i % 6) * 50}>
            <Link
              href={`/brand/${b._id}`}
              aria-label={b.name}
              className="group relative isolate block aspect-[3/2] overflow-hidden rounded-card bg-plate"
            >
              {b.image ? (
                <Image
                  src={b.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 16vw, 33vw"
                  className="object-contain p-[14%] mix-blend-multiply grayscale transition-[filter,opacity,scale] duration-(--dur-state) ease-light group-hover:grayscale-0 motion-safe:group-hover:scale-105 opacity-80 group-hover:opacity-100"
                />
              ) : (
                <span className="grid h-full place-items-center t-label text-[#171721]">{b.name}</span>
              )}
            </Link>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
