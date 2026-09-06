import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import ProductShelf from '@/component/product/ProductShelf'
import type { CardProduct } from '@/component/product/ProductCard'

interface Category {
  _id: string
  name: string
  image?: string
  slug?: string
}

interface Subcategory {
  _id: string
  name: string
}

const CATEGORIES_API = 'https://ecommerce.routemisr.com/api/v1/categories'
const PRODUCTS_API = 'https://ecommerce.routemisr.com/api/v1/products'

async function getCategory(categoryId: string): Promise<Category | null> {
  try {
    const res = await fetch(`${CATEGORIES_API}/${categoryId}`, { next: { revalidate: 300 } })
    if (!res.ok) return null
    const json = (await res.json()) as { data: Category }
    return json.data ?? null
  } catch {
    return null
  }
}

async function getSubcategories(categoryId: string): Promise<Subcategory[]> {
  try {
    const res = await fetch(`${CATEGORIES_API}/${categoryId}/subcategories`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    const json = (await res.json()) as { data: Subcategory[] }
    return json.data ?? []
  } catch {
    return []
  }
}

async function getCategoryProducts(categoryId: string): Promise<CardProduct[]> {
  try {
    const res = await fetch(`${PRODUCTS_API}?category[in]=${categoryId}&limit=40`, {
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
  params: Promise<{ categoriesId: string }>
}): Promise<Metadata> {
  const { categoriesId } = await props.params
  const category = await getCategory(categoriesId)
  return category ? { title: category.name } : { title: 'Department not found' }
}

export default async function CategoryDetails(props: {
  params: Promise<{ categoriesId: string }>
}) {
  // Next 16: params is async-only.
  const { categoriesId } = await props.params
  const [category, subcategories, products] = await Promise.all([
    getCategory(categoriesId),
    getSubcategories(categoriesId),
    getCategoryProducts(categoriesId),
  ])

  if (!category) {
    return (
      <main className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 py-24">
        <div className="bento px-8 py-20 text-center">
          <h1 className="font-display text-2xl">Department not found</h1>
          <p className="mt-3 text-sm font-light text-ink-muted">The link may be out of date.</p>
          <Link
            href="/categories"
            className="label mt-7 inline-block text-gold transition-colors duration-300 hover:text-gold-deep"
          >
            All departments
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
          <li><Link href="/categories" className="transition-colors duration-300 hover:text-gold">Departments</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-ink">{category.name}</li>
        </ol>
      </nav>

      {/* The department's own photograph is the header, held inside a tile
          rather than bled across a coloured gradient banner. */}
      <header className="bento mb-8 overflow-hidden">
        <div className="relative aspect-[21/8] min-h-[220px]">
          {category.image && (
            <Image
              src={category.image}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          )}
          <span
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.05) 30%, rgba(255,255,255,0.95) 100%)',
            }}
          />
          <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10">
            <span className="label text-ink-muted">Department</span>
            <h1 className="font-display-lg mt-3 text-[clamp(28px,4.6vw,52px)] text-ink">
              {category.name}
            </h1>
            <p className="mt-3 text-[15px] font-light text-ink-muted">
              <span className="tabular">{products.length}</span> product
              {products.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {subcategories.length > 0 && (
          <div className="border-t border-line-soft p-6 sm:px-10 sm:py-7">
            <span className="label mb-4 block text-ink-muted">Browse within</span>
            <ul className="flex flex-wrap gap-2.5">
              {subcategories.map((s) => (
                <li key={s._id}>
                  <Link
                    href={`/products?subcategory=${s._id}`}
                    className="inline-block rounded-full border border-line px-4 py-2.5 text-[12.5px] transition-colors duration-400 hover:border-gold hover:text-gold"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      {products.length === 0 ? (
        <div className="bento px-8 py-20 text-center">
          <h2 className="font-display text-xl">Nothing in {category.name} right now</h2>
          <p className="mt-3 text-sm font-light text-ink-muted">
            This department has no products in the catalogue at the moment.
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
