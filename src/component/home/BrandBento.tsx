import Image from "next/image";
import Link from "next/link";
import Reveal from "@/component/ui/Reveal";

interface Brand {
  _id: string;
  name: string;
  image: string;
}

async function getBrands(): Promise<Brand[]> {
  try {
    const res = await fetch("https://ecommerce.routemisr.com/api/v1/brands?limit=12", {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data: Brand[] };
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function BrandBento() {
  const brands = await getBrands();
  if (!brands.length) return null;

  return (
    <section className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 py-14 sm:py-20">
      <div className="mb-9 flex items-baseline justify-between gap-5 flex-wrap">
        <h2 className="font-display text-[clamp(24px,3.2vw,36px)]">Brands we carry</h2>
        <Link
          href="/brand"
          className="label text-gold transition-colors duration-300 hover:text-gold-deep"
        >
          All brands
        </Link>
      </div>

      <Reveal
        stagger={60}
        className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6"
      >
        {brands.map((b) => (
          <Link
            key={b._id}
            href={`/brand/${b._id}`}
            className="reveal bento bento-hover grid aspect-[3/2] place-items-center p-6"
          >
            <Image
              src={b.image}
              alt={b.name}
              width={120}
              height={60}
              className="h-auto w-full max-w-[104px] object-contain opacity-65 transition-opacity duration-500 hover:opacity-100"
            />
          </Link>
        ))}
      </Reveal>
    </section>
  );
}
