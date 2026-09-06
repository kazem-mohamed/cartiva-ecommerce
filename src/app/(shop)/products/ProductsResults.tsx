import Link from "next/link";
import ProductShelf from "@/component/product/ProductShelf";
import type { CardProduct } from "@/component/product/ProductCard";

/** Server Component — the empty state needs no client JS at all. */
export default function ProductsResults({ products }: { products: CardProduct[] }) {
  if (!products.length) {
    return (
      <div className="bento px-8 py-20 text-center">
        <h2 className="font-display text-xl">Nothing matches those filters</h2>
        <p className="mt-3 text-sm font-light text-ink-muted">
          Try widening the price range, or clearing a department.
        </p>
        <Link
          href="/products"
          className="label mt-7 inline-block text-gold transition-colors duration-300 hover:text-gold-deep"
        >
          Clear all filters
        </Link>
      </div>
    );
  }

  return <ProductShelf products={products} className="sm:grid-cols-2 xl:grid-cols-3" />;
}
