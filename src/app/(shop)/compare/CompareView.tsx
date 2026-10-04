"use client";

import { Check, Star, X } from "lucide-react";
import Link from "next/link";
import { clearCompare, MAX_COMPARE_ITEMS } from "@/lib/compare";
import { useCommerce } from "@/ds/commerce/CommerceProvider";
import { EmptyState } from "@/ds/commerce/EmptyState";
import { unitPrice, type Product } from "@/ds/commerce/types";
import { useCatalog } from "@/ds/commerce/useCatalog";
import { Button, ButtonLink } from "@/ds/ui/Button";
import { IconButton } from "@/ds/ui/IconButton";
import { PageIntro } from "@/ds/ui/PageIntro";
import { Price } from "@/ds/ui/Price";
import { ProductShot } from "@/ds/ui/ProductShot";

const crumbs = [{ href: "/", label: "Home" }];

function Best({ children }: { children: string }) {
  return (
    <span className="mt-1.5 flex items-center gap-1 t-caption text-fg">
      <Check aria-hidden size={13} strokeWidth={2} />
      {children}
    </span>
  );
}

function stock(p: Product) {
  if (p.quantity === 0) return "Sold out";
  if (typeof p.quantity === "number" && p.quantity <= 5) return `Only ${p.quantity} left`;
  return "In stock";
}

export function CompareView() {
  const { compare, toggleCompare, addToBag, pending } = useCommerce();
  const { data, error, retry } = useCatalog(compare.length > 0);
  const products = compare.map((id) => data?.products.find((p) => p._id === id)).filter((p): p is Product => !!p);

  if (!compare.length) {
    return (
      <>
        <PageIntro crumbs={crumbs} title="Compare" />
        <EmptyState
          className="py-10"
          title="Nothing to compare yet."
          body={`Use the compare button on any product to line up to ${MAX_COMPARE_ITEMS} side by side.`}
          action={<ButtonLink href="/products">Browse products</ButtonLink>}
        />
      </>
    );
  }
  if (error) {
    return (
      <>
        <PageIntro crumbs={crumbs} title="Compare" />
        <EmptyState className="py-10" title="The comparison didn't load." action={<Button onClick={retry}>Try again</Button>} />
      </>
    );
  }
  if (!data) {
    return (
      <>
        <PageIntro crumbs={crumbs} title="Compare" />
        <div role="status" aria-label="Loading the comparison" className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {compare.map((id) => (
            <div key={id} className="skeleton aspect-[11/15] rounded-card" />
          ))}
        </div>
      </>
    );
  }

  const several = products.length > 1;
  const cheapest = several ? [...products].sort((a, b) => unitPrice(a) - unitPrice(b))[0]._id : null;
  const rated = products.filter((p) => p.ratingsQuantity && p.ratingsAverage);
  const topRated = several && rated.length ? [...rated].sort((a, b) => (b.ratingsAverage ?? 0) - (a.ratingsAverage ?? 0))[0]._id : null;

  const rows: { label: string; cell: (p: Product) => React.ReactNode }[] = [
    {
      label: "Price",
      cell: (p) => (
        <>
          <Price price={p.price} priceAfterDiscount={p.priceAfterDiscount} size="sm" />
          {p._id === cheapest && <Best>Lowest price</Best>}
        </>
      ),
    },
    {
      label: "Rating",
      cell: (p) =>
        p.ratingsQuantity && p.ratingsAverage ? (
          <>
            <span className="inline-flex items-center gap-1.5 t-body t-num">
              <Star aria-hidden size={14} strokeWidth={1.5} className="fill-current" />
              {p.ratingsAverage.toFixed(1)} <span className="text-fg-3">· {p.ratingsQuantity} ratings</span>
            </span>
            {p._id === topRated && <Best>Top rated</Best>}
          </>
        ) : (
          <span className="text-fg-3">No ratings yet</span>
        ),
    },
    { label: "Availability", cell: (p) => stock(p) },
    { label: "Sold", cell: (p) => <span className="t-num">{(p.sold ?? 0).toLocaleString("en-US")}</span> },
    { label: "Brand", cell: (p) => p.brand?.name ?? "—" },
    { label: "Department", cell: (p) => p.category?.name ?? "—" },
  ];

  return (
    <>
      <PageIntro crumbs={crumbs} title="Compare">
        <span className="t-num">
          {products.length} of {MAX_COMPARE_ITEMS}
        </span>
        {several && " · the lowest price and top rating are marked"}
      </PageIntro>
      <div className="mb-8 flex justify-end">
        <Button variant="text" onClick={clearCompare}>
          Clear all
        </Button>
      </div>

      {/* A real table: screen readers announce "Price, Woman Shawl, EGP 149". Scrolls sideways on phones, labels pinned. */}
      {/* `relative`: sr-only text in the cells is absolutely positioned, and must be clipped by this scroller, not the page. */}
      <div className="enter relative -mx-(--gutter) overflow-x-auto px-(--gutter) [scrollbar-width:thin]">
        <table className="w-full min-w-[640px] table-fixed border-collapse">
          <caption className="sr-only">Product comparison</caption>
          <colgroup>
            <col className="w-32 sm:w-40" />
            {products.map((p) => (
              <col key={p._id} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <td className="sticky left-0 z-10 bg-canvas" />
              {products.map((p) => {
                const soldOut = p.quantity === 0;
                return (
                  <th key={p._id} scope="col" className="px-2.5 pb-8 text-left align-top font-normal">
                    <div className="relative">
                      <Link href={`/products/${p._id}`} tabIndex={-1} aria-hidden className="group block">
                        <ProductShot src={p.imageCover} alt="" sizes="(min-width: 1024px) 22vw, 200px" />
                      </Link>
                      <IconButton
                        tone="plate"
                        label={`Remove ${p.title} from compare`}
                        icon={<X aria-hidden strokeWidth={1.5} />}
                        onClick={() => toggleCompare(p._id)}
                        className="absolute top-3 right-3"
                      />
                    </div>
                    {p.brand?.name && <p className="mt-4 t-caption text-fg-3">{p.brand.name}</p>}
                    <Link href={`/products/${p._id}`} className="mt-1 line-clamp-2 min-h-[2.75em] pb-0.5 text-[0.9375rem] leading-snug font-[420] underline-reveal underline-offset-4 hover:decoration-line-strong">
                      {p.title}
                    </Link>
                    <Button
                      variant="secondary"
                      fullWidth
                      className="mt-4"
                      disabled={soldOut}
                      loading={pending.has(p._id)}
                      loadingLabel="Adding to bag"
                      onClick={() => addToBag(p)}
                    >
                      {soldOut ? "Sold out" : "Add to bag"}
                    </Button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-line">
                <th scope="row" className="sticky left-0 z-10 bg-canvas py-5 pr-4 text-left align-top t-label font-normal text-fg-2">
                  {row.label}
                </th>
                {products.map((p) => (
                  <td key={p._id} className="px-2.5 py-5 align-top t-body">
                    {row.cell(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
