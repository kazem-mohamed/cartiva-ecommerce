import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Catalogue } from "@/ds/commerce/Catalogue";
import { EmptyState } from "@/ds/commerce/EmptyState";
import { parseFilters } from "@/ds/commerce/filter-logic";
import { getBrand, getProducts } from "@/ds/data/catalog";
import { ButtonLink } from "@/ds/ui/Button";
import { PageFrame, PageIntro } from "@/ds/ui/PageIntro";

type Params = Promise<{ brandId: string }>;
type SP = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { brandId } = await params;
  const brand = await getBrand(brandId);
  return { title: brand?.name ?? "Brand" };
}

export default async function BrandPage({ params, searchParams }: { params: Params; searchParams: SP }) {
  const { brandId } = await params;
  const sp = await searchParams;
  const [brand, products] = await Promise.all([getBrand(brandId), getProducts()]);
  if (!brand) notFound();

  const scoped = products.filter((p) => p.brand?._id === brand._id);
  const crumbs = [
    { href: "/", label: "Home" },
    { href: "/brand", label: "Brands" },
  ];
  const title = (
    <span className="flex items-center gap-5">
      {brand.image && (
        <span className="relative isolate block size-16 shrink-0 overflow-hidden rounded-card bg-plate">
          <Image src={brand.image} alt="" fill sizes="64px" className="object-contain p-2 mix-blend-multiply" />
        </span>
      )}
      {brand.name}
    </span>
  );

  if (!scoped.length) {
    return (
      <PageFrame>
        <PageIntro crumbs={crumbs} title={title} />
        <EmptyState
          className="py-10"
          title={`Nothing from ${brand.name} on display yet.`}
          body="Browse the brands that have products right now."
          action={
            <ButtonLink href="/brand" variant="secondary">
              All brands
            </ButtonLink>
          }
        />
      </PageFrame>
    );
  }

  const { filters } = parseFilters(sp);
  return (
    <PageFrame>
      <PageIntro crumbs={crumbs} title={title}>
        {scoped.length} {scoped.length === 1 ? "product" : "products"} from {brand.name}.
      </PageIntro>
      <Catalogue key={JSON.stringify(sp)} products={scoped} initial={{ ...filters, brands: [] }} hide={["brands"]} />
    </PageFrame>
  );
}
