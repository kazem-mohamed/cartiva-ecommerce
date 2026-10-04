import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getBrands, getProducts } from "@/ds/data/catalog";
import { Reveal } from "@/ds/motion/Reveal";
import { PageFrame, PageIntro } from "@/ds/ui/PageIntro";

export const metadata: Metadata = { title: "Brands", description: "Every brand in the Cartiva catalogue." };
export const revalidate = 3600;

export default async function BrandsPage() {
  const [brands, products] = await Promise.all([getBrands(), getProducts()]);
  const count = (id: string) => products.filter((p) => p.brand?._id === id).length;
  const rows = brands.map((b) => ({ brand: b, count: count(b._id) }));
  const stocked = rows.filter((r) => r.count > 0).sort((a, b) => b.count - a.count || a.brand.name.localeCompare(b.brand.name));
  const rest = rows.filter((r) => r.count === 0).sort((a, b) => a.brand.name.localeCompare(b.brand.name));

  return (
    <PageFrame>
      <PageIntro crumbs={[{ href: "/", label: "Home" }]} title="Brands">
        {stocked.length} brands with products on display.
      </PageIntro>

      <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {stocked.map(({ brand, count: n }, i) => (
          <Reveal as="li" key={brand._id} delay={(i % 4) * 60}>
            <Link href={`/brand/${brand._id}`} className="group block">
              <span className="relative isolate block aspect-[3/2] overflow-hidden rounded-card bg-plate">
                {brand.image ? (
                  <Image
                    src={brand.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-contain p-[16%] opacity-85 mix-blend-multiply grayscale transition-[filter,opacity,scale] duration-(--dur-state) group-hover:opacity-100 motion-safe:group-hover:scale-105 group-hover:grayscale-0"
                  />
                ) : (
                  <span className="grid h-full place-items-center t-h3 text-[#171721]">{brand.name}</span>
                )}
              </span>
              <span className="mt-3 flex items-baseline justify-between gap-2">
                <span className="t-label underline-reveal underline-offset-4 transition-colors group-hover:decoration-line-strong">{brand.name}</span>
                <span className="t-caption t-num text-fg-3">{n}</span>
              </span>
            </Link>
          </Reveal>
        ))}
      </ul>

      {rest.length > 0 && (
        <section aria-labelledby="more-brands" className="mt-24">
          <h2 id="more-brands" className="t-h3">
            More brands
          </h2>
          <p className="mt-2 t-body text-fg-2">Nothing on display from these yet.</p>
          <ul className="mt-8 columns-2 gap-8 sm:columns-3 lg:columns-5">
            {rest.map(({ brand }) => (
              <li key={brand._id} className="break-inside-avoid">
                <Link href={`/brand/${brand._id}`} className="block py-2 t-body text-fg-2 hover:text-fg">
                  {brand.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageFrame>
  );
}
