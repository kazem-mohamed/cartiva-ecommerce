import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Catalogue } from "@/ds/commerce/Catalogue";
import { EmptyState } from "@/ds/commerce/EmptyState";
import { parseFilters } from "@/ds/commerce/filter-logic";
import { getCategories, getCategory, getProducts, stockedIds } from "@/ds/data/catalog";
import { ButtonLink } from "@/ds/ui/Button";
import { PageFrame, PageIntro } from "@/ds/ui/PageIntro";

type Params = Promise<{ categoriesId: string }>;
type SP = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { categoriesId } = await params;
  const category = await getCategory(categoriesId);
  return { title: category?.name ?? "Department" };
}

export default async function DepartmentPage({ params, searchParams }: { params: Params; searchParams: SP }) {
  const { categoriesId } = await params;
  const sp = await searchParams;
  const [category, products, categories] = await Promise.all([getCategory(categoriesId), getProducts(), getCategories()]);
  if (!category) notFound();

  const scoped = products.filter((p) => p.category?._id === category._id);
  const crumbs = [
    { href: "/", label: "Home" },
    { href: "/categories", label: "Departments" },
  ];

  if (!scoped.length) {
    // Shown on purpose (all departments stay reachable) — but honestly, and with a way forward.
    const stocked = stockedIds(products).categories;
    const alternatives = categories.filter((c) => stocked.has(c._id));
    return (
      <PageFrame>
        <PageIntro crumbs={crumbs} title={category.name} />
        <EmptyState
          className="py-10"
          title={`Nothing on display in ${category.name} yet.`}
          body="These departments have products right now:"
          action={
            <div className="flex flex-wrap justify-center gap-3">
              {alternatives.map((c) => (
                <ButtonLink key={c._id} href={`/categories/${c._id}`} variant="secondary">
                  {c.name}
                </ButtonLink>
              ))}
            </div>
          }
        />
      </PageFrame>
    );
  }

  const { filters } = parseFilters(sp);
  return (
    <PageFrame>
      <PageIntro crumbs={crumbs} title={category.name}>
        {scoped.length} products, each on the same light.
      </PageIntro>
      <Catalogue key={JSON.stringify(sp)} products={scoped} initial={{ ...filters, categories: [] }} hide={["categories"]} />
    </PageFrame>
  );
}
