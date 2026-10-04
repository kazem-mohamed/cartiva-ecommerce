import { EditorialImage, hasEditorial } from "@/ds/commerce/EditorialImage";
import type { Product } from "@/ds/commerce/types";
import { getProducts } from "@/ds/data/catalog";
import { ProductShot } from "@/ds/ui/ProductShot";

/** One best seller per department — the same three objects the storefront leads with. */
function vitrineOf(products: Product[]) {
  const byDept = new Map<string, Product>();
  for (const p of [...products].sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0))) {
    const key = p.category?.name ?? "";
    if (!byDept.has(key)) byDept.set(key, p);
  }
  return [...byDept.values()].slice(0, 3);
}

/**
 * Sign in, register, reset: the form on the canvas, and beside it the studio —
 * the store's promise while you type (a dark vitrine of best sellers stands in
 * until the photo exists). Phones get the form alone.
 */
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const hasImage = hasEditorial("auth-vitrine");
  const vitrine = hasImage ? [] : vitrineOf(await getProducts());
  const steps = ["mt-16", "mt-0", "mt-28"];

  return (
    <div className="mx-auto grid w-full max-w-(--page-max) flex-1 gap-12 px-(--gutter) py-12 lg:grid-cols-2 lg:gap-20 lg:py-16">
      <div className="flex items-center">
        <div className="w-full max-w-md">{children}</div>
      </div>
      <aside
        data-theme={hasImage ? "light" : "dark"}
        aria-hidden
        className="relative isolate hidden min-h-[640px] overflow-hidden rounded-card border border-line bg-canvas text-fg lg:block"
      >
        {hasImage ? (
          <>
            <EditorialImage name="auth-vitrine" sizes="50vw" className="absolute inset-0 h-full w-full rounded-none" imgClassName="object-[center_35%]" />
            {/* The caption sits on the empty floor; a soft paper fade keeps it legible on any crop. */}
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(0deg,color-mix(in_srgb,var(--canvas)_85%,transparent),transparent)]" />
          </>
        ) : (
          <>
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_30%_10%,rgb(237_237_243/0.12),transparent_65%)]" />
            <ul className="absolute inset-x-10 top-16 grid grid-cols-3 items-start gap-4">
              {vitrine.map((p, i) => (
                <li key={p._id} className={steps[i]}>
                  <div className="lit-plate rounded-card" style={{ "--delay": `${200 + i * 160}ms` } as React.CSSProperties}>
                    <ProductShot src={p.imageCover} alt="" sizes="16vw" />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="absolute inset-x-10 bottom-10 grid gap-2">
          <p className="t-h2">Everything, well lit.</p>
          <p className="t-body text-fg-2">One account for your bag, wishlist, addresses and orders.</p>
        </div>
      </aside>
    </div>
  );
}
