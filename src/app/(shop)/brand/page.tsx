import Link from 'next/link'

interface Brand {
  _id: string
  name: string
  image?: string
  slug?: string
}

interface BrandsResponse {
  data: Brand[]
}

async function getBrands(): Promise<Brand[]> {
  try {
    const res = await fetch('https://ecommerce.routemisr.com/api/v1/brands', {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const json = (await res.json()) as BrandsResponse
    return json.data ?? []
  } catch {
    return []
  }
}

export default async function BrandPage() {
  const brands = await getBrands()

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-gradient-to-br from-violet-600 via-violet-500 to-purple-400 text-white">
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <nav className="flex items-center gap-2 text-sm text-white/70 mb-6">
            <Link className="hover:text-white transition-colors" href="/">
              Home
            </Link>
            <span className="text-white/40">/</span>
            <span className="text-white font-medium">Brands</span>
          </nav>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl ring-1 ring-white/30">
              <svg
                data-prefix="fas"
                data-icon="tags"
                className="h-8 w-8 text-white"
                role="img"
                viewBox="0 0 576 512"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M401.2 39.1L549.4 189.4c27.7 28.1 27.7 73.1 0 101.2L393 448.9c-9.3 9.4-24.5 9.5-33.9 .2s-9.5-24.5-.2-33.9L515.3 256.8c9.2-9.3 9.2-24.4 0-33.7L367 72.9c-9.3-9.4-9.2-24.6 .2-33.9s24.6-9.2 33.9 .2zM32.1 229.5L32.1 96c0-35.3 28.7-64 64-64l133.5 0c17 0 33.3 6.7 45.3 18.7l144 144c25 25 25 65.5 0 90.5L285.4 418.7c-25 25-65.5 25-90.5 0l-144-144c-12-12-18.7-28.3-18.7-45.3zm144-85.5a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Top Brands</h1>
              <p className="text-white/80 mt-1">Shop from your favorite brands</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {brands.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No brands available</h2>
            <p className="text-gray-500 mb-6">Please check back in a moment or browse all products.</p>
            <Link
              className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold bg-violet-600 text-white hover:bg-violet-700 transition"
              href="/products"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
            {brands.map((brand) => (
              <Link
                key={brand._id}
                className="group block bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-xl hover:border-violet-200 transition-all duration-300 hover:-translate-y-1"
                href={`/brand/${encodeURIComponent(brand._id)}`}
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3 p-4 flex items-center justify-center">
                  {brand.image ? (
                    <img
                      alt={brand.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                      src={brand.image}
                    />
                  ) : (
                    <div className="w-full h-full rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium">
                      {brand.name}
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 text-center text-sm group-hover:text-violet-600 transition-colors truncate">
                  {brand.name}
                </h3>
                <div className="flex justify-center mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-violet-600 flex items-center gap-1">
                    View Products
                    <svg
                      data-prefix="fas"
                      data-icon="arrow-right"
                      className="h-3 w-3"
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
