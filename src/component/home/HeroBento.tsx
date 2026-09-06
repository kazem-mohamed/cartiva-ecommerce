import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/component/ui/Button";
import HeroSearch from "./HeroSearch";
import Reveal from "@/component/ui/Reveal";

/**
 * Hero — Bento, per the engine's resolved style for this direction.
 *
 * An asymmetric grid of tiles rather than a full-bleed banner: one large
 * statement tile, a live search tile, and department tiles at varied spans.
 * Everything sits on the light ground; nothing here is a black section.
 */

interface Category {
  _id: string;
  name: string;
  image: string;
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch("https://ecommerce.routemisr.com/api/v1/categories", {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data: Category[] };
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function HeroBento() {
  const categories = await getCategories();
  const feature = categories.slice(0, 5);

  return (
    <section className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 pt-10 pb-6 sm:pt-14">
      <Reveal
        stagger={90}
        className="grid gap-5 md:grid-cols-4 md:auto-rows-[186px]"
      >
        {/* Statement tile — 2x2 */}
        <div className="reveal bento md:col-span-2 md:row-span-2 flex flex-col justify-between overflow-hidden p-8 sm:p-10">
          <span className="label text-ink-muted">Est. 2026 · Cairo</span>

          <h1 className="font-display-lg my-8 text-[clamp(38px,5.4vw,66px)]">
            Everything has
            <br />
            <span className="gold-text">a price tag.</span>
          </h1>

          <div>
            <p className="mb-7 max-w-[42ch] text-[15.5px] font-light leading-relaxed text-ink-muted">
              Electronics, fashion, beauty, home, books and mobiles — one
              marketplace, tracked end to end.
            </p>
            <ButtonLink href="/products" size="md">
              Browse the catalogue
            </ButtonLink>
          </div>
        </div>

        {/* Search tile — 2x1 */}
        <div className="reveal bento md:col-span-2 flex flex-col justify-center p-7 sm:p-8">
          <span className="label mb-4 text-ink-muted">Find anything</span>
          <HeroSearch />
        </div>

        {/* Two department tiles — 1x1 each */}
        {feature.slice(0, 2).map((cat) => (
          <Link
            key={cat._id}
            href={`/categories/${cat._id}`}
            className="reveal bento bento-hover group relative overflow-hidden"
          >
            <Image
              src={cat.image}
              alt=""
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-[900ms] ease-[var(--ease)] group-hover:scale-[1.06]"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.92) 100%)",
              }}
            />
            <span className="absolute inset-x-0 bottom-0 p-5">
              <span className="font-display block text-[15px] text-ink">{cat.name}</span>
            </span>
          </Link>
        ))}

        {/* Remaining departments — a wide strip */}
        <div className="reveal bento md:col-span-4 p-6 sm:p-7">
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <span className="label text-ink-muted">All departments</span>
            <Link
              href="/categories"
              className="label text-gold transition-colors duration-300 hover:text-gold-deep"
            >
              See all
            </Link>
          </div>
          <ul className="flex flex-wrap gap-2.5">
            {categories.map((cat) => (
              <li key={cat._id}>
                <Link
                  href={`/categories/${cat._id}`}
                  className="inline-block rounded-full border border-line px-4 py-2.5 text-[12.5px] transition-colors duration-400 hover:border-gold hover:text-gold"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
