import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import ProductShelf from '@/component/product/ProductShelf'
import type { CardProduct } from '@/component/product/ProductCard'

interface Brand {
  _id: string
  name: string
  image?: string
  slug?: string
}

const BRANDS_API = 'https://ecommerce.routemisr.com/api/v1/brands'
const PRODUCTS_API = 'https://ecommerce.routemisr.com/api/v1/products'

async function getBrand(brandId: string): Promise<Brand | null> {
  try {
    const res = await fetch(`${BRANDS_API}/${brandId}`, { next: { revalidate: 300 } })
    if (!res.ok) return null
    const json = (await res.json()) as { data: Brand }
    return json.data ?? null
  } catch {
    return null
  }
}

async function getBrandProducts(brandId: string): Promise<CardProduct[]> {
  try {
    const res = await fetch(`${PRODUCTS_API}?brand=${brandId}&limit=40`, {
      next: { revalidate: 120 },
    })
    if (!res.ok) return []
    const json = (await res.json()) as { data: CardProduct[] }
    return json.data ?? []
  } catch {
    return []
  }
}

export async function generateMetadata(props: {
  params: Promise<{ brandId: string }>
}): Promise<Metadata> {
  const { brandId } = await props.params
  const brand = await getBrand(brandId)
  return brand ? { title: brand.name } : { title: 'Brand not found' }
}

export default async function BrandDetails(props: {
  params: Promise<{ brandId: string }>
}) {
  // Next 16: params is async-only.
  const { brandId } = await props.params
  const [brand, products] = await Promise.all([getBrand(brandId), getBrandProducts(brandId)])

  if (!brand) {
    return (
      <main className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 py-24">
        <div className="bento px-8 py-20 text-center">
          <h1 className="font-display text-2xl">Brand not found</h1>
          <p className="mt-3 text-sm font-light text-ink-muted">
            The link may be out of date.
          </p>
          <Link
            href="/brand"
            className="label mt-7 inline-block text-gold transition-colors duration-300 hover:text-gold-deep"
          >
            All brands
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 py-10 sm:py-14">
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="label flex flex-wrap items-center gap-2 text-ink-muted">
          <li><Link href="/" className="transition-colors duration-300 hover:text-gold">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/brand" className="transition-colors duration-300 hover:text-gold">Brands</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-ink">{brand.name}</li>
        </ol>
      </nav>

      {/* The brand's own mark carries the header — no coloured gradient. */}
      <header className="bento mb-8 flex flex-wrap items-center gap-8 p-8 sm:p-10">
        {brand.image && (
          <div className="well grid h-28 w-40 shrink-0 place-items-center p-5">
            <Image
              src={brand.image}
              alt=""
              width={160}
              height={90}
              className="h-auto w-full max-w-[112px] object-contain"
            />
          </div>
        )}
        <div className="min-w-0">
          <span className="label text-ink-muted">Brand</span>
          <h1 className="font-display-lg mt-3 text-[clamp(28px,4.4vw,50px)]">{brand.name}</h1>
          <p className="mt-3 text-[15px] font-light text-ink-muted">
            <span className="tabular">{products.length}</span> product
            {products.length === 1 ? '' : 's'} in the catalogue
          </p>
        </div>
      </header>

      {products.length === 0 ? (
        <div className="bento px-8 py-20 text-center">
          <h2 className="font-display text-xl">Nothing from {brand.name} right now</h2>
          <p className="mt-3 text-sm font-light text-ink-muted">
            This brand has no products in the catalogue at the moment.
          </p>
          <Link
            href="/products"
            className="label mt-7 inline-block text-gold transition-colors duration-300 hover:text-gold-deep"
          >
            Browse everything
          </Link>
        </div>
      ) : (
        <ProductShelf products={products} />
      )}
    </main>
  )
}
