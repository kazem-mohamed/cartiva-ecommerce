import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import Reveal from '@/component/ui/Reveal'

export const metadata: Metadata = {
  title: 'Brands',
  description: 'Every brand carried by Cartiva.',
}

interface Brand {
  _id: string
  name: string
  image?: string
  slug?: string
}

async function getBrands(): Promise<Brand[]> {
  try {
    const res = await fetch('https://ecommerce.routemisr.com/api/v1/brands?limit=50', {
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    const json = (await res.json()) as { data: Brand[] }
    return json.data ?? []
  } catch {
    return []
  }
}

export default async function BrandPage() {
  const brands = await getBrands()

  return (
    <main className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 py-10 sm:py-14">
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="label flex items-center gap-2 text-ink-muted">
          <li><Link href="/" className="transition-colors duration-300 hover:text-gold">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-ink">Brands</li>
        </ol>
      </nav>

      {/* Editorial header, not a coloured gradient banner. The previous
          version opened with a violet-to-purple gradient hero, which
          belongs to no part of this brand. */}
      <header className="bento mb-8 p-8 sm:p-12">
        <span className="label text-ink-muted">
          <span className="tabular">{brands.length}</span> in the catalogue
        </span>
        <h1 className="font-display-lg mt-4 text-[clamp(32px,5vw,58px)]">
          Brands we <span className="gold-text">carry.</span>
        </h1>
        <p className="mt-5 max-w-[54ch] text-[16px] font-light leading-relaxed text-ink-muted">
          Every label stocked by Cartiva, across electronics, fashion, beauty,
          home and mobiles.
        </p>
      </header>

      {brands.length === 0 ? (
        <div className="bento px-8 py-20 text-center">
          <h2 className="font-display text-xl">Brands are unavailable</h2>
          <p className="mt-3 text-sm font-light text-ink-muted">
            The catalogue could not be reached. Refresh to try again.
          </p>
        </div>
      ) : (
        <Reveal stagger={50} className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {brands.map((b) => (
            <Link
              key={b._id}
              href={`/brand/${b._id}`}
              className="reveal bento bento-hover group flex flex-col overflow-hidden p-5"
            >
              <div className="well grid aspect-[4/3] place-items-center p-7">
                {b.image ? (
                  <Image
                    src={b.image}
                    alt=""
                    width={200}
                    height={120}
                    className="h-auto w-full max-w-[132px] object-contain opacity-70 transition-opacity duration-500 group-hover:opacity-100"
                  />
                ) : (
                  <span className="font-display text-2xl text-ink-muted">{b.name.slice(0, 2)}</span>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 px-1 pt-4">
                <span className="font-display text-[15px]">{b.name}</span>
                <span
                  aria-hidden="true"
                  className="flex -translate-x-1.5 text-gold opacity-0 transition-[opacity,transform] duration-[500ms] ease-[var(--ease)] group-hover:translate-x-0 group-hover:opacity-100"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </Reveal>
      )}
    </main>
  )
}
