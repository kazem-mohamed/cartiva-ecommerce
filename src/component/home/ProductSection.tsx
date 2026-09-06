import ProductShelf from "@/component/product/ProductShelf";
import type { CardProduct } from "@/component/product/ProductCard";
import { ButtonLink } from "@/component/ui/Button";

/** Server Component — products ship inside the HTML. */
async function getProducts(limit: number, sort?: string): Promise<CardProduct[]> {
  try {
    const params = new URLSearchParams({ limit: String(limit) });
    if (sort) params.set("sort", sort);
    const res = await fetch(`https://ecommerce.routemisr.com/api/v1/products?${params}`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data: CardProduct[] };
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function ProductSection({
  title,
  kicker,
  limit = 8,
  sort,
  href = "/products",
}: {
  title: string;
  kicker?: string;
  limit?: number;
  sort?: string;
  href?: string;
}) {
  const products = await getProducts(limit, sort);
  if (!products.length) return null;

  return (
    <section className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 py-14 sm:py-20">
      <div className="mb-9 flex items-end justify-between gap-6 flex-wrap">
        <div>
          {kicker && <span className="label text-ink-muted">{kicker}</span>}
          <h2 className="font-display mt-3 text-[clamp(24px,3.2vw,36px)]">{title}</h2>
        </div>
        <ButtonLink href={href} variant="secondary" size="md">
          See all
        </ButtonLink>
      </div>

      <ProductShelf products={products} />
    </section>
  );
}
