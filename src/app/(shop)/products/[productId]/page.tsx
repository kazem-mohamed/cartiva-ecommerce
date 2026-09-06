import Link from "next/link";
import type { Metadata } from "next";
import WishlistButton from "@/component/wishlist/WishlistButton";
import ProductImageGallery from "./ProductImageGallery";
import ProductPurchase from "./ProductPurchase";
import ShareButton from "./ShareButton";
import SimilarProductsCarousel from "./SimilarProductsCarousel";
import ProductReviews, { type Review } from "@/component/product/ProductReviews";

interface Ref {
  _id: string;
  name: string;
  slug?: string;
}

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  priceAfterDiscount?: number;
  quantity: number;
  ratingsAverage?: number;
  ratingsQuantity?: number;
  imageCover: string;
  images: string[];
  category?: Ref;
  subcategory?: Ref;
  brand?: Ref;
  sold?: number;
}

const API = "https://ecommerce.routemisr.com/api/v1/products";
const egp = new Intl.NumberFormat("en-EG");

async function getProduct(productId: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API}/${productId}`, { next: { revalidate: 120 } });
    if (!res.ok) return null;
    const json = (await res.json()) as { data: Product };
    return json.data ?? null;
  } catch {
    return null;
  }
}

async function getSimilar(product: Product): Promise<Product[]> {
  try {
    const categoryId = product.category?._id;
    if (!categoryId) return [];
    const res = await fetch(`${API}?category[in]=${categoryId}&limit=12`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data: Product[] };
    return (json.data ?? []).filter((p) => p._id !== product._id).slice(0, 8);
  } catch {
    return [];
  }
}

/** Real reviews from the API — 37 on some products, with names and dates. */
async function getReviews(productId: string): Promise<Review[]> {
  try {
    const res = await fetch(`${API}/${productId}/reviews`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = (await res.json()) as { data: Review[] };
    return json.data ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata(props: {
  params: Promise<{ productId: string }>;
}): Promise<Metadata> {
  const { productId } = await props.params;
  const product = await getProduct(productId);
  if (!product) return { title: "Product not found" };
  return {
    title: product.title,
    description: product.description?.slice(0, 160),
  };
}

export default async function ProductDetails(props: {
  params: Promise<{ productId: string }>;
}) {
  // Next 16: params is async-only.
  const { productId } = await props.params;
  const product = await getProduct(productId);

  if (!product) {
    return (
      <main className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 py-24">
        <div className="bento px-8 py-20 text-center">
          <h1 className="font-display text-2xl">Product not found</h1>
          <p className="mt-3 text-sm font-light text-ink-muted">
            It may have sold out, or the link is no longer valid.
          </p>
          <Link
            href="/products"
            className="label mt-7 inline-block text-gold transition-colors duration-300 hover:text-gold-deep"
          >
            Back to the catalogue
          </Link>
        </div>
      </main>
    );
  }

  const discounted =
    typeof product.priceAfterDiscount === "number" &&
    product.priceAfterDiscount < product.price;
  const shown = discounted ? product.priceAfterDiscount! : product.price;
  const off = discounted
    ? Math.round((1 - product.priceAfterDiscount! / product.price) * 100)
    : 0;
  const soldOut = product.quantity === 0;
  const low = !soldOut && product.quantity <= 5;

  const [similar, reviews] = await Promise.all([
    getSimilar(product),
    getReviews(product._id),
  ]);

  // The API returns descriptions as tab-separated spec pairs for many items.
  const specLines =
    product.description
      ?.split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => l.split("\t"))
      .filter((parts) => parts.length === 2) ?? [];
  const prose = specLines.length === 0 ? product.description?.trim() ?? "" : "";

  return (
    <main>
      {/* ── Chapter 1 · The object ──────────────────────────────────────
          The gallery is pinned while the buying column scrolls past it.
          Engine pattern: "sticky section header push", density 2/10. */}
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 pt-8">
        <nav aria-label="Breadcrumb">
          <ol className="label flex flex-wrap items-center gap-2 text-ink-muted">
            <li><Link href="/" className="transition-colors duration-300 hover:text-gold">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/products" className="transition-colors duration-300 hover:text-gold">Products</Link></li>
            {product.category && (
              <>
                <li aria-hidden="true">/</li>
                <li>
                  <Link
                    href={`/categories/${product.category._id}`}
                    className="transition-colors duration-300 hover:text-gold"
                  >
                    {product.category.name}
                  </Link>
                </li>
              </>
            )}
          </ol>
        </nav>
      </div>

      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 py-10 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,48%)_minmax(0,1fr)] lg:gap-16 lg:items-start">
          <ProductImageGallery
            title={product.title}
            imageCover={product.imageCover}
            images={product.images}
            hasDiscount={discounted}
            savePercent={off}
          />

          <div className="lg:py-4">
            {product.brand && (
              <Link
                href={`/brand/${product.brand._id}`}
                className="label text-gold transition-colors duration-300 hover:text-gold-deep"
              >
                {product.brand.name}
              </Link>
            )}

            <h1 className="font-display-lg mt-5 text-[clamp(30px,4.4vw,52px)]">
              {product.title}
            </h1>

            {typeof product.ratingsAverage === "number" && (
              <a
                href="#reviews"
                className="mt-6 inline-flex items-center gap-3 text-[14px] font-light text-ink-muted transition-colors duration-300 hover:text-gold"
              >
                <span aria-hidden="true" className="text-gold">★</span>
                <span className="tabular">{product.ratingsAverage.toFixed(1)}</span>
                {reviews.length > 0 && (
                  <span className="tabular underline decoration-line underline-offset-4">
                    {reviews.length} review{reviews.length === 1 ? "" : "s"}
                  </span>
                )}
                {typeof product.sold === "number" && product.sold > 0 && (
                  <span className="tabular">· {egp.format(product.sold)} sold</span>
                )}
              </a>
            )}

            {/* Price — given real air, per density 2/10 */}
            <div className="mt-10 flex items-baseline gap-4">
              <span className="font-display tabular text-[clamp(34px,4.6vw,46px)] font-semibold leading-none">
                {egp.format(shown)}
              </span>
              <span className="text-[15px] font-light text-ink-muted">EGP</span>
              {discounted && (
                <>
                  <s className="tabular text-[17px] font-light text-ink-muted decoration-1">
                    {egp.format(product.price)}
                  </s>
                  <span className="label rounded-full bg-gold px-3 py-1.5 text-[9px] text-white">
                    −{off}%
                  </span>
                </>
              )}
            </div>

            <p className="mt-5 flex items-center gap-2.5 text-[14px] font-light">
              <span
                aria-hidden="true"
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{
                  background: soldOut ? "var(--danger)" : low ? "var(--warning)" : "var(--success)",
                }}
              />
              {soldOut ? "Out of stock" : low ? `Only ${product.quantity} left` : "In stock"}
            </p>

            <div className="mt-10">
              <ProductPurchase
                productId={product._id}
                stock={product.quantity}
                soldOut={soldOut}
                unitPrice={shown}
              />
            </div>

            <div className="mt-5 flex items-center gap-3">
              <WishlistButton productId={product._id} />
              <ShareButton title={product.title} />
            </div>

            {/* Specs as an editorial table, not a card grid */}
            {(specLines.length > 0 || prose) && (
              <section className="mt-14">
                <h2 className="label mb-7 text-ink-muted">Specification</h2>
                {specLines.length > 0 ? (
                  <dl className="border-t border-line">
                    {specLines.map(([k, v], i) => (
                      <div
                        key={`${k}-${i}`}
                        className="flex gap-6 border-b border-line-soft py-4"
                      >
                        <dt className="w-[42%] shrink-0 text-[13.5px] font-light text-ink-muted">
                          {k}
                        </dt>
                        <dd className="text-[14.5px]">{v}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="max-w-[64ch] text-[15.5px] font-light leading-[1.75] text-ink-soft whitespace-pre-line">
                    {prose}
                  </p>
                )}
              </section>
            )}
          </div>
        </div>
      </div>

      {/* ── Chapter 2 · What buyers said ─────────────────────────────── */}
      <div id="reviews" className="scroll-mt-6">
        <ProductReviews
          productId={product._id}
          reviews={reviews}
          ratingsAverage={product.ratingsAverage}
        />
      </div>

      {/* ── Chapter 3 · The horizontal track ─────────────────────────── */}
      {similar.length > 0 && <SimilarProductsCarousel products={similar} />}
    </main>
  );
}
