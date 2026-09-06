import Link from "next/link";
import type { Metadata } from "next";
import FilterRail from "./FilterRail";
import ProductsResults from "./ProductsResults";
import type { CardProduct } from "@/component/product/ProductCard";

export const metadata: Metadata = {
  title: "All products",
  description: "Browse the full Cartiva catalogue.",
};

const PRODUCTS_API = "https://ecommerce.routemisr.com/api/v1/products";
const CATEGORIES_API = "https://ecommerce.routemisr.com/api/v1/categories";
const BRANDS_API = "https://ecommerce.routemisr.com/api/v1/brands";

/** Params forwarded verbatim to the API. Anything else is ignored. */
const QUERY_KEYS = [
  "limit",
  "sort",
  "fields",
  "page",
  "keyword",
  "brand",
  "subcategory",
  "price[gte]",
  "price[lte]",
  "category[in]",
] as const;

type SearchParams = Record<string, string | string[] | undefined>;

interface Ref {
  _id: string;
  name: string;
}

function buildQuery(searchParams: SearchParams) {
  const params = new URLSearchParams();
  QUERY_KEYS.forEach((key) => {
    const value = searchParams[key];
    if (value === undefined) return;
    if (Array.isArray(value)) value.forEach((v) => v !== "" && params.append(key, v));
    else if (value !== "") params.append(key, value);
  });
  if (!params.has("limit")) params.set("limit", "24");
  if (!params.has("sort")) params.set("sort", "-createdAt");
  return params.toString();
}

async function getProducts(query: string) {
  try {
    const res = await fetch(`${PRODUCTS_API}?${query}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()) as {
      results?: number;
      metadata?: { currentPage: number; numberOfPages: number };
      data: CardProduct[];
    };
  } catch {
    return null;
  }
}

async function getRefs(url: string): Promise<Ref[]> {
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = (await res.json()) as { data: Ref[] };
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function ProductsPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  // Next 16: searchParams is async-only. Reading it synchronously throws.
  const searchParams = await props.searchParams;
  const query = buildQuery(searchParams);

  const [payload, categories, brands] = await Promise.all([
    getProducts(query),
    getRefs(CATEGORIES_API),
    getRefs(`${BRANDS_API}?limit=50`),
  ]);

  const rawProducts = payload?.data ?? [];

  // The API sorts and filters on `price` (list price), but the card shows
  // `priceAfterDiscount` — the amount actually charged. Left alone, "price,
  // low to high" renders a 189 EGP item below a 349 EGP one, which reads as
  // a broken sort. Re-sorting the page by effective price fixes what the
  // shopper can see.
  //
  // Known limit: this only orders the current page. Page boundaries are
  // still chosen by the API on list price, so an item can sit on a later
  // page than its discounted price implies. Fixing that properly needs
  // sort-by-discounted-price server-side, which this API does not offer.
  const sortParam = Array.isArray(searchParams.sort) ? searchParams.sort[0] : searchParams.sort;
  const effective = (p: CardProduct) =>
    typeof p.priceAfterDiscount === "number" && p.priceAfterDiscount < p.price
      ? p.priceAfterDiscount
      : p.price;

  const products =
    sortParam === "price" || sortParam === "-price"
      ? [...rawProducts].sort((a, b) =>
          sortParam === "price" ? effective(a) - effective(b) : effective(b) - effective(a)
        )
      : rawProducts;

  const total = payload?.results ?? products.length;
  const page = payload?.metadata?.currentPage ?? 1;
  const pages = payload?.metadata?.numberOfPages ?? 1;

  const pageHref = (n: number) => {
    const next = new URLSearchParams();
    QUERY_KEYS.forEach((key) => {
      const value = searchParams[key];
      if (key === "page" || value === undefined) return;
      if (Array.isArray(value)) value.forEach((v) => next.append(key, v));
      else next.append(key, value);
    });
    next.set("page", String(n));
    return `/products?${next.toString()}`;
  };

  return (
    <main className="mx-auto w-full max-w-[1320px] px-6 sm:px-8 py-12 sm:py-16">
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="label flex items-center gap-2 text-ink-muted">
          <li>
            <Link href="/" className="transition-colors duration-300 hover:text-gold">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-ink">All products</li>
        </ol>
      </nav>

      <header className="bento mb-8 p-8 sm:p-10">
        <h1 className="font-display-lg text-[clamp(32px,5vw,54px)]">The catalogue</h1>
        <p className="mt-4 max-w-[58ch] text-[16px] font-light text-ink-muted">
          Everything Cartiva carries, in one place. Filter by department, brand
          or price — every result is live from the catalogue.
        </p>
      </header>

      {!payload ? (
        <div className="bento px-8 py-20 text-center">
          <h2 className="font-display text-xl">The catalogue is unavailable</h2>
          <p className="mt-3 text-sm font-light text-ink-muted">
            The store could not be reached. Refresh to try again.
          </p>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
          <FilterRail categories={categories} brands={brands} total={total} />

          <div>
            <ProductsResults products={products} />

            {pages > 1 && (
              <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
                {page > 1 && (
                  <Link href={pageHref(page - 1)} className="label border border-line px-5 py-3 transition-colors duration-300 hover:border-gold-deep hover:text-gold">
                    Previous
                  </Link>
                )}
                <span className="label tabular px-4 text-ink-muted">
                  Page {page} of {pages}
                </span>
                {page < pages && (
                  <Link href={pageHref(page + 1)} className="label border border-line px-5 py-3 transition-colors duration-300 hover:border-gold-deep hover:text-gold">
                    Next
                  </Link>
                )}
              </nav>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
