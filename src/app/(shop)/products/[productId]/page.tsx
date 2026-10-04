import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/ds/commerce/Gallery";
import { ProductCard } from "@/ds/commerce/ProductCard";
import { Reviews } from "@/ds/commerce/Reviews";
import { siblingsOf } from "@/ds/commerce/Swatches";
import type { Product } from "@/ds/commerce/types";
import { getProduct, getProducts, getReviews } from "@/ds/data/catalog";
import { Reveal } from "@/ds/motion/Reveal";
import { PageFrame } from "@/ds/ui/PageIntro";
import { BuyBox } from "./BuyBox";

type Params = Promise<{ productId: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { productId } = await params;
  const product = await getProduct(productId);
  if (!product) return { title: "Product not found" };
  return { title: product.title, description: product.description?.slice(0, 160) };
}

/** The API sends many descriptions as tab-separated "key<TAB>value" lines — a spec sheet in disguise. */
function readDescription(text = "") {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const specs = lines.map((l) => l.split("\t")).filter((p): p is [string, string] => p.length === 2 && !!p[0] && !!p[1]);
  return specs.length >= 2 ? { specs, prose: "" } : { specs: [] as [string, string][], prose: text.trim() };
}

/** Same department, one per title (the catalogue repeats items per colour), best sellers first. */
function similarTo(product: Product, all: Product[]) {
  const seen = new Set([product.title.trim().toLowerCase()]);
  return all
    .filter((p) => p.category?._id === product.category?._id)
    .sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0))
    .filter((p) => {
      const key = p.title.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 4);
}

export default async function ProductPage({ params }: { params: Params }) {
  const { productId } = await params;
  const [product, all, reviews] = await Promise.all([getProduct(productId), getProducts(), getReviews(productId)]);
  if (!product) notFound();

  const images = [product.imageCover, ...(product.images ?? [])].filter((src, i, list) => src && list.indexOf(src) === i);
  const siblings = siblingsOf(product, all);
  const similar = similarTo(product, all);
  const { specs, prose } = readDescription(product.description);

  return (
    <PageFrame>
      <nav aria-label="Breadcrumb" className="pt-8 pb-6 lg:pt-10">
        <ol className="flex flex-wrap items-center gap-2 t-caption text-fg-3">
          <li className="flex items-center gap-2">
            <Link href="/" className="hover:text-fg">
              Home
            </Link>
            <span aria-hidden>/</span>
          </li>
          <li className="flex items-center gap-2">
            <Link href="/products" className="hover:text-fg">
              Shop
            </Link>
            <span aria-hidden>/</span>
          </li>
          {product.category?._id && (
            <li className="flex items-center gap-2">
              <Link href={`/categories/${product.category._id}`} className="hover:text-fg">
                {product.category.name}
              </Link>
            </li>
          )}
        </ol>
      </nav>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] lg:gap-16">
        <div className="md:sticky md:top-20 md:self-start lg:top-24">
          <Gallery images={images} title={product.title} />
        </div>
        {/* Keyed so switching colour (a different product) starts from quantity 1. */}
        <BuyBox key={product._id} product={product} siblings={siblings} reviewCount={reviews.length} />
      </div>

      {(specs.length > 0 || prose) && (
        <section aria-labelledby="details" className="mt-24 grid grid-cols-1 gap-8 border-t border-line pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
          <h2 id="details" className="t-h2">
            Details
          </h2>
          {specs.length > 0 ? (
            <dl className="grid">
              {specs.map(([k, v], i) => (
                <div key={`${k}-${i}`} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-6 border-b border-line py-4 first:pt-0">
                  <dt className="t-body text-fg-3">{k}</dt>
                  <dd className="t-body text-fg">{v}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="max-w-[64ch] whitespace-pre-line t-body-lg text-fg-2">{prose}</p>
          )}
        </section>
      )}

      <div id="reviews" className="mt-24 scroll-mt-24 border-t border-line pt-12">
        <Reviews productId={product._id} initial={reviews} ratingsAverage={product.ratingsAverage} ratingsQuantity={product.ratingsQuantity} />
      </div>

      {similar.length > 0 && (
        <section aria-labelledby="similar" className="mt-24 border-t border-line pt-12">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2 id="similar" className="t-h2">
              More in {product.category?.name ?? "this department"}
            </h2>
            {product.category?._id && (
              <Link
                href={`/categories/${product.category._id}`}
                className="t-label underline decoration-line-strong underline-offset-[6px] hover:decoration-current"
              >
                See all
              </Link>
            )}
          </div>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-5">
            {similar.map((p, i) => (
              <Reveal as="li" key={p._id} delay={i * 70}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </ul>
        </section>
      )}
    </PageFrame>
  );
}
