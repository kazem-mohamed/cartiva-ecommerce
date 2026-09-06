import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import Reveal from '@/component/ui/Reveal'

export const metadata: Metadata = {
  title: 'Departments',
  description: 'Every department in the Cartiva catalogue.',
}

interface Category {
  _id: string
  name: string
  image: string
  slug: string
}

const CATEGORIES_API = 'https://ecommerce.routemisr.com/api/v1/categories'

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(CATEGORIES_API, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const json = (await res.json()) as { data: Category[] }
    return json.data ?? []
  } catch {
    return []
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <main className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 py-10 sm:py-14">
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="label flex items-center gap-2 text-ink-muted">
          <li><Link href="/" className="transition-colors duration-300 hover:text-gold">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-ink">Departments</li>
        </ol>
      </nav>

      <header className="bento mb-8 p-8 sm:p-12">
        <span className="label text-ink-muted">
          <span className="tabular">{categories.length}</span> departments
        </span>
        <h1 className="font-display-lg mt-4 text-[clamp(32px,5vw,58px)]">
          Everything, <span className="gold-text">sorted.</span>
        </h1>
        <p className="mt-5 max-w-[54ch] text-[16px] font-light leading-relaxed text-ink-muted">
          Ten departments, one account. Pick a shelf and start.
        </p>
      </header>

      {categories.length === 0 ? (
        <div className="bento px-8 py-20 text-center">
          <h2 className="font-display text-xl">Departments are unavailable</h2>
          <p className="mt-3 text-sm font-light text-ink-muted">
            The catalogue could not be reached. Refresh to try again.
          </p>
        </div>
      ) : (
        /* Bento: the first tile runs wide and tall, the rest fall in around
           it — the engine's varied-span rule, not a uniform grid. */
        <Reveal
          stagger={60}
          className="grid grid-cols-2 gap-5 lg:grid-cols-4 lg:auto-rows-[220px]"
        >
          {categories.map((cat, i) => {
            const feature = i === 0
            return (
              <Link
                key={cat._id}
                href={`/categories/${cat._id}`}
                className={`reveal bento bento-hover group relative overflow-hidden ${
                  feature ? 'col-span-2 row-span-2' : ''
                } ${!feature ? 'aspect-[4/5] lg:aspect-auto' : 'aspect-square lg:aspect-auto'}`}
              >
                <Image
                  src={cat.image}
                  alt=""
                  fill
                  sizes={feature ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 1024px) 50vw, 25vw'}
                  className="object-cover transition-transform duration-[900ms] ease-[var(--ease)] group-hover:scale-[1.06]"
                />
                {/* The API's category art is arbitrary photography — the
                    scrim is what keeps the label legible over all of it. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(255,255,255,0) 32%, rgba(255,255,255,0.94) 100%)',
                  }}
                />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 sm:p-6">
                  <span
                    className={`font-display block text-ink ${
                      feature ? 'text-[clamp(20px,2.6vw,30px)]' : 'text-[15px]'
                    }`}
                  >
                    {cat.name}
                  </span>
                  <span
                    aria-hidden="true"
                    className="mb-1 flex shrink-0 -translate-x-1.5 text-gold opacity-0 transition-[opacity,transform] duration-[500ms] ease-[var(--ease)] group-hover:translate-x-0 group-hover:opacity-100"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </span>
              </Link>
            )
          })}
        </Reveal>
      )}
    </main>
  )
}
