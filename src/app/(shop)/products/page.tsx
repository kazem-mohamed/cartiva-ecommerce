import type { Metadata } from "next";
import { Catalogue } from "@/ds/commerce/Catalogue";
import { parseFilters } from "@/ds/commerce/filter-logic";
import { getProducts } from "@/ds/data/catalog";
import { PageFrame, PageIntro } from "@/ds/ui/PageIntro";

type SP = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const sale = (await searchParams).sale === "1";
  return sale
    ? { title: "Marked down", description: "Every reduction in the Cartiva catalogue, biggest first." }
    : { title: "Shop", description: "Every product in the Cartiva catalogue." };
}

export default async function ProductsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const { filters } = parseFilters(sp);
  const products = await getProducts();
  const sale = filters.onSale;

  return (
    <PageFrame>
      <PageIntro crumbs={[{ href: "/", label: "Home" }]} title={sale ? "Marked down" : "Shop everything"}>
        {sale
          ? "Every reduction in the store, biggest first. The struck price is what it cost before."
          : "Electronics and fashion — every piece on the same light, at its real price."}
      </PageIntro>
      {/* Keyed on the query so header links (Shop ↔ Marked down) start a fresh view. */}
      <Catalogue
        key={JSON.stringify(sp)}
        products={products}
        initial={sale && filters.sort === "featured" ? { ...filters, sort: "discount" } : filters}
      />
    </PageFrame>
  );
}
