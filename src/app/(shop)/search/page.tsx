import type { Metadata } from "next";
import { Catalogue } from "@/ds/commerce/Catalogue";
import { parseFilters } from "@/ds/commerce/filter-logic";
import { getProducts } from "@/ds/data/catalog";
import { PageFrame, PageIntro } from "@/ds/ui/PageIntro";

type SP = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const { q } = parseFilters(await searchParams);
  return { title: q ? `“${q}”` : "Search", robots: { index: false } };
}

export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const { filters, q } = parseFilters(sp);
  const products = await getProducts();
  return (
    <PageFrame>
      <PageIntro crumbs={[{ href: "/", label: "Home" }]} title="Search" />
      <Catalogue key={JSON.stringify(sp)} products={products} initial={filters} initialQuery={q} withSearch />
    </PageFrame>
  );
}
