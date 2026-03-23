import Image from 'next/image'
import Link from 'next/link'

interface Category {
  _id: string
  name: string
  image: string
  slug: string
}

interface CategoriesResponse {
  data: Category[]
}

const CATEGORIES_API = 'https://ecommerce.routemisr.com/api/v1/categories'

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(CATEGORIES_API, {
      next: { revalidate: 60 },
    })

    if (!res.ok) return []

    const json = (await res.json()) as CategoriesResponse
    return json.data ?? []
  } catch {
    return []
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 text-white">
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <nav className="flex items-center gap-2 text-sm text-white/70 mb-6">
            <Link className="hover:text-white transition-colors" href="/">
              Home
            </Link>
            <span className="text-white/40">/</span>
            <span className="text-white font-medium">Categories</span>
          </nav>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl ring-1 ring-white/30">
              <svg
                data-prefix="fas"
                data-icon="layer-group"
                className="svg-inline--fa fa-layer-group text-3xl"
                role="img"
                viewBox="0 0 512 512"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M232.5 5.2c14.9-6.9 32.1-6.9 47 0l218.6 101c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L13.9 149.8C5.4 145.8 0 137.3 0 128s5.4-17.9 13.9-21.8L232.5 5.2zM48.1 218.4l164.3 75.9c27.7 12.8 59.6 12.8 87.3 0l164.3-75.9 34.1 15.8c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L13.9 277.8C5.4 273.8 0 265.3 0 256s5.4-17.9 13.9-21.8l34.1-15.8zM13.9 362.2l34.1-15.8 164.3 75.9c27.7 12.8 59.6 12.8 87.3 0l164.3-75.9 34.1 15.8c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L13.9 405.8C5.4 401.8 0 393.3 0 384s5.4-17.9 13.9-21.8z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">All Categories</h1>
              <p className="text-white/80 mt-1">Browse our wide range of product categories</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
            <p className="text-gray-600">No categories available right now.</p>
            <Link
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition-colors hover:bg-primary-700"
              href="/"
            >
              Back to home
              <svg data-prefix="fas" data-icon="arrow-right" className="h-4 w-4" role="img" viewBox="0 0 512 512" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-105.4 105.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
                />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {categories.map((category) => (
              <Link
                key={category._id}
                className="group bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm hover:shadow-xl hover:border-primary-200 transition-all duration-300 hover:-translate-y-1"
                href={`/categories/${category._id}`}
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 mb-4 relative">
                  <Image
                    alt={category.name}
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    src={category.image}
                    fill
                    sizes="(min-width: 1280px) 12rem, (min-width: 768px) 10rem, 8rem"
                  />
                </div>
                <h3 className="font-bold text-gray-900 text-center group-hover:text-primary-600 transition-colors">
                  {category.name}
                </h3>
                <div className="flex justify-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-primary-600 flex items-center gap-1">
                    View Subcategories
                    <svg
                      data-prefix="fas"
                      data-icon="arrow-right"
                      className="h-3 w-3 shrink-0"
                      role="img"
                      viewBox="0 0 512 512"
                      aria-hidden="true"
                    >
                      <path
                        fill="currentColor"
                        d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-105.4 105.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
