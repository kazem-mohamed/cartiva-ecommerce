import { ProductCardSkeleton } from "@/ds/commerce/ProductCard";
import { PageFrame } from "@/ds/ui/PageIntro";

/** While a page's data loads: its shape, in the same light sweep the cards use. */
export default function Loading() {
  return (
    <PageFrame>
      <div role="status" aria-label="Loading" className="grid gap-4 pt-10 pb-10 lg:pt-14">
        <div className="skeleton h-3 w-24 rounded-pill" />
        <div className="skeleton h-12 w-72 max-w-full rounded-pill" />
        <div className="skeleton h-4 w-96 max-w-full rounded-pill" />
      </div>
      <div aria-hidden className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-5">
        {Array.from({ length: 8 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </PageFrame>
  );
}
