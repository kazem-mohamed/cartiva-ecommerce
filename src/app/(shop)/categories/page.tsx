import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EditorialImage, hasEditorial, type EditorialName } from "@/ds/commerce/EditorialImage";
import type { Product } from "@/ds/commerce/types";
import { getCategories, getProducts } from "@/ds/data/catalog";
import { Reveal } from "@/ds/motion/Reveal";
import { PageFrame, PageIntro } from "@/ds/ui/PageIntro";
import { ProductShot } from "@/ds/ui/ProductShot";

export const metadata: Metadata = { title: "Departments", description: "Every department in the Cartiva catalogue." };
export const revalidate = 3600;

const COVER: Record<string, EditorialName> = {
  Electronics: "category-electronics",
  "Men's Fashion": "category-men",
  "Women's Fashion": "category-women",
};

export default async function DepartmentsPage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const bySold = [...products].sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0));
  const rows = categories
    .map((c) => {
      const items = bySold.filter((p) => p.category?._id === c._id);
      return { category: c, count: items.length, hero: items[0] as Product | undefined };
    })
    .sort((a, b) => b.count - a.count);
  const stocked = rows.filter((r) => r.count > 0);
  const empty = rows.filter((r) => r.count === 0);

  return (
    <PageFrame>
      <PageIntro crumbs={[{ href: "/", label: "Home" }]} title="Departments">
        {stocked.length} departments with products on display, and {empty.length} still being stocked.
      </PageIntro>

      <ul className="grid gap-x-5 gap-y-12 sm:grid-cols-3">
        {stocked.map(({ category, count, hero }, i) => {
          const cover = COVER[category.name];
          return (
            <Reveal as="li" key={category._id} delay={i * 80}>
              <Link href={`/categories/${category._id}`} className="group block">
                {cover && hasEditorial(cover) ? (
                  <EditorialImage name={cover} sizes="(min-width: 640px) 33vw, 100vw" />
                ) : hero ? (
                  <ProductShot src={hero.imageCover} hoverSrc={hero.images?.[1]} alt="" sizes="(min-width: 640px) 33vw, 100vw" />
                ) : null}
                <div className="mt-4 flex items-baseline justify-between gap-3">
                  <h2 className="t-h3 underline-reveal underline-offset-[6px] transition-colors group-hover:decoration-line-strong">{category.name}</h2>
                  <span className="flex items-center gap-2 t-label t-num text-fg-3">
                    {count} products
                    <ArrowRight aria-hidden size={16} strokeWidth={1.5} className="transition-transform duration-(--dur-state) group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </ul>

      {empty.length > 0 && (
        <section aria-labelledby="stocking" className="mt-24">
          <h2 id="stocking" className="t-h3">
            Being stocked
          </h2>
          <p className="mt-2 t-body text-fg-2">Nothing on display in these yet.</p>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {empty.map(({ category }) => (
              <li key={category._id}>
                <Link
                  href={`/categories/${category._id}`}
                  className="flex min-h-24 items-end rounded-card border border-line p-4 t-label text-fg-2 transition-colors hover:border-line-strong hover:text-fg"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageFrame>
  );
}
